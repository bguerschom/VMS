import React, { useState } from 'react';

const ComponentDocumentation = () => {
  const components = [
    // Pages from App.js Routes
    {
      type: 'Page',
      name: 'LoginPage',
      path: '/login',
      description: 'User authentication page',
      category: 'Authentication'
    },
    {
      type: 'Page',
      name: 'Dashboard',
      path: '/dashboard',
      description: 'Main application dashboard',
      category: 'Core'
    },
    {
      type: 'Page',
      name: 'CheckInOutReport',
      path: '/reports',
      description: 'Comprehensive check-in and check-out reporting',
      category: 'Reporting'
    },
    {
      type: 'Page',
      name: 'SearchVisitor',
      path: '/check-in',
      description: 'Search and initiate visitor check-in process',
      category: 'Visitor Management'
    },
    {
      type: 'Page',
      name: 'VisitorForm',
      path: '/check-in/form',
      description: 'Detailed form for capturing visitor information',
      category: 'Visitor Management'
    },
    {
      type: 'Page',
      name: 'CheckOut',
      path: '/check-out',
      description: 'Visitor check-out process',
      category: 'Visitor Management'
    },
    {
      type: 'Page',
      name: 'CheckoutModal',
      path: '/check-out/form',
      description: 'Modal for finalizing visitor check-out',
      category: 'Visitor Management'
    },
    {
      type: 'Page',
      name: 'VisitorHistory',
      path: '/visitor-history',
      description: 'Historical record of visitor entries',
      category: 'Visitor Management'
    },
    {
      type: 'Page',
      name: 'VisitorDetailsModal',
      path: '/visitor-history/form',
      description: 'Detailed view of a specific visitor entry',
      category: 'Visitor Management'
    },
    {
      type: 'Page',
      name: 'BulkVisitorUpload',
      path: '/bulkvisitors',
      description: 'Bulk upload of multiple visitor records',
      category: 'Visitor Management'
    },
    {
      type: 'Page',
      name: 'ActiveScheduledVisitors',
      path: '/scheduled-visitors',
      description: 'List of pre-scheduled visitor entries',
      category: 'Visitor Management'
    },
    {
      type: 'Page',
      name: 'UserManagement',
      path: '/user-management',
      description: 'Administrative user management interface',
      category: 'Administration'
    },
    {
      type: 'Page',
      name: 'GuardShiftReport',
      path: '/GuardShiftReport',
      description: 'Security guard shift reporting form',
      category: 'Reporting'
    },
    {
      type: 'Page',
      name: 'GuardShiftReportViewer',
      path: '/GuardShiftReportViewer',
      description: 'View and analyze guard shift reports',
      category: 'Reporting'
    },
    {
      type: 'Page',
      name: 'ScheduledVisitorsReport',
      path: '/scheduled-report',
      description: 'Reporting for scheduled visitors',
      category: 'Reporting'
    },
    {
      type: 'Page',
      name: 'Unauthorized',
      path: '/unauthorized',
      description: 'Error page for unauthorized access',
      category: 'System'
    },

    // Layout Components
    {
      type: 'Layout',
      name: 'Header',
      description: 'Top navigation and application header',
      category: 'Layout'
    },
    {
      type: 'Layout',
      name: 'Sidebar',
      description: 'Side navigation menu',
      category: 'Layout'
    },
    {
      type: 'Layout',
      name: 'Footer',
      description: 'Bottom application footer',
      category: 'Layout'
    },

    // Utility Components
    {
      type: 'Utility',
      name: 'ProtectedRoute',
      description: 'Route protection and authentication wrapper',
      category: 'Authentication'
    },
    {
      type: 'Utility',
      name: 'AuthenticatedLayout',
      description: 'Layout wrapper for authenticated pages',
      category: 'Layout'
    }
  ];

  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const getTypeColor = (type) => {
    switch (type) {
      case 'Page': return 'bg-blue-100 text-blue-800';
      case 'Layout': return 'bg-green-100 text-green-800';
      case 'Utility': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredComponents = components.filter(component => 
    (filter === 'ALL' || component.type === filter) &&
    (searchTerm === '' || 
     component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     component.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
     component.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container mx-auto p-6 bg-white dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        Application Component Documentation
      </h1>

      <div className="mb-4 flex space-x-2">
        <select 
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:text-white"
        >
          <option value="ALL">All Components</option>
          <option value="Page">Pages</option>
          <option value="Layout">Layout Components</option>
          <option value="Utility">Utility Components</option>
        </select>

        <input 
          type="text"
          placeholder="Search components..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border rounded-lg flex-grow dark:bg-gray-800 dark:text-white"
        />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredComponents.map((component) => (
          <div 
            key={component.name}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow 
                       dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {component.name}
              </h2>
              <span className={`px-2 py-1 rounded text-xs ${getTypeColor(component.type)}`}>
                {component.type}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              {component.description}
            </p>
            {component.path && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Path: <code>{component.path}</code>
              </div>
            )}
            {component.category && (
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Category: {component.category}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          Application Structure Insights
        </h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
          <li>
            <strong>Total Components:</strong> {components.length}
          </li>
          <li>
            <strong>Pages:</strong> {components.filter(c => c.type === 'Page').length}
          </li>
          <li>
            <strong>Layout Components:</strong> {components.filter(c => c.type === 'Layout').length}
          </li>
          <li>
            <strong>Utility Components:</strong> {components.filter(c => c.type === 'Utility').length}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ComponentDocumentation;
