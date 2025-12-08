'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, user, loading } = useAuth()

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated && user) {
        // Redirect based on role
        switch (user.role) {
          case 'admin':
            router.push('/admin')
            break
          case 'waiter':
            router.push('/waiter')
            break
          case 'cashier':
            router.push('/cashier')
            break
          case 'kitchen':
            router.push('/kitchen')
            break
          default:
            router.push('/login')
        }
      } else {
        router.push('/login')
      }
    }
  }, [isAuthenticated, user, loading, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
        <p className="mt-6 text-lg text-gray-700 font-medium">Loading Restaurant POS...</p>
      </div>
    </div>
  )
}
