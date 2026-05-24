import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <p style={{ fontSize: '13px', color: '#525252' }}>404 — page not found</p>
      <Link to="/search" style={{ fontSize: '13px', color: '#737373', textDecoration: 'underline' }}>
        Go to search
      </Link>
    </div>
  )
}