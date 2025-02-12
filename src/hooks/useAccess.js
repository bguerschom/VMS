// src/hooks/useAccess.js
import { useAuth } from './useAuth';

const roleAccess = {
  admin: [
    '/admindashboard',
    '/user-management',
    '/check-in',
    '/check-out',
    '/visitor-history',
    '/bulkvisitors',
    '/scheduled-visitors',
    '/reports',
    '/GuardShiftReportViewer',
    '/GuardShiftReport'
  ],
    manager: [
    '/managerdashboard',
    '/bulkvisitors',
    '/reports',
    '/GuardShiftReportViewer',
    '/GuardShiftReport',
    '/visitor-history'
  ],
  supervisor: [
    '/supervisordashboard',
    '/GuardShiftReport',
    '/check-in',
    '/check-out',
    '/scheduled-visitors',
    '/visitor-history'
  ],
  security_guard: [
    '/securityguarddashboard',
    '/check-in',
    '/check-out',
    '/scheduled-visitors'
  ],
  user: [
    '/userdashboard',
    '/check-out',
    '/bulkvisitors',
    '/scheduled-visitors',
    '/reports',
    '/GuardShiftReportViewer',
    '/visitor-history'
    '/GuardShiftReport',
  ]
};

export const useAccess = () => {
  const { user } = useAuth();

  const hasAccess = (path) => {
    if (!user || !user.role) return false;
    return roleAccess[user.role]?.includes(path) || false;
  };

  return { hasAccess };
};
