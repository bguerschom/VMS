import { useState } from 'react'
import { supabase } from '../config/supabase'

export const useVisitor = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchVisitorById = async (identityNumber) => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('visitors')
        .select(`
          *,
          visits (
            *,
            department:departments(name)
          )
        `)
        .eq('identity_number', identityNumber)
        .single()

      if (error) throw error
      
      return data
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  const checkIn = async (visitorData, departmentId, purpose) => {
    try {
      setLoading(true)
      setError(null)

      const { data: visitor, error: visitorError } = await supabase
        .from('visitors')
        .upsert([visitorData])
        .single()

      if (visitorError) throw visitorError

      const { error: visitError } = await supabase
        .from('visits')
        .insert([
          {
            visitor_id: visitor.id,
            department_id: departmentId,
            purpose,
            checked_in_at: new Date(),
          }
        ])

      if (visitError) throw visitError

      return visitor
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  const checkOut = async (visitId) => {
    try {
      setLoading(true)
      setError(null)

      const { error } = await supabase
        .from('visits')
        .update({
          checked_out_at: new Date()
        })
        .eq('id', visitId)

      if (error) throw error
      
      return true
    } catch (err) {
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    fetchVisitorById,
    checkIn,
    checkOut
  }
}

export default useVisitor
