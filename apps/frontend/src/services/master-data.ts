import publicApi from '@/lib/public-api';
import adminApi from '@/lib/api';

// ─── Shared Types ─────────────────────────────────────────────────────────────

export interface IndustrialArea {
  id: string;
  name: string;
  code?: string;
  city?: string;
  province?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  industrial_area_id?: string;
  industrial_area?: string;
  address?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface JobTitle {
  id: string;
  name: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ListParams {
  search?: string;
  is_active?: boolean;
  area_id?: string;
  page?: number;
  limit?: number;
}

// ─── Request Types ────────────────────────────────────────────────────────────

export interface CreateIndustrialAreaRequest {
  name: string;
  code?: string;
  city?: string;
  province?: string;
  is_active?: boolean;
  sort_order?: number;
}

export interface CreateCompanyRequest {
  name: string;
  industrial_area_id?: string;
  address?: string;
  is_active?: boolean;
}

export interface CreateJobTitleRequest {
  name: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface CreateDepartmentRequest {
  name: string;
  is_active?: boolean;
}

// ─── Public Service (active-only, no auth) ───────────────────────────────────

export const publicMasterDataService = {
  async getIndustrialAreas(): Promise<IndustrialArea[]> {
    const res = await publicApi.get('/public/master/industrial-areas');
    return res.data?.data ?? [];
  },

  async getCompanies(areaId?: string): Promise<Company[]> {
    const params = areaId ? { area_id: areaId } : {};
    const res = await publicApi.get('/public/master/companies', { params });
    return res.data?.data ?? [];
  },

  async getJobTitles(): Promise<JobTitle[]> {
    const res = await publicApi.get('/public/master/job-titles');
    return res.data?.data ?? [];
  },

  async getDepartments(): Promise<Department[]> {
    const res = await publicApi.get('/public/master/departments');
    return res.data?.data ?? [];
  },
};

// ─── Admin Service (full CRUD) ────────────────────────────────────────────────

function buildParams(p: ListParams): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  if (p.search !== undefined && p.search !== '') out.search = p.search;
  if (p.is_active !== undefined) out.is_active = p.is_active;
  if (p.area_id) out.area_id = p.area_id;
  if (p.page) out.page = p.page;
  if (p.limit) out.limit = p.limit;
  return out;
}

export const adminMasterDataService = {
  // ─ Industrial Areas ─
  async listIndustrialAreas(p: ListParams = {}): Promise<PaginatedResponse<IndustrialArea>> {
    const res = await adminApi.get('/admin/master/industrial-areas', { params: buildParams(p) });
    return res.data?.data;
  },

  async getIndustrialArea(id: string): Promise<IndustrialArea> {
    const res = await adminApi.get(`/admin/master/industrial-areas/${id}`);
    return res.data?.data;
  },

  async createIndustrialArea(req: CreateIndustrialAreaRequest): Promise<IndustrialArea> {
    const res = await adminApi.post('/admin/master/industrial-areas', req);
    return res.data?.data;
  },

  async updateIndustrialArea(id: string, req: CreateIndustrialAreaRequest): Promise<IndustrialArea> {
    const res = await adminApi.put(`/admin/master/industrial-areas/${id}`, req);
    return res.data?.data;
  },

  async deleteIndustrialArea(id: string): Promise<void> {
    await adminApi.delete(`/admin/master/industrial-areas/${id}`);
  },

  async restoreIndustrialArea(id: string): Promise<void> {
    await adminApi.patch(`/admin/master/industrial-areas/${id}/restore`);
  },

  // ─ Companies ─
  async listCompanies(p: ListParams = {}): Promise<PaginatedResponse<Company>> {
    const res = await adminApi.get('/admin/master/companies', { params: buildParams(p) });
    return res.data?.data;
  },

  async getCompany(id: string): Promise<Company> {
    const res = await adminApi.get(`/admin/master/companies/${id}`);
    return res.data?.data;
  },

  async createCompany(req: CreateCompanyRequest): Promise<Company> {
    const res = await adminApi.post('/admin/master/companies', req);
    return res.data?.data;
  },

  async updateCompany(id: string, req: CreateCompanyRequest): Promise<Company> {
    const res = await adminApi.put(`/admin/master/companies/${id}`, req);
    return res.data?.data;
  },

  async deleteCompany(id: string): Promise<void> {
    await adminApi.delete(`/admin/master/companies/${id}`);
  },

  async restoreCompany(id: string): Promise<void> {
    await adminApi.patch(`/admin/master/companies/${id}/restore`);
  },

  // ─ Job Titles ─
  async listJobTitles(p: ListParams = {}): Promise<PaginatedResponse<JobTitle>> {
    const res = await adminApi.get('/admin/master/job-titles', { params: buildParams(p) });
    return res.data?.data;
  },

  async getJobTitle(id: string): Promise<JobTitle> {
    const res = await adminApi.get(`/admin/master/job-titles/${id}`);
    return res.data?.data;
  },

  async createJobTitle(req: CreateJobTitleRequest): Promise<JobTitle> {
    const res = await adminApi.post('/admin/master/job-titles', req);
    return res.data?.data;
  },

  async updateJobTitle(id: string, req: CreateJobTitleRequest): Promise<JobTitle> {
    const res = await adminApi.put(`/admin/master/job-titles/${id}`, req);
    return res.data?.data;
  },

  async deleteJobTitle(id: string): Promise<void> {
    await adminApi.delete(`/admin/master/job-titles/${id}`);
  },

  async restoreJobTitle(id: string): Promise<void> {
    await adminApi.patch(`/admin/master/job-titles/${id}/restore`);
  },

  // ─ Departments ─
  async listDepartments(p: ListParams = {}): Promise<PaginatedResponse<Department>> {
    const res = await adminApi.get('/admin/master/departments', { params: buildParams(p) });
    return res.data?.data;
  },

  async getDepartment(id: string): Promise<Department> {
    const res = await adminApi.get(`/admin/master/departments/${id}`);
    return res.data?.data;
  },

  async createDepartment(req: CreateDepartmentRequest): Promise<Department> {
    const res = await adminApi.post('/admin/master/departments', req);
    return res.data?.data;
  },

  async updateDepartment(id: string, req: CreateDepartmentRequest): Promise<Department> {
    const res = await adminApi.put(`/admin/master/departments/${id}`, req);
    return res.data?.data;
  },

  async deleteDepartment(id: string): Promise<void> {
    await adminApi.delete(`/admin/master/departments/${id}`);
  },

  async restoreDepartment(id: string): Promise<void> {
    await adminApi.patch(`/admin/master/departments/${id}/restore`);
  },
};
