import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import StudentDashboard from './pages/dashboards/StudentDashboard';
import InstructorDashboard from './pages/dashboards/InstructorDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import Courses from './pages/courses/Courses';
import CourseDetail from './pages/courses/CourseDetail';
import MyCourses from './pages/courses/MyCourses';
import Assignments from './pages/assignments/Assignments';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useAuthStore } from './store/authStore';

function App() {
  const { isAuthenticated, user } = useAuthStore();

  // Redirect /dashboard to role-specific dashboard
  const getDashboardRedirect = () => {
    if (!isAuthenticated) return <Navigate to="/login" />;
    switch (user?.role) {
      case 'admin':
        return <Navigate to="/admin/dashboard" />;
      case 'instructor':
        return <Navigate to="/instructor/dashboard" />;
      default:
        return <Navigate to="/student/dashboard" />;
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={!isAuthenticated ? <Login /> : getDashboardRedirect()} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : getDashboardRedirect()} />

        {/* Protected routes with Layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={getDashboardRedirect()} />
          <Route path="dashboard" element={getDashboardRedirect()} />

          {/* Student routes */}
          <Route path="student/dashboard" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          } />

          {/* Instructor routes */}
          <Route path="instructor/dashboard" element={
            <ProtectedRoute allowedRoles={['instructor']}>
              <InstructorDashboard />
            </ProtectedRoute>
          } />

          {/* Admin routes */}
          <Route path="admin/dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* Common protected routes */}
          <Route path="courses" element={<Courses />} />
          <Route path="courses/:id" element={<CourseDetail />} />
          <Route path="my-courses" element={
            <ProtectedRoute allowedRoles={['student']}>
              <MyCourses />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
