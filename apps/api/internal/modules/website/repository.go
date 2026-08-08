package website

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"

	"github.com/jmoiron/sqlx"
)

type CandidateEntity struct {
	ID             string  `db:"id"`
	SequenceNumber *int    `db:"candidate_number"`
	Name           *string `db:"name"`
	Title          *string `db:"title"`
	Vision         *string `db:"vision"`
	Biography      *string `db:"biography"`
	Mission        *string `db:"mission"`
	Organization   *string `db:"organization"`
	PhotoPath      *string `db:"photo_path"`
}

type Repository interface {
	// Transaction
	BeginTx(ctx context.Context) (*sqlx.Tx, error)

	// General
	GetGeneral(ctx context.Context) (*WebsiteGeneralSettings, error)
	UpdateGeneral(ctx context.Context, s *WebsiteGeneralSettings) (*WebsiteGeneralSettings, error)

	// Hero
	GetHero(ctx context.Context) (*WebsiteHeroSettings, error)
	UpdateHero(ctx context.Context, h *WebsiteHeroSettings) (*WebsiteHeroSettings, error)

	// Timeline
	GetTimelinePhases(ctx context.Context, publicOnly bool) ([]WebsiteTimelinePhase, error)
	GetTimelinePhaseByID(ctx context.Context, id string) (*WebsiteTimelinePhase, error)
	CreateTimelinePhase(ctx context.Context, p *WebsiteTimelinePhase) (*WebsiteTimelinePhase, error)
	UpdateTimelinePhase(ctx context.Context, p *WebsiteTimelinePhase) (*WebsiteTimelinePhase, error)
	DeleteTimelinePhase(ctx context.Context, id string) error
	ReorderTimelinePhases(ctx context.Context, items []ReorderTimelinePhaseItem) error

	// Announcements
	GetAnnouncements(ctx context.Context, publicOnly bool) ([]WebsiteAnnouncement, error)
	GetAnnouncementByID(ctx context.Context, id string) (*WebsiteAnnouncement, error)
	GetAnnouncementBySlug(ctx context.Context, slug string) (*WebsiteAnnouncement, error)
	CreateAnnouncement(ctx context.Context, a *WebsiteAnnouncement) (*WebsiteAnnouncement, error)
	UpdateAnnouncement(ctx context.Context, a *WebsiteAnnouncement) (*WebsiteAnnouncement, error)
	DeleteAnnouncement(ctx context.Context, id string) error

	// Candidate CMS & Candidates
	GetCandidateSettings(ctx context.Context) (*WebsiteCandidateSettings, error)
	UpdateCandidateSettings(ctx context.Context, c *WebsiteCandidateSettings) (*WebsiteCandidateSettings, error)
	GetCandidates(ctx context.Context) ([]CandidateEntity, error)
	GetCandidateByID(ctx context.Context, id string) (*CandidateEntity, error)

	// Footer
	GetFooter(ctx context.Context) (*WebsiteFooterSettings, error)
	UpdateFooter(ctx context.Context, f *WebsiteFooterSettings) (*WebsiteFooterSettings, error)

	// Information Pages
	GetInformationPages(ctx context.Context, onlyPublished bool) ([]WebsiteInformationPage, error)
	GetInformationPage(ctx context.Context, idOrSlug string) (*WebsiteInformationPage, error)
	CreateInformationPage(ctx context.Context, p *WebsiteInformationPage) (*WebsiteInformationPage, error)
	UpdateInformationPage(ctx context.Context, id string, p *WebsiteInformationPage) (*WebsiteInformationPage, error)
	DeleteInformationPage(ctx context.Context, id string) error

	// Operational Metrics
	GetParticipantCount(ctx context.Context) (int, error)
	GetRegistrationLimit(ctx context.Context) (int, int, string, error)
	GetWaitingListCount(ctx context.Context) (int, error)
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

func (r *repository) BeginTx(ctx context.Context) (*sqlx.Tx, error) {
	return r.db.BeginTxx(ctx, nil)
}

// ----------------------------------------------------------------------------
// General Settings
// ----------------------------------------------------------------------------

func (r *repository) GetGeneral(ctx context.Context) (*WebsiteGeneralSettings, error) {
	query := `
		SELECT 
			id, site_name, tagline, theme, primary_color, secondary_color, 
			default_light_theme, default_dark_theme, registration_enabled, maintenance_mode, 
			seo_title, seo_description, seo_image_url, favicon_url, created_at, updated_at
		FROM website_general_settings
		ORDER BY created_at ASC
		LIMIT 1
	`
	var s WebsiteGeneralSettings
	err := r.db.GetContext(ctx, &s, query)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &s, nil
}

func (r *repository) UpdateGeneral(ctx context.Context, s *WebsiteGeneralSettings) (*WebsiteGeneralSettings, error) {
	query := `
		UPDATE website_general_settings
		SET 
			site_name = $1, tagline = $2, theme = $3, primary_color = $4, secondary_color = $5,
			default_light_theme = $6, default_dark_theme = $7, registration_enabled = $8, maintenance_mode = $9,
			seo_title = $10, seo_description = $11, seo_image_url = $12, favicon_url = $13, updated_at = NOW()
		WHERE id = (SELECT id FROM website_general_settings ORDER BY created_at ASC LIMIT 1)
		RETURNING id, site_name, tagline, theme, primary_color, secondary_color, default_light_theme, default_dark_theme,
		          registration_enabled, maintenance_mode, seo_title, seo_description, seo_image_url, favicon_url, created_at, updated_at
	`
	var updated WebsiteGeneralSettings
	err := r.db.GetContext(ctx, &updated, query,
		s.SiteName, s.Tagline, s.Theme, s.PrimaryColor, s.SecondaryColor,
		s.DefaultLightTheme, s.DefaultDarkTheme, s.RegistrationEnabled, s.MaintenanceMode,
		s.SEOTitle, s.SEODescription, s.SEOImageURL, s.FaviconURL,
	)
	if err != nil {
		return nil, err
	}
	return &updated, nil
}

// ----------------------------------------------------------------------------
// Hero Settings
// ----------------------------------------------------------------------------

func (r *repository) GetHero(ctx context.Context) (*WebsiteHeroSettings, error) {
	query := `
		SELECT id, hero_badge,
		       primary_cta_label, primary_cta_url, primary_cta_enabled,
		       secondary_cta_label, secondary_cta_url, secondary_cta_enabled,
		       background_mode, hero_status, is_published, created_at, updated_at
		FROM website_hero_settings
		ORDER BY created_at ASC
		LIMIT 1
	`
	var h WebsiteHeroSettings
	err := r.db.GetContext(ctx, &h, query)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &h, nil
}

func (r *repository) UpdateHero(ctx context.Context, h *WebsiteHeroSettings) (*WebsiteHeroSettings, error) {
	query := `
		UPDATE website_hero_settings
		SET 
			hero_badge = $1,
			primary_cta_label = $2, primary_cta_url = $3, primary_cta_enabled = $4,
			secondary_cta_label = $5, secondary_cta_url = $6, secondary_cta_enabled = $7,
			background_mode = $8, hero_status = $9, is_published = $10, updated_at = NOW()
		WHERE id = (SELECT id FROM website_hero_settings ORDER BY created_at ASC LIMIT 1)
		RETURNING id, hero_badge,
		          primary_cta_label, primary_cta_url, primary_cta_enabled,
		          secondary_cta_label, secondary_cta_url, secondary_cta_enabled,
		          background_mode, hero_status, is_published, created_at, updated_at
	`
	var updated WebsiteHeroSettings
	err := r.db.GetContext(ctx, &updated, query,
		h.HeroBadge,
		h.PrimaryCTALabel, h.PrimaryCTAURL, h.PrimaryCTAEnabled,
		h.SecondaryCTALabel, h.SecondaryCTAURL, h.SecondaryCTAEnabled,
		h.BackgroundMode, h.HeroStatus, h.IsPublished,
	)
	if err != nil {
		return nil, err
	}
	return &updated, nil
}

// ----------------------------------------------------------------------------
// Timeline Phases
// ----------------------------------------------------------------------------

func (r *repository) GetTimelinePhases(ctx context.Context, publicOnly bool) ([]WebsiteTimelinePhase, error) {
	var query string
	if publicOnly {
		query = `
			SELECT id, title, description, start_date, end_date, display_order, registration_type, current_indicator, is_published, created_at, updated_at
			FROM website_timeline_phases
			WHERE deleted_at IS NULL AND is_published = true
			ORDER BY display_order ASC, start_date ASC
		`
	} else {
		query = `
			SELECT id, title, description, start_date, end_date, display_order, registration_type, current_indicator, is_published, created_at, updated_at
			FROM website_timeline_phases
			WHERE deleted_at IS NULL
			ORDER BY display_order ASC, start_date ASC
		`
	}

	var phases []WebsiteTimelinePhase
	err := r.db.SelectContext(ctx, &phases, query)
	if phases == nil {
		phases = []WebsiteTimelinePhase{}
	}
	return phases, err
}

func (r *repository) GetTimelinePhaseByID(ctx context.Context, id string) (*WebsiteTimelinePhase, error) {
	query := `
		SELECT id, title, description, start_date, end_date, display_order, registration_type, current_indicator, is_published, created_at, updated_at
		FROM website_timeline_phases
		WHERE id = $1 AND deleted_at IS NULL
	`
	var p WebsiteTimelinePhase
	err := r.db.GetContext(ctx, &p, query, id)
	return &p, err
}

func (r *repository) CreateTimelinePhase(ctx context.Context, p *WebsiteTimelinePhase) (*WebsiteTimelinePhase, error) {
	// If current_indicator is true, unset other current_indicators
	if p.CurrentIndicator {
		_, _ = r.db.ExecContext(ctx, `UPDATE website_timeline_phases SET current_indicator = false WHERE deleted_at IS NULL`)
	}

	query := `
		INSERT INTO website_timeline_phases (title, description, start_date, end_date, display_order, registration_type, current_indicator, is_published)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, title, description, start_date, end_date, display_order, registration_type, current_indicator, is_published, created_at, updated_at
	`
	var created WebsiteTimelinePhase
	err := r.db.GetContext(ctx, &created, query,
		p.Title, p.Description, p.StartDate, p.EndDate, p.DisplayOrder, p.RegistrationType, p.CurrentIndicator, p.IsPublished,
	)
	return &created, err
}

func (r *repository) UpdateTimelinePhase(ctx context.Context, p *WebsiteTimelinePhase) (*WebsiteTimelinePhase, error) {
	if p.CurrentIndicator {
		_, _ = r.db.ExecContext(ctx, `UPDATE website_timeline_phases SET current_indicator = false WHERE id != $1 AND deleted_at IS NULL`, p.ID)
	}

	query := `
		UPDATE website_timeline_phases
		SET title = $1, description = $2, start_date = $3, end_date = $4, display_order = $5, registration_type = $6, current_indicator = $7, is_published = $8, updated_at = NOW()
		WHERE id = $9 AND deleted_at IS NULL
		RETURNING id, title, description, start_date, end_date, display_order, registration_type, current_indicator, is_published, created_at, updated_at
	`
	var updated WebsiteTimelinePhase
	err := r.db.GetContext(ctx, &updated, query,
		p.Title, p.Description, p.StartDate, p.EndDate, p.DisplayOrder, p.RegistrationType, p.CurrentIndicator, p.IsPublished, p.ID,
	)
	return &updated, err
}

func (r *repository) DeleteTimelinePhase(ctx context.Context, id string) error {
	query := `UPDATE website_timeline_phases SET deleted_at = NOW() WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

func (r *repository) ReorderTimelinePhases(ctx context.Context, items []ReorderTimelinePhaseItem) error {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	for _, item := range items {
		_, err := tx.ExecContext(ctx, `UPDATE website_timeline_phases SET display_order = $1, updated_at = NOW() WHERE id = $2 AND deleted_at IS NULL`, item.DisplayOrder, item.ID)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

// ----------------------------------------------------------------------------
// Announcements
// ----------------------------------------------------------------------------

func (r *repository) GetAnnouncements(ctx context.Context, publicOnly bool) ([]WebsiteAnnouncement, error) {
	var query string
	if publicOnly {
		query = `
			SELECT id, title, slug, category, summary, content, thumbnail_url, is_pinned, is_published, published_at, created_at, updated_at
			FROM website_announcements
			WHERE deleted_at IS NULL AND is_published = true
			ORDER BY is_pinned DESC, published_at DESC
		`
	} else {
		query = `
			SELECT id, title, slug, category, summary, content, thumbnail_url, is_pinned, is_published, published_at, created_at, updated_at
			FROM website_announcements
			WHERE deleted_at IS NULL
			ORDER BY is_pinned DESC, published_at DESC
		`
	}

	var list []WebsiteAnnouncement
	err := r.db.SelectContext(ctx, &list, query)
	if list == nil {
		list = []WebsiteAnnouncement{}
	}
	return list, err
}

func (r *repository) GetAnnouncementByID(ctx context.Context, id string) (*WebsiteAnnouncement, error) {
	query := `
		SELECT id, title, slug, category, summary, content, thumbnail_url, is_pinned, is_published, published_at, created_at, updated_at
		FROM website_announcements
		WHERE id = $1 AND deleted_at IS NULL
	`
	var a WebsiteAnnouncement
	err := r.db.GetContext(ctx, &a, query, id)
	return &a, err
}

func (r *repository) GetAnnouncementBySlug(ctx context.Context, slug string) (*WebsiteAnnouncement, error) {
	query := `
		SELECT id, title, slug, category, summary, content, thumbnail_url, is_pinned, is_published, published_at, created_at, updated_at
		FROM website_announcements
		WHERE slug = $1 AND deleted_at IS NULL AND is_published = true
	`
	var a WebsiteAnnouncement
	err := r.db.GetContext(ctx, &a, query, slug)
	return &a, err
}

func (r *repository) CreateAnnouncement(ctx context.Context, a *WebsiteAnnouncement) (*WebsiteAnnouncement, error) {
	query := `
		INSERT INTO website_announcements (title, slug, category, summary, content, thumbnail_url, is_pinned, is_published, published_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id, title, slug, category, summary, content, thumbnail_url, is_pinned, is_published, published_at, created_at, updated_at
	`
	var created WebsiteAnnouncement
	err := r.db.GetContext(ctx, &created, query,
		a.Title, a.Slug, a.Category, a.Summary, a.Content, a.ThumbnailURL, a.IsPinned, a.IsPublished, a.PublishedAt,
	)
	return &created, err
}

func (r *repository) UpdateAnnouncement(ctx context.Context, a *WebsiteAnnouncement) (*WebsiteAnnouncement, error) {
	query := `
		UPDATE website_announcements
		SET title = $1, slug = $2, category = $3, summary = $4, content = $5, thumbnail_url = $6, is_pinned = $7, is_published = $8, published_at = $9, updated_at = NOW()
		WHERE id = $10 AND deleted_at IS NULL
		RETURNING id, title, slug, category, summary, content, thumbnail_url, is_pinned, is_published, published_at, created_at, updated_at
	`
	var updated WebsiteAnnouncement
	err := r.db.GetContext(ctx, &updated, query,
		a.Title, a.Slug, a.Category, a.Summary, a.Content, a.ThumbnailURL, a.IsPinned, a.IsPublished, a.PublishedAt, a.ID,
	)
	return &updated, err
}

func (r *repository) DeleteAnnouncement(ctx context.Context, id string) error {
	query := `UPDATE website_announcements SET deleted_at = NOW() WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

// ----------------------------------------------------------------------------
// Candidate CMS & Candidates
// ----------------------------------------------------------------------------

func (r *repository) GetCandidateSettings(ctx context.Context) (*WebsiteCandidateSettings, error) {
	query := `
		SELECT id, section_title, section_description, registration_status, empty_state_message, publication_message, created_at, updated_at
		FROM website_candidate_settings
		ORDER BY created_at ASC
		LIMIT 1
	`
	var c WebsiteCandidateSettings
	err := r.db.GetContext(ctx, &c, query)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return &WebsiteCandidateSettings{
				SectionTitle:       "Bursa Calon Ketua",
				SectionDescription: "Mengenal lebih dekat visi dan misi calon pemimpin yang akan membawa perubahan untuk komunitas.",
				RegistrationStatus: "PENJARINGAN",
				EmptyStateMessage:  "Calon Ketua Umum akan dipublikasikan setelah proses verifikasi administrasi selesai.",
				PublicationMessage: "Daftar calon resmi telah ditetapkan.",
			}, nil
		}
		return nil, err
	}
	return &c, nil
}

func (r *repository) UpdateCandidateSettings(ctx context.Context, c *WebsiteCandidateSettings) (*WebsiteCandidateSettings, error) {
	query := `
		UPDATE website_candidate_settings
		SET section_title = $1, section_description = $2, registration_status = $3, empty_state_message = $4, publication_message = $5, updated_at = NOW()
		WHERE id = (SELECT id FROM website_candidate_settings ORDER BY created_at ASC LIMIT 1)
		RETURNING id, section_title, section_description, registration_status, empty_state_message, publication_message, created_at, updated_at
	`
	var updated WebsiteCandidateSettings
	err := r.db.GetContext(ctx, &updated, query,
		c.SectionTitle, c.SectionDescription, c.RegistrationStatus, c.EmptyStateMessage, c.PublicationMessage,
	)
	return &updated, err
}

func (r *repository) GetCandidates(ctx context.Context) ([]CandidateEntity, error) {
	query := `
		SELECT 
			id,
			candidate_number,
			full_name as name,
			COALESCE(job_title, '') as title,
			CASE WHEN show_vision THEN COALESCE(vision, '') ELSE '' END as vision,
			CASE WHEN show_biography THEN COALESCE(biography, '') ELSE '' END as biography,
			CASE WHEN show_mission THEN COALESCE(mission, '') ELSE '' END as mission,
			COALESCE(company_name, '') as organization,
			CASE WHEN show_photo THEN COALESCE(profile_photo, '') ELSE '' END as photo_path
		FROM candidates
		WHERE deleted_at IS NULL AND publication_status = 'Published'
		ORDER BY display_order ASC, candidate_number ASC
	`
	var list []CandidateEntity
	err := r.db.SelectContext(ctx, &list, query)
	if list == nil {
		list = []CandidateEntity{}
	}
	return list, err
}

func (r *repository) GetCandidateByID(ctx context.Context, id string) (*CandidateEntity, error) {
	query := `
		SELECT 
			id,
			candidate_number,
			full_name as name,
			COALESCE(job_title, '') as title,
			CASE WHEN show_vision THEN COALESCE(vision, '') ELSE '' END as vision,
			CASE WHEN show_biography THEN COALESCE(biography, '') ELSE '' END as biography,
			CASE WHEN show_mission THEN COALESCE(mission, '') ELSE '' END as mission,
			COALESCE(company_name, '') as organization,
			CASE WHEN show_photo THEN COALESCE(profile_photo, '') ELSE '' END as photo_path
		FROM candidates
		WHERE id = $1 AND deleted_at IS NULL AND publication_status = 'Published'
	`
	var entity CandidateEntity
	err := r.db.GetContext(ctx, &entity, query, id)
	if err != nil {
		return nil, err
	}
	return &entity, nil
}

// ----------------------------------------------------------------------------
// Footer Settings
// ----------------------------------------------------------------------------

func (r *repository) GetFooter(ctx context.Context) (*WebsiteFooterSettings, error) {
	query := `
		SELECT id, organization_name, description, copyright, official_badge, tagline, created_at, updated_at
		FROM website_footer_settings
		ORDER BY created_at ASC
		LIMIT 1
	`
	var f WebsiteFooterSettings
	err := r.db.GetContext(ctx, &f, query)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return &WebsiteFooterSettings{
				OrganizationName: "MUSKOM",
				Description:      "Portal resmi Musyawarah KOMITKABE. Membangun proses pemilihan yang transparan, profesional, dan dapat dipercaya oleh seluruh anggota komunitas.",
				Copyright:        "© 2026 MUSKOM. Seluruh hak cipta dilindungi.",
				OfficialBadge:    "OFFICIAL PORTAL",
				Tagline:          "Dibangun untuk kemajuan bersama.",
			}, nil
		}
		return nil, err
	}
	return &f, nil
}

