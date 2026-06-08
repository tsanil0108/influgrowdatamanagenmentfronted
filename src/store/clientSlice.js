import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getClients } from '../api/clientApi'

export const fetchClients = createAsyncThunk('clients/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const res = await getClients(params)
    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch clients')
  }
})

const clientSlice = createSlice({
  name: 'clients',
  initialState: {
    list: [],
    total: 0,
    loading: false,
    error: null,
  },
  reducers: {
    clearClientError(state) { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClients.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.loading = false
        state.list = action.payload.content || action.payload
        state.total = action.payload.totalElements || action.payload.length || 0
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearClientError } = clientSlice.actions
export default clientSlice.reducer