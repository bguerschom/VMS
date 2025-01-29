// Date formatting
export const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Time duration
export const getDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return ''
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diff = Math.abs(end - start)
  const hours = Math.floor(diff / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  
  return `${hours}h ${minutes}m`
}

// ID formatter
export const formatIdentityNumber = (type, number) => {
  if (!number) return ''
  if (type === 'National ID') {
    return number.replace(/(\d{4})(\d{4})(\d{4})/, '$1-$2-$3')
  }
  return number
}

// Name formatter
export const formatName = (firstName, lastName) => {
  return `${firstName || ''} ${lastName || ''}`.trim()
}

// Status formatter
export const getVisitStatus = (checkedInAt, checkedOutAt) => {
  if (!checkedInAt) return 'PENDING'
  if (!checkedOutAt) return 'ACTIVE'
  return 'COMPLETED'
}
