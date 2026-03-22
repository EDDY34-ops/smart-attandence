// src/lib/api.ts
// Central API helper — all requests go through here

// In development the Vite dev-server proxy rewrites /api/* → http://localhost/smart-attendance/backend/api/*
// In production (when built files are served from Apache), /api/* hits Apache directly.
const BASE = '/api';

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include', // send session cookie
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? `HTTP ${res.status}`);
  }

  return data as T;
}

// ── Auth ─────────────────────────────────────────────────────────────────────
export interface EnrollmentRequest {
  id: string;
  userId?: string;
  classId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  className: string;
  classSection: string;
  userName?: string;
  userEmail?: string;
}

export const authApi = {
  login: (email: string, password: string) =>
    request<{ user: ApiUser }>('/auth/login.php', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  signup: (name: string, email: string, password: string, role: string = 'admin') =>
    request<{ user: ApiUser }>('/auth/signup.php', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    }),
  logout: () =>
    request<{ success: boolean }>('/auth/logout.php', { method: 'POST' }),
  me: () =>
    request<{ user: ApiUser }>('/auth/me.php'),
};

// ── Students ─────────────────────────────────────────────────────────────────
export const studentsApi = {
  list: () => request<Student[]>('/students/index.php'),
  create: (s: Omit<Student, 'id'>) =>
    request<Student>('/students/index.php', { method: 'POST', body: JSON.stringify(s) }),
  update: (s: Student) =>
    request<Student>(`/students/index.php?id=${s.id}`, { method: 'PUT', body: JSON.stringify(s) }),
  remove: (id: string) =>
    request<{ success: boolean }>(`/students/index.php?id=${id}`, { method: 'DELETE' }),
};

// ── Teachers ─────────────────────────────────────────────────────────────────
export const teachersApi = {
  list: () => request<Teacher[]>('/teachers/index.php'),
  create: (t: Omit<Teacher, 'id'>) =>
    request<Teacher>('/teachers/index.php', { method: 'POST', body: JSON.stringify(t) }),
  update: (t: Teacher) =>
    request<Teacher>(`/teachers/index.php?id=${t.id}`, { method: 'PUT', body: JSON.stringify(t) }),
  remove: (id: string) =>
    request<{ success: boolean }>(`/teachers/index.php?id=${id}`, { method: 'DELETE' }),
};

// ── Classes ───────────────────────────────────────────────────────────────────
export const classesApi = {
  list: () => request<ClassInfo[]>('/classes/index.php'),
  create: (c: Omit<ClassInfo, 'id'>) =>
    request<ClassInfo>('/classes/index.php', { method: 'POST', body: JSON.stringify(c) }),
  update: (c: ClassInfo) =>
    request<ClassInfo>(`/classes/index.php?id=${c.id}`, { method: 'PUT', body: JSON.stringify(c) }),
  remove: (id: string) =>
    request<{ success: boolean }>(`/classes/index.php?id=${id}`, { method: 'DELETE' }),
};

// ── Attendance ────────────────────────────────────────────────────────────────
export const attendanceApi = {
  list: () => request<AttendanceRecord[]>('/attendance/index.php'),
  submit: (records: Omit<AttendanceRecord, 'id'>[]) =>
    request<{ inserted: AttendanceRecord[]; count: number }>(
      '/attendance/index.php',
      { method: 'POST', body: JSON.stringify({ records }) }
    ),
};

// ── Shared types ──────────────────────────────────────────────────────────────
export interface ApiUser {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
}

export interface Student {
  id: string;
  name: string;
  email: string;
  classId: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  subject: string;
}

export interface ClassInfo {
  id: string;
  name: string;
  section: string;
  teacherId: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  classId: string;
  date: string;
  status: 'present' | 'absent' | 'late';
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  date: string;
  classId: string;
}

export const lessonsApi = {
  list: (classId?: string) => request<Lesson[]>(`/lessons/index.php${classId ? `?classId=${classId}` : ''}`),
  create: (l: Omit<Lesson, 'id'>) =>
    request<Lesson>('/lessons/index.php', { method: 'POST', body: JSON.stringify(l) }),
  update: (l: Lesson) =>
    request<{ success: boolean }>(`/lessons/index.php?id=${l.id}`, { method: 'PUT', body: JSON.stringify(l) }),
  remove: (id: string) =>
    request<{ success: boolean }>(`/lessons/index.php?id=${id}`, { method: 'DELETE' }),
};

export const enrollmentsApi = {
  list: () => request<EnrollmentRequest[]>('/enrollments/index.php'),
  request: (classId: string) =>
    request<{ success: boolean; id: number }>('/enrollments/index.php', {
      method: "POST",
      body: JSON.stringify({ classId }),
    }),
  updateStatus: (id: string, status: "approved" | "rejected") =>
    request<{ success: boolean }>(`/enrollments/index.php?id=${id}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),
};
