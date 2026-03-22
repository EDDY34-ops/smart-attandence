import { useState } from "react";
import { Plus, Pencil, Trash2, X, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { useData, ClassInfo } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function ManageClasses() {
  const { classes, teachers, addClass, updateClass, deleteClass } = useData();
  const { userRole, userEmail } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ClassInfo | null>(null);
  const [form, setForm] = useState({ name: "", section: "", teacherId: "" });
  const [busy, setBusy] = useState(false);

  const currentUserAsTeacher = teachers.find(t => t.email === userEmail);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", section: "", teacherId: "" });
    setShowForm(true);
  };

  const openEdit = (c: ClassInfo) => {
    setEditing(c);
    setForm({ name: c.name, section: c.section, teacherId: c.teacherId });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.section) return;
    setBusy(true);
    try {
      if (editing) {
        await updateClass({ ...editing, ...form });
        toast.success("Class updated");
      } else {
        await addClass(form);
        toast.success("Class added");
      }
      setShowForm(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save class");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this class? All enrolled students will be unlinked.")) return;
    try {
      await deleteClass(id);
      toast.success("Class deleted");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete class");
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Classes</h2>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus size={16} /> Add Class
        </button>
      </div>

      {showForm && (
        <div className="dashboard-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">{editing ? "Edit Class" : "Add Class"}</h3>
            <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid sm:grid-cols-3 gap-3">
            <input
              placeholder="Class Name (e.g. Grade 10)"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              placeholder="Section (e.g. A)"
              value={form.section}
              onChange={(e) => setForm({ ...form, section: e.target.value })}
              className="px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {userRole === 'admin' ? (
              <select
                value={form.teacherId}
                onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
                className="px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">{teachers.length === 0 ? "No Teachers Registered" : "Assign Teacher"}</option>
                {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            ) : (
              <div className="px-3 py-2 rounded-lg border border-input bg-muted/30 text-sm text-muted-foreground flex items-center italic">
                Will be assigned to: {currentUserAsTeacher?.name || userEmail}
              </div>
            )}
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
        {classes.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">No classes yet. Click "Add Class" to get started.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 font-semibold text-muted-foreground">ID</th>
                <th className="text-left py-3 px-2 font-semibold text-muted-foreground">Name</th>
                <th className="text-left py-3 px-2 font-semibold text-muted-foreground">Section</th>
                <th className="text-left py-3 px-2 font-semibold text-muted-foreground">Teacher</th>
                <th className="text-right py-3 px-2 font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="py-3 px-2 text-foreground">{c.id}</td>
                  <td className="py-3 px-2 text-foreground">{c.name}</td>
                  <td className="py-3 px-2 text-muted-foreground">{c.section}</td>
                  <td className="py-3 px-2 text-muted-foreground">{teachers.find((t) => t.id === c.teacherId)?.name || "—"}</td>
                  <td className="py-3 px-2 text-right space-x-2">
                    <Link to={`/classes/${c.id}`} className="inline-block text-primary hover:opacity-70 transition-opacity"><Eye size={15} /></Link>
                    <button onClick={() => openEdit(c)} className="text-primary hover:opacity-70 transition-opacity"><Pencil size={15} /></button>
                    <button onClick={() => handleDelete(c.id)} className="text-destructive hover:opacity-70 transition-opacity"><Trash2 size={15} /></button>
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
