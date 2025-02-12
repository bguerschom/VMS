import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Users, UserCheck, Calendar, Settings } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../config/supabase';
import { StatCard } from '../../components/StatCard';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalGuards: 0,
    systemUptime: 0
  });
  const [userRoleStats, setUserRoleStats] = useState([]);
  const [systemStats, setSystemStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminDashboardData();
  }, []);

  const fetchAdminDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch user statistics
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact' });

      // Fetch active users
      const { count: activeUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact' })
        .eq('is_active', true);

      // Fetch security guard count
      const { count: totalGuards } = await supabase
        .from('users')
        .select('*', { count: 'exact' })
        .eq('role', 'security_guard');

      // Fetch user role distribution
      const { data: roleData } = await supabase
        .from('users')
        .select('role');

      // Process role distribution data
      const roleCounts = roleData.reduce((acc, { role }) => {
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      }, {});

      const roleStatsArray = Object.entries(roleCounts).map(([name, value]) => ({
        name,
        value
      }));

      setUserRoleStats(roleStatsArray);
      setStats({
        totalUsers,
        activeUsers,
        totalGuards,
        systemUptime: 99.9 // Example static value
      });

    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {loading ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Welcome Section */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl"
            >
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome, {user?.full_name}
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                System and user management overview
              </p>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Users"
                value={stats.totalUsers}
                icon={<Users size={24} className="text-gray-600 dark:text-gray-300" />}
              />
              <StatCard
                title="Active Users"
                value={stats.activeUsers}
                icon={<UserCheck size={24} className="text-gray-600 dark:text-gray-300" />}
              />
              <StatCard
                title="Security Guards"
                value={stats.totalGuards}
                icon={<Calendar size={24} className="text-gray-600 dark:text-gray-300" />}
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Role Distribution */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  User Role Distribution
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={userRoleStats}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {userRoleStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* System Activity Monitor */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  System Activity
                </h3>
                {/* Add system monitoring charts/stats here */}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
