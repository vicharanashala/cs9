import { axisPrivate } from '../../api/axios'

export async function fetchAdminDashboard() {
  const { data } = await axisPrivate().get('/api/admin/dashboard')
  return data
}

export async function fetchAdminNotifications() {
  const { data } = await axisPrivate().get('/api/notifications?limit=8')
  return data
}

export async function markAllAdminNotificationsRead() {
  const { data } = await axisPrivate().patch('/api/notifications/read-all')
  return data
}

export async function logoutAdmin() {
  await axisPrivate().post('/api/auth/logout')
}

export async function sendAdminNotification(payload) {
  const { data } = await axisPrivate().post('/api/admin/notifications/send', payload)
  return data
}

export async function fetchUsersList(search = '') {
  const { data } = await axisPrivate().get(`/api/users?limit=100&search=${encodeURIComponent(search)}`)
  return data
}
