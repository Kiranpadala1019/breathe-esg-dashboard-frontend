import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({ baseURL: BASE });

export const getTenants       = ()         => api.get('/tenants/');
export const getDashboard     = (tenantId) => api.get(`/dashboard/?tenant=${tenantId}`);
export const getRecords       = (params)   => api.get('/records/', { params });
export const getBatches       = (tenantId) => api.get(`/batches/?tenant=${tenantId}`);
export const approveRecord    = (id, note)   => api.post(`/records/${id}/approve/`, { note });
export const rejectRecord     = (id, reason) => api.post(`/records/${id}/reject/`, { reason });
export const lockRecord       = (id)         => api.post(`/records/${id}/lock/`);
export const editRecord       = (id, data)   => api.patch(`/records/${id}/edit/`, data);
export const getRecordHistory = (id)         => api.get(`/records/${id}/history/`);

export const ingestFile = (tenantId, sourceType, file) => {
  const form = new FormData();
  form.append('tenant_id', tenantId);
  form.append('source_type', sourceType);
  form.append('file', file);
  return api.post('/ingest/', form, { headers: { 'Content-Type': 'multipart/form-data' } });
};
