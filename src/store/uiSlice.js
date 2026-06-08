import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarCollapsed: false,
    notification: null, // { type, message, description }
  },
  reducers: {
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed
    },
    setSidebarCollapsed(state, action) {
      state.sidebarCollapsed = action.payload
    },
    showNotification(state, action) {
      state.notification = action.payload
    },
    clearNotification(state) {
      state.notification = null
    },
  },
})

export const { toggleSidebar, setSidebarCollapsed, showNotification, clearNotification } = uiSlice.actions
export default uiSlice.reducer