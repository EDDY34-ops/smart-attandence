import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Users, ClipboardList, CheckCircle, XCircle, Clock, Plus, Pencil, Trash2, X, BookOpen } from "lucide-react";
import { useData, Lesson } from "@/contexts/DataContext";
import { useState } from "react";
import { toast } from "sonner";

export default function ClassDetail() {
  const { id } = useParams<{ id: string }>();
  const { classes, students, teachers, attendance, lessons, addLesson, updateLesson, deleteLesson } = useData();
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessonForm, setLessonForm] = useState({ title: "", description: "", date: new Date().toISOString().split("T")[0] });
  const [busy, setBusy] = useState(false);

  const classInfo = classes.find((c) => c.id === id);
  if (!classInfo) {
    return (
      <div className="animate-fade-in">
        <Link to="/classes" className="inline-flex items-center gap-2 text-sm text-primary hover:underline mb-4">
          <ArrowLeft size={16} /> Back to Classes
        </Link>
        <div className="dashboard-card text-center py-12">
          <p className="text-muted-foreground">Class not found.</p>
        </div>
      </div>
    );
  }

  const classLessons = lessons.filter(l => l.classId === id);
  const teacher = teachers.find((t) => t.id === classInfo.teacherId);
  const classStudents = students.filter((s) => s.classId === id);
  const classAttendance = attendance.filter((a) => a.classId === id);
  const presentCount = classAttendance.filter((a) => a.status === "present").length;
  const absentCount = classAttendance.filter((a) => a.status === "absent").length;
  const lateCount = classAttendance.filter((a) => a.status === "late").length;
  const attendanceRate = classAttendance.length > 0
    ? Math.round((presentCount / classAttendance.length) * 100)
    : 0;

  const handleLessonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonForm.title || !id) return;
    setBusy(true);
    try {
      if (editingLesson) {
        await updateLesson({ ...editingLesson, ...lessonForm });
        toast.success("Lesson updated");
      } else {
        await addLesson({ ...lessonForm, classId: id });
        toast.success("Lesson added");
      }
      setShowLessonForm(false);
      setEditingLesson(null);
      setLessonForm({ title: "", description: "", date: new Date().toISOString().split("T")[0] });
    } catch (err: any) {
      toast.error(err.message || "Failed to save lesson");
    } finally {
      setBusy(false);
    }
  };

  const openAddLesson = () => {
    setEditingLesson(null);
    setLessonForm({ title: "", description: "", date: new Date().toISOString().split("T")[0] });
    setShowLessonForm(true);
  };

  const openEditLesson = (l: Lesson) => {
    setEditingLesson(l);
    setLessonForm({ title: l.title, description: l.description, date: l.date });
    setShowLessonForm(true);
  };

  // Recent attendance (last 5 unique dates)
  const uniqueDates = [...new Set(classAttendance.map((a) => a.date))].sort().reverse().slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/classes" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h2 className="text-xl font-semibold text-foreground">{classInfo.name} — Section {classInfo.section}</h2>
            <p className="text-sm text-muted-foreground">Teacher: {teacher?.name || "Unassigned"}</p>
          </div>
        </div>
        <button
          onClick={openAddLesson}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={16} /> Add Lesson
        </button>
      </div>

      {showLessonForm && (
        <div className="dashboard-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">{editingLesson ? "Edit Lesson" : "Add Lesson"}</h3>
            <button onClick={() => setShowLessonForm(false)} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
          </div>
          <form onSubmit={handleLessonSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Title</label>
                <input
                  required
                  placeholder="Lesson Title"
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Date</label>
                <input
                  type="date"
                  required
                  value={lessonForm.date}
                  onChange={(e) => setLessonForm({ ...lessonForm, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-ring focus:outline-none text-foreground"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Description</label>
              <textarea
                placeholder="What will be covered in this lesson?"
                value={lessonForm.description}
                onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-ring focus:outline-none min-h-[80px]"
              />
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={busy}
                className="px-6 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center gap-2"
              >
                {busy && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {editingLesson ? "Update Lesson" : "Save Lesson"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { title: "Students", value: classStudents.length, icon: Users, color: "bg-primary" },
          { title: "Lessons", value: classLessons.length, icon: BookOpen, color: "bg-indigo-500" },
          { title: "Attendance", value: `${attendanceRate}%`, icon: ClipboardList, color: "bg-[hsl(var(--warning))]" },
          { title: "Present", value: presentCount, icon: CheckCircle, color: "bg-[hsl(var(--success))]" },
        ].map((s) => (
          <div key={s.title} className="dashboard-card flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center shrink-0`}>
              <s.icon size={18} className="text-primary-foreground" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Lessons List */}
          <div className="dashboard-card">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <BookOpen size={18} className="text-primary" /> Lessons History
            </h3>
            {classLessons.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8 border-2 border-dashed rounded-lg">No lessons recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {classLessons.map((l) => (
                  <div key={l.id} className="group p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-muted/30 transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{l.date}</span>
                          <h4 className="text-sm font-bold text-foreground truncate">{l.title}</h4>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{l.description || "No description provided."}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditLesson(l)} className="p-1.5 rounded-lg hover:bg-background text-muted-foreground hover:text-primary transition-colors">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => deleteLesson(l.id)} className="p-1.5 rounded-lg hover:bg-background text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Students list */}
          <div className="dashboard-card">
            <h3 className="font-semibold text-foreground mb-4">Enrolled Students</h3>
            {classStudents.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-6">No students enrolled in this class.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="py-3 px-2 font-semibold text-muted-foreground">Name</th>
                      <th className="py-3 px-2 font-semibold text-muted-foreground text-center">Records</th>
                      <th className="py-3 px-2 font-semibold text-muted-foreground text-center">Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classStudents.map((s) => {
                      const sAtt = classAttendance.filter((a) => a.studentId === s.id);
                      const sPresent = sAtt.filter((a) => a.status === "present").length;
                      const sRate = sAtt.length > 0 ? Math.round((sPresent / sAtt.length) * 100) : 0;
                      return (
                        <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                          <td className="py-3 px-2">
                            <div className="flex flex-col">
                              <span className="font-medium text-foreground">{s.name}</span>
                              <span className="text-[10px] text-muted-foreground">{s.email}</span>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-center text-muted-foreground">{sAtt.length}</td>
                          <td className="py-3 px-2 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${sRate >= 75 ? "bg-[hsl(var(--success))]/15 text-[hsl(var(--success))]" :
                                sRate >= 50 ? "bg-[hsl(var(--warning))]/15 text-[hsl(var(--warning))]" :
                                  "bg-destructive/15 text-destructive"
                              }`}>
                              {sRate}%
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

        <div className="space-y-6">
          {/* Recent attendance summary for sidebar */}
          <div className="dashboard-card">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <ClipboardList size={18} className="text-primary" /> Daily Trends
            </h3>
            {uniqueDates.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4 italic">No attendance records yet.</p>
            ) : (
              <div className="space-y-3">
                {uniqueDates.map((date) => {
                  const dayRecords = classAttendance.filter((a) => a.date === date);
                  const dp = dayRecords.filter((a) => a.status === "present").length;
                  const da = dayRecords.filter((a) => a.status === "absent").length;
                  const dl = dayRecords.filter((a) => a.status === "late").length;
                  return (
                    <div key={date} className="flex flex-col gap-1 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                      <span className="text-[11px] font-bold text-muted-foreground">{date}</span>
                      <div className="flex items-center gap-3 text-[10px] font-bold">
                        <span className="flex items-center gap-1 text-[hsl(var(--success))] bg-[hsl(var(--success))]/10 px-1.5 py-0.5 rounded"><CheckCircle size={10} /> {dp}</span>
                        <span className="flex items-center gap-1 text-destructive bg-destructive/10 px-1.5 py-0.5 rounded"><XCircle size={10} /> {da}</span>
                        <span className="flex items-center gap-1 text-[hsl(var(--warning))] bg-[hsl(var(--warning))]/10 px-1.5 py-0.5 rounded"><Clock size={10} /> {dl}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