func (r *repository) UpdateFooter(ctx context.Context, f *WebsiteFooterSettings) (*WebsiteFooterSettings, error) {
	query := `
		UPDATE website_footer_settings
		SET organization_name = $1, description = $2, copyright = $3, official_badge = $4, tagline = $5, updated_at = NOW()
		WHERE id = (SELECT id FROM website_footer_settings ORDER BY created_at ASC LIMIT 1)
		RETURNING id, organization_name, description, copyright, official_badge, tagline, created_at, updated_at
	`
	var updated WebsiteFooterSettings
	err := r.db.GetContext(ctx, &updated, query,
		f.OrganizationName, f.Description, f.Copyright, f.OfficialBadge, f.Tagline,
	)
	return &updated, err
}

// ----------------------------------------------------------------------------
// Information Pages
// ----------------------------------------------------------------------------

func (r *repository) GetInformationPages(ctx context.Context, onlyPublished bool) ([]WebsiteInformationPage, error) {
	query := `
		SELECT id, slug, title, content, is_published, created_at, updated_at
		FROM website_information_pages
	`
	if onlyPublished {
		query += ` WHERE is_published = true `
	}
	query += ` ORDER BY created_at ASC`

	var list []WebsiteInformationPage
	err := r.db.SelectContext(ctx, &list, query)
	if list == nil {
		list = []WebsiteInformationPage{}
	}
	return list, err
}

