export type TripShift = 'morning_pickup' | 'afternoon_dropoff';

export type UserRole = 'driver' | 'parent' | 'manager';

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
  emailOrPhone: string;
  avatarBg?: string;
  busId?: string;
  busNumber?: string;
  studentId?: string;
  studentIds?: string[];
  studentName?: string;
  schoolName?: string;
  title?: string;
}

export type StudentStatus =
  | 'home_waiting'
  | 'proximity_alert_sent'
  | 'bus_arrived'
  | 'boarded'
  | 'at_school'
  | 'absent'
  | 'returning_home'
  | 'dropped_off';

export interface Student {
  id: string;
  name: string;
  grade: string;
  avatarBg: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  permanentAddress: string;
  permanentLat: number;
  permanentLng: number;
  address: string; // active pickup/dropoff address
  lat: number;
  lng: number;
  isTemporaryAddress?: boolean;
  addressChangeReason?: string;
  addressUpdatedAt?: string;
  busId: string;
  schoolId: string;
  pickupSequence: number; // optimized order
  dropoffSequence: number;
  originalSequence: number; // naive unoptimized order
  status: StudentStatus;
  boardedTime?: string;
  dropoffTime?: string;
  etaMinutes: number;
  distanceKm: number;
  notes?: string;
  proximityAlertTriggered: boolean;
}

export interface School {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  morningBell: string;
  afternoonDismissal: string;
  principalName: string;
  phone: string;
}

export interface Bus {
  id: string;
  busNumber: string;
  plate: string;
  driverName: string;
  driverPhone: string;
  driverPhoto: string;
  capacity: number;
  fuelTankLiters: number;
  avgLitersPer100Km: number;
  currentLat: number;
  currentLng: number;
  heading: number; // degrees
  speedKmh: number;
  status: 'idle' | 'en_route' | 'at_school' | 'delayed' | 'emergency';
  isOnDuty: boolean; // Driver phone active duty toggle
  dutyStartedAt?: string;
  phoneGpsActive?: boolean;
  assignedSchoolId: string;
  currentStopIndex: number;
  isSimulating: boolean;
  simulationSpeed: number; // 1x, 2x, 5x, 10x
  delayMinutes: number;
  delayReason?: string;
  emergencyActive: boolean;
  emergencyMessage?: string;
}

export interface StopWaypoint {
  id: string;
  type: 'school_origin' | 'student_stop' | 'school_destination';
  studentId?: string;
  studentName?: string;
  address: string;
  lat: number;
  lng: number;
  estimatedArrival: string;
  distanceFromPrevKm: number;
  timeFromPrevMin: number;
  status: 'completed' | 'current' | 'pending' | 'skipped';
  is1MinProximity: boolean;
}

export interface OptimizationMetrics {
  originalDistanceKm: number;
  optimizedDistanceKm: number;
  distanceSavedKm: number;
  percentDistanceSaved: number;

  originalTimeMin: number;
  optimizedTimeMin: number;
  timeSavedMin: number;

  fuelSavedLiters: number;
  fuelCostSavedUsd: number;
  co2SavedKg: number;
}

export interface AppNotification {
  id: string;
  timestamp: string;
  type: 'proximity_1min' | 'delay' | 'emergency' | 'boarded' | 'school_arrival' | 'dropoff' | 'info';
  title: string;
  message: string;
  studentId?: string;
  studentName?: string;
  busId?: string;
  busNumber?: string;
  urgent?: boolean;
  read: boolean;
}
