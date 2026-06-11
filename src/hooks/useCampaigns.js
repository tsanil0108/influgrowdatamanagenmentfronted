// src/hooks/useCampaigns.js

import { useDispatch, useSelector } from 'react-redux'
import { fetchCampaigns, clearCampaignError } from '../store/campaignSlice'

export const useCampaigns = () => {
  const dispatch = useDispatch()
  const { list, loading, error } = useSelector(state => state.campaigns)

  const loadCampaigns = (params) => dispatch(fetchCampaigns(params))
  const clearError    = ()       => dispatch(clearCampaignError())

  return { list, loading, error, loadCampaigns, clearError }
}