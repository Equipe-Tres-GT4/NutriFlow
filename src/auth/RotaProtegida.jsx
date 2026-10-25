import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

export default function RotaProtegida({ children }) {
  const { usuario } = useAuth()
  return usuario ? children : <Navigate to="/login" replace />
}