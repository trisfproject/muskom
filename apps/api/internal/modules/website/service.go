package website

import (
	"context"
	"time"

	"go.uber.org/zap"
)

type Service interface {
	// Public
	GetPublicHome(ctx context.Context) (*PublicHomeResponse, error)
	GetPublicCandidates(ctx context.Context) ([]PublicCandidateDTO, error)
	GetPublicCandidateByID(ctx context.Context, id string) (*PublicCandidateDTO, error)
	GetPublicTimeline(ctx context.Context) ([]PublicTimelineDTO, error)
	GetPublicAnnouncements(ctx context.Context) ([]PublicAnnouncementDTO, error)
	GetPublicAnnouncementBySlug(ctx context.Context, slug string) (*PublicAnnouncementDTO, error)
	GetPublicFooter(ctx context.Context) (*WebsiteFooterDTO, error)

	// Admin General
	GetAdminGeneral(ctx context.Context) (*WebsiteGeneralSettings, error)
	UpdateAdminGeneral(ctx context.Context, req *UpdateGeneralRequest) (*WebsiteGeneralSettings, error)

	// Admin Hero
	GetAdminHero(ctx context.Context) (*WebsiteHeroSettings, error)
	UpdateAdminHero(ctx context.Context, req *UpdateHeroRequest) (*WebsiteHeroSettings, error)

	// Admin Timeline
	GetAdminTimeline(ctx context.Context) ([]WebsiteTimelinePhase, error)
	GetAdminTimelineByID(ctx context.Context, id string) (*WebsiteTimelinePhase, error)
	CreateAdminTimeline(ctx context.Context, req *CreateTimelinePhaseRequest) (*WebsiteTimelinePhase, error)
	UpdateAdminTimeline(ctx context.Context, id string, req *UpdateTimelinePhaseRequest) (*WebsiteTimelinePhase, error)
	DeleteAdminTimeline(ctx context.Context, id string) error
	ReorderAdminTimeline(ctx context.Context, req *ReorderTimelinePhasesRequest) error

	// Admin Announcements
	GetAdminAnnouncements(ctx context.Context) ([]WebsiteAnnouncement, error)
	GetAdminAnnouncementByID(ctx context.Context, id string) (*WebsiteAnnouncement, error)
	CreateAdminAnnouncement(ctx context.Context, req *CreateAnnouncementRequest) (*WebsiteAnnouncement, error)
	UpdateAdminAnnouncement(ctx context.Context, id string, req *UpdateAnnouncementRequest) (*WebsiteAnnouncement, error)
	DeleteAdminAnnouncement(ctx context.Context, id string) error

	// Admin Candidate CMS
	GetAdminCandidateSettings(ctx context.Context) (*WebsiteCandidateSettings, error)
	UpdateAdminCandidateSettings(ctx context.Context, req *UpdateCandidateCMSRequest) (*WebsiteCandidateSettings, error)

	// Admin Footer
	GetAdminFooter(ctx context.Context) (*WebsiteFooterSettings, error)
	UpdateAdminFooter(ctx context.Context, req *UpdateFooterRequest) (*WebsiteFooterSettings, error)

	// Public Information
	GetPublicInformationPages(ctx context.Context) ([]PublicInformationPageDTO, error)
	GetPublicInformationPage(ctx context.Context, slug string) (*PublicInformationPageDTO, error)

	// Admin Information
	GetAdminInformationPages(ctx context.Context) ([]WebsiteInformationPage, error)
	GetAdminInformationPage(ctx context.Context, id string) (*WebsiteInformationPage, error)
	CreateAdminInformationPage(ctx context.Context, req *CreateInformationPageRequest) (*WebsiteInformationPage, error)
	UpdateAdminInformationPage(ctx context.Context, id string, req *UpdateInformationPageRequest) (*WebsiteInformationPage, error)
	DeleteAdminInformationPage(ctx context.Context, id string) error
}

type service struct {
	repo      Repository
	cache     Cache
	mapper    *Mapper
	validator *Validator
	logger    *zap.Logger
	sync      TimelineSynchronizer
}

func NewService(repo Repository, cache Cache, mapper *Mapper, validator *Validator, logger *zap.Logger, opts ...ServiceOption) Service {
	s := &service{
		repo:      repo,
		cache:     cache,
		mapper:    mapper,
		validator: validator,
		logger:    logger,
	}
	for _, opt := range opts {
		opt(s)
	}
	return s
}

