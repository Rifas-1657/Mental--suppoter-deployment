import React from 'react'
import { Button } from '@mui/material'
import { ArrowBack } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

const BackButton = ({ label = 'Back' }) => {
  const navigate = useNavigate()
  return (
    <Button
      variant="text"
      startIcon={<ArrowBack />}
      onClick={() => navigate(-1)}
      sx={{ mb: 2 }}
    >
      {label}
    </Button>
  )
}

export default BackButton


