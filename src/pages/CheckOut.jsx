import { useState } from 'react'
import { Card } from '../components/common/Card'
import { Input } from '../components/common/Input'
import { Button } from '../components/common/Button'
import { useVisitor } from '../hooks/useVisitor'
import { formatDate, formatIdentityNumber, formatName } from '../utils/format'

const CheckOut = () => {
  const [searchId, setSearchId] = useState('')
  const [activeVisit, setActiveVisit] = useState(null)
  const { loading, fetchVisitorById, checkOut } = useVisitor()

  const handleSearch = async () => {
    const visitor = await fetchVisitorById(searchId)
    if (visitor) {
      const activeVisit = visitor.visits?.find(v => !v.checked_out_at)
      setActiveVisit(activeVisit ? { ...activeVisit, visitor } : null)
    }
  }

  const handleCheckOut = async () => {
    if (!activeVisit) return
    
    try {
      await checkOut(activeVisit.id)
      setActiveVisit(null)
      setSearchId('')
    } catch (error) {
      console.error('Check-out failed:', error)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Visitor Check-Out</h1>

      <Card className="mb-6">
        <div className="flex gap-4">
          <Input
            placeholder="Enter ID/Passport Number"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
          />
          <Button onClick={handleSearch} disabled={loading}>
            Search
          </Button>
        </div>
      </Card>

      {activeVisit && (
        <Card>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Visitor Name</h3>
                <p className="mt-1">
                  {formatName(activeVisit.visitor.firstName, activeVisit.visitor.lastName)}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">ID Number</h3>
                <p className="mt-1">
                  {formatIdentityNumber(
                    activeVisit.visitor.identityType,
                    activeVisit.visitor.identityNumber
                  )}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Department</h3>
                <p className="mt-1">{activeVisit.department.name}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Check-In Time</h3>
                <p className="mt-1">{formatDate(activeVisit.checked_in_at)}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Purpose</h3>
                <p className="mt-1">{activeVisit.purpose}</p>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button onClick={handleCheckOut} disabled={loading}>
                Check Out Visitor
              </Button>
            </div>
          </div>
        </Card>
      )}

      {!activeVisit && searchId && !loading && (
        <Card>
          <p className="text-center text-gray-500">
            No active visit found for this ID
          </p>
        </Card>
      )}
    </div>
  )
}

export default CheckOut
