import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

export default function RotaProtegida({ children }) {
  const { usuario } = useAuth()
  const location = useLocation()
  return usuario ? children : <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />
}