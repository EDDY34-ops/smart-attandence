import { Check, X, User } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { toast } from "sonner";

export default function ManageEnrollments() {
    const { enrollmentRequests = [], updateEnrollmentStatus } = useData();
    const requests = Array.isArray(enrollmentRequests) ? enrollmentRequests : [];

    const pendingRequests = requests.filter(r => r.status === 'pending');
    const pastRequests = requests.filter(r => r.status !== 'pending');

    const handleAction = async (id: string, status: 'approved' | 'rejected') => {
        try {
            await updateEnrollmentStatus(id, status);
            toast.success(`Request ${status} successfully`);
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : "Failed to update request");
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-bold text-foreground">Enrollment Management</h2>
                <p className="text-sm text-muted-foreground">Approve or reject student requests to join your classes.</p>
            </div>

            <div className="space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                    Pending Requests <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px]">{pendingRequests.length}</span>
                </h3>
                {pendingRequests.length === 0 ? (
                    <div className="dashboard-card py-12 text-center border-dashed">
                        <p className="text-muted-foreground text-sm">No pending enrollment requests.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {pendingRequests.map((req) => (
                            <div key={req.id} className="dashboard-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                                        <User size={20} className="text-muted-foreground" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-foreground">{req.userName}</h4>
                                        <p className="text-xs text-muted-foreground">{req.userEmail}</p>
                                        <div className="mt-1 flex items-center gap-2 text-[10px] font-medium text-primary uppercase tracking-wider">
                                            Joining: {req.className} ({req.classSection})
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleAction(req.id, 'rejected')}
                                        className="flex-1 sm:flex-none px-4 py-2 rounded-lg border border-destructive text-destructive text-sm font-medium hover:bg-destructive/5 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <X size={16} /> Reject
                                    </button>
                                    <button
                                        onClick={() => handleAction(req.id, 'approved')}
                                        className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-[hsl(var(--success))] text-white text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                                    >
                                        <Check size={16} /> Approve
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {pastRequests.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold opacity-70">Recent History</h3>
                    <div className="dashboard-card overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border text-muted-foreground">
                                    <th className="text-left py-3 px-2 font-semibold">Student</th>
                                    <th className="text-left py-3 px-2 font-semibold">Class</th>
                                    <th className="text-left py-3 px-2 font-semibold">Status</th>
                                    <th className="text-right py-3 px-2 font-semibold">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pastRequests.map((req) => (
                                    <tr key={req.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                                        <td className="py-3 px-2">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-foreground">{req.userName}</span>
                                                <span className="text-[10px] text-muted-foreground">{req.userEmail}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-2 text-muted-foreground">
                                            {req.className} ({req.classSection})
                                        </td>
                                        <td className="py-3 px-2">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${req.status === 'approved' ? 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]' : 'bg-destructive/10 text-destructive'
                                                }`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-2 text-right text-muted-foreground">
                                            {new Date(req.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
