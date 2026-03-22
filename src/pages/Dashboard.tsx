import { Link } from "react-router-dom";
import { Users, GraduationCap, School, ClipboardList, ArrowRight, TrendingUp, Calendar, Plus, UserPlus } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const { students, teachers, classes, attendance: allAttendance } = useData();
  const { userRole, userEmail, userName } = useAuth();

  const isStudent = userRole === "student";
  const myProfile = students.find(s => s.email === userEmail);
  const attendance = isStudent
    ? allAttendance.filter(a => a.studentId === myProfile?.id)
    : allAttendance;

  const today = new Date().toISOString().split("T")[0];
  const todayAttendance = attendance.filter((a) => a.date === today);
  const presentToday = todayAttendance.filter((a) => a.status === "present").length;

  const totalPresent = attendance.filter((a) => a.status === "present").length;
  const overallRate = attendance.length > 0 ? Math.round((totalPresent / attendance.length) * 100) : 0;

  const stats = [
    ...(userRole === "admin" ? [{ title: "Total Students", value: students.length, icon: Users, color: "bg-primary" }] : []),
    ...(userRole === "admin" ? [{ title: "Total Teachers", value: teachers.length, icon: GraduationCap, color: "bg-[hsl(var(--success))]" }] : []),
    { title: isStudent ? "My Classes" : "Total Classes", value: isStudent ? classes.filter(c => attendance.some(a => a.classId === c.id)).length : classes.length, icon: School, color: "bg-[hsl(var(--warning))]" },
    { title: "Present Today", value: presentToday, icon: ClipboardList, color: "bg-[hsl(var(--info))]" },
  ];

  const chartData = classes.map((c) => {
    const classAtt = attendance.filter((a) => a.classId === c.id && a.date === today);
    return {
      name: c.name,
      Present: classAtt.filter((a) => a.status === "present").length,
      Absent: classAtt.filter((a) => a.status === "absent").length,
      Late: classAtt.filter((a) => a.status === "late").length,
    };
  });

  // Recent attendance records (last 10)
  const recentRecords = [...attendance].reverse().slice(0, 10).map((a) => {
    const student = students.find((s) => s.id === a.studentId);
    const cls = classes.find((c) => c.id === a.classId);
    return { ...a, studentName: student?.name || "Unknown", className: cls?.name || "Unknown" };
  });

  const allActions = [
    { title: "Manage Students", path: "/students", icon: Users, roles: ["admin"] },
    { title: "Manage Teachers", path: "/teachers", icon: GraduationCap, roles: ["admin"] },
    { title: "Manage Classes", path: "/classes", icon: School, roles: ["admin"] },
    { title: "Take Attendance", path: "/attendance", icon: ClipboardList, roles: ["admin", "teacher"] },
    { title: "View Reports", path: "/reports", icon: TrendingUp, roles: ["admin", "teacher"] },
    { title: "Request Enrollment", path: "/enrollment", icon: Plus, roles: ["student"] },
    { title: "Manage Enrollments", path: "/manage-enrollments", icon: UserPlus, roles: ["admin", "teacher"] },
  ];

  const quickActions = allActions.filter(a => a.roles.includes(userRole));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.title} className="dashboard-card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${s.color} flex items-center justify-center shrink-0`}>
              <s.icon size={22} className="text-primary-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Overall rate + Quick actions */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="dashboard-card lg:col-span-1">
          <h3 className="font-semibold text-foreground mb-4">Overall Attendance</h3>
          <div className="flex flex-col items-center py-4">
            <div className="relative w-28 h-28">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="3"
                  strokeDasharray={`${overallRate}, 100`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-foreground">{overallRate}%</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-3">{attendance.length} total records</p>
          </div>
        </div>

        <div className="dashboard-card lg:col-span-2">
          <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="grid sm:grid-cols-2 gap-2">
            {quickActions.map((a) => (
              <Link
                key={a.path}
                to={a.path}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <a.icon size={18} className="text-primary" />
                  <span className="text-sm font-medium text-foreground">{a.title}</span>
                </div>
                <ArrowRight size={14} className="text-muted-foreground group-hover:text-foreground transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="dashboard-card">
        <h2 className="text-lg font-semibold text-foreground mb-4">Today's Attendance by Class</h2>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 90%)" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="Present" fill="hsl(142 71% 45%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Absent" fill="hsl(0 72% 51%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Late" fill="hsl(38 92% 50%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-muted-foreground text-sm py-12 text-center">
            No attendance data yet. Add classes and submit attendance to see the chart.
          </p>
        )}
      </div>

      {/* Recent Activity */}
      {recentRecords.length > 0 && (
        <div className="dashboard-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Recent Activity</h3>
            <Link to="/reports" className="text-sm text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {recentRecords.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <Calendar size={14} className="text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{r.studentName}</p>
                    <p className="text-xs text-muted-foreground">{r.className} • {r.date}</p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${r.status === "present" ? "bg-[hsl(var(--success))]/15 text-[hsl(var(--success))]" :
                  r.status === "absent" ? "bg-destructive/15 text-destructive" :
                    "bg-[hsl(var(--warning))]/15 text-[hsl(var(--warning))]"
                  }`}>
                  {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
