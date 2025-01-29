import * as z from 'zod'

// Login validation schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

// Visitor validation schema
export const visitorSchema = z.object({
  identityType: z.enum(['National ID', 'Passport']),
  identityNumber: z.string().min(4, 'Invalid identity number'),
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  fatherName: z.string().optional(),
  motherName: z.string().optional(),
  gender: z.enum(['Male', 'Female', 'Other']),
  department: z.string().min(1, 'Department is required'),
  purpose: z.string().min(4, 'Purpose is required')
})

// Form validation helper
export const validateForm = (schema, data) => {
  try {
    schema.parse(data)
    return { valid: true, errors: {} }
  } catch (error) {
    const errors = {}
    error.errors.forEach(err => {
      errors[err.path[0]] = err.message
    })
    return { valid: false, errors }
  }
}

// Identity number validation
export const isValidIdentityNumber = (type, number) => {
  if (type === 'National ID') {
    return /^\d{12}$/.test(number.replace(/-/g, ''))
  }
  if (type === 'Passport') {
    return /^[A-Z0-9]{6,12}$/.test(number)
  }
  return false
}

// Phone number validation
export const isValidPhone = (phone) => {
  return /^\+?[\d\s-]{10,}$/.test(phone)
}
