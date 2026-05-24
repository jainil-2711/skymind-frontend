import { useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'

const ROUTE_LABELS: Record<string, string> = {
  '/search': 'Flight Search',
  '/inspire': 'Inspire',
  '/planner': 'AI Planner',
  '/itineraries': 'Itineraries',
  '/routes': 'Routes',
  '/multi-city': 'Multi-City',
  '/carbon': 'Carbon',
  '/alerts': 'Alerts',
  '/saved-searches': 'Saved Searches',
  '/analytics': 'Analytics',
  '/profile': 'Profile',
  '/admin': 'Admin',
}

export default function Topbar() {
  const location = useLocation()
  const user = useAuthStore((s) => s.user)
  const label = ROUTE_LABELS[location.pathname] ?? 'SkyMind'

  return (
    <header
      style={{
        height: '52px',
        borderBottom: '1px solid #171717',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        flexShrink: 0,
        backgroundColor: '#000000',
      }}
    >
      <span style={{ fontSize: '13px', color: '#525252', fontWeight: '400' }}>
        {label}
      </span>
      {user && (
        <span style={{ fontSize: '12px', color: '#404040' }}>
          {user.email}
        </span>
      )}
    </header>
  )
}