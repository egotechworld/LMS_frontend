import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import StudentDashboard from './pages/dashboards/StudentDashboard';
import InstructorDashboard from './pages/dashboards/InstructorDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import AdminFinanceDashboard from './pages/dashboards/AdminFinanceDashboard';
import Courses from './pages/courses/Courses';
import ManageCourses from './pages/courses/ManageCourses';
import CourseDetail from './pages/courses/CourseDetail';
import MyCourses from './pages/courses/MyCourses';
import CourseProgress from './pages/progress/CourseProgress';
import InstructorProgress from './pages/progress/InstructorProgress';
import InstructorProgressOverview from './pages/progress/InstructorProgressOverview';
import PaymentSuccess from './pages/payment/PaymentSuccess';
import PaymentCancel from './pages/payment/PaymentCancel';
import DemoCheckout from './pages/payment/DemoCheckout';
import StudentPurchaseHistory from './pages/payment/StudentPurchaseHistory';
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
        <Route path="/login"    element={!isAuthenticated ? <Login />    : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />

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
          <Route path="instructor/courses" element={
            <ProtectedRoute allowedRoles={['instructor']}>
              <ManageCourses />
            </ProtectedRoute>
          } />

          {/* Admin routes */}
          <Route path="admin/dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="admin/finance" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminFinanceDashboard />
            </ProtectedRoute>
          } />
          <Route path="admin/courses" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ManageCourses />
            </ProtectedRoute>
          } />

          {/* Common protected routes */}
          <Route path="courses" element={<Courses />} />
          <Route path="courses/:id" element={<CourseDetail />} />
          <Route path="my-courses" element={<ProtectedRoute><MyCourses /></ProtectedRoute>} />
          <Route path="progress/:courseId" element={<ProtectedRoute><CourseProgress /></ProtectedRoute>} />
          <Route path="instructor/progress/:courseId" element={<ProtectedRoute><InstructorProgress /></ProtectedRoute>} />
          <Route path="instructor/progress" element={<ProtectedRoute><InstructorProgressOverview /></ProtectedRoute>} />
          
          {/* Payment Routes */}
          <Route path="checkout/:courseId" element={<ProtectedRoute allowedRoles={['student']}><DemoCheckout /></ProtectedRoute>} />
          <Route path="payment/success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
          <Route path="payment/cancel" element={<ProtectedRoute><PaymentCancel /></ProtectedRoute>} />
          <Route path="student/purchases" element={<ProtectedRoute allowedRoles={['student']}><StudentPurchaseHistory /></ProtectedRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
