import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import Courses from './pages/courses/Courses';
import CourseDetail from './pages/courses/CourseDetail';
import MyCourses from './pages/courses/MyCourses';
import Assignments from './pages/assignments/Assignments';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useAuthStore } from './store/authStore';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public auth pages — no sidebar */}
        <Route
          path="/login"
          element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/register"
          element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />}
        />

        {/* App shell with sidebar */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" />} />

          <Route
            path="dashboard"
            element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
          />
          <Route path="courses" element={<Courses />} />
          <Route path="courses/:id" element={<CourseDetail />} />
          <Route
            path="my-courses"
            element={<ProtectedRoute><MyCourses /></ProtectedRoute>}
          />
          <Route
            path="assignments"
            element={<ProtectedRoute><Assignments /></ProtectedRoute>}
          />

          {/* Placeholder routes — other members' components */}
          <Route
            path="notifications"
            element={
              <ProtectedRoute>
                <div style={{ padding: '32px 36px' }}>
                  <h2>Notifications</h2>
                  <p style={{ color: '#888', marginTop: 8 }}>
                    Notifications component coming soon.
                  </p>
                </div>
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
