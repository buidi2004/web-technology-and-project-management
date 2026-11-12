export type Role = 'Student' | 'Organizer' | 'Admin';
export type ActivityType = 'CongTacXaHoi' | 'LaoDong';
export type ParticipationStatus = 'Registered' | 'CheckedIn' | 'Verified' | 'Rejected';
export type ActivityPhase = 'SapDienRa' | 'DangDienRa' | 'DaKetThuc';

export interface User {
  id: number;
  studentCode: string;
  fullName: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
  user: User;
}

export interface Activity {
  id: number;
  title: string;
  type: ActivityType;
  days: number;
  location: string;
  startAt: string;
  endAt: string;
}

export interface RegistrationResult {
  id: number;
  status: ParticipationStatus;
}

export interface MyParticipation {
  id: number;
  activityId: number;
  title: string;
  type: ActivityType;
  days: number;
  location: string;
  startAt: string;
  endAt: string;
  status: ParticipationStatus;
  checkedInAt: string | null;
  verifiedAt: string | null;
}

export interface Summary {
  ctxhDays: number;
  laoDongDays: number;
  verifiedActivities: number;
}
