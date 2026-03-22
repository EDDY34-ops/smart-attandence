import { useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { useData, Teacher } from "@/contexts/DataContext";
import { toast } from "sonner";

export default function ManageTeachers() {
  const { teachers, addTeacher, updateTeacher, deleteTeacher } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Teacher | null>(null);
  const [form, setForm] = useState({ name: "", email: "", subject: "" });
  const [busy, setBusy] = useState(false);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", email: "", subject: "" });
    setShowForm(true);
  };

  const openEdit = (t: Teacher) => {
    setEditing(t);
    setForm({ name: t.name, email: t.email, subject: t.subject });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) return;
    setBusy(true);
    try {
      if (editing) {
        await updateTeacher({ ...editing, ...form });
        toast.success("Teacher updated");
      } else {
        await addTeacher(form);
        toast.success("Teacher added");
      }
      setShowForm(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save teacher");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this teacher?")) return;
    try {
      await deleteTeacher(id);
      toast.success("Teacher deleted");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete teacher");
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Teachers</h2>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus size={16} /> Add Teacher
        </button>
      </div>

      {showForm && (
        <div className="dashboard-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">{editing ? "Edit Teacher" : "Add Teacher"}</h3>
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
            <input
              placeholder="Subject"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
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
        {teachers.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">No teachers yet. Click "Add Teacher" to get started.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 font-semibold text-muted-foreground">ID</th>
                <th className="text-left py-3 px-2 font-semibold text-muted-foreground">Name</th>
                <th className="text-left py-3 px-2 font-semibold text-muted-foreground">Email</th>
                <th className="text-left py-3 px-2 font-semibold text-muted-foreground">Subject</th>
                <th className="text-right py-3 px-2 font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((t) => (
                <tr key={t.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="py-3 px-2 text-foreground">{t.id}</td>
                  <td className="py-3 px-2 text-foreground">{t.name}</td>
                  <td className="py-3 px-2 text-muted-foreground">{t.email}</td>
                  <td className="py-3 px-2 text-muted-foreground">{t.subject}</td>
                  <td className="py-3 px-2 text-right space-x-2">
                    <button onClick={() => openEdit(t)} className="text-primary hover:opacity-70 transition-opacity"><Pencil size={15} /></button>
                    <button onClick={() => handleDelete(t.id)} className="text-destructive hover:opacity-70 transition-opacity"><Trash2 size={15} /></button>
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
