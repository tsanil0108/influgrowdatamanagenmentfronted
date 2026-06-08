import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { loginStart, loginSuccess, loginFailure, logout as logoutAction } from '../store/authSlice'
import { login as loginApi, logout as logoutApi } from '../api/authApi'

export function useAuth() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, token, isAuthenticated, loading, error } = useSelector((state) => state.auth)

  const login = async (credentials) => {
    dispatch(loginStart())
    try {
      const res = await loginApi(credentials)
      dispatch(loginSuccess({ token: res.data.token, user: res.data.user }))
      navigate('/dashboard')
    } catch (err) {
      dispatch(loginFailure(err.response?.data?.message || 'Login failed'))
    }
  }

  const logout = async () => {
    try { await logoutApi() } catch {}
    dispatch(logoutAction())
    navigate('/login')
  }

  return { user, token, isAuthenticated, loading, error, login, logout }
}