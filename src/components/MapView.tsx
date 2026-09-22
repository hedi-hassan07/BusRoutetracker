import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Bus, School, StopWaypoint, Student } from '../types';
import { Bus as BusIcon, Crosshair, Eye, Fuel, Layers, Navigation, ZoomIn, ZoomOut } from 'lucide-react';
import { calculateHeading } from '../services/roadRoutingService';

interface MapViewProps {
  school: School;
  bus: Bus;
  students: Student[];
  waypoints: StopWaypoint[];
  routePolyline: [number, number][];
  activeStudentId?: string;
  onSelectStudent?: (studentId: string) => void;
  showComparisonRoute?: boolean;
  onToggleComparisonRoute?: () => void;
  unoptimizedPolyline?: [number, number][];
  parentStudentIds?: string[];
  activeRole?: 'driver' | 'parent' | 'manager';
}

export const MapView: React.FC<MapViewProps> = ({
  school,
  bus,
  students,
  waypoints,
  routePolyline,
  activeStudentId,
  onSelectStudent,
  showComparisonRoute = false,
  onToggleComparisonRoute,
  unoptimizedPolyline = [],
  parentStudentIds,
  activeRole,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const polylineLayerRef = useRef<L.LayerGroup | null>(null);
  const busMarkerRef = useRef<L.Marker | null>(null);
  const [followBus, setFollowBus] = useState<boolean>(false);
  const lastFocusedStudentIdRef = useRef<string | null>(null);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [school.lat, school.lng],
      zoom: 14,
      zoomControl: false,
    });

    // High-resolution CARTO Voyager tiles with user's authorized API key
    const MAP_API_KEY = 'cb1_3sv2_1_4ea502812ab1bdcbf12dad74';
    const primaryTiles = L.tileLayer(
      `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=${MAP_API_KEY}`,
      {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
      }
    ).addTo(map);

    // Fallback to standard OpenStreetMap tiles if Carto is unavailable
    primaryTiles.on('tileerror', () => {
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);
    });

    mapInstanceRef.current = map;
    markersLayerRef.current = L.layerGroup().addTo(map);
    polylineLayerRef.current = L.layerGroup().addTo(map);

    // Initial bounds to fit school and students
    if (students.length > 0) {
      const bounds = L.latLngBounds([
        [school.lat, school.lng],
        ...students.map((s) => [s.lat, s.lng] as [number, number]),
      ]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }

    // When user manually pans/drags the map, stop forcing bus follow so camera doesn't fight them
    map.on('dragstart', () => {
      setFollowBus(false);
    });

    // Ensure map renders properly on mobile and Vercel by invalidating size
    const t1 = window.setTimeout(() => map.invalidateSize(), 150);
    const t2 = window.setTimeout(() => map.invalidateSize(), 600);

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    const handleWindowResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener('resize', handleWindowResize);
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update bounds if school coordinates update
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const bounds = L.latLngBounds([
      [school.lat, school.lng],
      [bus.currentLat, bus.currentLng],
      ...students.map((s) => [s.lat, s.lng] as [number, number]),
    ]);
    mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
  }, [school.lat, school.lng]);

  // Update polylines (Optimized vs Unoptimized Comparison)
  useEffect(() => {
    if (!polylineLayerRef.current) return;
    polylineLayerRef.current.clearLayers();

    // 1. If comparison enabled, draw naive unoptimized path in dashed red
    if (showComparisonRoute && unoptimizedPolyline.length > 1) {
      const unoptimizedLine = L.polyline(unoptimizedPolyline, {
        color: '#f43f5e',
        weight: 3,
        dashArray: '8, 8',
        opacity: 0.65,
      });
      unoptimizedLine.bindTooltip('❌ ڕێگای ناڕێکخراو (+٣٥٪ خەرجی بەنزین)', {
        sticky: true,
        className: 'bg-rose-900 text-white text-xs px-2 py-1 rounded shadow font-sans',
      });
      polylineLayerRef.current.addLayer(unoptimizedLine);
    }

    // 2. Draw primary optimized TSP route in vibrant amber/indigo
    if (routePolyline.length > 1) {
      // Glow underlay
      const glowLine = L.polyline(routePolyline, {
        color: '#fbbf24',
        weight: 7,
        opacity: 0.35,
      });
      polylineLayerRef.current.addLayer(glowLine);

      // Main core line
      const mainLine = L.polyline(routePolyline, {
        color: '#d97706',
        weight: 4,
        opacity: 0.95,
      });
      mainLine.bindTooltip('✅ کورتترین ڕێگای ڕێکخراو بۆ کەمکردنەوەی سووتەمەنی', {
        sticky: true,
        className: 'bg-amber-900 text-white text-xs px-2 py-1 rounded shadow font-sans',
      });
      polylineLayerRef.current.addLayer(mainLine);
    }
  }, [routePolyline, showComparisonRoute, unoptimizedPolyline]);

  // Update markers (School, Students, Geofences)
  useEffect(() => {
    if (!markersLayerRef.current || !mapInstanceRef.current) return;
    markersLayerRef.current.clearLayers();

    // 1. School Marker
    const schoolIcon = L.divIcon({
      className: 'custom-school-marker',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg border-2 border-white ring-4 ring-indigo-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 22v-4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v4"/>
              <path d="m18 10 3.447 1.724a1 1 0 0 1 .553.894V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-7.382a1 1 0 0 1 .553-.894L6 10"/>
              <path d="M18 5v17"/>
              <path d="m4 6 8-4 8 4"/>
              <path d="M6 5v17"/>
              <circle cx="12" cy="9" r="2"/>
            </svg>
          </div>
          <span class="absolute -bottom-6 whitespace-nowrap bg-slate-900 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow font-sans">
            ${school.name}
          </span>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    const schoolMarker = L.marker([school.lat, school.lng], { icon: schoolIcon });
    schoolMarker.bindPopup(`
      <div dir="rtl" class="p-2 text-slate-800 text-right font-sans">
        <h4 class="font-bold text-sm text-indigo-700">${school.name}</h4>
        <p class="text-xs text-slate-600 mb-1">${school.address}</p>
        <div class="text-[11px] bg-indigo-50 text-indigo-800 p-1.5 rounded">
          <strong>وێستگەی کۆتایی و دەستپێک</strong><br/>
          زەنگی بەیانی: ${school.morningBell} | دەرچوون: ${school.afternoonDismissal}
        </div>
      </div>
    `);
    markersLayerRef.current.addLayer(schoolMarker);

    // 2. Student Stop Markers & 1-minute Geofence Rings
    students.forEach((student) => {
      const isSelected = activeStudentId === student.id;
      const isBoarded = student.status === 'boarded' || student.status === 'at_school';
      const isAbsent = student.status === 'absent';
      const isAlertActive =
        student.proximityAlertTriggered ||
        student.status === 'proximity_alert_sent' ||
        student.status === 'bus_arrived';

      // Status color tokens
      let bgColor = 'bg-blue-600';
      let ringColor = 'ring-blue-400/30';
      let statusLabel = 'چاوەڕوانە';

      if (isBoarded) {
        bgColor = 'bg-emerald-600';
        ringColor = 'ring-emerald-400/30';
        statusLabel = 'سواربووە';
      } else if (isAlertActive) {
        bgColor = 'bg-amber-500 animate-pulse';
        ringColor = 'ring-amber-400 ring-8';
        statusLabel = '⚡ ١ خولەک دوورە';
      } else if (isAbsent) {
        bgColor = 'bg-rose-500';
        ringColor = 'ring-rose-400/30';
        statusLabel = 'نەهاتووە';
      }

      // Draw 1-Minute Geofence Radius Circle (~450m radius)
      const geofenceCircle = L.circle([student.lat, student.lng], {
        radius: 450,
        color: isAlertActive ? '#f59e0b' : '#3b82f6',
        fillColor: isAlertActive ? '#fbbf24' : '#60a5fa',
        fillOpacity: isAlertActive ? 0.25 : 0.08,
        weight: isAlertActive ? 2.5 : 1,
        dashArray: isAlertActive ? undefined : '4, 4',
      });
      geofenceCircle.bindTooltip(`بازنەی ئاگاداری ١ خولەک: ${student.name}`, { sticky: true });
      markersLayerRef.current?.addLayer(geofenceCircle);

      const isMyChild = !parentStudentIds || parentStudentIds.includes(student.id);
      const isParentViewing = activeRole === 'parent';

      const isTemp = student.isTemporaryAddress;
      const studentIcon = L.divIcon({
        className: 'custom-student-marker',
        html: `
          <div class="relative flex flex-col items-center cursor-pointer group">
            <div class="w-8 h-8 rounded-full ${isParentViewing && !isMyChild ? 'bg-slate-400' : bgColor} text-white font-extrabold text-xs flex items-center justify-center shadow-lg border-2 ${
              isTemp ? 'border-amber-300 ring-4 ring-amber-400/40' : isParentViewing && isMyChild ? 'border-amber-400 ring-4 ring-amber-400/50' : 'border-white'
            } ring-2 ${ringColor} transition-transform group-hover:scale-110 relative">
              #${student.pickupSequence}
              ${
                isTemp
                  ? `<span class="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black flex items-center justify-center shadow border border-slate-950" title="ناونیشانی کاتی">📍</span>`
                  : ''
              }
            </div>
            <div class="absolute -bottom-5 whitespace-nowrap ${isParentViewing && isMyChild ? 'bg-amber-50 text-amber-950 border-amber-300 font-bold ring-1 ring-amber-300' : 'bg-white text-slate-800 font-semibold border-slate-200'} text-[10px] px-1.5 py-0.5 rounded shadow-sm border font-sans flex items-center gap-1">
              <span>${isParentViewing && !isMyChild ? `وێستگەی #${student.pickupSequence}` : (isParentViewing && isMyChild ? `⭐ ${student.name.split(' ')[0]}` : student.name.split(' ')[0])}</span>
              ${isTemp ? '<span class="text-[9px] bg-amber-100 text-amber-900 font-bold px-1 rounded">کاتی</span>' : ''}
              ${isAlertActive ? '🔔' : ''}
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([student.lat, student.lng], { icon: studentIcon });

      marker.on('click', () => {
        if (onSelectStudent) {
          // In parent view, only allow selecting own children
          if (isParentViewing && !isMyChild) {
            return;
          }
          onSelectStudent(student.id);
        }
      });

      if (isParentViewing && !isMyChild) {
        marker.bindPopup(`
          <div dir="rtl" class="p-2 min-w-[200px] text-slate-800 text-right font-sans">
            <div class="flex items-center justify-between mb-1">
              <span class="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                وێستگەی #${student.pickupSequence}
              </span>
              <span class="text-[10px] bg-slate-100 text-slate-500 font-medium px-1.5 py-0.5 rounded">
                🔒 زانیاری پارێزراو
              </span>
            </div>
            <h4 class="font-bold text-xs text-slate-700">وێستگەی پاسی قوتابخانە</h4>
            <p class="text-[11px] text-slate-500 mt-1">
              تەنها سەرپەرشتیاری پەیوەندیدار دەتوانێت زانیاری تایبەتی ئەم وێستگەیە ببینێت.
            </p>
            <div class="text-[11px] border-t border-slate-100 pt-1.5 mt-2 text-slate-500">
              کاتی چاوەڕوانکراوی پاس: <strong>~${student.etaMinutes} خولەک</strong>
            </div>
          </div>
        `);
      } else {
        marker.bindPopup(`
          <div dir="rtl" class="p-2 min-w-[210px] text-slate-800 text-right font-sans">
            <div class="flex items-center justify-between mb-1">
              <span class="text-[10px] font-bold uppercase tracking-wider ${isParentViewing && isMyChild ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold' : 'bg-slate-100 text-slate-700'} px-1.5 py-0.5 rounded">
                ${isParentViewing && isMyChild ? `⭐ منداڵەکەت (وێستگەی #${student.pickupSequence})` : `وێستگەی #${student.pickupSequence}`}
              </span>
              <span class="text-[11px] font-semibold text-amber-600">${statusLabel}</span>
            </div>
            <h4 class="font-bold text-sm text-slate-900">${student.name}</h4>
            <p class="text-xs text-slate-500">${student.grade}</p>
            
            <div class="my-1.5 p-1.5 rounded-lg ${isTemp ? 'bg-amber-50 border border-amber-200' : 'bg-slate-50'}">
              <div class="text-xs text-slate-700">
                ${isTemp ? '<strong class="text-amber-900">📍 شوێنی کاتی:</strong> ' : '<strong class="text-slate-800">ناونیشان:</strong> '}
                ${student.address}
              </div>
              ${
                isTemp && student.addressChangeReason
                  ? `<div class="text-[11px] text-amber-800 mt-1 font-medium">💬 هۆکار: "${student.addressChangeReason}"</div>`
                  : ''
              }
              ${
                isTemp && student.permanentAddress
                  ? `<div class="text-[10px] text-slate-500 mt-0.5">🏠 هەمیشەیی: ${student.permanentAddress}</div>`
                  : ''
              }
            </div>

            <div class="text-[11px] border-t border-slate-200 pt-1.5 mt-1 space-y-0.5 text-slate-600">
              <div>سەرپەرشتیار: <strong>${student.parentName}</strong> (${student.parentPhone})</div>
              <div>دووری: <strong>${student.distanceKm} کم</strong> | کات: <strong>~${student.etaMinutes} خولەک</strong></div>
            </div>
          </div>
        `);
      }

      markersLayerRef.current?.addLayer(marker);
    });
  }, [students, school, activeStudentId, onSelectStudent, parentStudentIds, activeRole]);

  // Determine next destination and heading for the bus
  const nextWaypoint = waypoints.find((w) => w.status === 'pending');
  let nextDestinationName = 'گەیشتووە بە قوتابخانە';

  if (nextWaypoint) {
    if (nextWaypoint.type === 'school_destination') {
      nextDestinationName = school.name;
    } else {
      const student = students.find((s) => s.id === nextWaypoint.studentId);
      nextDestinationName = student ? student.name : nextWaypoint.address;
    }
  }

  // Calculate effective heading angle (0 = North, 90 = East, 180 = South, 270 = West)
  let effectiveHeading = typeof bus.heading === 'number' ? bus.heading : 0;
  if (nextWaypoint && (!bus.heading || bus.speedKmh === 0)) {
    effectiveHeading = calculateHeading(bus.currentLat, bus.currentLng, nextWaypoint.lat, nextWaypoint.lng);
  }

  // Live Bus vehicle marker update
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const isOnDuty = bus.isOnDuty;
    const busStatusBadge = isOnDuty
      ? (bus.speedKmh > 0 ? `${bus.speedKmh} کم/ک` : 'وەستاوە')
      : 'دەوامی نییە';

    const busBadgeBg = isOnDuty
      ? 'bg-slate-900 text-amber-300 border-amber-400/40'
      : 'bg-slate-800 text-slate-300 border-slate-600';

    const busIcon = L.divIcon({
      className: 'custom-bus-marker',
      html: `
        <div class="relative flex flex-col items-center justify-center select-none" style="filter: drop-shadow(0 6px 16px rgba(0,0,0,0.35));">
          <!-- Directional Heading Pointer (Rotating Chevron with Glowing Beam) -->
          <div class="absolute w-24 h-24 flex items-center justify-center pointer-events-none transition-transform duration-300 ease-out" style="transform: rotate(${effectiveHeading}deg);">
            <div class="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[18px] border-b-amber-400 absolute -top-3.5 drop-shadow-[0_0_10px_rgba(251,191,36,0.95)]"></div>
          </div>

          <!-- Radar Attention Pulse -->
          <div class="absolute w-16 h-16 rounded-full ${isOnDuty ? 'bg-amber-400/25 animate-ping' : ''} pointer-events-none"></div>

          <!-- Main School Bus Logo Emblem Container -->
          <div class="relative z-10 w-13 h-13 rounded-2xl ${isOnDuty ? 'bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 border-2 border-slate-950 shadow-2xl ring-2 ring-amber-400/60' : 'bg-slate-300 border-2 border-slate-500'} flex flex-col items-center justify-center text-slate-950">
            <!-- Roof Flasher Beacons -->
            <div class="absolute -top-1.5 flex items-center justify-between w-8 px-0.5">
              <span class="w-2 h-2 rounded-full ${isOnDuty ? 'bg-red-500 animate-pulse shadow-[0_0_6px_red]' : 'bg-slate-500'} border border-slate-900"></span>
              <span class="w-1.5 h-1.5 rounded-full ${isOnDuty ? 'bg-amber-300' : 'bg-slate-400'}"></span>
              <span class="w-2 h-2 rounded-full ${isOnDuty ? 'bg-red-500 animate-pulse shadow-[0_0_6px_red]' : 'bg-slate-500'} border border-slate-900"></span>
            </div>

            <!-- Front-Facing School Bus Vector Icon -->
            <svg class="w-7 h-7" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 11C4 7.68629 6.68629 5 10 5H22C25.3137 5 28 7.68629 28 11V23C28 24.6569 26.6569 26 25 26H23V27C23 28.1046 22.1046 29 21 29H19C17.8954 29 17 28.1046 17 27V26H15V27C15 28.1046 14.1046 29 13 29H11C9.89543 29 9 28.1046 9 27V26H7C5.34315 26 4 24.6569 4 23V11Z" fill="#FBBF24" stroke="#0F172A" stroke-width="1.8" stroke-linejoin="round"/>
              <rect x="7" y="8" width="18" height="6.5" rx="1.5" fill="#38BDF8" stroke="#0F172A" stroke-width="1.4"/>
              <line x1="16" y1="8" x2="16" y2="14.5" stroke="#0F172A" stroke-width="1.2"/>
              <rect x="10" y="18" width="12" height="4" rx="1" fill="#1E293B"/>
              <line x1="13" y1="18" x2="13" y2="22" stroke="#FBBF24" stroke-width="1"/>
              <line x1="16" y1="18" x2="16" y2="22" stroke="#FBBF24" stroke-width="1"/>
              <line x1="19" y1="18" x2="19" y2="22" stroke="#FBBF24" stroke-width="1"/>
              <circle cx="7" cy="19.5" r="1.8" fill="#FEF08A" stroke="#0F172A" stroke-width="1.2"/>
              <circle cx="25" cy="19.5" r="1.8" fill="#FEF08A" stroke="#0F172A" stroke-width="1.2"/>
              <rect x="5" y="24" width="22" height="2" rx="1" fill="#0F172A"/>
            </svg>

            <!-- Bus Plate Number -->
            <div class="absolute -bottom-1.5 bg-slate-950 text-amber-300 text-[8px] font-black px-1.5 rounded-full border border-amber-400 shadow">
              ${bus.busNumber === 'Bus 104' ? '١٠٤' : '١٠٨'}
            </div>
          </div>

          <!-- Top Speed & Live Badge -->
          <div class="absolute -top-6 ${busBadgeBg} text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1 border font-sans z-20 whitespace-nowrap">
            <span>${busStatusBadge}</span>
          </div>

          <!-- Bottom "Heading To" Callout Badge -->
          ${
            isOnDuty
              ? `
              <div class="absolute -bottom-6.5 bg-slate-950/95 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-lg border border-slate-700/80 flex items-center gap-1 whitespace-nowrap z-20 pointer-events-none font-sans">
                <span class="text-amber-400 font-black">بەرەو:</span>
                <span class="text-slate-100 max-w-[90px] truncate">${nextDestinationName}</span>
              </div>
              `
              : ''
          }
        </div>
      `,
      iconSize: [60, 60],
      iconAnchor: [30, 30],
    });

    if (!busMarkerRef.current) {
      busMarkerRef.current = L.marker([bus.currentLat, bus.currentLng], {
        icon: busIcon,
        zIndexOffset: 1000,
      }).addTo(mapInstanceRef.current);

      busMarkerRef.current.bindPopup(`
        <div dir="rtl" class="p-2.5 text-slate-800 text-right font-sans min-w-[210px]">
          <div class="flex items-center gap-2 border-b border-slate-200 pb-2 mb-2">
            <div class="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center text-slate-950 font-black text-sm border border-slate-900 shadow">
              🚌
            </div>
            <div>
              <h4 class="font-bold text-sm text-slate-900 leading-tight">
                ${bus.busNumber === 'Bus 104' ? 'پاسی قوتابخانە ١٠٤' : 'پاسی قوتابخانە ١٠٨'}
              </h4>
              <p class="text-[11px] text-slate-500">${bus.plate} • شۆفێر: <strong>${bus.driverName}</strong></p>
            </div>
          </div>
          
          <div class="space-y-1.5 text-xs bg-slate-50 p-2 rounded-xl border border-slate-100">
            <div class="flex items-center justify-between text-slate-600">
              <span>دۆخی پاس:</span>
              <span class="font-bold ${isOnDuty ? 'text-emerald-600' : 'text-slate-500'}">
                ${isOnDuty ? '🟢 چالاکە (GPS پەیوەستە)' : '⚪ لە دەوامدا نییە'}
              </span>
            </div>
            <div class="flex items-center justify-between text-slate-600">
              <span>خێرایی ئێستا:</span>
              <span class="font-bold text-slate-900 font-sans">${bus.speedKmh} کم/ک</span>
            </div>
            <div class="flex items-center justify-between text-slate-600">
              <span>ئاراستەی ئێستا:</span>
              <span class="font-bold text-amber-600 truncate max-w-[120px]">${nextDestinationName}</span>
            </div>
            <div class="flex items-center justify-between text-slate-600">
              <span>سووتەمەنی:</span>
              <span class="font-bold text-slate-900 font-sans">${bus.fuelTankLiters} لیتر</span>
            </div>
          </div>
        </div>
      `);
    } else {
      busMarkerRef.current.setLatLng([bus.currentLat, bus.currentLng]);
      busMarkerRef.current.setIcon(busIcon);
    }

    if (followBus && isOnDuty) {
      mapInstanceRef.current.panTo([bus.currentLat, bus.currentLng], { animate: true, duration: 0.5 });
    }
  }, [
    bus.currentLat,
    bus.currentLng,
    bus.speedKmh,
    bus.busNumber,
    bus.status,
    bus.isOnDuty,
    bus.heading,
    followBus,
    nextDestinationName,
    effectiveHeading,
  ]);

  // Only pan/zoom to student when user explicitly selects a NEW student ID
  useEffect(() => {
    if (!activeStudentId || !mapInstanceRef.current) return;
    if (lastFocusedStudentIdRef.current === activeStudentId) return;

    lastFocusedStudentIdRef.current = activeStudentId;
    const target = students.find((s) => s.id === activeStudentId);
    if (target) {
      // Pan to student stop once on selection, preserving user freedom to zoom in/out
      mapInstanceRef.current.setView([target.lat, target.lng], 15, { animate: true });
    }
  }, [activeStudentId]);

  // Recenter / Fit All
  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    setFollowBus(false);
    const bounds = L.latLngBounds([
      [school.lat, school.lng],
      [bus.currentLat, bus.currentLng],
      ...students.map((s) => [s.lat, s.lng] as [number, number]),
    ]);
    mapInstanceRef.current.fitBounds(bounds, { padding: [60, 60], animate: true });
  };

  // Locate & Center on Bus
  const handleLocateBus = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([bus.currentLat, bus.currentLng], 16, {
      animate: true,
      duration: 0.8,
    });
    if (busMarkerRef.current) {
      busMarkerRef.current.openPopup();
    }
  };

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-2xl overflow-hidden shadow-lg border border-slate-200 font-sans">
      {/* Map DOM node */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Map Controls & Overlays (Left in RTL layout) */}
      <div className="absolute top-3 left-3 z-[500] flex flex-col gap-1.5 sm:gap-2">
        {/* Recenter button */}
        <button
          id="map-recenter-btn"
          onClick={handleRecenter}
          className="bg-white/95 hover:bg-white text-slate-800 p-2 sm:p-2.5 rounded-xl shadow-md border border-slate-200 transition flex items-center justify-center hover:shadow-lg cursor-pointer"
          title="پیشاندانی تەواوی نەخشە"
        >
          <Crosshair className="w-4 h-4 text-slate-700" />
        </button>

        {/* Locate bus directly */}
        <button
          id="map-locate-bus-btn"
          onClick={handleLocateBus}
          className="bg-amber-400 hover:bg-amber-300 text-slate-950 p-2 sm:p-2.5 rounded-xl shadow-md border border-amber-500 transition flex items-center justify-center hover:shadow-lg cursor-pointer group"
          title="دۆزینەوە و سەنتەرکردنی شوێنی ئێستای پاس"
        >
          <BusIcon className="w-4 h-4 transition-transform group-hover:scale-110" />
        </button>

        {/* Follow bus toggle */}
        <button
          id="map-follow-bus-btn"
          onClick={() => setFollowBus((prev) => !prev)}
          className={`p-2 sm:p-2.5 rounded-xl shadow-md border transition flex items-center justify-center cursor-pointer ${
            followBus
              ? 'bg-amber-400 text-slate-950 font-bold border-amber-500 shadow-amber-400/40'
              : 'bg-white/95 hover:bg-white text-slate-700 border-slate-200'
          }`}
          title={followBus ? 'شوێنکەوتنی جووڵەی پاس' : 'شوێنکەوتنی پاس بە کامێرا'}
        >
          <Navigation className={`w-4 h-4 ${followBus ? 'animate-bounce' : ''}`} />
        </button>

        {/* Zoom controls */}
        <div className="bg-white/95 rounded-xl shadow-md border border-slate-200 overflow-hidden flex flex-col">
          <button
            onClick={() => mapInstanceRef.current?.zoomIn()}
            className="p-1.5 sm:p-2 hover:bg-slate-100 text-slate-700 transition border-b border-slate-100 cursor-pointer"
            title="نزیککردنەوە"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => mapInstanceRef.current?.zoomOut()}
            className="p-1.5 sm:p-2 hover:bg-slate-100 text-slate-700 transition cursor-pointer"
            title="دوورخستنەوە"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Route Mode & Optimization Toggle Badge (Top Right) */}
      <div className="absolute top-3 right-3 z-[500] flex flex-wrap gap-1.5 items-center justify-end max-w-[62%] sm:max-w-none">
        <div className="bg-slate-900/90 backdrop-blur-md text-white text-[11px] sm:text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-slate-700/80 shadow-md flex items-center gap-1.5 sm:gap-2">
          <span className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${bus.isOnDuty ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
          <span className="font-semibold text-slate-200 hidden xs:inline">{bus.isOnDuty ? 'GPS ڕاستەوخۆ' : 'دەوامی نییە'}</span>
          <span className="text-slate-400 hidden xs:inline">|</span>
          <span className={`${bus.isOnDuty ? 'text-amber-400' : 'text-slate-400'} font-bold`}>
            {bus.busNumber === 'Bus 104' ? 'پاسی ١٠٤' : 'پاسی ١٠٨'}
          </span>
        </div>

        {onToggleComparisonRoute && (
          <button
            id="toggle-comparison-route-btn"
            onClick={onToggleComparisonRoute}
            className={`text-[11px] sm:text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border shadow-md font-semibold transition flex items-center gap-1 sm:gap-1.5 cursor-pointer ${
              showComparisonRoute
                ? 'bg-rose-500 text-white border-rose-600 shadow-rose-500/30'
                : 'bg-white/90 backdrop-blur-md text-slate-700 hover:text-slate-900 border-slate-200'
            }`}
          >
            <Fuel className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{showComparisonRoute ? 'شاردنەوەی ڕێگای کۆن' : 'بەراوردکردنی ڕێگای ناڕێکخراو'}</span>
            <span className="sm:hidden">{showComparisonRoute ? 'کۆن' : 'بەراورد'}</span>
          </button>
        )}
      </div>

      {/* Live Bus Location & Heading Status HUD (Bottom Left) */}
      <div
        dir="rtl"
        className="absolute bottom-4 left-4 z-[500] bg-slate-900/95 backdrop-blur-md text-white p-2 sm:px-3 sm:py-2.5 rounded-2xl border border-slate-700/80 shadow-2xl flex items-center gap-2.5 sm:gap-3 transition-all max-w-[calc(100%-8.5rem)] sm:max-w-md pointer-events-auto"
      >
        <button
          onClick={handleLocateBus}
          className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-pointer shrink-0"
          title="سەنتەرکردن لەسەر شوێنی پاس"
        >
          <BusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
        </button>

        <div className="flex flex-col text-right min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="font-bold text-[11px] sm:text-xs text-amber-300 truncate">
              {bus.busNumber === 'Bus 104' ? 'پاسی قوتابخانە ١٠٤' : 'پاسی قوتابخانە ١٠٨'}
            </span>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700 font-sans shrink-0">
              {bus.speedKmh > 0 ? `${bus.speedKmh} کم/ک` : 'وەستاوە'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-200 mt-0.5 truncate">
            <Navigation
              className="w-3 h-3 text-amber-400 shrink-0 transition-transform duration-300"
              style={{ transform: `rotate(${effectiveHeading}deg)` }}
            />
            <span className="text-slate-400 text-[10px] shrink-0">ئاراستە:</span>
            <span className="font-semibold text-amber-300 truncate">
              {nextDestinationName}
            </span>
          </div>
        </div>
      </div>

      {/* Map Legend Overlay (Bottom Right) */}
      <div dir="rtl" className="absolute bottom-4 right-4 z-[500] hidden sm:flex items-center gap-3 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-200 shadow-md text-[11px] text-slate-700">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-600" />
          <span>پاسی قوتابخانە</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
          <span>بازنەی ١ خولەک</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
          <span>وێستگەی چاوەڕوان</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
          <span>سواربووە</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600" />
          <span>قوتابخانە</span>
        </div>
      </div>
    </div>
  );
};
