import { useState } from 'react'
import { Container, Typography } from '@mui/material'
import EntityManager from '../components/EntityManager'

export default function EntityManagerPage() {
  return (
    <>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography
          variant="h4"
          sx={{
            mb: 2,
            fontWeight: 700,
            color: 'primary.main',
            textAlign: 'center'
          }}
        >
          📊 Entity Management
        </Typography>

        <Typography
          variant="body1"
          sx={{
            mb: 4,
            color: 'text.secondary',
            textAlign: 'center',
            maxWidth: 600,
            mx: 'auto'
          }}
        >
          Create and manage JSON entities that can be reused across multiple mapping profiles.
          Entities represent data structures that you want to transform between.
        </Typography>

        <EntityManager />
      </Container>
    </>
  )
}
