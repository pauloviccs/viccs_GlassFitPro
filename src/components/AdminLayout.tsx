import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Users, Dumbbell, LayoutDashboard, LogOut, Settings, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: ReactNode;
}

const sidebarItems = [
  { icon: LayoutDashboard, label: "Visão Geral", path: "/admin" },
  { icon: Users, label: "Meus Alunos", path: "/admin/students" },
  { icon: Dumbbell, label: "Biblioteca de Exercícios", path: "/admin/exercises" },
  { icon: CalendarDays, label: "Workout Builder", path: "/admin/workouts" },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen animated-bg flex text-foreground">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-72 glass-strong border-r border-white/5 sticky top-0 h-screen z-40 shrink-0">
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <span className="font-bold text-primary text-lg">GF</span>
          </div>
          <div>
            <h2 className="font-bold tracking-tight">GlassFit Pro</h2>
            <span className="text-xs text-primary font-medium tracking-wider uppercase">Painel do Professor</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path !== '/admin' && location.pathname.startsWith(item.path));

            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative block"
              >
                {isActive && (
                  <motion.div
                    layoutId="adminSidebarIndicator"
                    className="absolute inset-0 bg-primary/10 rounded-xl"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <div className={cn(
                  "relative flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}>
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Encerrar Sessão</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto">
        {/* Topbar Mobile (Visible only on lg down) */}
        <header className="lg:hidden sticky top-0 z-30 glass border-b border-white/5 px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <span className="font-bold text-primary text-sm">GF</span>
            </div>
            <span className="font-semibold">Painel do Professor</span>
          </div>
          <button onClick={logout} className="p-2 text-muted-foreground hover:text-foreground">
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
