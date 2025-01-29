import { useState } from 'react'
import { Card } from '../components/common/Card'
import { Input } from '../components/common/Input'
import { Select } from '../components/common/Select'
import { Button } from '../components/common/Button'
import { useVisitor } from '../hooks/useVisitor'
import { validateForm, visitorSchema } from '../utils/validation'
import { formatIdentityNumber } from '../utils/format'

const CheckIn = () => {
  const [searchId, setSearchId] = useState('')
  const [visitorData, setVisitorData] = useState(null)
  const [formData, setFormData] = useState({
    identityType: '',
    identityNumber: '',
    firstName: '',
    lastName: '',
    fatherName: '',
    motherName: '',
    gender: '',
    department: '',
    purpose: ''
  })
  const [errors, setErrors] = useState({})
  const { loading, fetchVisitorById, checkIn } = useVisitor()

  const handleSearch = async () => {
    const visitor = await fetchVisitorById(searchId)
    if (visitor) {
      setVisitorData(visitor)
      setFormData({
        ...visitor,
        department: '',
        purpose: ''
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validation = validateForm(visitorSchema, formData)
    
    if (!validation.valid) {
      setErrors(validation.errors)
      return
    }

    try {
      await checkIn(formData, formData.department, formData.purpose)
      // Show success message and reset form
      setFormData({
        identityType: '',
        identityNumber: '',
        firstName: '',
        lastName: '',
        fatherName: '',
        motherName: '',
        gender: '',
        department: '',
        purpose: ''
      })
      setVisitorData(null)
      setSearchId('')
    } catch (error) {
      setErrors({ submit: error.message })
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Visitor Check-In</h1>

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

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Identity Type"
              options={[
                { value: 'National ID', label: 'National ID' },
                { value: 'Passport', label: 'Passport' }
              ]}
              value={formData.identityType}
              onChange={(e) => setFormData({ ...formData, identityType: e.target.value })}
              error={errors.identityType}
            />

            <Input
              label="Identity Number"
              value={formData.identityNumber}
              onChange={(e) => setFormData({ ...formData, identityNumber: e.target.value })}
              error={errors.identityNumber}
            />

            <Input
              label="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              error={errors.firstName}
            />

            <Input
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              error={errors.lastName}
            />

            <Input
              label="Father's Name"
              value={formData.fatherName}
              onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
            />

            <Input
              label="Mother's Name"
              value={formData.motherName}
              onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
            />

            <Select
              label="Gender"
              options={[
                { value: 'Male', label: 'Male' },
                { value: 'Female', label: 'Female' },
                { value: 'Other', label: 'Other' }
              ]}
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              error={errors.gender}
            />

            <Select
              label="Department"
              options={[
                { value: 'HR', label: 'Human Resources' },
                { value: 'IT', label: 'Information Technology' },
                { value: 'FIN', label: 'Finance' }
              ]}
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              error={errors.department}
            />

            <Input
              label="Purpose of Visit"
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              error={errors.purpose}
              className="md:col-span-2"
            />
          </div>

          {errors.submit && (
            <p className="text-sm text-red-500 mt-2">{errors.submit}</p>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              Check In Visitor
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default CheckIn
