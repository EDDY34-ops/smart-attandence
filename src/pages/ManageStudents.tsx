import { useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { useData, Student } from "@/contexts/DataContext";
import { toast } from "sonner";

export default function ManageStudents() {
  const { students, classes, addStudent, updateStudent, deleteStudent } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [form, setForm] = useState({ name: "", email: "", classId: "" });
  const [busy, setBusy] = useState(false);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", email: "", classId: "" });
    setShowForm(true);
  };

  const openEdit = (s: Student) => {
    setEditing(s);
    setForm({ name: s.name, email: s.email, classId: s.classId });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) return;
    setBusy(true);
    try {
      if (editing) {
        await updateStudent({ ...editing, ...form });
        toast.success("Student updated");
      } else {
        await addStudent(form);
        toast.success("Student added");
      }
      setShowForm(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save student");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this student?")) return;
    try {
      await deleteStudent(id);
      toast.success("Student deleted");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete student");
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Students</h2>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus size={16} /> Add Student
        </button>
      </div>

      {showForm && (
        <div className="dashboard-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">{editing ? "Edit Student" : "Add Student"}</h3>
            <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid sm:grid-cols-3 gap-3">
            <input
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <select
              value={form.classId}
              onChange={(e) => setForm({ ...form, classId: e.target.value })}
              className="px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select Class</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name} - {c.section}</option>)}
            </select>
            <button
              type="submit"
              disabled={busy}
              className="sm:col-span-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {busy && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {editing ? "Update" : "Add"}
            </button>
          </form>
        </div>
      )}

      <div className="dashboard-card overflow-x-auto">
        {students.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">No students yet. Click "Add Student" to get started.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 font-semibold text-muted-foreground">ID</th>
                <th className="text-left py-3 px-2 font-semibold text-muted-foreground">Name</th>
                <th className="text-left py-3 px-2 font-semibold text-muted-foreground">Email</th>
                <th className="text-left py-3 px-2 font-semibold text-muted-foreground">Class</th>
                <th className="text-right py-3 px-2 font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="py-3 px-2 text-foreground">{s.id}</td>
                  <td className="py-3 px-2 text-foreground">{s.name}</td>
                  <td className="py-3 px-2 text-muted-foreground">{s.email}</td>
                  <td className="py-3 px-2 text-muted-foreground">{classes.find((c) => c.id === s.classId)?.name || "—"}</td>
                  <td className="py-3 px-2 text-right space-x-2">
                    <button onClick={() => openEdit(s)} className="text-primary hover:opacity-70 transition-opacity"><Pencil size={15} /></button>
                    <button onClick={() => handleDelete(s.id)} className="text-destructive hover:opacity-70 transition-opacity"><Trash2 size={15} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
