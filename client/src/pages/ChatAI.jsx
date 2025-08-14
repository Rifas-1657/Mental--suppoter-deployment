import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Box, Container, Paper, Typography, IconButton, TextField, Chip, Avatar, Stack } from '@mui/material'
import { ArrowBack, Send } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import BackButton from '../components/BackButton'
import api, { profileAPI } from '../services/api'

const ChatAI = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [emotions, setEmotions] = useState(user?.emotionTags || [])
  const [bot, setBot] = useState('support')
  const endRef = useRef(null)

  useEffect(() => {
    setEmotions(user?.emotionTags || [])
  }, [user])

  const scrollToBottom = () => endRef.current?.scrollIntoView({ behavior: 'smooth' })
  useEffect(scrollToBottom, [messages])

  const personaPrompt = (b) => {
    switch (b) {
      case 'motivation':
        return 'You are a motivational coach who responds with uplifting, action-oriented, brief messages.'
      case 'entertainment':
        return 'You are a friendly, light-hearted companion. Keep messages fun, gentle, and reassuring.'
      case 'support':
      default:
        return 'You are an empathetic mental health supporter. Respond with warmth and care.'
    }
  }

  const sendPrompt = async (text) => {
    if (!text.trim()) return
    const userMsg = { role: 'user', text, ts: Date.now() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    try {
      const prompt = `${personaPrompt(bot)} User's selected emotions: ${emotions.join(', ') || 'none'}. Keep replies concise. Question: ${text}`
      const res = await api.post('/api/gemini', { prompt, emotions, persona: bot })
      const botMsg = { role: 'ai', text: res.data.response, ts: Date.now() }
      setMessages(prev => [...prev, botMsg])
    } catch (err) {
      const botMsg = { role: 'ai', text: err.message || 'AI is unavailable right now.', ts: Date.now() }
      setMessages(prev => [...prev, botMsg])
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', py: 3, bgcolor: 'background.default' }}>
      <Container maxWidth="md">
        <BackButton />
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Gemini AI Chat</Typography>
          <Typography variant="body2" color="text.secondary">Responses adapt to your selected emotions.</Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            {[{key:'support',label:'Sad Support',avatar:'💙'},{key:'entertainment',label:'Entertainment',avatar:'🎭'},{key:'motivation',label:'Motivation',avatar:'⚡'}].map(p => (
              <Chip key={p.key} label={`${p.avatar} ${p.label}`} color={bot===p.key?'primary':'default'} onClick={()=>setBot(p.key)} />
            ))}
          </Stack>
        </Paper>

        <Paper sx={{ p: 2, minHeight: 400, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ flexGrow: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
            {messages.map((m, i) => (
              <Box key={i} sx={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <Box sx={{ bgcolor: m.role === 'user' ? 'primary.main' : 'background.paper', color: m.role === 'user' ? 'white' : 'text.primary', px: 2, py: 1, borderRadius: 2, maxWidth: '70%' }}>
                  <Typography variant="body2">{m.text}</Typography>
                </Box>
              </Box>
            ))}
            <div ref={endRef} />
          </Box>
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <TextField fullWidth value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); sendPrompt(input) }}} placeholder="Type your message..." size="small" />
            <IconButton color="primary" onClick={() => sendPrompt(input)} disabled={!input.trim()}>
              <Send />
            </IconButton>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}

export default ChatAI


