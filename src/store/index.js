import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import clientReducer from './clientSlice'
import vendorReducer from './vendorSlice'
import campaignReducer from './campaignSlice'
import uiReducer from './uiSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    clients: clientReducer,
    vendors: vendorReducer,
    campaigns: campaignReducer,
    ui: uiReducer,
  },
})