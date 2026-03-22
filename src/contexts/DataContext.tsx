import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {
  studentsApi,
  teachersApi,
  classesApi,
  attendanceApi,
  Student,
  Teacher,
  ClassInfo,
  AttendanceRecord,
  Lesson,
  lessonsApi,
  enrollmentsApi,
  EnrollmentRequest,
} from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

// Re-export types so existing page imports keep working
export type { Student, Teacher, ClassInfo, AttendanceRecord, Lesson };

interface DataContextType {
  students: Student[];
  teachers: Teacher[];
  classes: ClassInfo[];
  attendance: AttendanceRecord[];
  loading: boolean;
  // Students
  addStudent: (s: Omit<Student, "id">) => Promise<void>;
  updateStudent: (s: Student) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  // Teachers
  addTeacher: (t: Omit<Teacher, "id">) => Promise<void>;
  updateTeacher: (t: Teacher) => Promise<void>;
  deleteTeacher: (id: string) => Promise<void>;
  // Classes
  addClass: (c: Omit<ClassInfo, "id">) => Promise<void>;
  updateClass: (c: ClassInfo) => Promise<void>;
  deleteClass: (id: string) => Promise<void>;
  // Lessons
  lessons: Lesson[];
  addLesson: (l: Omit<Lesson, "id">) => Promise<void>;
  updateLesson: (l: Lesson) => Promise<void>;
  deleteLesson: (id: string) => Promise<void>;
  // Attendance
  submitAttendance: (records: Omit<AttendanceRecord, "id">[]) => Promise<void>;
  // Enrollments
  enrollmentRequests: EnrollmentRequest[];
  requestEnrollment: (classId: string) => Promise<void>;
  updateEnrollmentStatus: (id: string, status: "approved" | "rejected") => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
};

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [enrollmentRequests, setEnrollmentRequests] = useState<EnrollmentRequest[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch everything once the user is confirmed authenticated
  const fetchAll = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);

    const safeFetch = async <T,>(fn: () => Promise<T>, fallback: T, name: string): Promise<T> => {
      try {
        return await fn();
      } catch (err) {
        console.warn(`Failed to fetch ${name}:`, err);
        return fallback;
      }
    };

    try {
      const [s, t, c, a, er, les] = await Promise.all([
        safeFetch(studentsApi.list, [], "students"),
        safeFetch(teachersApi.list, [], "teachers"),
        safeFetch(classesApi.list, [], "classes"),
        safeFetch(attendanceApi.list, [], "attendance"),
        safeFetch(enrollmentsApi.list, [], "enrollments"),
        safeFetch(lessonsApi.list, [], "lessons"),
      ]);

      setStudents(s);
      setTeachers(t);
      setClasses(c);
      setAttendance(a);
      setEnrollmentRequests(er);
      setLessons(les);
    } catch (err) {
      console.error("Critical error in fetchAll:", err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!authLoading) fetchAll();
  }, [authLoading, fetchAll]);

  // ── Students ───────────────────────────────────────────────────────────────
  const addStudent = async (s: Omit<Student, "id">) => {
    const created = await studentsApi.create(s);
    setStudents((p) => [...p, created]);
  };
  const updateStudent = async (s: Student) => {
    const updated = await studentsApi.update(s);
    setStudents((p) => p.map((x) => (x.id === s.id ? updated : x)));
  };
  const deleteStudent = async (id: string) => {
    await studentsApi.remove(id);
    setStudents((p) => p.filter((x) => x.id !== id));
  };

  // ── Teachers ───────────────────────────────────────────────────────────────
  const addTeacher = async (t: Omit<Teacher, "id">) => {
    const created = await teachersApi.create(t);
    setTeachers((p) => [...p, created]);
  };
  const updateTeacher = async (t: Teacher) => {
    const updated = await teachersApi.update(t);
    setTeachers((p) => p.map((x) => (x.id === t.id ? updated : x)));
  };
  const deleteTeacher = async (id: string) => {
    await teachersApi.remove(id);
    setTeachers((p) => p.filter((x) => x.id !== id));
  };

  // ── Classes ────────────────────────────────────────────────────────────────
  const addClass = async (c: Omit<ClassInfo, "id">) => {
    const created = await classesApi.create(c);
    setClasses((p) => [...p, created]);
  };
  const updateClass = async (c: ClassInfo) => {
    const updated = await classesApi.update(c);
    setClasses((p) => p.map((x) => (x.id === c.id ? updated : x)));
  };
  const deleteClass = async (id: string) => {
    await classesApi.remove(id);
    setClasses((p) => p.filter((x) => x.id !== id));
  };

  // ── Lessons ────────────────────────────────────────────────────────────────
  const addLesson = async (l: Omit<Lesson, "id">) => {
    const created = await lessonsApi.create(l);
    setLessons((p) => [created, ...p]);
  };
  const updateLesson = async (l: Lesson) => {
    await lessonsApi.update(l);
    setLessons((p) => p.map((x) => (x.id === l.id ? l : x)));
  };
  const deleteLesson = async (id: string) => {
    await lessonsApi.remove(id);
    setLessons((p) => p.filter((x) => x.id !== id));
  };

  // ── Attendance ─────────────────────────────────────────────────────────────
  const submitAttendance = async (records: Omit<AttendanceRecord, "id">[]) => {
    const result = await attendanceApi.submit(records);
    setAttendance((p) => {
      // Upsert: replace any existing record with same studentId+classId+date
      const merged = [...p];
      for (const ins of result.inserted) {
        const idx = merged.findIndex(
          (x) =>
            x.studentId === ins.studentId &&
            x.classId === ins.classId &&
            x.date === ins.date
        );
        if (idx >= 0) merged[idx] = ins;
        else merged.push(ins);
      }
      return merged;
    });
  };
  // ── Enrollments ─────────────────────────────────────────────────────────────
  const requestEnrollment = async (classId: string) => {
    await enrollmentsApi.request(classId);
    // Refresh requests
    const er = await enrollmentsApi.list();
    setEnrollmentRequests(er);
  };

  const updateEnrollmentStatus = async (id: string, status: "approved" | "rejected") => {
    await enrollmentsApi.updateStatus(id, status);
    // Refresh requests and potentially students/attendance if approved
    const [er, s] = await Promise.all([
      enrollmentsApi.list(),
      studentsApi.list(),
    ]);
    setEnrollmentRequests(er);
    setStudents(s);
  };
  return (
    <DataContext.Provider
      value={{
        students,
        teachers,
        classes,
        attendance,
        enrollmentRequests,
        loading,
        addStudent,
        updateStudent,
        deleteStudent,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        addClass,
        updateClass,
        deleteClass,
        lessons,
        addLesson,
        updateLesson,
        deleteLesson,
        submitAttendance,
        requestEnrollment,
        updateEnrollmentStatus,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
