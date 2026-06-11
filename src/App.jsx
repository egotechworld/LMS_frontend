import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import Courses from './pages/courses/Courses';
import CourseDetail from './pages/courses/CourseDetail';
import MyCourses from './pages/courses/MyCourses';
import CourseProgress from './pages/progress/CourseProgress';
import InstructorProgress from './pages/progress/InstructorProgress';
import InstructorProgressOverview from './pages/progress/InstructorProgressOverview';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useAuthStore } from './store/authStore';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
        
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="courses" element={<Courses />} />
          <Route path="courses/:id" element={<CourseDetail />} />
          <Route path="my-courses" element={<ProtectedRoute><MyCourses /></ProtectedRoute>} />
          <Route path="progress/:courseId" element={<ProtectedRoute><CourseProgress /></ProtectedRoute>} />
          <Route path="instructor/progress/:courseId" element={<ProtectedRoute><InstructorProgress /></ProtectedRoute>} />
          <Route path="instructor/progress" element={<ProtectedRoute><InstructorProgressOverview /></ProtectedRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