// ServiceOption allows injecting optional dependencies into the website service.
type ServiceOption func(*service)

// WithTimelineSynchronizer injects the timeline synchronizer for ADR-007.
func WithTimelineSynchronizer(sync TimelineSynchronizer) ServiceOption {
	return func(s *service) {
		s.sync = sync
	}
}

// ----------------------------------------------------------------------------
// Shared Helpers
// ----------------------------------------------------------------------------

func CalculatePhasesStatus(phases []WebsiteTimelinePhase) {
	now := time.Now().UTC()
	var activePhaseID *string

	// 1. Find the explicitly active phase (CurrentIndicator == true)
	for i := range phases {
		if phases[i].CurrentIndicator {
			id := phases[i].ID
			activePhaseID = &id
			break
		}
	}

	// 2. If no explicit active phase, find the first valid active phase by date
	if activePhaseID == nil {
		for i := range phases {
			p := &phases[i]
			if (now.After(p.StartDate) || now.Equal(p.StartDate)) && (now.Before(p.EndDate) || now.Equal(p.EndDate)) {
				id := p.ID
				activePhaseID = &id
				break
			}
		}
	}

	// 3. Assign statuses
	for i := range phases {
		p := &phases[i]
		if activePhaseID != nil && p.ID == *activePhaseID {
			p.Status = "active"
		} else if now.After(p.EndDate) {
			p.Status = "past"
		} else {
			p.Status = "upcoming"
		}
	}
}

// ----------------------------------------------------------------------------
// Public Service Methods
// ----------------------------------------------------------------------------

