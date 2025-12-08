'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Delete, LogIn } from 'lucide-react'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handlePinClick = (num) => {
    if (pin.length < 6) {
      setPin(pin + num)
      setError('')
    }
  }

  const handleClear = () => {
    setPin('')
    setError('')
  }

  const handleBackspace = () => {
    setPin(pin.slice(0, -1))
    setError('')
  }

  const handleLogin = async () => {
    if (!username) {
      setError('Please select a user')
      return
    }
    
    if (pin.length < 4) {
      setError('PIN must be at least 4 digits')
      return
    }

    setLoading(true)
    setError('')

    const result = await login(username, pin)

    if (!result.success) {
      setError(result.error || 'Invalid credentials')
      setPin('')
    }
    
    setLoading(false)
  }

  const users = [
    { username: 'admin', name: 'System Admin', role: 'admin', color: 'bg-purple-500' },
    { username: 'john', name: 'John Sharma', role: 'waiter', color: 'bg-blue-500' },
    { username: 'ram', name: 'Ram Thapa', role: 'waiter', color: 'bg-blue-500' },
    { username: 'sita', name: 'Sita Gurung', role: 'cashier', color: 'bg-green-500' },
    { username: 'chef', name: 'Chef Kumar', role: 'kitchen', color: 'bg-orange-500' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-6">
        {/* User Selection */}
        <Card>
          <CardHeader>
            <CardTitle>🍽️ Restaurant POS</CardTitle>
            <CardDescription>Select your profile to continue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {users.map((u) => (
              <button
                key={u.username}
                onClick={() => {
                  setUsername(u.username)
                  setPin('')
                  setError('')
                }}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left shadow-md hover:shadow-lg ${
                  username === u.username
                    ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-200'
                    : 'border-gray-300 hover:border-blue-400 bg-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-full ${u.color} flex items-center justify-center text-white font-bold text-lg shadow-md`}>
                    {u.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{u.name}</div>
                    <div className="text-sm text-gray-800 capitalize font-semibold">{u.role}</div>
                  </div>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* PIN Entry */}
        <Card className="shadow-2xl border-4 border-white/10">
          <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
            <CardTitle>Enter PIN</CardTitle>
            <CardDescription className="text-base font-medium">
              {username ? `Login as ${users.find(u => u.username === username)?.name}` : 'Select a user first'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* PIN Display */}
            <div className="bg-gray-100 rounded-lg p-4 text-center">
              <div className="flex justify-center space-x-2">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full ${
                      i < pin.length ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              <div className="mt-2 text-2xl font-mono text-gray-700 tracking-widest">
                {pin.replace(/./g, '•') || '______'}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* PIN Pad */}
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => handlePinClick(num.toString())}
                  disabled={!username || loading}
                  className="h-14 text-xl font-semibold bg-white border-2 border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 active:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {num}
                </button>
              ))}
              
              <button
                onClick={handleClear}
                disabled={!username || loading}
                className="h-14 bg-gray-200 border-2 border-gray-300 rounded-lg hover:bg-gray-300 active:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                Clear
              </button>
              
              <button
                onClick={() => handlePinClick('0')}
                disabled={!username || loading}
                className="h-14 text-xl font-semibold bg-white border-2 border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 active:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                0
              </button>
              
              <button
                onClick={handleBackspace}
                disabled={!username || loading}
                className="h-14 bg-gray-200 border-2 border-gray-300 rounded-lg hover:bg-gray-300 active:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>

            {/* Login Button */}
            <Button
              onClick={handleLogin}
              disabled={!username || pin.length < 4 || loading}
              className="w-full h-12 text-lg"
              size="lg"
            >
              {loading ? (
                <span>Logging in...</span>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Login
                </>
              )}
            </Button>

            {/* Helper Text */}
            <p className="text-xs text-center text-gray-700">
              Demo PINs: admin(123456), john(1234), ram(4567), sita(7890), chef(1111)
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
