import { useState } from "react";
import { Plus, Check, Clock, X } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { toast } from "sonner";

export default function StudentEnrollment() {
    const { classes = [], enrollmentRequests = [], requestEnrollment } = useData();
    const requests = Array.isArray(enrollmentRequests) ? enrollmentRequests : [];
    const [selectedClass, setSelectedClass] = useState("");
    const [busy, setBusy] = useState(false);

    const handleRequest = async () => {
        if (!selectedClass) {
            toast.error("Please select a class");
            return;
        }

        setBusy(true);
        try {
            await requestEnrollment(selectedClass);
            toast.success("Enrollment request submitted!");
            setSelectedClass("");
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : "Failed to submit request");
        } finally {
            setBusy(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "approved": return <Check size={16} className="text-[hsl(var(--success))]" />;
            case "rejected": return <X size={16} className="text-destructive" />;
            default: return <Clock size={16} className="text-[hsl(var(--warning))]" />;
        }
    };

    const getStatusBadge = (status: string) => {
        const base = "px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider";
        switch (status) {
            case "approved": return `${base} bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]`;
            case "rejected": return `${base} bg-destructive/10 text-destructive`;
            default: return `${base} bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]`;
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-bold text-foreground">Enrollment Requests</h2>
                <p className="text-sm text-muted-foreground">Request to join a class and track your status.</p>
            </div>

            <div className="dashboard-card max-w-xl">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <Plus size={16} className="text-primary" /> Request New Enrollment
                </h3>
                <div className="flex flex-col sm:flex-row gap-3">
                    <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        <option value="">Select a Class to Join...</option>
                        {classes.map((c) => (
                            <option key={c.id} value={c.id}>{c.name} - {c.section}</option>
                        ))}
                    </select>
                    <button
                        onClick={handleRequest}
                        disabled={busy || !selectedClass}
                        className="px-6 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {busy && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                        Submit Request
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-sm font-semibold">Your Recent Requests</h3>
                {requests.length === 0 ? (
                    <div className="dashboard-card py-12 text-center">
                        <p className="text-muted-foreground text-sm">You haven't submitted any enrollment requests yet.</p>
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {requests.map((req) => (
                            <div key={req.id} className="dashboard-card flex items-center justify-between group hover:border-primary/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${req.status === 'approved' ? 'bg-[hsl(var(--success))]/10' :
                                        req.status === 'rejected' ? 'bg-destructive/10' : 'bg-[hsl(var(--warning))]/10'
                                        }`}>
                                        {getStatusIcon(req.status)}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-foreground">{req.className}</h4>
                                        <p className="text-xs text-muted-foreground">Section: {req.classSection} • {new Date(req.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className={getStatusBadge(req.status)}>
                                        {req.status}
                                    </span>
                                    {req.status === 'pending' && <p className="text-[10px] text-muted-foreground italic">Waiting for approval</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
