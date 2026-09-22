import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AppNotification,
  Bus,
  OptimizationMetrics,
  School,
  StopWaypoint,
  Student,
  TripShift,
} from './types';
import { INITIAL_BUSES, INITIAL_SCHOOL, INITIAL_STUDENTS } from './data/mockData';
import { getHaversineDistanceKm, interpolatePoints, optimizeRouteOrder } from './utils/routeOptimizer';
import {
  calculateHeading,
  fetchRoadRoute,
  generateRealisticRoadFallback,
  INITIAL_OPTIMIZED_ROAD_ROUTE,
  INITIAL_UNOPTIMIZED_ROAD_ROUTE,
} from './services/roadRoutingService';
import { soundPlayer } from './utils/audioAlert';
import { Header } from './components/Header';
import { MapView } from './components/MapView';
import { DriverConsole } from './components/DriverConsole';
import { ParentPortal } from './components/ParentPortal';
import { SchoolManagerView } from './components/SchoolManagerView';
import { DelayModal } from './components/DelayModal';
import { EmergencyModal } from './components/EmergencyModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { LoginPage } from './components/LoginPage';
import { AuthUser } from './types';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Navigation & Role State
  const [activeRole, setActiveRole] = useState<'driver' | 'parent' | 'manager'>('driver');
  const [shift, setShift] = useState<TripShift>('morning_pickup');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Entities
  const [school] = useState<School>(INITIAL_SCHOOL);
  const [buses, setBuses] = useState<Bus[]>(INITIAL_BUSES);
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(INITIAL_STUDENTS[0].id);

  // Mapping of parent identifier/email to registered child IDs.
  // Initially each parent has 1 registered kid, and can add more anytime!
  const [parentChildrenMap, setParentChildrenMap] = useState<Record<string, string[]>>({
    'sara.ali@example.com': ['stu_1'],
    'rebwar.a@example.com': ['stu_2'],
    'peyman.q@example.com': ['stu_3'],
    'aram.k@example.com': ['stu_4'],
    'brwa.o@example.com': ['stu_5'],
    'rozhin.f@example.com': ['stu_6'],
  });

  // Accessible children for the active parent (Strictly isolates parent view to own kids only)
  const parentAccessibleStudents = useMemo(() => {
    let activeParentEmail = 'sara.ali@example.com';
    let activeParentPhone = '0750 339 3912';

    if (currentUser && currentUser.role === 'parent') {
      activeParentEmail = currentUser.emailOrPhone;
      const matched = students.find(
        (s) =>
          (currentUser.studentIds && currentUser.studentIds.includes(s.id)) ||
          s.id === currentUser.studentId ||
          s.parentEmail.toLowerCase() === currentUser.emailOrPhone.toLowerCase() ||
          s.parentPhone.replace(/\s/g, '') === currentUser.emailOrPhone.replace(/\s/g, '')
      );
      if (matched) {
        activeParentEmail = matched.parentEmail;
        activeParentPhone = matched.parentPhone;
      }
    } else {
      const matched = students.find((s) => s.id === selectedStudentId) || students[0];
      activeParentEmail = matched.parentEmail;
      activeParentPhone = matched.parentPhone;
    }

    const emailKey = activeParentEmail.toLowerCase();
    const mappedIds = parentChildrenMap[emailKey] || [];

    const matchedList = students.filter(
      (s) =>
        mappedIds.includes(s.id) ||
        (currentUser?.studentIds && currentUser.studentIds.includes(s.id)) ||
        (s.parentEmail && s.parentEmail.toLowerCase() === emailKey) ||
        (s.parentPhone && s.parentPhone.replace(/\s/g, '') === activeParentPhone.replace(/\s/g, ''))
    );

    return matchedList.length > 0 ? matchedList : [students[0]];
  }, [currentUser, students, parentChildrenMap, selectedStudentId]);

  // Comparison toggle for naive vs optimized route
  const [showComparisonRoute, setShowComparisonRoute] = useState(false);

  // Modals & Drawers
  const [isDelayModalOpen, setIsDelayModalOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);

  // Notifications Log
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif_welcome',
      timestamp: '07:25 AM',
      type: 'info',
      title: 'سیستمی گواستنەوە چالاکە',
      message: 'پلانی کورتکردنەوەی ڕێگای بەیانیان ئامادەیە. پەخشی شوێنی پاسی ١٠٤ و ١٠٨ چالاکە.',
      read: true,
    },
    {
      id: 'notif_opt_ready',
      timestamp: '07:28 AM',
      type: 'info',
      title: 'ڕێکخستنی ڕێگا ٢٦٪ سووتەمەنی پاشەکەوت کرد',
      message: 'ئەلگۆریتمی ڕێکخستن ٤.٢ کم لە مەودای ڕێگاکە و ١٨ خولەکی کەمکردەوە بۆ پاسی ١٠٤.',
      read: true,
    },
  ]);

  // Primary Bus (Bus 104)
  const currentBus = buses[0];

  // Compute Route Optimization
  const optimization = useMemo(() => {
    return optimizeRouteOrder(school, students, shift);
  }, [school, students, shift]);

  // Realistic Road-Network Geometry State (Sourced from OpenStreetMap/OSRM Driving Graph)
  const [roadPolyline, setRoadPolyline] = useState<[number, number][]>(
    INITIAL_OPTIMIZED_ROAD_ROUTE
  );
  const [unoptimizedRoadPolyline, setUnoptimizedRoadPolyline] = useState<[number, number][]>(
    INITIAL_UNOPTIMIZED_ROAD_ROUTE
  );

  // Synchronize road polylines whenever students (e.g. sick/absent toggle), school, or shift changes
  useEffect(() => {
    let isCancelled = false;
    const activeStudents = students.filter((s) => s.status !== 'absent');

    // If standard full 6-student morning route, use high-precision precomputed OSM geometry
    if (activeStudents.length === 6 && shift === 'morning_pickup') {
      setRoadPolyline(INITIAL_OPTIMIZED_ROAD_ROUTE);
      setUnoptimizedRoadPolyline(INITIAL_UNOPTIMIZED_ROAD_ROUTE);
      return;
    }

    // Fetch live turn-by-turn road route from OSRM for active waypoints
    if (optimization.waypoints.length >= 2) {
      fetchRoadRoute(optimization.waypoints).then((result) => {
        if (!isCancelled) {
          if (result && result.coordinates.length > 0) {
            setRoadPolyline(result.coordinates);
          } else {
            setRoadPolyline(generateRealisticRoadFallback(optimization.waypoints));
          }
        }
      });
    }

    // Also update unoptimized route for comparison
    const naiveList = [...activeStudents].sort((a, b) => a.originalSequence - b.originalSequence);
    const naiveWaypoints = [
      { lat: school.lat, lng: school.lng },
      ...naiveList.map((s) => ({ lat: s.lat, lng: s.lng })),
      { lat: school.lat, lng: school.lng },
    ];

    if (naiveWaypoints.length >= 2) {
      fetchRoadRoute(naiveWaypoints).then((result) => {
        if (!isCancelled) {
          if (result && result.coordinates.length > 0) {
            setUnoptimizedRoadPolyline(result.coordinates);
          } else {
            setUnoptimizedRoadPolyline(generateRealisticRoadFallback(naiveWaypoints));
          }
        }
      });
    }

    return () => {
      isCancelled = true;
    };
  }, [optimization.waypoints, students, shift, school]);

  // Add Notification Helper
  const addNotification = useCallback((notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newNotif: AppNotification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: timeStr,
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  }, []);

  // Simulation State Ref to manage loop without stale closures
  const simulationRef = useRef<{
    polylineIndex: number;
    timerId: number | null;
  }>({
    polylineIndex: 0,
    timerId: null,
  });

  // GPS Simulation Loop
  useEffect(() => {
    if (!currentBus.isSimulating) {
      if (simulationRef.current.timerId) {
        clearInterval(simulationRef.current.timerId);
        simulationRef.current.timerId = null;
      }
      return;
    }

    const intervalTime = Math.max(90, Math.round(300 / currentBus.simulationSpeed));
    const stepSize = currentBus.simulationSpeed >= 3 ? 2 : 1;

    simulationRef.current.timerId = window.setInterval(() => {
      const polyline = roadPolyline;
      if (!polyline || polyline.length === 0) return;

      simulationRef.current.polylineIndex += stepSize;
      const nextIndex = simulationRef.current.polylineIndex;

      // Reached destination (School)
      if (nextIndex >= polyline.length) {
        if (simulationRef.current.timerId) {
          clearInterval(simulationRef.current.timerId);
          simulationRef.current.timerId = null;
        }

        setBuses((prev) =>
          prev.map((b) =>
            b.id === currentBus.id
              ? { ...b, isSimulating: false, speedKmh: 0, status: 'at_school' }
              : b
          )
        );

        // Mark all onboard students as arrived at school
        const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setStudents((prev) =>
          prev.map((s) =>
            s.status === 'boarded' ? { ...s, status: 'at_school', dropoffTime: nowTime } : s
          )
        );

        soundPlayer.playSuccessTone();
        addNotification({
          type: 'school_arrival',
          title: `گەیشتن بە ${school.name}`,
          message: `${currentBus.busNumber === 'Bus 104' ? 'پاسی ١٠٤' : 'پاسی ١٠٨'} بە سەلامەتی گەیشتە قوتابخانە لەگەڵ سەرجەم قوتابیان.`,
          busId: currentBus.id,
          busNumber: currentBus.busNumber,
        });
        return;
      }

      const [nextLat, nextLng] = polyline[nextIndex];
      const prevLat = currentBus.currentLat;
      const prevLng = currentBus.currentLng;
      const heading = calculateHeading(prevLat, prevLng, nextLat, nextLng);
      const speed = Math.floor(28 + Math.random() * 8);

      // Update bus location
      setBuses((prev) =>
        prev.map((b) =>
          b.id === currentBus.id
            ? {
                ...b,
                currentLat: nextLat,
                currentLng: nextLng,
                heading: heading || b.heading,
                speedKmh: speed,
                status: 'en_route',
              }
            : b
        )
      );

      // Evaluate proximity to student stops
      setStudents((prevStudents) => {
        let alertTriggeredThisStep = false;

        const updated: Student[] = prevStudents.map((student: Student): Student => {
          if (student.status === 'boarded' || student.status === 'at_school' || student.status === 'absent') {
            return student;
          }

          const distKm = getHaversineDistanceKm(nextLat, nextLng, student.lat, student.lng);
          const etaMin = Math.max(1, Math.round((distKm / 28) * 60));

          // 1-MINUTE PROXIMITY DETECTION: Distance <= 0.45 km (~450 meters)
          if (distKm <= 0.45 && !student.proximityAlertTriggered && student.status === 'home_waiting') {
            alertTriggeredThisStep = true;
            soundPlayer.playProximityChime();

            addNotification({
              type: 'proximity_1min',
              title: `⚡ ئاگاداری ١ خولەک: ${student.name}`,
              message: `${currentBus.busNumber === 'Bus 104' ? 'پاسی ١٠٤' : 'پاسی ١٠٨'} نزیکەی ١ خولەک لە ${student.address} دوورە! تکایە لە بەردەم ماڵ بن.`,
              studentId: student.id,
              studentName: student.name,
              busId: currentBus.id,
              busNumber: currentBus.busNumber,
              urgent: true,
            });

            return {
              ...student,
              proximityAlertTriggered: true,
              status: 'proximity_alert_sent' as const,
              distanceKm: distKm,
              etaMinutes: 1,
            };
          }

          // Arrived at student's home stop (<= 75 meters)
          if (distKm <= 0.08 && student.status === 'proximity_alert_sent') {
            return {
              ...student,
              status: 'bus_arrived' as const,
              distanceKm: distKm,
              etaMinutes: 0,
            };
          }

          return {
            ...student,
            distanceKm: distKm,
            etaMinutes: etaMin,
          };
        });

        return updated;
      });
    }, intervalTime);

    return () => {
      if (simulationRef.current.timerId) {
        clearInterval(simulationRef.current.timerId);
        simulationRef.current.timerId = null;
      }
    };
  }, [currentBus.isSimulating, currentBus.simulationSpeed, roadPolyline, school, addNotification]);

  // Simulation Controls
  const handleStartSimulation = () => {
    setBuses((prev) =>
      prev.map((b) => (b.id === currentBus.id ? { ...b, isSimulating: true, status: 'en_route' } : b))
    );
  };

  const handlePauseSimulation = () => {
    setBuses((prev) =>
      prev.map((b) => (b.id === currentBus.id ? { ...b, isSimulating: false, speedKmh: 0 } : b))
    );
  };

  const handleResetSimulation = () => {
    if (simulationRef.current.timerId) {
      clearInterval(simulationRef.current.timerId);
      simulationRef.current.timerId = null;
    }
    simulationRef.current.polylineIndex = 0;

    setBuses((prev) =>
      prev.map((b) =>
        b.id === currentBus.id
          ? {
              ...b,
              currentLat: school.lat,
              currentLng: school.lng,
              speedKmh: 0,
              isSimulating: false,
              status: 'idle',
              delayMinutes: 0,
              emergencyActive: false,
            }
          : b
      )
    );

    // Reset students to initial waiting state
    setStudents(INITIAL_STUDENTS);
  };

  const handleSetSimulationSpeed = (speed: number) => {
    setBuses((prev) =>
      prev.map((b) => (b.id === currentBus.id ? { ...b, simulationSpeed: speed } : b))
    );
  };

  // Authentication Handlers
  const handleLogin = (user: AuthUser, selectedShift?: TripShift) => {
    setCurrentUser(user);
    setActiveRole(user.role);
    setIsLoggedIn(true);

    if (selectedShift) {
      setShift(selectedShift);
    }
    if (user.studentIds && user.studentIds.length > 0) {
      setSelectedStudentId(user.studentIds[0]);
    } else if (user.studentId) {
      setSelectedStudentId(user.studentId);
    }
    if (user.busId) {
      const busIdx = buses.findIndex((b) => b.id === user.busId);
      if (busIdx > 0) {
        setBuses((prev) => {
          const reordered = [...prev];
          const [moved] = reordered.splice(busIdx, 1);
          reordered.unshift(moved);
          return reordered;
        });
      }
    }

    soundPlayer.playSuccessTone();
    addNotification({
      type: 'info',
      title: `چوونەژوورەوە: ${user.name}`,
      message: `بەخێربێیت بۆ سیستەمی پاسی قوتابخانە. بەستراوە وەک ${user.title || user.role}.`,
    });
  };

  const handleSignOut = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  // Driver Shift Activation / Deactivation from Mobile Phone
  const handleToggleDuty = () => {
    const isCurrentlyOn = currentBus.isOnDuty;
    const nextOnDuty = !isCurrentlyOn;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setBuses((prev) =>
      prev.map((b) =>
        b.id === currentBus.id
          ? {
              ...b,
              isOnDuty: nextOnDuty,
              dutyStartedAt: nextOnDuty ? nowTime : b.dutyStartedAt,
              isSimulating: nextOnDuty ? b.isSimulating : false, // pause route simulation if driver clocks off
              status: nextOnDuty ? (b.status === 'idle' ? 'idle' : b.status) : 'idle',
            }
          : b
      )
    );

    if (nextOnDuty) {
      soundPlayer.playSuccessTone();
      addNotification({
        type: 'info',
        title: `🟢 دەوامی شۆفێر دەستیپێکرد: ${currentBus.driverName}`,
        message: `${currentBus.driverName} ئێستا لە دەوامدایە لە ڕێگەی مۆبایلەوە. پەخشی ڕاستەوخۆی GPS بۆ ${currentBus.busNumber === 'Bus 104' ? 'پاسی ١٠٤' : 'پاسی ١٠٨'} چالاکە.`,
        busId: currentBus.id,
        busNumber: currentBus.busNumber,
      });
    } else {
      addNotification({
        type: 'info',
        title: `⚪ دەوامی شۆفێر کۆتایی هات: ${currentBus.driverName}`,
        message: `${currentBus.driverName} دەوامی تەواو کرد و وەستا. پەخشی شوێنی پاس وەستێنرا.`,
        busId: currentBus.id,
        busNumber: currentBus.busNumber,
      });
    }
  };

  const handleTogglePhoneGps = () => {
    if (!navigator.geolocation) {
      addNotification({
        type: 'info',
        title: `GPS Unavailable`,
        message: `Geolocation sensor is not supported on this browser device.`,
      });
      return;
    }

    if (!currentBus.phoneGpsActive) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setBuses((prev) =>
            prev.map((b) =>
              b.id === currentBus.id
                ? {
                    ...b,
                    phoneGpsActive: true,
                    currentLat: position.coords.latitude,
                    currentLng: position.coords.longitude,
                  }
                : b
            )
          );
          soundPlayer.playSuccessTone();
          addNotification({
            type: 'info',
            title: `📍 Mobile Phone GPS Synchronized`,
            message: `Bus location updated using driver device sensor telemetry.`,
            busId: currentBus.id,
          });
        },
        (error) => {
          console.warn('Phone GPS error:', error);
          addNotification({
            type: 'info',
            title: `Device GPS Warning`,
            message: `Could not retrieve phone coordinates: ${error.message}. Continuing with simulated route GPS.`,
          });
        },
        { enableHighAccuracy: true }
      );
    } else {
      setBuses((prev) =>
        prev.map((b) => (b.id === currentBus.id ? { ...b, phoneGpsActive: false } : b))
      );
    }
  };

  // Student Actions
  const handleBoardStudent = (studentId: string) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    soundPlayer.playSuccessTone();

    const student = students.find((s) => s.id === studentId);

    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? {
              ...s,
              status: 'boarded',
              boardedTime: nowTime,
              proximityAlertTriggered: false,
            }
          : s
      )
    );

    if (student) {
      addNotification({
        type: 'boarded',
        title: `سواربوونی قوتابی: ${student.name}`,
        message: `${student.name} بە سەلامەتی سواری ${currentBus.busNumber === 'Bus 104' ? 'پاسی ١٠٤' : 'پاسی ١٠٨'} بوو لە کاتی ${nowTime}.`,
        studentId: student.id,
        studentName: student.name,
      });
    }
  };

  const handleMarkAbsent = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, status: 'absent' } : s))
    );

    if (student) {
      soundPlayer.playProximityChime();
      addNotification({
        type: 'info',
        title: `🔄 کورتکردنەوەی ڕێگا: ${student.name}`,
        message: `قوتابی (${student.name}) وەک نەخۆش/نەهاتوو دیاریکرا. وێستگەکەی لە نەخشە و ڕێگای پاس سڕایەوە و کاتی گەشت کورتکرایەوە.`,
        studentId: student.id,
        studentName: student.name,
        urgent: false,
      });
    }
  };

  const handleToggleAbsentStatus = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    if (student.status === 'absent') {
      // Revert to waiting / present
      setStudents((prev) =>
        prev.map((s) => (s.id === studentId ? { ...s, status: 'home_waiting' } : s))
      );
      soundPlayer.playSuccessTone();
      addNotification({
        type: 'info',
        title: `✅ گەڕاندنەوە بۆ ڕێگا: ${student.name}`,
        message: `${student.name} دووبارە خرایەوە نێو هێڵی پاس. وێستگەکەیان سەرلەنوێ خرایەوە نێو ڕێگای پاس.`,
        studentId: student.id,
        studentName: student.name,
      });
    } else {
      handleMarkAbsent(studentId);
    }
  };

  const handleSkipStop = (studentId: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, status: 'home_waiting' } : s))
    );
  };

  // Parent Instant Communications
  const handleParentNotice = (studentId: string, type: 'running_late' | 'mark_absent') => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    if (type === 'mark_absent') {
      handleMarkAbsent(studentId);
    } else {
      addNotification({
        type: 'info',
        title: `پەیامی باوان: ${student.parentName}`,
        message: `${student.parentName} داوای ٢ خولەک چاوەڕوانی دەکات بۆ ${student.name}.`,
        studentId: student.id,
        studentName: student.name,
      });
    }
  };

  // Parent Address & Location Updates (Permanent & Temporary with comment)
  const handleUpdateStudentAddress = (
    studentId: string,
    update: {
      address: string;
      lat: number;
      lng: number;
      isTemporary: boolean;
      reason?: string;
      updatePermanent?: boolean;
    }
  ) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        if (update.updatePermanent) {
          return {
            ...s,
            permanentAddress: update.address,
            permanentLat: update.lat,
            permanentLng: update.lng,
            address: update.address,
            lat: update.lat,
            lng: update.lng,
            isTemporaryAddress: false,
            addressChangeReason: update.reason,
            addressUpdatedAt: nowTime,
          };
        } else {
          return {
            ...s,
            address: update.address,
            lat: update.lat,
            lng: update.lng,
            isTemporaryAddress: update.isTemporary,
            addressChangeReason: update.reason,
            addressUpdatedAt: nowTime,
          };
        }
      })
    );

    const targetStu = students.find((s) => s.id === studentId);
    const stuName = targetStu?.name || 'قوتابی';
    const parentName = targetStu?.parentName || 'باوان';

    addNotification({
      type: 'info',
      title: update.isTemporary
        ? `📍 ناونیشانی کاتی بۆ ${stuName}`
        : `🏠 نوێکردنەوەی ناونیشانی هەمیشەیی بۆ ${stuName}`,
      message: `${parentName} شوێنی سواربوونی ${stuName}ی گۆڕی بۆ: "${update.address}". ${
        update.reason ? `هۆکار: "${update.reason}". ` : ''
      }ڕێڕەوی پاسەکە بە شێوەی خۆکارانە ڕێکخرایەوە.`,
      studentId: studentId,
      studentName: stuName,
      urgent: true,
    });
  };

  const handleRevertToPermanentAddress = (studentId: string) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const targetStu = students.find((s) => s.id === studentId);
    if (!targetStu) return;

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        return {
          ...s,
          address: s.permanentAddress,
          lat: s.permanentLat,
          lng: s.permanentLng,
          isTemporaryAddress: false,
          addressChangeReason: undefined,
          addressUpdatedAt: nowTime,
        };
      })
    );

    addNotification({
      type: 'info',
      title: `🔄 گەڕاندنەوە بۆ ناونیشانی هەمیشەیی: ${targetStu.name}`,
      message: `شوێنی سواربوونی ${targetStu.name} گەڕێندرایەوە سەر ناونیشانی هەمیشەیی ماڵەوە (${targetStu.permanentAddress}).`,
      studentId: studentId,
      studentName: targetStu.name,
    });
  };

  // Add Another Child for Parent Account
  const handleAddChildForParent = (newChildData: {
    name: string;
    grade: string;
    avatarBg: string;
    address: string;
    lat: number;
    lng: number;
    notes?: string;
  }) => {
    const existingChild = parentAccessibleStudents[0] || students[0];
    const newChildId = `stu_child_${Date.now()}`;

    const newStudent: Student = {
      id: newChildId,
      name: newChildData.name,
      grade: newChildData.grade,
      avatarBg: newChildData.avatarBg,
      parentName: existingChild.parentName,
      parentPhone: existingChild.parentPhone,
      parentEmail: existingChild.parentEmail,
      permanentAddress: newChildData.address,
      permanentLat: newChildData.lat,
      permanentLng: newChildData.lng,
      address: newChildData.address,
      lat: newChildData.lat,
      lng: newChildData.lng,
      isTemporaryAddress: false,
      busId: existingChild.busId || 'bus_104',
      schoolId: existingChild.schoolId || 'school_horizon',
      originalSequence: students.length + 1,
      pickupSequence: students.length + 1,
      dropoffSequence: students.length + 1,
      status: 'home_waiting',
      etaMinutes: Math.max(2, (existingChild.etaMinutes || 5) + 2),
      distanceKm: +(existingChild.distanceKm + 0.4).toFixed(1),
      notes: newChildData.notes,
      proximityAlertTriggered: false,
    };

    setStudents((prev) => [...prev, newStudent]);

    const emailKey = existingChild.parentEmail.toLowerCase();
    setParentChildrenMap((prev) => ({
      ...prev,
      [emailKey]: [...(prev[emailKey] || [existingChild.id]), newChildId],
    }));

    if (currentUser && currentUser.role === 'parent') {
      setCurrentUser((prev) =>
        prev
          ? {
              ...prev,
              studentIds: [...(prev.studentIds || [existingChild.id]), newChildId],
            }
          : null
      );
    }

    setSelectedStudentId(newChildId);

    if (soundEnabled) {
      soundPlayer.playSuccessTone();
    }

    addNotification({
      type: 'info',
      title: `منداڵی نوێ زیادکرا: ${newChildData.name}`,
      message: `${newChildData.name} (${newChildData.grade}) بە سەرکەوتوویی بۆ ئەژمێری ${existingChild.parentName} لە پاسی ١٠٤ زیادکرا.`,
      studentId: newChildId,
      studentName: newChildData.name,
    });
  };

  // Switch Parent Account for testing different parents
  const handleSwitchParentDemo = (targetStudentId: string) => {
    const targetStudent = students.find((s) => s.id === targetStudentId);
    if (!targetStudent) return;

    setSelectedStudentId(targetStudent.id);

    const emailKey = targetStudent.parentEmail.toLowerCase();
    const mappedIds = parentChildrenMap[emailKey] || [targetStudent.id];

    if (currentUser && currentUser.role === 'parent') {
      setCurrentUser({
        ...currentUser,
        id: `usr_parent_${targetStudent.id}`,
        name: targetStudent.parentName,
        emailOrPhone: targetStudent.parentEmail,
        studentId: targetStudent.id,
        studentIds: mappedIds,
        studentName: targetStudent.name,
        title: `سەرپەرشتیاری ${targetStudent.name}`,
      });
    }
  };

  // Delay & Emergency Handlers
  const handleConfirmDelay = (minutes: number, reason: string) => {
    setBuses((prev) =>
      prev.map((b) =>
        b.id === currentBus.id
          ? { ...b, delayMinutes: minutes, delayReason: reason }
          : b
      )
    );

    addNotification({
      type: 'delay',
      title: `ئاگاداری دواکەوتنی پاس: +${minutes} خولەک`,
      message: `${currentBus.busNumber === 'Bus 104' ? 'پاسی ١٠٤' : 'پاسی ١٠٨'}: ${reason}. کاتی نوێکراوەی گەیشتن بۆ هەموو باوان نێردرا.`,
      busId: currentBus.id,
      busNumber: currentBus.busNumber,
      urgent: true,
    });
  };

  const handleConfirmEmergency = (message: string) => {
    setBuses((prev) =>
      prev.map((b) =>
        b.id === currentBus.id
          ? { ...b, emergencyActive: true, emergencyMessage: message }
          : b
      )
    );

    addNotification({
      type: 'emergency',
      title: `🚨 پەخشی فریاگوزاری و لەناکاو`,
      message: message,
      urgent: true,
    });
  };

  const handleClearEmergency = () => {
    setBuses((prev) =>
      prev.map((b) => ({ ...b, emergencyActive: false, emergencyMessage: undefined }))
    );
  };

  // Enforce role isolation: ONLY ADMIN (School Manager) CAN SEE ALL AND SWITCH ROLES
  const handleRoleChange = (role: 'driver' | 'parent' | 'manager') => {
    if (currentUser?.role === 'manager') {
      setActiveRole(role);
    } else if (currentUser?.role) {
      setActiveRole(currentUser.role);
    }
  };

  // Ensure non-admins are never stuck in manager role
  useEffect(() => {
    if (currentUser?.role && currentUser.role !== 'manager' && activeRole !== currentUser.role) {
      setActiveRole(currentUser.role);
    }
  }, [currentUser, activeRole]);

  // Privacy-isolated notifications:
  // Admin sees all notifications.
  // Driver sees bus notifications & emergencies.
  // Parents ONLY see notifications regarding their own child or school-wide alerts.
  const accessibleNotifications = useMemo(() => {
    if (!currentUser || currentUser.role === 'manager') {
      return notifications; // Admin can see all!
    }
    if (currentUser.role === 'driver') {
      return notifications.filter(
        (n) => !n.studentId || n.busId === currentBus.id || n.type === 'emergency' || n.type === 'delay'
      );
    }
    if (currentUser.role === 'parent') {
      const myKidIds = parentAccessibleStudents.map((s) => s.id);
      return notifications.filter((n) => {
        if (n.type === 'emergency' || n.type === 'delay') return true;
        if (n.studentId) return myKidIds.includes(n.studentId);
        return true;
      });
    }
    return notifications;
  }, [notifications, currentUser, parentAccessibleStudents, currentBus.id]);

  const unreadCount = accessibleNotifications.filter((n) => !n.read).length;

  if (!isLoggedIn) {
    return (
      <LoginPage
        buses={buses}
        students={students}
        school={school}
        currentShift={shift}
        onLogin={handleLogin}
        onContinueAsGuest={() => {
          handleLogin({
            id: 'guest_driver',
            name: 'کاک کاوە ئەحمەد',
            role: 'driver',
            emailOrPhone: '0750 445 8821',
            busId: 'bus_104',
            busNumber: 'Bus 104',
            title: 'شۆفێری پاسی قوتابخانە (میوان)',
          });
        }}
      />
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 text-right">
      {/* Top Header */}
      <Header
        currentUser={currentUser}
        onSignOut={handleSignOut}
        onOpenLogin={() => setIsLoggedIn(false)}
        activeRole={activeRole}
        onRoleChange={handleRoleChange}
        shift={shift}
        onShiftChange={setShift}
        emergencyActive={currentBus.emergencyActive}
        emergencyMessage={currentBus.emergencyMessage}
        onClearEmergency={handleClearEmergency}
        unreadCount={unreadCount}
        onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={() => {
          const next = !soundEnabled;
          setSoundEnabled(next);
          soundPlayer.soundEnabled = next;
        }}
      />

      {/* Main Content Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 flex flex-col lg:flex-row gap-5">
        {/* Left Side: Interactive Map */}
        <section
          className={`w-full ${
            activeRole === 'manager' ? 'lg:w-5/12' : 'lg:w-7/12'
          } flex flex-col min-h-[460px] lg:min-h-[640px]`}
        >
          <MapView
            school={school}
            bus={currentBus}
            students={students}
            waypoints={optimization.waypoints}
            routePolyline={roadPolyline}
            activeStudentId={selectedStudentId}
            parentStudentIds={activeRole === 'parent' ? parentAccessibleStudents.map((s) => s.id) : undefined}
            activeRole={activeRole}
            onSelectStudent={(id) => {
              if (activeRole === 'parent') {
                if (parentAccessibleStudents.some((s) => s.id === id)) {
                  setSelectedStudentId(id);
                }
              } else {
                setSelectedStudentId(id);
              }
            }}
            showComparisonRoute={showComparisonRoute}
            onToggleComparisonRoute={() => setShowComparisonRoute((prev) => !prev)}
            unoptimizedPolyline={unoptimizedRoadPolyline}
          />
        </section>

        {/* Right Side: Role Specific Controls */}
        <section
          className={`w-full ${
            activeRole === 'manager' ? 'lg:w-7/12' : 'lg:w-5/12'
          } flex flex-col space-y-4 overflow-y-auto`}
        >
          {activeRole === 'driver' && (
            <DriverConsole
              bus={currentBus}
              students={students.filter((s) => !s.busId || s.busId === currentBus.id)}
              school={school}
              waypoints={optimization.waypoints}
              metrics={optimization.metrics}
              shift={shift}
              onToggleDuty={handleToggleDuty}
              onTogglePhoneGps={handleTogglePhoneGps}
              onStartSimulation={handleStartSimulation}
              onPauseSimulation={handlePauseSimulation}
              onResetSimulation={handleResetSimulation}
              onSetSimulationSpeed={handleSetSimulationSpeed}
              onBoardStudent={handleBoardStudent}
              onMarkAbsent={handleMarkAbsent}
              onSkipStop={handleSkipStop}
              onOptimizeRoute={() => {
                // Trigger re-sorting
                setStudents((prev) => [...prev]);
              }}
              onReportDelay={() => setIsDelayModalOpen(true)}
              onTriggerEmergency={() => setIsEmergencyModalOpen(true)}
              onSelectStudent={setSelectedStudentId}
            />
          )}

          {activeRole === 'parent' && (
            <ParentPortal
              students={parentAccessibleStudents}
              allStudents={students}
              selectedStudentId={selectedStudentId}
              onSelectStudentId={setSelectedStudentId}
              bus={currentBus}
              school={school}
              shift={shift}
              parentName={currentUser?.role === 'parent' ? currentUser.name : parentAccessibleStudents[0]?.parentName}
              isAdmin={currentUser?.role === 'manager'}
              onAddChild={handleAddChildForParent}
              onSwitchParentDemo={handleSwitchParentDemo}
              onParentSendNotice={handleParentNotice}
              onUpdateStudentAddress={handleUpdateStudentAddress}
              onRevertToPermanentAddress={handleRevertToPermanentAddress}
            />
          )}

          {activeRole === 'manager' && (
            <SchoolManagerView
              school={school}
              buses={buses}
              students={students}
              metrics={optimization.metrics}
              shift={shift}
              onOpenBroadcastModal={() => setIsEmergencyModalOpen(true)}
              onOpenDelayModal={() => setIsDelayModalOpen(true)}
              onSelectStudent={setSelectedStudentId}
              onToggleAbsentStatus={handleToggleAbsentStatus}
              onFocusBusOnMap={(busId) => {
                const b = buses.find((item) => item.id === busId);
                if (b) {
                  setSelectedStudentId('');
                }
              }}
            />
          )}
        </section>
      </main>

      {/* Modals & Slide-over drawer */}
      <DelayModal
        isOpen={isDelayModalOpen}
        onClose={() => setIsDelayModalOpen(false)}
        onConfirmDelay={handleConfirmDelay}
      />

      <EmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        onConfirmEmergency={handleConfirmEmergency}
      />

      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        notifications={accessibleNotifications}
        onMarkAllRead={() => {
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        }}
      />
    </div>
  );
}
