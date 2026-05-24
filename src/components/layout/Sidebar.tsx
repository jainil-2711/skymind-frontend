import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'

const NAV_ITEMS = [
  { to: '/search', label: 'Flight Search' },
  { to: '/inspire', label: 'Inspire' },
  { to: '/planner', label: 'AI Planner' },
  { to: '/itineraries', label: 'Itineraries' },
  { to: '/routes', label: 'Routes' },
  { to: '/multi-city', label: 'Multi-City' },
  { to: '/carbon', label: 'Carbon' },
  { to: '/alerts', label: 'Alerts' },
  { to: '/saved-searches', label: 'Saved Searches' },
  { to: '/analytics', label: 'Analytics' },
]

export default function Sidebar() {
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <aside
      style={{
        width: '200px',
        minHeight: '100vh',
        borderRight: '1px solid #171717',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 0',
        flexShrink: 0,
        backgroundColor: '#000000',
      }}
    >
      {/* Logo */}
      <div style={{ padding: '0 20px 32px' }}>
        <span
          style={{
            fontSize: '15px',
            fontWeight: '600',
            letterSpacing: '-0.02em',
            color: '#ffffff',
          }}
        >
          SkyMind
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', padding: '0 8px' }}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              display: 'block',
              padding: '7px 12px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: isActive ? '500' : '400',
              color: isActive ? '#ffffff' : '#525252',
              backgroundColor: isActive ? '#171717' : 'transparent',
              textDecoration: 'none',
              transition: 'color 0.15s, background-color 0.15s',
            })}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom links */}
      <div style={{ padding: '0 8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <NavLink
          to="/profile"
          style={({ isActive }) => ({
            display: 'block',
            padding: '7px 12px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: isActive ? '500' : '400',
            color: isActive ? '#ffffff' : '#525252',
            backgroundColor: isActive ? '#171717' : 'transparent',
            textDecoration: 'none',
            transition: 'color 0.15s, background-color 0.15s',
          })}
        >
          Profile
        </NavLink>
        <NavLink
          to="/admin"
          style={({ isActive }) => ({
            display: 'block',
            padding: '7px 12px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: isActive ? '500' : '400',
            color: isActive ? '#ffffff' : '#525252',
            backgroundColor: isActive ? '#171717' : 'transparent',
            textDecoration: 'none',
            transition: 'color 0.15s, background-color 0.15s',
          })}
        >
          Admin
        </NavLink>
        <button
          onClick={handleLogout}
          style={{
            display: 'block',
            width: '100%',
            textAlign: 'left',
            padding: '7px 12px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: '400',
            color: '#525252',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#525252')}
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}