import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Bus, School, StopWaypoint, Student } from '../types';
import { Crosshair, Eye, Fuel, Layers, Navigation, ZoomIn, ZoomOut } from 'lucide-react';

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

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [school.lat, school.lng],
      zoom: 14,
      zoomControl: false,
    });

    // High quality, clean CartoDB Positron / OSM tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=cb1_3sv2_1_4ea502812ab1bdcbf12dad74', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;
    markersLayerRef.current = L.layerGroup().addTo(map);
    polylineLayerRef.current = L.layerGroup().addTo(map);

    // Initial bounds to fit school and students
    if (students.length > 0) {
      const bounds = L.latLngBounds([
        [school.lat, school.lng],
        ...students.map((s) => [s.lat, s.lng] as [number, number]),
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    return () => {
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

  // Live Bus vehicle marker update
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const isOnDuty = bus.isOnDuty;
    const busBgClass = isOnDuty
      ? 'bg-amber-400 text-slate-950 bus-marker-pulse border-slate-900'
      : 'bg-slate-300 text-slate-700 border-slate-500 opacity-90';

    const busStatusBadge = isOnDuty
      ? (bus.speedKmh > 0 ? `${bus.speedKmh} کم/ک` : 'وەستاوە')
      : 'دەوامی نییە';

    const busBadgeBg = isOnDuty
      ? 'bg-slate-900 text-amber-300 border-amber-400/40'
      : 'bg-slate-800 text-slate-300 border-slate-600';

    const busIcon = L.divIcon({
      className: 'custom-bus-marker',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="w-11 h-11 rounded-2xl ${busBgClass} flex flex-col items-center justify-center shadow-xl border-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M8 6v6"/>
              <path d="M15 6v6"/>
              <path d="M2 12h19.6"/>
              <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4C2.9 6 1.9 6.8 1.6 7.8L.2 12.8C.1 13.2 0 13.6 0 14c0 .4.1.8.2 1.2.3 1.1.8 2.8.8 2.8h3"/>
              <circle cx="7" cy="18" r="2"/>
              <path d="M9 18h5"/>
              <circle cx="16" cy="18" r="2"/>
            </svg>
            <span class="text-[8px] font-black leading-none">${bus.busNumber === 'Bus 104' ? '١٠٤' : '١٠٨'}</span>
          </div>
          <div class="absolute -top-6 ${busBadgeBg} text-[10px] font-black px-2 py-0.5 rounded shadow flex items-center gap-1 border font-sans">
            <span>${busStatusBadge}</span>
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    if (!busMarkerRef.current) {
      busMarkerRef.current = L.marker([bus.currentLat, bus.currentLng], {
        icon: busIcon,
        zIndexOffset: 1000,
      }).addTo(mapInstanceRef.current);

      busMarkerRef.current.bindPopup(`
        <div dir="rtl" class="p-2 text-slate-800 text-right font-sans">
          <h4 class="font-bold text-sm text-amber-600">${bus.busNumber === 'Bus 104' ? 'پاسی ١٠٤' : 'پاسی ١٠٨'} (${bus.plate})</h4>
          <p class="text-xs text-slate-600">شۆفێر: <strong>${bus.driverName}</strong></p>
          <div class="mt-1 text-[11px] bg-slate-100 p-1.5 rounded">
            دۆخی دەوام: <strong>${isOnDuty ? '🟢 لە دەوامدایە' : '⚪ دەوامی نییە'}</strong><br/>
            خێرایی: ${bus.speedKmh} کم/ک | سووتەمەنی: ${bus.fuelTankLiters}L<br/>
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
  }, [bus.currentLat, bus.currentLng, bus.speedKmh, bus.busNumber, bus.status, bus.isOnDuty, followBus]);

  // Handle focus active student
  useEffect(() => {
    if (!activeStudentId || !mapInstanceRef.current) return;
    const target = students.find((s) => s.id === activeStudentId);
    if (target) {
      mapInstanceRef.current.setView([target.lat, target.lng], 16, { animate: true });
    }
  }, [activeStudentId, students]);

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

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-2xl overflow-hidden shadow-lg border border-slate-200 font-sans">
      {/* Map DOM node */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Map Controls & Overlays (Left in RTL layout) */}
      <div className="absolute top-4 left-4 z-[500] flex flex-col gap-2">
        {/* Recenter button */}
        <button
          id="map-recenter-btn"
          onClick={handleRecenter}
          className="bg-white/95 hover:bg-white text-slate-800 p-2.5 rounded-xl shadow-md border border-slate-200 transition flex items-center justify-center hover:shadow-lg cursor-pointer"
          title="پیشاندانی تەواوی نەخشە"
        >
          <Crosshair className="w-4 h-4 text-slate-700" />
        </button>

        {/* Follow bus toggle */}
        <button
          id="map-follow-bus-btn"
          onClick={() => setFollowBus((prev) => !prev)}
          className={`p-2.5 rounded-xl shadow-md border transition flex items-center justify-center cursor-pointer ${
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
            className="p-2 hover:bg-slate-100 text-slate-700 transition border-b border-slate-100 cursor-pointer"
            title="نزیککردنەوە"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => mapInstanceRef.current?.zoomOut()}
            className="p-2 hover:bg-slate-100 text-slate-700 transition cursor-pointer"
            title="دوورخستنەوە"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Route Mode & Optimization Toggle Badge (Top Right) */}
      <div className="absolute top-4 right-4 z-[500] flex flex-wrap gap-2 items-center">
        <div className="bg-slate-900/90 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-xl border border-slate-700/80 shadow-md flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${bus.isOnDuty ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
          <span className="font-semibold text-slate-200">{bus.isOnDuty ? 'GPS ڕاستەوخۆ' : 'دەوامی نییە'}</span>
          <span className="text-slate-400">|</span>
          <span className={`${bus.isOnDuty ? 'text-amber-400' : 'text-slate-400'} font-bold`}>
            {bus.busNumber === 'Bus 104' ? 'پاسی ١٠٤' : 'پاسی ١٠٨'}
          </span>
        </div>

        {onToggleComparisonRoute && (
          <button
            id="toggle-comparison-route-btn"
            onClick={onToggleComparisonRoute}
            className={`text-xs px-3 py-1.5 rounded-xl border shadow-md font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              showComparisonRoute
                ? 'bg-rose-500 text-white border-rose-600 shadow-rose-500/30'
                : 'bg-white/90 backdrop-blur-md text-slate-700 hover:text-slate-900 border-slate-200'
            }`}
          >
            <Fuel className="w-3.5 h-3.5" />
            <span>{showComparisonRoute ? 'شاردنەوەی ڕێگای کۆن' : 'بەراوردکردنی ڕێگای ناڕێکخراو'}</span>
          </button>
        )}
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
