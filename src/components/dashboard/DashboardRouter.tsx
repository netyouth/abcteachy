import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AdminDashboard } from './AdminDashboard';
import { TeacherDashboard } from './TeacherDashboard';
import { StudentDashboard } from './StudentDashboard';

export function DashboardRouter() {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect to role-specific dashboard
  useEffect(() => {
    if (!loading && user && role) {
      console.log('🔀 Redirecting to role-specific dashboard:', role);
      
      if (role === 'admin') {
        navigate('/dashboard/admin', { replace: true });
      } else if (role === 'teacher') {
        navigate('/dashboard/teacher', { replace: true });
      } else if (role === 'student') {
        navigate('/dashboard/student', { replace: true });
      }
    }
  }, [user, role, loading, navigate]);

  // Show loading while redirecting
  if (loading || !role) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // This component will redirect, but just in case render the right dashboard
  if (role === 'admin') return <AdminDashboard />;
  if (role === 'teacher') return <TeacherDashboard />;
  if (role === 'student') return <StudentDashboard />;

  // Fallback
  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold mb-4">Welcome!</h1>
      <p>Role: {role}</p>
    </div>
  );
}