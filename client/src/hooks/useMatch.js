import { useState, useEffect, useCallback } from 'react'
import { matchAPI } from '../services/api'
import { calculateCompatibility } from '../utils/helpers'

export const useMatch = () => {
  const [matches, setMatches] = useState([])
  const [myMatches, setMyMatches] = useState([])
  const [emotions, setEmotions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [suggestions, setSuggestions] = useState([])

  // Load available emotions
  const loadEmotions = useCallback(async () => {
    try {
      const response = await matchAPI.getEmotions()
      const emotionValues = (response.data.emotions || []).map(e => e.value || e)
      setEmotions(emotionValues)
    } catch (err) {
      setError(err.message || 'Failed to load emotions')
    }
  }, [])

  // Find matches
  const findMatches = useCallback(async (filters = {}) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await matchAPI.findMatches(filters)
      const matchesWithCompatibility = response.data.matches.map(match => ({
        ...match,
        compatibility: calculateCompatibility(match, match) // This will be calculated properly with current user
      }))
      
      setMatches(matchesWithCompatibility)
      setSuggestions(response.data.suggestions || [])
    } catch (err) {
      setError(err.message || 'Failed to find matches')
    } finally {
      setLoading(false)
    }
  }, [])

  // Load my matches
  const loadMyMatches = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await matchAPI.getMyMatches()
      setMyMatches(response.data.matches)
    } catch (err) {
      setError(err.message || 'Failed to load your matches')
    } finally {
      setLoading(false)
    }
  }, [])

  // Create match
  const createMatch = useCallback(async (matchData) => {
    try {
      const response = await matchAPI.createMatch(matchData)
      // Add new match to my matches
      setMyMatches(prev => [...prev, response.data.match])
      return response.data.match
    } catch (err) {
      setError(err.message || 'Failed to create match')
      throw err
    }
  }, [])

  // Update match status
  const updateMatchStatus = useCallback(async (matchId, status) => {
    try {
      await matchAPI.updateMatchStatus(matchId, status)
      // Update match in my matches
      setMyMatches(prev => 
        prev.map(match => 
          match._id === matchId 
            ? { ...match, status } 
            : match
        )
      )
    } catch (err) {
      setError(err.message || 'Failed to update match status')
      throw err
    }
  }, [])

  // Delete match
  const deleteMatch = useCallback(async (matchId) => {
    try {
      await matchAPI.deleteMatch(matchId)
      // Remove match from my matches
      setMyMatches(prev => prev.filter(match => match._id !== matchId))
    } catch (err) {
      setError(err.message || 'Failed to delete match')
      throw err
    }
  }, [])

  // Load emotions on mount
  useEffect(() => {
    loadEmotions()
  }, [loadEmotions])

  return {
    matches,
    myMatches,
    emotions,
    loading,
    error,
    suggestions,
    findMatches,
    loadMyMatches,
    createMatch,
    updateMatchStatus,
    deleteMatch,
    clearError: () => setError(null)
  }
}
