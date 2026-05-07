import api, { unwrap } from './client';

export const attendanceApi = {
  // ----- Employee -----
  clockIn: (payload = {}) => api.post('/attendance/clock-in', payload).then(unwrap),
  clockOut: (payload = {}) => api.post('/attendance/clock-out', payload).then(unwrap),
  myAttendance: (params = {}) => api.get('/attendance/my-attendance', { params }).then(unwrap),
  byDate: (date) => api.get(`/attendance/date/${date}`).then(unwrap),

  // ----- Admin -----
  ofEmployee: (employeeId, params = {}) =>
    api.get(`/attendance/employee/${employeeId}`, { params }).then(unwrap),
  update: (id, payload) => api.put(`/attendance/${id}`, payload).then(unwrap),
  mark: (payload) => api.post('/attendance/mark', payload).then(unwrap),
};
