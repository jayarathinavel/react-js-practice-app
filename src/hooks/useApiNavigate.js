import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { setNavigate } from "../api/api"

// Custom hook to set navigate function for API interceptor
export const useApiNavigate = () => {
  const navigate = useNavigate()

  useEffect(() => {
    setNavigate(navigate)
  }, [navigate])
}