func (r *repository) GetInformationPage(ctx context.Context, idOrSlug string) (*WebsiteInformationPage, error) {
	query := `
		SELECT id, slug, title, content, is_published, created_at, updated_at
		FROM website_information_pages
		WHERE id::text = $1 OR slug = $1
		LIMIT 1
	`
	var p WebsiteInformationPage
	err := r.db.GetContext(ctx, &p, query, idOrSlug)
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *repository) CreateInformationPage(ctx context.Context, p *WebsiteInformationPage) (*WebsiteInformationPage, error) {
	query := `
		INSERT INTO website_information_pages (slug, title, content, is_published)
		VALUES ($1, $2, $3, $4)
		RETURNING id, slug, title, content, is_published, created_at, updated_at
	`
	var created WebsiteInformationPage
	err := r.db.GetContext(ctx, &created, query,
		p.Slug, p.Title, p.Content, p.IsPublished,
	)
	return &created, err
}

func (r *repository) UpdateInformationPage(ctx context.Context, id string, p *WebsiteInformationPage) (*WebsiteInformationPage, error) {
	query := `
		UPDATE website_information_pages
		SET slug = $1, title = $2, content = $3, is_published = $4, updated_at = NOW()
		WHERE id = $5
		RETURNING id, slug, title, content, is_published, created_at, updated_at
	`
	var updated WebsiteInformationPage
	err := r.db.GetContext(ctx, &updated, query,
		p.Slug, p.Title, p.Content, p.IsPublished, id,
	)
	return &updated, err
}