func (s *service) GetPublicHome(ctx context.Context) (*PublicHomeResponse, error) {
	start := time.Now()

	// 1. Check Cache
	if s.cache != nil {
		cached, err := s.cache.GetPublicHome(ctx)
		if err == nil && cached != nil {
			s.logger.Info("Website Engine public home aggregation",
				zap.String("cache_status", "HIT"),
				zap.Duration("duration_ms", time.Since(start)),
			)
			return cached, nil
		}
	}

	// 2. Fetch all raw entities from DB
	general, _ := s.repo.GetGeneral(ctx)
	hero, _ := s.repo.GetHero(ctx)
	phases, _ := s.repo.GetTimelinePhases(ctx, true)
	announcements, _ := s.repo.GetAnnouncements(ctx, true)
	candSettings, _ := s.repo.GetCandidateSettings(ctx)
	candidates, _ := s.repo.GetCandidates(ctx)
	footer, _ := s.repo.GetFooter(ctx)

	// 3. Current Phase & Countdown Engine
	CalculatePhasesStatus(phases)

	var currentPhase PublicCurrentPhaseDTO
	var countdown *PublicCountdownDTO
	var activePhase *WebsiteTimelinePhase
	var nextPhase *WebsiteTimelinePhase

	for i := range phases {
		if phases[i].Status == "active" {
			activePhase = &phases[i]
			if i+1 < len(phases) {
				nextPhase = &phases[i+1]
			}
			break
		}
	}

	if activePhase == nil {
		for i := range phases {
			if phases[i].Status == "upcoming" {
				nextPhase = &phases[i]
				break
			}
		}
	}

	if activePhase != nil {
		endDateCopy := activePhase.EndDate
		currentPhase = PublicCurrentPhaseDTO{
			Name:     activePhase.Title,
			EndDate:  &endDateCopy,
			IsActive: true,
		}
		countdown = &PublicCountdownDTO{
			TargetDate: activePhase.EndDate.Format(time.RFC3339),
			Label:      "Tahapan Berakhir",
		}
	} else if nextPhase != nil {
		startDateCopy := nextPhase.StartDate
		currentPhase = PublicCurrentPhaseDTO{
			Name:     "Menuju: " + nextPhase.Title,
			EndDate:  &startDateCopy,
			IsActive: false,
		}
		countdown = &PublicCountdownDTO{
			TargetDate: nextPhase.StartDate.Format(time.RFC3339),
			Label:      "Menuju Pembukaan",
		}
	} else if len(phases) > 0 {
		last := phases[len(phases)-1]
		endDateCopy := last.EndDate
		currentPhase = PublicCurrentPhaseDTO{
			Name:     last.Title + " (Selesai)",
			EndDate:  &endDateCopy,
			IsActive: false,
		}
	} else {
		currentPhase = PublicCurrentPhaseDTO{
			Name:     "Belum Ada Jadwal",
			IsActive: false,
		}
	}

	var activePhaseID *string
	if activePhase != nil {
		activePhaseID = &activePhase.ID
	}

	// 4. CTA Priority Engine
	regEnabled := true
	heroPrimaryEnabled := true
	heroSecondaryEnabled := true
	primaryLabel := "Daftar Calon Ketua Umum"
	primaryURL := "/register/candidate"
	secondaryLabel := "Daftar Peserta Musyawarah"
	secondaryURL := "/register"

	if general != nil {
		regEnabled = general.RegistrationEnabled
	}
	if hero != nil {
		heroPrimaryEnabled = hero.PrimaryCTAEnabled
		heroSecondaryEnabled = hero.SecondaryCTAEnabled
		primaryLabel = hero.PrimaryCTALabel
		primaryURL = hero.PrimaryCTAURL
		secondaryLabel = hero.SecondaryCTALabel
		secondaryURL = hero.SecondaryCTAURL
	}

	regType := "NONE"
	if activePhase != nil {
		regType = activePhase.RegistrationType
	}

	candStyle, partStyle := "outline", "outline"
	candOpen := regEnabled && heroPrimaryEnabled
	partOpen := regEnabled && heroSecondaryEnabled

	switch regType {
	case "CANDIDATE":
		candStyle = "primary"
	case "PARTICIPANT":
		partStyle = "primary"
	case "BOTH":
		candStyle, partStyle = "primary", "primary"
	default:
		candStyle = "primary"
	}

	cta := PublicCtaDTO{
		CandidateRegistration: &PublicRegistrationCTA{
			Label: primaryLabel,
			URL:   primaryURL,
			Open:  candOpen,
			Style: candStyle,
		},
		ParticipantRegistration: &PublicRegistrationCTA{
			Label: secondaryLabel,
			URL:   secondaryURL,
			Open:  partOpen,
			Style: partStyle,
		},
	}

	// 5. Map DTOs
	genDTO, metaDTO, flagsDTO, navDTO := s.mapper.MapGeneral(general)
	heroDTO := s.mapper.MapHero(hero)
	timelineDTO := s.mapper.MapTimelinePhases(phases, activePhaseID)
	announcementsDTO := s.mapper.MapAnnouncements(announcements)
	candCMS, candList, candSection := s.mapper.MapCandidates(candSettings, candidates)
	footerDTO := s.mapper.MapFooter(footer)

	resp := &PublicHomeResponse{
		Hero:          heroDTO,
		CurrentPhase:  currentPhase,
		CTA:           cta,
		Countdown:     countdown,
		Timeline:      timelineDTO,
		Announcements: announcementsDTO,
		Candidate:     candSection,
		Footer:        footerDTO,
		Navigation:    navDTO,
		Metadata:      metaDTO,
		FeatureFlags:  flagsDTO,
		// Aliases
		General:      genDTO,
		CandidateCMS: candCMS,
		Candidates:   candList,
	}

	// 6. Set Cache
	if s.cache != nil {
		if err := s.cache.SetPublicHome(ctx, resp, 0); err != nil {
			s.logger.Warn("Failed to cache public home", zap.Error(err))
		}
	}

	s.logger.Info("Website Engine public home aggregation",
		zap.String("cache_status", "MISS"),
		zap.Duration("duration_ms", time.Since(start)),
		zap.Int("phases_count", len(phases)),
		zap.Int("announcements_count", len(announcements)),
	)

	return resp, nil
}

func (s *service) GetPublicTimeline(ctx context.Context) ([]PublicTimelineDTO, error) {
	phases, err := s.repo.GetTimelinePhases(ctx, true)
	if err != nil {
		return nil, err
	}

	CalculatePhasesStatus(phases)

	dtos := make([]PublicTimelineDTO, len(phases))
	for i, p := range phases {
		dtos[i] = PublicTimelineDTO{
			ID:               p.ID,
			Title:            p.Title,
			Description:      p.Description,
			StartDate:        p.StartDate,
			EndDate:          p.EndDate,
			DisplayOrder:     p.DisplayOrder,
			RegistrationType: p.RegistrationType,
			Status:           p.Status,
		}
	}
	return dtos, nil
}

