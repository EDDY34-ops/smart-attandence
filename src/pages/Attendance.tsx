import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Calendar, CheckCircle, XCircle, Clock } from "lucide-react";

export default function Attendance() {
  const { students, classes, attendance, submitAttendance } = useData();
  const { userRole, userEmail } = useAuth();
  const [selectedClass, setSelectedClass] = useState("");
  const [statuses, setStatuses] = useState<Record<string, "present" | "absent" | "late">>({});
  const [busy, setBusy] = useState(false);

  const isStudent = userRole === "student";
  const myStudentProfile = students.find(s => s.email === userEmail);
  const myAttendance = attendance
    .filter(a => a.studentId === myStudentProfile?.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const classStudents = students.filter((s) => s.classId === selectedClass);

  const handleClassChange = (classId: string) => {
    setSelectedClass(classId);
    setStatuses({});
  };

  const handleStatusChange = (studentId: string, status: "present" | "absent" | "late") => {
    setStatuses((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = async () => {
    if (!selectedClass) return;
    const today = new Date().toISOString().split("T")[0];
    const records = classStudents
      .filter((s) => statuses[s.id])
      .map((s) => ({
        studentId: s.id,
        classId: selectedClass,
        date: today,
        status: statuses[s.id],
      }));

    if (records.length === 0) {
      toast.error("Please mark attendance for at least one student");
      return;
    }

    setBusy(true);
    try {
      await submitAttendance(records);
      toast.success("Attendance submitted successfully!");
      setStatuses({});
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to submit attendance");
    } finally {
      setBusy(false);
    }
  };

  if (isStudent) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">My Attendance History</h2>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-[hsl(var(--success))] font-medium">
              <CheckCircle size={16} /> {myAttendance.filter(a => a.status === 'present').length} Present
            </div>
            <div className="flex items-center gap-1.5 text-destructive font-medium">
              <XCircle size={16} /> {myAttendance.filter(a => a.status === 'absent').length} Absent
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          {myAttendance.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-12">No attendance records found yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="py-3 px-2 font-semibold text-muted-foreground">Date</th>
                    <th className="py-3 px-2 font-semibold text-muted-foreground">Class</th>
                    <th className="py-3 px-2 font-semibold text-muted-foreground text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {myAttendance.map((rec) => {
                    const cls = classes.find(c => c.id === rec.classId);
                    return (
                      <tr key={rec.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2 text-foreground font-medium">
                            <Calendar size={14} className="text-muted-foreground" />
                            {rec.date}
                          </div>
                        </td>
                        <td className="py-3 px-2 text-muted-foreground">{cls ? `${cls.name} (${cls.section})` : "Unknown Class"}</td>
                        <td className="py-3 px-2 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${rec.status === "present" ? "bg-[hsl(var(--success))]/15 text-[hsl(var(--success))]" :
                            rec.status === "absent" ? "bg-destructive/15 text-destructive" :
                              "bg-[hsl(var(--warning))]/15 text-[hsl(var(--warning))]"
                            }`}>
                            {rec.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-xl font-semibold text-foreground">Take Attendance</h2>

      <div className="dashboard-card">
        <label className="block text-sm font-medium text-foreground mb-2">Select Class</label>
        <select
          value={selectedClass}
          onChange={(e) => handleClassChange(e.target.value)}
          className="w-full sm:w-72 px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Choose a class...</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.name} - {c.section}</option>
          ))}
        </select>
      </div>

      {selectedClass && (
        <div className="dashboard-card overflow-x-auto">
          {classStudents.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">No students in this class yet.</p>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 font-semibold text-muted-foreground">Name</th>
                    <th className="text-center py-3 px-2 font-semibold text-muted-foreground">Present</th>
                    <th className="text-center py-3 px-2 font-semibold text-muted-foreground">Absent</th>
                    <th className="text-center py-3 px-2 font-semibold text-muted-foreground">Late</th>
                  </tr>
                </thead>
                <tbody>
                  {classStudents.map((s) => (
                    <tr key={s.id} className="border-b border-border last:border-0">
                      <td className="py-3 px-2 text-foreground">{s.name}</td>
                      {(["present", "absent", "late"] as const).map((status) => (
                        <td key={status} className="py-3 px-2 text-center">
                          <input
                            type="radio"
                            name={`attendance-${s.id}`}
                            checked={statuses[s.id] === status}
                            onChange={() => handleStatusChange(s.id, status)}
                            className="w-4 h-4 accent-primary"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                onClick={handleSubmit}
                disabled={busy}
                className="mt-4 px-6 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center gap-2"
              >
                {busy && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                Submit Attendance
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
