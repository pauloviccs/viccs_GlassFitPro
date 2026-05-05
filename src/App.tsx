import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import LoginPage from "./pages/Login";
import StudentDashboard from "./pages/student/StudentDashboard";
import AdminLayout from "./components/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminExercises from "./pages/admin/AdminExercises";
import AdminWorkouts from "./pages/admin/AdminWorkouts";
import AdminTemplates from "./pages/admin/AdminTemplates";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminProfile from "./pages/admin/AdminProfile";
import TeacherRegister from "./pages/TeacherRegister";
import NotFound from "./pages/NotFound";
import { PublicProfile } from "./pages/student/PublicProfile";

const queryClient = new QueryClient();

function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole?: 'student' | 'admin' | 'super_admin' }) {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/" replace />;
  
  // super_admin e admin ambos acessam /admin
  if (requiredRole === 'admin' && user?.role !== 'admin' && user?.role !== 'super_admin') {
    return <Navigate to="/student" replace />;
  }
  if (requiredRole === 'super_admin' && user?.role !== 'super_admin') {
    return <Navigate to={user?.role === 'admin' ? '/admin' : '/student'} replace />;
  }
  if (requiredRole === 'student' && user?.role === 'student') {
    return <>{children}</>;
  }
  if (requiredRole === 'student' && (user?.role === 'admin' || user?.role === 'super_admin')) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}

function AdminPage({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
  );
}

function SuperAdminPage({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole="super_admin">
      <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/teacher/register" element={<TeacherRegister />} />
            <Route path="/student" element={<ProtectedRoute requiredRole="student"><StudentDashboard /></ProtectedRoute>} />
            <Route path="/student/profile/:idOrUsername" element={<ProtectedRoute requiredRole="student"><PublicProfile /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminPage><AdminOverview /></AdminPage>} />
            <Route path="/admin/students" element={<AdminPage><AdminStudents /></AdminPage>} />
            <Route path="/admin/exercises" element={<AdminPage><AdminExercises /></AdminPage>} />
            <Route path="/admin/workouts" element={<AdminPage><AdminWorkouts /></AdminPage>} />
            <Route path="/admin/templates" element={<AdminPage><AdminTemplates /></AdminPage>} />
            <Route path="/admin/profile" element={<AdminPage><AdminProfile /></AdminPage>} />
            <Route path="/admin/settings" element={<SuperAdminPage><AdminSettings /></SuperAdminPage>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
