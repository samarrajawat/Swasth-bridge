import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Landing from './pages/public/Landing';

// Patient pages
import PatientDashboard from './pages/patient/PatientDashboard';
import BookAppointment from './pages/patient/BookAppointment';
import MyAppointments from './pages/patient/MyAppointments';
import QueueStatus from './pages/patient/QueueStatus';
import BedAvailability from './pages/patient/BedAvailability';

// Doctor pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import Availability from './pages/doctor/Availability';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageDoctors from './pages/admin/ManageDoctors';
import ManageBeds from './pages/admin/ManageBeds';
import ManageMedicines from './pages/admin/ManageMedicines';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Patient */}
          <Route path="/patient" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<PatientDashboard />} />
            <Route path="book" element={<BookAppointment />} />
            <Route path="appointments" element={<MyAppointments />} />
            <Route path="queue" element={<QueueStatus />} />
            <Route path="beds" element={<BedAvailability />} />
          </Route>

          {/* Doctor */}
          <Route path="/doctor" element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<DoctorDashboard />} />
            <Route path="appointments" element={<DoctorAppointments />} />
            <Route path="availability" element={<Availability />} />
          </Route>

          {/* Admin */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="doctors" element={<ManageDoctors />} />
            <Route path="beds" element={<ManageBeds />} />
            <Route path="medicines" element={<ManageMedicines />} />
          </Route>

          {/* Public Landing */}
          <Route path="/" element={<Landing />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
