import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

// Legacy redirect - routes to role-specific dashboards
const Dashboard = () => {
  const { user } = useAuthStore();

  switch (user?.role) {
    case 'admin':
      return <Navigate to="/admin/dashboard" replace />;
    case 'instructor':
      return <Navigate to="/instructor/dashboard" replace />;
    default:
      return <Navigate to="/student/dashboard" replace />;
  }
};

export default Dashboard;