func (s *service) GetPublicAnnouncements(ctx context.Context) ([]PublicAnnouncementDTO, error) {
	list, err := s.repo.GetAnnouncements(ctx, true)
	if err != nil {
		return nil, err
	}

	dtos := make([]PublicAnnouncementDTO, len(list))
	for i, a := range list {
		dtos[i] = PublicAnnouncementDTO{
			ID:           a.ID,
			Title:        a.Title,
			Slug:         a.Slug,
			Category:     a.Category,
			Summary:      a.Summary,
			Content:      a.Content,
			ThumbnailURL: a.ThumbnailURL,
			IsPinned:     a.IsPinned,
			PublishedAt:  a.PublishedAt,
			CreatedAt:    a.CreatedAt,
		}
	}
	return dtos, nil
}

func (s *service) GetPublicAnnouncementBySlug(ctx context.Context, slug string) (*PublicAnnouncementDTO, error) {
	a, err := s.repo.GetAnnouncementBySlug(ctx, slug)
	if err != nil {
		return nil, err
	}

	return &PublicAnnouncementDTO{
		ID:           a.ID,
		Title:        a.Title,
		Slug:         a.Slug,
		Category:     a.Category,
		Summary:      a.Summary,
		Content:      a.Content,
		ThumbnailURL: a.ThumbnailURL,
		IsPinned:     a.IsPinned,
		PublishedAt:  a.PublishedAt,
		CreatedAt:    a.CreatedAt,
	}, nil
}

func (s *service) GetPublicFooter(ctx context.Context) (*WebsiteFooterDTO, error) {
	f, err := s.repo.GetFooter(ctx)
	if err != nil {
		return nil, err
	}
	return &WebsiteFooterDTO{
		OrganizationName: f.OrganizationName,
		Description:      f.Description,
		Copyright:        f.Copyright,
		OfficialBadge:    f.OfficialBadge,
		Tagline:          f.Tagline,
	}, nil
}

func (s *service) GetPublicCandidates(ctx context.Context) ([]PublicCandidateDTO, error) {
	candidates, err := s.repo.GetCandidates(ctx)
	if err != nil {
		return nil, err
	}
	candDTOs := make([]PublicCandidateDTO, len(candidates))
	for i, c := range candidates {
		candDTOs[i] = s.mapper.MapCandidate(&c)
	}
	return candDTOs, nil
}

func (s *service) GetPublicCandidateByID(ctx context.Context, id string) (*PublicCandidateDTO, error) {
	c, err := s.repo.GetCandidateByID(ctx, id)
	if err != nil {
		return nil, err
	}
	dto := s.mapper.MapCandidate(c)
	return &dto, nil
}

// ----------------------------------------------------------------------------
// Admin Service Methods
// ----------------------------------------------------------------------------

func (s *service) GetAdminGeneral(ctx context.Context) (*WebsiteGeneralSettings, error) {
	return s.repo.GetGeneral(ctx)
}

func (s *service) UpdateAdminGeneral(ctx context.Context, req *UpdateGeneralRequest) (*WebsiteGeneralSettings, error) {
	entity := &WebsiteGeneralSettings{
		SiteName:            req.SiteName,
		Tagline:             req.Tagline,
		Theme:               req.Theme,
		PrimaryColor:        req.PrimaryColor,
		SecondaryColor:      req.SecondaryColor,
		DefaultLightTheme:   req.DefaultLightTheme,
		DefaultDarkTheme:    req.DefaultDarkTheme,
		RegistrationEnabled: req.RegistrationEnabled,
		MaintenanceMode:     req.MaintenanceMode,
		SEOTitle:            req.SEOTitle,
		SEODescription:      req.SEODescription,
		SEOImageURL:         req.SEOImageURL,
		FaviconURL:          req.FaviconURL,
	}
	res, err := s.repo.UpdateGeneral(ctx, entity)
	if err == nil {
		TriggerCacheInvalidation(ctx, s.cache, s.logger, EventGeneralUpdated)
	}
	return res, err
}

func (s *service) GetAdminHero(ctx context.Context) (*WebsiteHeroSettings, error) {
	return s.repo.GetHero(ctx)
}

