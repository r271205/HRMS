import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute.jsx';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import AnimatedOutlet from '../components/premium/AnimatedOutlet.jsx';
import Login from '../pages/Login.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import Employees from '../pages/Employees.jsx';
import EmployeeProfile from '../pages/EmployeeProfile.jsx';
import Attendance from '../pages/Attendance.jsx';
import Leaves from '../pages/Leaves.jsx';
import Profile from '../pages/Profile.jsx';
import Calendar from '../pages/Calendar.jsx';
import Analytics from '../pages/Analytics.jsx';
import NotFound from '../pages/NotFound.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route element={<AnimatedOutlet />}>
          <Route index element={<Dashboard />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="analytics" element={<Analytics />} />
          <Route
            path="employees"
            element={
              <ProtectedRoute roles={['admin']}>
                <Employees />
              </ProtectedRoute>
            }
          />
          <Route
            path="employees/:id"
            element={
              <ProtectedRoute roles={['admin']}>
                <EmployeeProfile />
              </ProtectedRoute>
            }
          />
          <Route path="attendance" element={<Attendance />} />
          <Route path="leaves" element={<Leaves />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Route>
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
