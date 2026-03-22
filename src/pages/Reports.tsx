import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Download, FileText, FileSpreadsheet } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const COLORS = ["hsl(142 71% 45%)", "hsl(0 72% 51%)", "hsl(38 92% 50%)"];

export default function Reports() {
  const { attendance: allAttendance, classes, students } = useData();
  const { userRole, userEmail } = useAuth();

  const isStudent = userRole === "student";
  const myStudentProfile = students.find(s => s.email === userEmail);
  const attendance = isStudent
    ? allAttendance.filter(a => a.studentId === myStudentProfile?.id)
    : allAttendance;

  const totalPresent = attendance.filter((a) => a.status === "present").length;
  const totalAbsent = attendance.filter((a) => a.status === "absent").length;
  const totalLate = attendance.filter((a) => a.status === "late").length;

  const pieData = [
    { name: "Present", value: totalPresent },
    { name: "Absent", value: totalAbsent },
    { name: "Late", value: totalLate },
  ].filter((d) => d.value > 0);

  const classData = classes
    .filter(c => !isStudent || attendance.some(a => a.classId === c.id))
    .map((c) => {
      const classAtt = attendance.filter((a) => a.classId === c.id);
      return {
        name: c.name,
        Total: classAtt.length,
        Present: classAtt.filter((a) => a.status === "present").length,
      };
    });

  const getReportRows = () =>
    attendance.map((a) => {
      const student = students.find((s) => s.id === a.studentId);
      const cls = classes.find((c) => c.id === a.classId);
      return {
        date: a.date,
        student: student?.name || "Unknown",
        email: student?.email || "",
        class: cls?.name || "Unknown",
        status: a.status.charAt(0).toUpperCase() + a.status.slice(1),
      };
    });

  const exportCSV = () => {
    const rows = getReportRows();
    const header = "Date,Student,Email,Class,Status";
    const csv = [header, ...rows.map((r) => `${r.date},${r.student},${r.email},${r.class},${r.status}`)].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const rows = getReportRows();
    const rate = attendance.length > 0 ? Math.round((totalPresent / attendance.length) * 100) : 0;

    doc.setFontSize(18);
    doc.text("SMART Attendance Report", 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);
    doc.text(`Total Records: ${attendance.length}  |  Attendance Rate: ${rate}%`, 14, 34);

    autoTable(doc, {
      startY: 42,
      head: [["Date", "Student", "Email", "Class", "Status"]],
      body: rows.map((r) => [r.date, r.student, r.email, r.class, r.status]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [30, 90, 170] },
    });

    doc.save(`attendance-report-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl font-semibold text-foreground">{isStudent ? "My Performance Report" : "Reports"}</h2>
        {attendance.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card text-foreground text-sm font-medium hover:bg-muted transition-colors"
            >
              <FileSpreadsheet size={16} />
              Export CSV
            </button>
            <button
              onClick={exportPDF}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <FileText size={16} />
              Export PDF
            </button>
          </div>
        )}
      </div>

      {attendance.length === 0 ? (
        <div className="dashboard-card">
          <p className="text-muted-foreground text-sm text-center py-12">No attendance data yet. Submit attendance to see reports.</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="dashboard-card">
            <h3 className="font-semibold text-foreground mb-4">Overall Status Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="dashboard-card">
            <h3 className="font-semibold text-foreground mb-4">Attendance by Class</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={classData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 90%)" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="Present" fill="hsl(211 70% 45%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Total" fill="hsl(214 20% 90%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="dashboard-card">
        <h3 className="font-semibold text-foreground mb-4">Summary</h3>
        <div className="grid sm:grid-cols-3 gap-4 text-center">
          {!isStudent && (
            <div className="p-4 rounded-xl bg-muted">
              <p className="text-2xl font-bold text-foreground">{students.length}</p>
              <p className="text-sm text-muted-foreground">Total Students</p>
            </div>
          )}
          <div className="p-4 rounded-xl bg-muted">
            <p className="text-2xl font-bold text-foreground">{attendance.length}</p>
            <p className="text-sm text-muted-foreground">{isStudent ? "My Records" : "Total Records"}</p>
          </div>
          <div className="p-4 rounded-xl bg-muted">
            <p className="text-2xl font-bold text-foreground">
              {attendance.length > 0 ? Math.round((totalPresent / attendance.length) * 100) : 0}%
            </p>
            <p className="text-sm text-muted-foreground">Attendance Rate</p>
          </div>
        </div>
      </div>
    </div>
  );
}
