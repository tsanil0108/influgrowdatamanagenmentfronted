import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getVendors } from '../api/vendorApi'

export const fetchVendors = createAsyncThunk('vendors/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const res = await getVendors(params)
    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch vendors')
  }
})

const vendorSlice = createSlice({
  name: 'vendors',
  initialState: {
    list: [],
    total: 0,
    loading: false,
    error: null,
  },
  reducers: {
    clearVendorError(state) { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVendors.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchVendors.fulfilled, (state, action) => {
        state.loading = false
        state.list = action.payload.content || action.payload
        state.total = action.payload.totalElements || action.payload.length || 0
      })
      .addCase(fetchVendors.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearVendorError } = vendorSlice.actions
export default vendorSlice.reducer