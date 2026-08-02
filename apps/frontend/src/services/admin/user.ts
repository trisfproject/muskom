import api from '@/lib/api';

export interface UserResponse {
  id: string;
  full_name: string;
  email: string;
  username: string;
  role_id: string;
  role_code: string;
  role_name: string;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ListUsersResponse {
  data: UserResponse[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export const userService = {
  async listUsers(params?: { search?: string; role_id?: string; status?: string; page?: number; limit?: number }): Promise<ListUsersResponse> {
    const response = await api.get('/admin/users', { params });
    return response.data.data;
  },

  async createUser(payload: any): Promise<UserResponse> {
    const response = await api.post('/admin/users', payload);
    return response.data.data;
  },

  async updateRole(id: string, role_id: string): Promise<void> {
    await api.patch(`/admin/users/${id}/role`, { role_id });
  },

  async updateStatus(id: string, is_active: boolean): Promise<void> {
    await api.patch(`/admin/users/${id}/status`, { is_active });
  },

  async resetPassword(id: string, new_password: string): Promise<void> {
    await api.post(`/admin/users/${id}/password-reset`, { new_password });
  },
};
