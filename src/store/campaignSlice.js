// src/store/campaignSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getCampaigns } from '../api/campaignApi'

export const fetchCampaigns = createAsyncThunk('campaigns/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const res = await getCampaigns(params)
    return res.data  // { success: true, message: null, data: {...} }
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch campaigns')
  }
})

const campaignSlice = createSlice({
  name: 'campaigns',
  initialState: { list: [], loading: false, error: null },
  reducers: {
    clearCampaignError(state) { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCampaigns.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCampaigns.fulfilled, (state, action) => {
        state.loading = false
        const d = action.payload?.data
        if      (Array.isArray(d))           state.list = d
        else if (Array.isArray(d?.content))  state.list = d.content
        else                                 state.list = []
      })
      .addCase(fetchCampaigns.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.list = []
      })
  },
})

export const { clearCampaignError } = campaignSlice.actions
export default campaignSlice.reducer