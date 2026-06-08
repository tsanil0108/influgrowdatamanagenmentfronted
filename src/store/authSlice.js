import { createSlice } from '@reduxjs/toolkit'
import { getToken, getStoredUser, setToken, setStoredUser, removeToken } from '../utils/tokenHelper'

const initialState = {
  token: getToken(),
  user: getStoredUser(),
  isAuthenticated: !!getToken(),
  loading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart(state) {
      state.loading = true
      state.error = null
    },
    loginSuccess(state, action) {
      state.loading = false
      state.token = action.payload.token
      state.user = action.payload.user
      state.isAuthenticated = true
      setToken(action.payload.token)
      setStoredUser(action.payload.user)
    },
    loginFailure(state, action) {
      state.loading = false
      state.error = action.payload
    },
    logout(state) {
      state.token = null
      state.user = null
      state.isAuthenticated = false
      removeToken()
    },
    clearError(state) {
      state.error = null
    },
  },
})

export const { loginStart, loginSuccess, loginFailure, logout, clearError } = authSlice.actions
export default authSlice.reducer