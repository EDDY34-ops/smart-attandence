import { useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import {
  LayoutDashboard, Users, GraduationCap, School, ClipboardList, BarChart3,
  LogOut, Menu, X, ChevronDown, User, Plus, UserPlus
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo.png";

const navItems = [
  { title: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { title: "Manage Students", path: "/students", icon: Users },
  { title: "Manage Teachers", path: "/teachers", icon: GraduationCap },
  { title: "Manage Classes", path: "/classes", icon: School },
  { title: "Attendance", path: "/attendance", icon: ClipboardList },
  { title: "Reports", path: "/reports", icon: BarChart3 },
  { title: "Join Class", path: "/enrollment", icon: Plus },
  { title: "Enrollments", path: "/manage-enrollments", icon: UserPlus },
];

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, userEmail, userRole } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const filteredNavItems = navItems.filter((item) => {
    if (userRole === "admin") return item.title !== "Join Class";
    if (userRole === "teacher") return ["Dashboard", "Manage Classes", "Attendance", "Reports", "Enrollments"].includes(item.title);
    if (userRole === "student") return ["Dashboard", "Attendance", "Reports", "Join Class"].includes(item.title);
    return false;
  });

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground transform transition-transform duration-200 lg:relative lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
          <img src={logo} alt="Logo" className="w-10 h-10 rounded-full bg-sidebar-primary p-0.5" />
          <div className="leading-tight">
            <p className="font-bold text-sm text-sidebar-primary">SMART</p>
            <p className="text-xs opacity-80">Attendance System</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-sidebar-foreground">
            <X size={20} />
          </button>
        </div>

        <nav className="mt-4 px-3 space-y-1">
          {filteredNavItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                  }`}
              >
                <item.icon size={18} />
                {item.title}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center justify-between h-16 px-4 md:px-6 bg-card border-b border-border shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-foreground">
            <Menu size={22} />
          </button>
          <h1 className="text-lg font-semibold text-foreground hidden sm:block">
            {navItems.find((i) => i.path === location.pathname)?.title || "Dashboard"}
          </h1>
          <div className="ml-auto relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <User size={16} className="text-primary-foreground" />
              </div>
              <span className="hidden md:inline">{userEmail || "Admin"}</span>
              <ChevronDown size={14} />
            </button>
            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-card rounded-lg shadow-lg border border-border py-1 z-50">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