func (s *service) UpdateAdminHero(ctx context.Context, req *UpdateHeroRequest) (*WebsiteHeroSettings, error) {
	entity := &WebsiteHeroSettings{
		HeroBadge:           req.HeroBadge,
		HeroTitle:           req.HeroTitle,
		HeroDescription:     req.HeroDescription,
		PrimaryCTALabel:     req.PrimaryCTALabel,
		PrimaryCTAURL:       req.PrimaryCTAURL,
		PrimaryCTAEnabled:   req.PrimaryCTAEnabled,
		SecondaryCTALabel:   req.SecondaryCTALabel,
		SecondaryCTAURL:     req.SecondaryCTAURL,
		SecondaryCTAEnabled: req.SecondaryCTAEnabled,
		BackgroundMode:      req.BackgroundMode,
		HeroStatus:          req.HeroStatus,
		IsPublished:         req.IsPublished,
	}
	res, err := s.repo.UpdateHero(ctx, entity)
	if err == nil {
		TriggerCacheInvalidation(ctx, s.cache, s.logger, EventHeroUpdated)
	}
	return res, err
}

func (s *service) GetAdminTimeline(ctx context.Context) ([]WebsiteTimelinePhase, error) {
	phases, err := s.repo.GetTimelinePhases(ctx, false)
	if err != nil {
		return nil, err
	}
	CalculatePhasesStatus(phases)
	return phases, nil
}

func (s *service) GetAdminTimelineByID(ctx context.Context, id string) (*WebsiteTimelinePhase, error) {
	return s.repo.GetTimelinePhaseByID(ctx, id)
}

