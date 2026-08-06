import api from '@/lib/api';
import { DashboardData } from '@/types/dashboard';

export const dashboardService = {
  async getSummary(): Promise<DashboardData> {
    try {
      const res = await api.get('/admin/dashboard/summary');
      return res.data.data as DashboardData;
    } catch (error) {
      throw error;
    }
  }
};
