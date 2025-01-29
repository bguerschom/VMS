import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { validateForm, loginSchema } from '../utils/validation'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import Card from '../components/common/Card'

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validation = validateForm(loginSchema, formData)
    
    if (!validation.valid) {
      setErrors(validation.errors)
      return
    }

    try {
      await signIn(formData.email, formData.password)
      navigate('/dashboard')
    } catch (error) {
      setErrors({ submit: error.message })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Visitor Management System
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
            placeholder="Enter your email"
          />

          <Input
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            error={errors.password}
            placeholder="Enter your password"
          />

          {errors.submit && (
            <p className="text-sm text-red-500 mt-2">{errors.submit}</p>
          )}

          <Button type="submit" fullWidth>
            Sign In
          </Button>
        </form>
      </Card>
    </div>
  )
}

export default Login
