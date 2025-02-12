import React, { useState } from 'react';

const RouteDocumentation = () => {
  const routes = [
    {
      path: '/login',
      component: 'LoginPage',
      description: 'Login page for user authentication',
      status: 'ESSENTIAL'
    },
    {
      path: '/dashboard',
      component: 'Dashboard',
      description: 'Main dashboard after login',
      status: 'ESSENTIAL'
    },
    {
      path: '/check-in',
      component: 'SearchVisitor',
      description: 'Search and check-in visitors',
      status: 'CORE_FEATURE'
    },
    {
      path: '/check-in/form',
      component: 'VisitorForm',
      description: 'Form for adding new visitor details',
      status: 'CORE_FEATURE'
    },
    {
      path: '/check-out',
      component: 'CheckOut',
      description: 'Visitor check-out process',
      status: 'CORE_FEATURE'
    },
    {
      path: '/check-out/form',
      component: 'CheckoutModal',
      description: 'Modal for check-out details',
      status: 'CORE_FEATURE'
    },
    {
      path: '/visitor-history',
      component: 'VisitorHistory',
      description: 'View historical visitor records',
      status: 'OPTIONAL'
    },
    {
      path: '/visitor-history/form',
      component: 'VisitorDetailsModal',
      description: 'Modal for visitor details',
      status: 'OPTIONAL'
    },
    {
      path: '/bulkvisitors',
      component: 'BulkVisitorUpload',
      description: 'Bulk upload of visitor information',
      status: 'OPTIONAL'
    },
    {
      path: '/scheduled-visitors',
      component: 'ActiveScheduledVisitors',
      description: 'List of scheduled visitors',
      status: 'OPTIONAL'
    },
    {
      path: '/user-management',
      component: 'UserManagement',
      description: 'User management and administration',
      status: 'ADMIN_FEATURE'
    },
    {
      path: '/GuardShiftReport',
      component: 'GuardShiftReport',
      description: 'Guard shift reporting form',
      status: 'OPTIONAL'
    },
    {
      path: '/reports',
      component: 'CheckInOutReport',
      description: 'Check-in and check-out reports',
      status: 'REPORTING'
    },
    {
      path: '/GuardShiftReportViewer',
      component: 'GuardShiftReportViewer',
      description: 'View guard shift reports',
      status: 'OPTIONAL'
    },
    {
      path: '/scheduled-report',
      component: 'ScheduledVisitorsReport',
      description: 'Reports for scheduled visitors',
      status: 'OPTIONAL'
    }
  ];

  const [filter, setFilter] = useState('ALL');

  const getStatusColor = (status) => {
    switch (status) {
      case 'ESSENTIAL': return 'bg-green-100 text-green-800';
      case 'CORE_FEATURE': return 'bg-blue-100 text-blue-800';
      case 'ADMIN_FEATURE': return 'bg-purple-100 text-purple-800';
      case 'OPTIONAL': return 'bg-yellow-100 text-yellow-800';
      case 'REPORTING': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRoutes = filter === 'ALL' 
    ? routes 
    : routes.filter(route => route.status === filter);

  return (
    <div className="container mx-auto p-6 bg-white dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        Application Route Documentation
      </h1>

      <div className="mb-4 flex space-x-2">
        <select 
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:text-white"
        >
          <option value="ALL">All Routes</option>
          <option value="ESSENTIAL">Essential Routes</option>
          <option value="CORE_FEATURE">Core Features</option>
          <option value="ADMIN_FEATURE">Admin Features</option>
          <option value="OPTIONAL">Optional Routes</option>
          <option value="REPORTING">Reporting</option>
        </select>
      </div>

      <div className="grid gap-4">
        {filteredRoutes.map((route) => (
          <div 
            key={route.path}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow 
                       dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {route.path}
              </h2>
              <span className={`px-2 py-1 rounded text-xs ${getStatusColor(route.status)}`}>
                {route.status}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              {route.description}
            </p>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Component: <code>{route.component}</code>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          Recommendations
        </h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
          <li>
            <strong>Essential Routes:</strong> Login, Dashboard - Always keep these
          </li>
          <li>
            <strong>Core Features:</strong> Check-in, Check-out - Critical for main functionality
          </li>
          <li>
            <strong>Optional Routes:</strong> Consider removing or consolidating:
            <ul className="pl-6 list-[circle]">
              <li>Visitor History Form</li>
              <li>Guard Shift Report Viewer</li>
              <li>Scheduled Visitors Report</li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default RouteDocumentation;
