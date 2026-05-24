import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/search')
    } catch {
      setError('Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ width: '100%', maxWidth: '360px', padding: '0 24px' }}>
        <div style={{ marginBottom: '40px' }}>
          <h1
            style={{
              fontSize: '22px',
              fontWeight: '500',
              color: '#ffffff',
              letterSpacing: '-0.02em',
              marginBottom: '6px',
            }}
          >
            SkyMind
          </h1>
          <p style={{ fontSize: '13px', color: '#525252' }}>
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', color: '#737373', fontWeight: '400' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={{
                backgroundColor: '#0a0a0a',
                border: '1px solid #262626',
                borderRadius: '6px',
                padding: '10px 12px',
                fontSize: '13px',
                color: '#ffffff',
                outline: 'none',
                transition: 'border-color 0.15s',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#525252')}
              onBlur={(e) => (e.target.style.borderColor = '#262626')}
              placeholder="you@example.com"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', color: '#737373', fontWeight: '400' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={{
                backgroundColor: '#0a0a0a',
                border: '1px solid #262626',
                borderRadius: '6px',
                padding: '10px 12px',
                fontSize: '13px',
                color: '#ffffff',
                outline: 'none',
                transition: 'border-color 0.15s',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#525252')}
              onBlur={(e) => (e.target.style.borderColor = '#262626')}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p style={{ fontSize: '12px', color: '#dc2626' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: '#ffffff',
              color: '#000000',
              border: 'none',
              borderRadius: '6px',
              padding: '10px 16px',
              fontSize: '13px',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              transition: 'opacity 0.15s',
              marginTop: '4px',
            }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p style={{ fontSize: '12px', color: '#525252', marginTop: '24px', textAlign: 'center' }}>
          No account?{' '}
          <Link to="/register" style={{ color: '#737373', textDecoration: 'underline' }}>
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}