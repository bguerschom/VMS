import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { getRoleBasedDashboard } from './utils/roleRoutes';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Pages
import LoginPage from './pages/Login/Login';
import SearchVisitor from './pages/check-in/SearchVisitor';
import VisitorForm from './pages/check-in/VisitorForm';
import CheckOut from './pages/check-out/CheckOut';
import CheckoutModal from './pages/check-out/CheckoutModal';
import VisitorDetailsModal from './pages/visitors-history/VisitorDetailsModal';
import VisitorHistory from './pages/visitors-history/VisitorHistory';
import BulkVisitorUpload from './pages/bulk-upload/BulkVisitorUpload';
import ActiveScheduledVisitors from './pages/scheduled-visitors/ActiveScheduledVisitors';
import UserManagement from './pages/UserManagement/UserManagement';
import GuardShiftReport from './pages/security-guard-shift-report/GuardShiftForm';
import GuardShiftReportViewer from './pages/report/GuardShiftReportViewer';
import ScheduledVisitorsReport from './pages/report/ScheduledVisitorsReport';
import CheckInOutReport from './pages/report/CheckInOutReport';
import Unauthorized from './pages/Unauthorized';

// Dashboard Pages
import AdminDashboard from './pages/dashboard/AdminDashboard';
import SecurityGuardDashboard from './pages/dashboard/SecurityGuardDashboard';
import SupervisorDashboard from './pages/dashboard/SupervisorDashboard';
import UserDashboard from './pages/dashboard/UserDashboard';
import ManagerDashboard from './pages/dashboard/ManagerDashboard';

// Audit Pages
import ComponentDocumentation from './audit/ComponentDocumentation';
import RouteDocumentation from './audit/RouteDocumentation';

const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black dark:border-white"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role?.toLowerCase())) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

const AuthenticatedLayout = ({ children }) => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
    <Header />
    <main className="pt-10 pb-10">{children}</main>
    <Footer />
  </div>
);

const App = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public route */}
      <Route path="/login" element={user ? <Navigate to={getRoleBasedDashboard(user.role)} replace /> : <LoginPage />} />

      {/* Dashboard routes */}
      <Route path="/admindashboard" element={<ProtectedRoute requiredRoles={['admin']}><AuthenticatedLayout><AdminDashboard /></AuthenticatedLayout></ProtectedRoute>} />
      <Route path="/securityguarddashboard" element={<ProtectedRoute requiredRoles={['security_guard']}><AuthenticatedLayout><SecurityGuardDashboard /></AuthenticatedLayout></ProtectedRoute>} />
      <Route path="/supervisordashboard" element={<ProtectedRoute requiredRoles={['supervisor']}><AuthenticatedLayout><SupervisorDashboard /></AuthenticatedLayout></ProtectedRoute>} />
      <Route path="/userdashboard" element={<ProtectedRoute requiredRoles={['user']}><AuthenticatedLayout><UserDashboard /></AuthenticatedLayout></ProtectedRoute>} />
      <Route path="/managerdashboard" element={<ProtectedRoute requiredRoles={['manager']}><AuthenticatedLayout><ManagerDashboard /></AuthenticatedLayout></ProtectedRoute>} />

      {/* Check-in routes */}
      <Route path="/check-in" element={<ProtectedRoute requiredRoles={['admin', 'security_guard']}><AuthenticatedLayout><SearchVisitor /></AuthenticatedLayout></ProtectedRoute>} />
      <Route path="/check-in/form" element={<ProtectedRoute requiredRoles={['admin', 'security_guard']}><AuthenticatedLayout><VisitorForm /></AuthenticatedLayout></ProtectedRoute>} />

      {/* Check-out routes */}
      <Route path="/check-out" element={<ProtectedRoute requiredRoles={['admin', 'security_guard']}><AuthenticatedLayout><CheckOut /></AuthenticatedLayout></ProtectedRoute>} />
      <Route path="/check-out/form" element={<ProtectedRoute requiredRoles={['admin', 'security_guard']}><AuthenticatedLayout><CheckoutModal /></AuthenticatedLayout></ProtectedRoute>} />

      {/* Visitor history routes */}
      <Route path="/visitor-history" element={<ProtectedRoute requiredRoles={['admin', 'supervisor', 'manager', 'user']}><AuthenticatedLayout><VisitorHistory /></AuthenticatedLayout></ProtectedRoute>} />
      <Route path="/visitor-history/form" element={<ProtectedRoute requiredRoles={['admin', 'supervisor', 'manager', 'user']}><AuthenticatedLayout><VisitorDetailsModal /></AuthenticatedLayout></ProtectedRoute>} />

      {/* Bulk visitors route */}
      <Route path="/bulkvisitors" element={<ProtectedRoute requiredRoles={['admin']}><AuthenticatedLayout><BulkVisitorUpload /></AuthenticatedLayout></ProtectedRoute>} />

      {/* Scheduled visitors route */}
      <Route path="/scheduled-visitors" element={<ProtectedRoute requiredRoles={['admin', 'user', 'manager']}><AuthenticatedLayout><ActiveScheduledVisitors /></AuthenticatedLayout></ProtectedRoute>} />

      {/* User Management route */}
      <Route path="/user-management" element={<ProtectedRoute requiredRoles={['admin']}><AuthenticatedLayout><UserManagement /></AuthenticatedLayout></ProtectedRoute>} />

      {/* Reports routes */}
      <Route path="/GuardShiftReport" element={<ProtectedRoute requiredRoles={['admin', 'security_guard']}><AuthenticatedLayout><GuardShiftReport /></AuthenticatedLayout></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute requiredRoles={['admin', 'supervisor', 'manager']}><AuthenticatedLayout><CheckInOutReport /></AuthenticatedLayout></ProtectedRoute>} />
      <Route path="/GuardShiftReportViewer" element={<ProtectedRoute requiredRoles={['admin', 'supervisor']}><AuthenticatedLayout><GuardShiftReportViewer /></AuthenticatedLayout></ProtectedRoute>} />
      <Route path="/scheduled-report" element={<ProtectedRoute requiredRoles={['admin', 'supervisor', 'manager']}><AuthenticatedLayout><ScheduledVisitorsReport /></AuthenticatedLayout></ProtectedRoute>} />

      {/* Audit routes */}
      <Route path="/route-documentation" element={<ProtectedRoute requiredRoles={['admin']}><AuthenticatedLayout><RouteDocumentation /></AuthenticatedLayout></ProtectedRoute>} />
      <Route path="/component-documentation" element={<ProtectedRoute requiredRoles={['admin']}><AuthenticatedLayout><ComponentDocumentation /></AuthenticatedLayout></ProtectedRoute>} />

      {/* Root route redirect */}
      <Route path="/" element={<Navigate to={user ? getRoleBasedDashboard(user.role) : "/login"} replace />} />

      {/* Unauthorized and catch-all routes */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<Navigate to="/unauthorized" replace />} />
    </Routes>
  );
};

export default App;