func (s *service) CreateAdminTimeline(ctx context.Context, req *CreateTimelinePhaseRequest) (*WebsiteTimelinePhase, error) {
	entity := &WebsiteTimelinePhase{
		Title:            req.Title,
		Description:      req.Description,
		StartDate:        req.StartDate,
		EndDate:          req.EndDate,
		DisplayOrder:     req.DisplayOrder,
		RegistrationType: req.RegistrationType,
		CurrentIndicator: req.CurrentIndicator,
		IsPublished:      req.IsPublished,
	}

	// Single transaction: CMS write + operational sync
	tx, err := s.repo.BeginTx(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	// If current_indicator is true, unset others within the transaction
	if entity.CurrentIndicator {
		_, _ = tx.ExecContext(ctx, `UPDATE website_timeline_phases SET current_indicator = false WHERE deleted_at IS NULL`)
	}

	query := `
		INSERT INTO website_timeline_phases (title, description, start_date, end_date, display_order, registration_type, current_indicator, is_published)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, title, description, start_date, end_date, display_order, registration_type, current_indicator, is_published, created_at, updated_at
	`
	var created WebsiteTimelinePhase
	err = tx.GetContext(ctx, &created, query,
		entity.Title, entity.Description, entity.StartDate, entity.EndDate,
		entity.DisplayOrder, entity.RegistrationType, entity.CurrentIndicator, entity.IsPublished,
	)
	if err != nil {
		return nil, err
	}

	// Synchronize derived tables within the same transaction
	if s.sync != nil {
		if err := s.sync.SyncWithinTx(ctx, tx); err != nil {
			return nil, err
		}
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	TriggerCacheInvalidation(ctx, s.cache, s.logger, EventTimelineUpdated)
	return &created, nil
}

func (s *service) UpdateAdminTimeline(ctx context.Context, id string, req *UpdateTimelinePhaseRequest) (*WebsiteTimelinePhase, error) {
	entity := &WebsiteTimelinePhase{
		ID:               id,
		Title:            req.Title,
		Description:      req.Description,
		StartDate:        req.StartDate,
		EndDate:          req.EndDate,
		DisplayOrder:     req.DisplayOrder,
		RegistrationType: req.RegistrationType,
		CurrentIndicator: req.CurrentIndicator,
		IsPublished:      req.IsPublished,
	}

	// Single transaction: CMS write + operational sync
	tx, err := s.repo.BeginTx(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	// If current_indicator is true, unset others within the transaction
	if entity.CurrentIndicator {
		_, _ = tx.ExecContext(ctx, `UPDATE website_timeline_phases SET current_indicator = false WHERE id != $1 AND deleted_at IS NULL`, entity.ID)
	}

	query := `
		UPDATE website_timeline_phases
		SET title = $1, description = $2, start_date = $3, end_date = $4, display_order = $5, registration_type = $6, current_indicator = $7, is_published = $8, updated_at = NOW()
		WHERE id = $9 AND deleted_at IS NULL
		RETURNING id, title, description, start_date, end_date, display_order, registration_type, current_indicator, is_published, created_at, updated_at
	`
	var updated WebsiteTimelinePhase
	err = tx.GetContext(ctx, &updated, query,
		entity.Title, entity.Description, entity.StartDate, entity.EndDate,
		entity.DisplayOrder, entity.RegistrationType, entity.CurrentIndicator, entity.IsPublished, entity.ID,
	)
	if err != nil {
		return nil, err
	}

	// Synchronize derived tables within the same transaction
	if s.sync != nil {
		if err := s.sync.SyncWithinTx(ctx, tx); err != nil {
			return nil, err
		}
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	TriggerCacheInvalidation(ctx, s.cache, s.logger, EventTimelineUpdated)
	return &updated, nil
}

func (s *service) DeleteAdminTimeline(ctx context.Context, id string) error {
	// Single transaction: CMS delete + operational sync
	tx, err := s.repo.BeginTx(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Soft delete the phase
	_, err = tx.ExecContext(ctx, `UPDATE website_timeline_phases SET deleted_at = NOW() WHERE id = $1`, id)
	if err != nil {
		return err
	}

	// Synchronize derived tables within the same transaction
	// This will nullify event_phases and events columns if the deleted phase
	// was the only source for REGISTRATION or CANDIDATE_REGISTRATION dates.
	if s.sync != nil {
		if err := s.sync.SyncWithinTx(ctx, tx); err != nil {
			return err
		}
	}

	if err := tx.Commit(); err != nil {
		return err
	}

	TriggerCacheInvalidation(ctx, s.cache, s.logger, EventTimelineUpdated)
	return nil
}

func (s *service) ReorderAdminTimeline(ctx context.Context, req *ReorderTimelinePhasesRequest) error {
	err := s.repo.ReorderTimelinePhases(ctx, req.Items)
	if err == nil {
		TriggerCacheInvalidation(ctx, s.cache, s.logger, EventTimelineUpdated)
	}
	return err
}

func (s *service) GetAdminAnnouncements(ctx context.Context) ([]WebsiteAnnouncement, error) {
	return s.repo.GetAnnouncements(ctx, false)
}

func (s *service) GetAdminAnnouncementByID(ctx context.Context, id string) (*WebsiteAnnouncement, error) {
	return s.repo.GetAnnouncementByID(ctx, id)
}

func (s *service) CreateAdminAnnouncement(ctx context.Context, req *CreateAnnouncementRequest) (*WebsiteAnnouncement, error) {
	pubAt := req.PublishedAt
	if pubAt.IsZero() {
		pubAt = time.Now().UTC()
	}
	entity := &WebsiteAnnouncement{
		Title:        req.Title,
		Slug:         req.Slug,
		Category:     req.Category,
		Summary:      req.Summary,
		Content:      req.Content,
		ThumbnailURL: req.ThumbnailURL,
		IsPinned:     req.IsPinned,
		IsPublished:  req.IsPublished,
		PublishedAt:  pubAt,
	}
	res, err := s.repo.CreateAnnouncement(ctx, entity)
	if err == nil {
		TriggerCacheInvalidation(ctx, s.cache, s.logger, EventAnnouncementUpdated)
	}
	return res, err
}

func (s *service) UpdateAdminAnnouncement(ctx context.Context, id string, req *UpdateAnnouncementRequest) (*WebsiteAnnouncement, error) {
	pubAt := req.PublishedAt
	if pubAt.IsZero() {
		pubAt = time.Now().UTC()
	}
	entity := &WebsiteAnnouncement{
		ID:           id,
		Title:        req.Title,
		Slug:         req.Slug,
		Category:     req.Category,
		Summary:      req.Summary,
		Content:      req.Content,
		ThumbnailURL: req.ThumbnailURL,
		IsPinned:     req.IsPinned,
		IsPublished:  req.IsPublished,
		PublishedAt:  pubAt,
	}
	res, err := s.repo.UpdateAnnouncement(ctx, entity)
	if err == nil {
		TriggerCacheInvalidation(ctx, s.cache, s.logger, EventAnnouncementUpdated)
	}
	return res, err
}

func (s *service) DeleteAdminAnnouncement(ctx context.Context, id string) error {
	err := s.repo.DeleteAnnouncement(ctx, id)
	if err == nil {
		TriggerCacheInvalidation(ctx, s.cache, s.logger, EventAnnouncementUpdated)
	}
	return err
}

func (s *service) GetAdminCandidateSettings(ctx context.Context) (*WebsiteCandidateSettings, error) {
	return s.repo.GetCandidateSettings(ctx)
}

func (s *service) UpdateAdminCandidateSettings(ctx context.Context, req *UpdateCandidateCMSRequest) (*WebsiteCandidateSettings, error) {
	entity := &WebsiteCandidateSettings{
		SectionTitle:       req.SectionTitle,
		SectionDescription: req.SectionDescription,
		RegistrationStatus: req.RegistrationStatus,
		EmptyStateMessage:  req.EmptyStateMessage,
		PublicationMessage: req.PublicationMessage,
	}
	res, err := s.repo.UpdateCandidateSettings(ctx, entity)
	if err == nil {
		TriggerCacheInvalidation(ctx, s.cache, s.logger, EventCandidateUpdated)
	}
	return res, err
}

func (s *service) GetAdminFooter(ctx context.Context) (*WebsiteFooterSettings, error) {
	return s.repo.GetFooter(ctx)
}

func (s *service) UpdateAdminFooter(ctx context.Context, req *UpdateFooterRequest) (*WebsiteFooterSettings, error) {
	entity := &WebsiteFooterSettings{
		OrganizationName: req.OrganizationName,
		Description:      req.Description,
		Copyright:        req.Copyright,
		OfficialBadge:    req.OfficialBadge,
		Tagline:          req.Tagline,
	}
	res, err := s.repo.UpdateFooter(ctx, entity)
	if err == nil {
		TriggerCacheInvalidation(ctx, s.cache, s.logger, EventFooterUpdated)
	}
	return res, err
}

// ----------------------------------------------------------------------------
// Information Pages
// ----------------------------------------------------------------------------

func (s *service) GetPublicInformationPages(ctx context.Context) ([]PublicInformationPageDTO, error) {
	pages, err := s.repo.GetInformationPages(ctx, true)
	if err != nil {
		return nil, err
	}
	var dtos []PublicInformationPageDTO
	for _, p := range pages {
		dtos = append(dtos, PublicInformationPageDTO{
			ID:          p.ID,
			Slug:        p.Slug,
			Title:       p.Title,
			Content:     p.Content,
			IsPublished: p.IsPublished,
			CreatedAt:   p.CreatedAt,
			UpdatedAt:   p.UpdatedAt,
		})
	}
	return dtos, nil
}

func (s *service) GetPublicInformationPage(ctx context.Context, slug string) (*PublicInformationPageDTO, error) {
	p, err := s.repo.GetInformationPage(ctx, slug)
	if err != nil {
		return nil, err
	}
	return &PublicInformationPageDTO{
		ID:          p.ID,
		Slug:        p.Slug,
		Title:       p.Title,
		Content:     p.Content,
		IsPublished: p.IsPublished,
		CreatedAt:   p.CreatedAt,
		UpdatedAt:   p.UpdatedAt,
	}, nil
}

func (s *service) GetAdminInformationPages(ctx context.Context) ([]WebsiteInformationPage, error) {
	return s.repo.GetInformationPages(ctx, false)
}

func (s *service) GetAdminInformationPage(ctx context.Context, id string) (*WebsiteInformationPage, error) {
	return s.repo.GetInformationPage(ctx, id)
}

func (s *service) CreateAdminInformationPage(ctx context.Context, req *CreateInformationPageRequest) (*WebsiteInformationPage, error) {
	entity := &WebsiteInformationPage{
		Slug:        req.Slug,
		Title:       req.Title,
		Content:     req.Content,
		IsPublished: req.IsPublished,
	}
	res, err := s.repo.CreateInformationPage(ctx, entity)
	if err == nil {
		TriggerCacheInvalidation(ctx, s.cache, s.logger, EventInformationUpdated)
	}
	return res, err
}

func (s *service) UpdateAdminInformationPage(ctx context.Context, id string, req *UpdateInformationPageRequest) (*WebsiteInformationPage, error) {
	entity := &WebsiteInformationPage{
		Slug:        req.Slug,
		Title:       req.Title,
		Content:     req.Content,
		IsPublished: req.IsPublished,
	}
	res, err := s.repo.UpdateInformationPage(ctx, id, entity)
	if err == nil {
		TriggerCacheInvalidation(ctx, s.cache, s.logger, EventInformationUpdated)
	}
	return res, err
}

func (s *service) DeleteAdminInformationPage(ctx context.Context, id string) error {
	err := s.repo.DeleteInformationPage(ctx, id)
	if err == nil {
		TriggerCacheInvalidation(ctx, s.cache, s.logger, EventInformationUpdated)
	}
	return err
}