func (r *repository) DeleteInformationPage(ctx context.Context, id string) error {
	query := `DELETE FROM website_information_pages WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

func (r *repository) GetParticipantCount(ctx context.Context) (int, error) {
	var count int
	err := r.db.GetContext(ctx, &count, `SELECT COUNT(*) FROM participants WHERE deleted_at IS NULL AND UPPER(status) IN ('VERIFIED', 'APPROVED')`)
	if err != nil {
		return 0, err
	}
	return count, nil
}

func (r *repository) GetRegistrationLimit(ctx context.Context) (int, int, string, error) {
	var settingsJSON []byte
	err := r.db.GetContext(ctx, &settingsJSON, `SELECT settings FROM system_configurations WHERE group_name = 'registration'`)
	if err != nil {
		return 0, 0, "CLOSE", nil
	}

	var cfg struct {
		ParticipantLimit    int    `json:"participant_limit"`
		WaitingListCapacity int    `json:"waiting_list_capacity"`
		CapacityMode        string `json:"capacity_mode"`
	}
	if err := json.Unmarshal(settingsJSON, &cfg); err != nil {
		return 0, 0, "CLOSE", nil
	}
	if cfg.CapacityMode == "" {
		cfg.CapacityMode = "CLOSE"
	}

	return cfg.ParticipantLimit, cfg.WaitingListCapacity, cfg.CapacityMode, nil
}

func (r *repository) GetWaitingListCount(ctx context.Context) (int, error) {
	var count int
	err := r.db.GetContext(ctx, &count, `SELECT COUNT(*) FROM registrations WHERE UPPER(TRIM(status)) IN ('WAITING LIST', 'WAITINGLIST', 'WAITING_LIST')`)
	if err != nil {
		return 0, err
	}
	return count, nil
}
