import api from '@/lib/api';
import { Musyawarah, MusyawarahListItem, CreateMusyawarahPayload, UpdateMusyawarahPayload } from '@/types/musyawarah';

export const musyawarahAdminService = {
  async list(): Promise<MusyawarahListItem[]> {
    const response = await api.get('/admin/musyawarah');
    return response.data.data || [];
  },

  async getById(id: string): Promise<Musyawarah | null> {
    try {
      const response = await api.get(`/admin/musyawarah/${id}`);
      return response.data.data;
    } catch (error: unknown) {
      const err = error as { response?: { status?: number } };
      if (err.response?.status === 404) return null;
      throw error;
    }
  },

  async create(payload: CreateMusyawarahPayload): Promise<Musyawarah> {
    const response = await api.post('/admin/musyawarah', payload);
    return response.data.data;
  },

  async update(id: string, payload: UpdateMusyawarahPayload): Promise<Musyawarah> {
    const response = await api.put(`/admin/musyawarah/${id}`, payload);
    return response.data.data;
  },

  async activate(id: string): Promise<Musyawarah> {
    const response = await api.post(`/admin/musyawarah/${id}/activate`);
    return response.data.data;
  },

  async deactivate(id: string): Promise<Musyawarah> {
    const response = await api.post(`/admin/musyawarah/${id}/deactivate`);
    return response.data.data;
  },

  async archive(id: string): Promise<Musyawarah> {
    const response = await api.post(`/admin/musyawarah/${id}/archive`);
    return response.data.data;
  },

  async publish(id: string): Promise<Musyawarah> {
    const response = await api.post(`/admin/musyawarah/${id}/publish`);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/admin/musyawarah/${id}`);
  },
};
