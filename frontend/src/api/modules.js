import { api } from "./client";

export const lockersApi = {
  list: () => api.get("/lockers/cells/"),
  summary: () => api.get("/lockers/cells/summary/"),
  reset: (id) => api.post(`/lockers/cells/${id}/reset/`, {}),
  markMaintenance: (id) => api.post(`/lockers/cells/${id}/mark_maintenance/`, {}),
};

export const parcelsApi = {
  list: () => api.get("/parcels/"),
  inbound: (payload) => api.post("/parcels/inbound/", payload),
  open: (pickupCode) => api.post("/parcels/open/", { pickup_code: pickupCode }),
};

export const notificationsApi = {
  list: () => api.get("/notifications/"),
};

export const preferencesApi = {
  list: () => api.get("/notifications/preferences/"),
  create: (payload) => api.post("/notifications/preferences/", payload),
  update: (phone, payload) => api.put(`/notifications/preferences/${phone}/`, payload),
  patch: (phone, payload) => api.patch(`/notifications/preferences/${phone}/`, payload),
  delete: (phone) => api.delete(`/notifications/preferences/${phone}/`),
  getByPhone: (phone) => api.get(`/notifications/preferences/by-phone/${phone}/`),
};

export const returnsApi = {
  list: () => api.get("/returns/"),
  create: (payload) => api.post("/returns/", payload),
  complete: (id) => api.post(`/returns/${id}/complete/`, {}),
};
