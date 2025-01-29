import { useState, useEffect } from 'react'
import { Card } from '../components/common/Card'
import { Select } from '../components/common/Select'
import { formatDate, formatName } from '../utils/format'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const VisitorReport = () => {
  const [timeRange, setTimeRange] = useState('week')
  const [reportData, setReportData] = useState({
    visitorStats: [],
    recentVisits: []
  })

  useEffect(() => {
    fetchReportData()
  }, [timeRange])

  const fetchReportData = async () => {
    // In real app, fetch from Supabase
    // Using dummy data for now
    setReportData({
      visitorStats: [
        { date: '2024-01-23', count: 15 },
        { date: '2024-01-24', count: 20 },
        { date: '2024-01-25', count: 18 },
        { date: '2024-01-26', count: 25 },
        { date: '2024-01-27', count: 22 },
        { date: '2024-01-28', count: 16 },
        { date: '2024-01-29', count: 19 }
      ],
      recentVisits: [
        {
          id: 1,
          visitorName: 'John Doe',
          department: 'HR',
          checkIn: '2024-01-29T09:00:00',
          checkOut: '2024-01-29T11:00:00',
          purpose: 'Interview'
        }
      ]
    })
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Visitor Reports</h1>
        
        <Select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          options={[
            { value: 'week', label: 'Last 7 Days' },
            { value: 'month', label: 'Last 30 Days' },
            { value: 'year', label: 'Last 12 Months' }
          ]}
        />
      </div>

      <Card className="mb-6 h-96">
        <h2 className="text-lg font-medium mb-4">Visitor Traffic</h2>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={reportData.visitorStats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#000000" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <h2 className="text-lg font-medium mb-4">Recent Visits</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="pb-3">Visitor</th>
                <th className="pb-3">Department</th>
                <th className="pb-3">Check In</th>
                <th className="pb-3">Check Out</th>
                <th className="pb-3">Purpose</th>
              </tr>
            </thead>
            <tbody>
              {reportData.recentVisits.map((visit) => (
                <tr key={visit.id} className="border-b">
                  <td className="py-3">{visit.visitorName}</td>
                  <td className="py-3">{visit.department}</td>
                  <td className="py-3">{formatDate(visit.checkIn)}</td>
                  <td className="py-3">{formatDate(visit.checkOut)}</td>
                  <td className="py-3">{visit.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

export default VisitorReport
