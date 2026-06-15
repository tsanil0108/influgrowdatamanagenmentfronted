// src/utils/fileUtils.js
const API_BASE =
  window.location.hostname === 'localhost'
    ? 'http://localhost:8080'
    : 'https://influgrowdatamanagenmentbackned.onrender.com'

export const getDocUrl = (path) => `${API_BASE}${path}`