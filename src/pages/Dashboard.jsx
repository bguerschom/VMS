import { useState, useEffect } from 'react'
import { Card } from '../components/common/Card'
import { useVisitor } from '../hooks/useVisitor'
import { formatDate } from '../utils/format'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalVisitors: 0,
    activeVisits: 0,
    dailyVisits: 0,
    weeklyStats: []
  })
  const { loading } = useVisitor()

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    // In a real app, this would fetch from Supabase
    // For now, using dummy data
    setStats({
      totalVisitors: 150,
      activeVisits: 12,
      dailyVisits: 25,
      weeklyStats: [
        { name: 'Mon', visits: 20 },
        { name: 'Tue', visits: 25 },
        { name: 'Wed', visits: 30 },
        { name: 'Thu', visits: 22 },
        { name: 'Fri', visits: 28 },
        { name: 'Sat', visits: 15 },
        { name: 'Sun', visits: 10 }
      ]
    })
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="text-center">
            <h3 className="text-gray-500">Total Visitors</h3>
            <p className="text-3xl font-bold mt-2">{stats.totalVisitors}</p>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <h3 className="text-gray-500">Active Visits</h3>
            <p className="text-3xl font-bold mt-2">{stats.activeVisits}</p>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <h3 className="text-gray-500">Today's Visits</h3>
            <p className="text-3xl font-bold mt-2">{stats.dailyVisits}</p>
          </div>
        </Card>
      </div>

      <Card className="h-96">
        <h3 className="text-lg font-medium mb-4">Weekly Visitor Traffic</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={stats.weeklyStats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="visits" fill="#000000" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}

export default Dashboard
