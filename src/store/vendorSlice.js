import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getVendors } from '../api/vendorApi'

export const fetchVendors = createAsyncThunk('vendors/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const res = await getVendors(params)
    return {
      content: res.data?.data?.content ?? res.data?.data ?? [],
      totalElements: res.data?.data?.totalElements ?? 0,
    }
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch vendors')
  }
})

const vendorSlice = createSlice({
  name: 'vendors',
  initialState: { list: [], total: 0, loading: false, error: null },
  reducers: {
    clearVendorError(state) { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVendors.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchVendors.fulfilled, (state, action) => {
        state.loading = false
        state.list = action.payload.content
        state.total = action.payload.totalElements
      })
      .addCase(fetchVendors.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearVendorError } = vendorSlice.actions
export default vendorSlice.reducer