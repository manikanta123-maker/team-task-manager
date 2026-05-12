"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './providers'

export default function Home() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.push('/dashboard')
      } else {
        router.push('/login')
      }
    }
  }, [user, isLoading, router])

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>TaskFlow</h1>
        <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
      </div>
    </div>
  )
}
