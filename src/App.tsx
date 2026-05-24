import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import ProtectedRoute from './components/ui/ProtectedRoute'
import RootLayout from './components/layout/RootLayout'

import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import SearchPage from './pages/SearchPage'
import InspirePage from './pages/InspirePage'
import PlannerPage from './pages/PlannerPage'
import ItinerariesPage from './pages/ItinerariesPage'
import RoutePage from './pages/RoutePage'
import MultiCityPage from './pages/MultiCityPage'
import CarbonPage from './pages/CarbonPage'
import AlertsPage from './pages/AlertsPage'
import SavedSearchesPage from './pages/SavedSearchesPage'
import AnalyticsPage from './pages/AnalyticsPage'
import ProfilePage from './pages/ProfilePage'
import AdminPage from './pages/AdminPage'
import NotFoundPage from './pages/NotFoundPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<RootLayout />}>
              <Route index element={<Navigate to="/search" replace />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/inspire" element={<InspirePage />} />
              <Route path="/planner" element={<PlannerPage />} />
              <Route path="/itineraries" element={<ItinerariesPage />} />
              <Route path="/routes" element={<RoutePage />} />
              <Route path="/multi-city" element={<MultiCityPage />} />
              <Route path="/carbon" element={<CarbonPage />} />
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="/saved-searches" element={<SavedSearchesPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}