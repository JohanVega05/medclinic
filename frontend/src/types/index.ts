export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: 'patient' | 'doctor' | 'admin';
  phone: string;
  photo: string | null;
  created_at: string;
}

export interface Specialty {
  id: number;
  name: string;
  description: string;
  icon: string;
  is_active: boolean;
}

export interface Schedule {
  id: number;
  weekday: number;
  weekday_display: string;
  start_time: string;
  end_time: string;
  slot_minutes: number;
  is_active: boolean;
}

export interface Doctor {
  id: string;
  user: User;
  specialty: Specialty;
  license_number: string;
  bio: string;
  consultation_fee: string;
  years_experience: number;
  is_available: boolean;
  schedules: Schedule[];
  average_rating: number;
  created_at: string;
}

export interface Appointment {
  id: string;
  doctor: string;
  doctor_detail: Doctor;
  patient: string;
  patient_detail: User;
  scheduled_at: string;
  end_at: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  reason: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface Prescription {
  id: number;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface MedicalRecord {
  id: string;
  appointment: string;
  diagnosis: string;
  treatment: string;
  notes: string;
  prescriptions: Prescription[];
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  doctor: string;
  doctor_detail: Doctor;
  patient: string;
  patient_detail: User;
  appointment: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface AuthTokens {
  access: string;
  refresh: string;
}