import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Users, Dumbbell, LayoutDashboard, LogOut, Settings, CalendarDays, Menu, Library, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout, isSuperAdmin } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const sidebarItems = [
    { icon: LayoutDashboard, label: "Visão Geral", path: "/admin" },
    { icon: Users, label: "Meus Alunos", path: "/admin/students" },
    { icon: Dumbbell, label: "Biblioteca de Exercícios", path: "/admin/exercises" },
    { icon: CalendarDays, label: "Workout Builder", path: "/admin/workouts" },
    { icon: Library, label: "Treinos Prontos", path: "/admin/templates" },
    { icon: UserCircle, label: "Meu Perfil", path: "/admin/profile" },
    // Settings apenas para super_admin
    ...(isSuperAdmin ? [{ icon: Settings, label: "Configurações", path: "/admin/settings" }] : []),
  ];

  const ProfileBadge = () => (
    <Link to="/admin/profile" className="flex items-center gap-3 group">
      <div className="w-10 h-10 rounded-xl overflow-hidden bg-primary/20 flex items-center justify-center shrink-0">
        {user?.avatarUrl ? (
          <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
        ) : (
          <span className="font-bold text-primary text-lg">
            {user?.name?.charAt(0)?.toUpperCase() || 'P'}
          </span>
        )}
      </div>
      <div className="min-w-0">
        <h2 className="font-bold tracking-tight text-foreground truncate group-hover:text-primary transition-colors">
          {user?.displayName || user?.name || 'Professor'}
        </h2>
        <span className="text-xs text-primary font-medium tracking-wider uppercase">
          {isSuperAdmin ? 'Administrador' : 'Professor'}
        </span>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen animated-bg flex text-foreground">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-72 glass-strong border-r border-white/5 sticky top-0 h-screen z-40 shrink-0">
        <div className="p-6 border-b border-white/5">
          <ProfileBadge />
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
        {/* Topbar Mobile */}
        <header className="lg:hidden sticky top-0 z-30 glass border-b border-white/5 px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <button className="p-2 -ml-2 text-muted-foreground hover:text-foreground">
                  <Menu className="w-6 h-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 glass-strong border-r border-white/5 p-0 flex flex-col">
                <SheetHeader className="p-6 border-b border-white/5 text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-primary/20 flex items-center justify-center shrink-0">
                      {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-bold text-primary text-lg">
                          {user?.name?.charAt(0)?.toUpperCase() || 'P'}
                        </span>
                      )}
                    </div>
                    <div>
                      <SheetTitle className="font-bold tracking-tight">
                        {user?.displayName || user?.name || 'Professor'}
                      </SheetTitle>
                      <span className="text-xs text-primary font-medium tracking-wider uppercase">
                        {isSuperAdmin ? 'Administrador' : 'Professor'}
                      </span>
                    </div>
                  </div>
                </SheetHeader>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                  {sidebarItems.map((item) => {
                    const isActive = location.pathname === item.path ||
                      (item.path !== '/admin' && location.pathname.startsWith(item.path));

                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
                          isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                        )}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>

                <div className="p-4 border-t border-white/5">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      logout();
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Encerrar Sessão</span>
                  </button>
                </div>
              </SheetContent>
            </Sheet>

            <div className="w-8 h-8 rounded-lg overflow-hidden bg-primary/20 flex items-center justify-center ml-2">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="font-bold text-primary text-sm">GF</span>
              )}
            </div>
            <span className="font-semibold hidden sm:inline">
              {isSuperAdmin ? 'Painel Admin' : 'Painel do Professor'}
            </span>
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
