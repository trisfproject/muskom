package masterdata

import (
	"strconv"

	"github.com/gofiber/fiber/v3"
	"github.com/trisfproject/muskom/apps/api/platform/response"
)

type Handler struct {
	svc Service
}

func NewHandler(svc Service) *Handler {
	return &Handler{svc: svc}
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

func parseListParams(c fiber.Ctx) ListParams {
	p := ListParams{}
	p.Search = c.Query("search")
	p.AreaID = c.Query("area_id")

	if v := c.Query("is_active"); v != "" {
		b, err := strconv.ParseBool(v)
		if err == nil {
			p.IsActive = &b
		}
	}
	p.Page, _ = strconv.Atoi(c.Query("page", "1"))
	p.Limit, _ = strconv.Atoi(c.Query("limit", "50"))
	return p
}

func activeOnly() ListParams {
	t := true
	return ListParams{IsActive: &t, Page: 1, Limit: 200}
}

func handleErr(c fiber.Ctx, err error) error {
	if err == ErrNotFound {
		return response.SendError(c, fiber.StatusNotFound, "Data tidak ditemukan", nil)
	}
	if err == ErrDuplicate {
		return response.SendError(c, fiber.StatusConflict, "Nama sudah digunakan", nil)
	}
	return response.SendError(c, fiber.StatusInternalServerError, "Terjadi kesalahan server", nil)
}

// ─── Industrial Areas ─────────────────────────────────────────────────────────

func (h *Handler) ListIndustrialAreas(c fiber.Ctx) error {
	res, err := h.svc.ListIndustrialAreas(c.Context(), parseListParams(c))
	if err != nil {
		return handleErr(c, err)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Industrial areas retrieved", res, nil)
}

func (h *Handler) PublicListIndustrialAreas(c fiber.Ctx) error {
	res, err := h.svc.ListIndustrialAreas(c.Context(), activeOnly())
	if err != nil {
		return handleErr(c, err)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Industrial areas retrieved", res.Items, nil)
}

func (h *Handler) GetIndustrialArea(c fiber.Ctx) error {
	item, err := h.svc.GetIndustrialAreaByID(c.Context(), c.Params("id"))
	if err != nil {
		return handleErr(c, err)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Industrial area retrieved", item, nil)
}

func (h *Handler) CreateIndustrialArea(c fiber.Ctx) error {
	var req CreateIndustrialAreaRequest
	if err := c.Bind().JSON(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Payload tidak valid", nil)
	}
	if req.Name == "" {
		return response.SendError(c, fiber.StatusUnprocessableEntity, "Nama harus diisi", nil)
	}
	item, err := h.svc.CreateIndustrialArea(c.Context(), req)
	if err != nil {
		return handleErr(c, err)
	}
	return response.SendSuccess(c, fiber.StatusCreated, "Industrial area dibuat", item, nil)
}

func (h *Handler) UpdateIndustrialArea(c fiber.Ctx) error {
	var req UpdateIndustrialAreaRequest
	if err := c.Bind().JSON(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Payload tidak valid", nil)
	}
	if req.Name == "" {
		return response.SendError(c, fiber.StatusUnprocessableEntity, "Nama harus diisi", nil)
	}
	item, err := h.svc.UpdateIndustrialArea(c.Context(), c.Params("id"), req)
	if err != nil {
		return handleErr(c, err)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Industrial area diperbarui", item, nil)
}

func (h *Handler) DeleteIndustrialArea(c fiber.Ctx) error {
	if err := h.svc.DeleteIndustrialArea(c.Context(), c.Params("id")); err != nil {
		return handleErr(c, err)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Industrial area dihapus", nil, nil)
}

func (h *Handler) RestoreIndustrialArea(c fiber.Ctx) error {
	if err := h.svc.RestoreIndustrialArea(c.Context(), c.Params("id")); err != nil {
		return handleErr(c, err)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Industrial area dipulihkan", nil, nil)
}

// ─── Companies ────────────────────────────────────────────────────────────────

func (h *Handler) ListCompanies(c fiber.Ctx) error {
	res, err := h.svc.ListCompanies(c.Context(), parseListParams(c))
	if err != nil {
		return handleErr(c, err)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Companies retrieved", res, nil)
}

func (h *Handler) PublicListCompanies(c fiber.Ctx) error {
	p := activeOnly()
	p.AreaID = c.Query("area_id")
	p.Search = c.Query("search")
	res, err := h.svc.ListCompanies(c.Context(), p)
	if err != nil {
		return handleErr(c, err)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Companies retrieved", res.Items, nil)
}

func (h *Handler) GetCompany(c fiber.Ctx) error {
	item, err := h.svc.GetCompanyByID(c.Context(), c.Params("id"))
	if err != nil {
		return handleErr(c, err)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Company retrieved", item, nil)
}

func (h *Handler) CreateCompany(c fiber.Ctx) error {
	var req CreateCompanyRequest
	if err := c.Bind().JSON(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Payload tidak valid", nil)
	}
	if req.Name == "" {
		return response.SendError(c, fiber.StatusUnprocessableEntity, "Nama harus diisi", nil)
	}
	item, err := h.svc.CreateCompany(c.Context(), req)
	if err != nil {
		return handleErr(c, err)
	}
	return response.SendSuccess(c, fiber.StatusCreated, "Company dibuat", item, nil)
}

func (h *Handler) UpdateCompany(c fiber.Ctx) error {
	var req UpdateCompanyRequest
	if err := c.Bind().JSON(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Payload tidak valid", nil)
	}
	if req.Name == "" {
		return response.SendError(c, fiber.StatusUnprocessableEntity, "Nama harus diisi", nil)
	}
	item, err := h.svc.UpdateCompany(c.Context(), c.Params("id"), req)
	if err != nil {
		return handleErr(c, err)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Company diperbarui", item, nil)
}

func (h *Handler) DeleteCompany(c fiber.Ctx) error {
	if err := h.svc.DeleteCompany(c.Context(), c.Params("id")); err != nil {
		return handleErr(c, err)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Company dihapus", nil, nil)
}

func (h *Handler) RestoreCompany(c fiber.Ctx) error {
	if err := h.svc.RestoreCompany(c.Context(), c.Params("id")); err != nil {
		return handleErr(c, err)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Company dipulihkan", nil, nil)
}

// ─── Job Titles ───────────────────────────────────────────────────────────────

func (h *Handler) ListJobTitles(c fiber.Ctx) error {
	res, err := h.svc.ListJobTitles(c.Context(), parseListParams(c))
	if err != nil {
		return handleErr(c, err)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Job titles retrieved", res, nil)
}

func (h *Handler) PublicListJobTitles(c fiber.Ctx) error {
	res, err := h.svc.ListJobTitles(c.Context(), activeOnly())
	if err != nil {
		return handleErr(c, err)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Job titles retrieved", res.Items, nil)
}

func (h *Handler) GetJobTitle(c fiber.Ctx) error {
	item, err := h.svc.GetJobTitleByID(c.Context(), c.Params("id"))
	if err != nil {
		return handleErr(c, err)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Job title retrieved", item, nil)
}

func (h *Handler) CreateJobTitle(c fiber.Ctx) error {
	var req CreateJobTitleRequest
	if err := c.Bind().JSON(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Payload tidak valid", nil)
	}
	if req.Name == "" {
		return response.SendError(c, fiber.StatusUnprocessableEntity, "Nama harus diisi", nil)
	}
	item, err := h.svc.CreateJobTitle(c.Context(), req)
	if err != nil {
		return handleErr(c, err)
	}
	return response.SendSuccess(c, fiber.StatusCreated, "Job title dibuat", item, nil)
}

func (h *Handler) UpdateJobTitle(c fiber.Ctx) error {
	var req UpdateJobTitleRequest
	if err := c.Bind().JSON(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Payload tidak valid", nil)
	}
	if req.Name == "" {
		return response.SendError(c, fiber.StatusUnprocessableEntity, "Nama harus diisi", nil)
	}
	item, err := h.svc.UpdateJobTitle(c.Context(), c.Params("id"), req)
	if err != nil {
		return handleErr(c, err)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Job title diperbarui", item, nil)
}

func (h *Handler) DeleteJobTitle(c fiber.Ctx) error {
	if err := h.svc.DeleteJobTitle(c.Context(), c.Params("id")); err != nil {
		return handleErr(c, err)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Job title dihapus", nil, nil)
}

func (h *Handler) RestoreJobTitle(c fiber.Ctx) error {
	if err := h.svc.RestoreJobTitle(c.Context(), c.Params("id")); err != nil {
		return handleErr(c, err)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Job title dipulihkan", nil, nil)
}

// ─── Departments ──────────────────────────────────────────────────────────────

func (h *Handler) ListDepartments(c fiber.Ctx) error {
	res, err := h.svc.ListDepartments(c.Context(), parseListParams(c))
	if err != nil {
		return handleErr(c, err)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Departments retrieved", res, nil)
}

func (h *Handler) PublicListDepartments(c fiber.Ctx) error {
	res, err := h.svc.ListDepartments(c.Context(), activeOnly())
	if err != nil {
		return handleErr(c, err)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Departments retrieved", res.Items, nil)
}

func (h *Handler) GetDepartment(c fiber.Ctx) error {
	item, err := h.svc.GetDepartmentByID(c.Context(), c.Params("id"))
	if err != nil {
		return handleErr(c, err)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Department retrieved", item, nil)
}

func (h *Handler) CreateDepartment(c fiber.Ctx) error {
	var req CreateDepartmentRequest
	if err := c.Bind().JSON(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Payload tidak valid", nil)
	}
	if req.Name == "" {
		return response.SendError(c, fiber.StatusUnprocessableEntity, "Nama harus diisi", nil)
	}
	item, err := h.svc.CreateDepartment(c.Context(), req)
	if err != nil {
		return handleErr(c, err)
	}
	return response.SendSuccess(c, fiber.StatusCreated, "Department dibuat", item, nil)
}

func (h *Handler) UpdateDepartment(c fiber.Ctx) error {
	var req UpdateDepartmentRequest
	if err := c.Bind().JSON(&req); err != nil {
		return response.SendError(c, fiber.StatusBadRequest, "Payload tidak valid", nil)
	}
	if req.Name == "" {
		return response.SendError(c, fiber.StatusUnprocessableEntity, "Nama harus diisi", nil)
	}
	item, err := h.svc.UpdateDepartment(c.Context(), c.Params("id"), req)
	if err != nil {
		return handleErr(c, err)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Department diperbarui", item, nil)
}

func (h *Handler) DeleteDepartment(c fiber.Ctx) error {
	if err := h.svc.DeleteDepartment(c.Context(), c.Params("id")); err != nil {
		return handleErr(c, err)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Department dihapus", nil, nil)
}

func (h *Handler) RestoreDepartment(c fiber.Ctx) error {
	if err := h.svc.RestoreDepartment(c.Context(), c.Params("id")); err != nil {
		return handleErr(c, err)
	}
	return response.SendSuccess(c, fiber.StatusOK, "Department dipulihkan", nil, nil)
}
