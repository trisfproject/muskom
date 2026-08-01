package website

import (
	"context"
	"time"

	"github.com/trisfproject/muskom/apps/api/platform/storage"
	"go.uber.org/zap"
)

type Service interface {
	// Public
	GetPublicHome(ctx context.Context) (*PublicHomeResponse, error)
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
}

type service struct {
	repo   Repository
	strg   storage.Storage
	logger *zap.Logger
}

func NewService(repo Repository, strg storage.Storage, logger *zap.Logger) Service {
	return &service{
		repo:   repo,
		strg:   strg,
		logger: logger,
	}
}

// ----------------------------------------------------------------------------
// Public Service Methods
// ----------------------------------------------------------------------------

func (s *service) GetPublicHome(ctx context.Context) (*PublicHomeResponse, error) {
	general, err := s.repo.GetGeneral(ctx)
	if err != nil {
		s.logger.Error("Failed to fetch general settings", zap.Error(err))
		return nil, err
	}

	hero, err := s.repo.GetHero(ctx)
	if err != nil {
		s.logger.Error("Failed to fetch hero settings", zap.Error(err))
		return nil, err
	}

	phases, err := s.repo.GetTimelinePhases(ctx, true)
	if err != nil {
		s.logger.Error("Failed to fetch timeline phases", zap.Error(err))
		return nil, err
	}

	// Timeline Engine: Determine current phase, countdown, and timeline statuses
	now := time.Now().UTC()
	var currentPhase PublicCurrentPhaseDTO
	var countdown *PublicCountdownDTO
	var activePhase *WebsiteTimelinePhase
	var nextPhase *WebsiteTimelinePhase

	// 1. Check for manual current_indicator
	for i := range phases {
		if phases[i].CurrentIndicator {
			activePhase = &phases[i]
			if i+1 < len(phases) {
				nextPhase = &phases[i+1]
			}
			break
		}
	}

	// 2. If no manual override, calculate by date
	if activePhase == nil {
		for i := range phases {
			p := &phases[i]
			if (now.After(p.StartDate) || now.Equal(p.StartDate)) && (now.Before(p.EndDate) || now.Equal(p.EndDate)) {
				activePhase = p
				if i+1 < len(phases) {
					nextPhase = &phases[i+1]
				}
				break
			} else if now.Before(p.StartDate) && activePhase == nil && nextPhase == nil {
				nextPhase = p
			}
		}
	}

	// 3. Build currentPhase and countdown DTOs
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
		countdown = nil
	} else {
		currentPhase = PublicCurrentPhaseDTO{
			Name:     "Belum Ada Jadwal",
			EndDate:  nil,
			IsActive: false,
		}
		countdown = nil
	}

	// 4. Determine CTA Priority (Backend decides, frontend only renders)
	var regType string = "NONE"
	if activePhase != nil {
		regType = activePhase.RegistrationType
	}

	var candStyle = "outline"
	var partStyle = "outline"
	var candOpen = general.RegistrationEnabled && hero.PrimaryCTAEnabled
	var partOpen = general.RegistrationEnabled && hero.SecondaryCTAEnabled

	switch regType {
	case "CANDIDATE":
		candStyle = "primary"
		partStyle = "outline"
	case "PARTICIPANT":
		candStyle = "outline"
		partStyle = "primary"
	case "BOTH":
		candStyle = "primary"
		partStyle = "primary"
	default:
		// When NONE, keep primary CTA matching Hero configuration
		candStyle = "primary"
		partStyle = "outline"
	}

	cta := PublicCtaDTO{
		CandidateRegistration: &PublicRegistrationCTA{
			Label: hero.PrimaryCTALabel,
			URL:   hero.PrimaryCTAURL,
			Open:  candOpen,
			Style: candStyle,
		},
		ParticipantRegistration: &PublicRegistrationCTA{
			Label: hero.SecondaryCTALabel,
			URL:   hero.SecondaryCTAURL,
			Open:  partOpen,
			Style: partStyle,
		},
	}

	// 5. Timeline DTOs
	timelineDTOs := make([]PublicTimelineDTO, len(phases))
	for i, p := range phases {
		status := "upcoming"
		if activePhase != nil && p.ID == activePhase.ID {
			status = "active"
		} else if now.After(p.EndDate) {
			status = "past"
		}

		timelineDTOs[i] = PublicTimelineDTO{
			ID:               p.ID,
			Title:            p.Title,
			Description:      p.Description,
			StartDate:        p.StartDate,
			EndDate:          p.EndDate,
			DisplayOrder:     p.DisplayOrder,
			RegistrationType: p.RegistrationType,
			Status:           status,
		}
	}

	// 6. Announcements
	announcements, err := s.repo.GetAnnouncements(ctx, true)
	if err != nil {
		s.logger.Error("Failed to fetch announcements", zap.Error(err))
		return nil, err
	}
	announcementDTOs := make([]PublicAnnouncementDTO, 0, len(announcements))
	for _, a := range announcements {
		announcementDTOs = append(announcementDTOs, PublicAnnouncementDTO{
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
		})
	}

	// 7. Candidate Settings & Candidates
	candSettings, err := s.repo.GetCandidateSettings(ctx)
	if err != nil {
		s.logger.Error("Failed to fetch candidate settings", zap.Error(err))
		return nil, err
	}

	candidates, err := s.repo.GetCandidates(ctx)
	if err != nil {
		s.logger.Error("Failed to fetch candidates", zap.Error(err))
		return nil, err
	}
	candidateDTOs := make([]PublicCandidateDTO, len(candidates))
	for i, c := range candidates {
		var photoURL *string
		if c.PhotoPath != nil && s.strg != nil {
			url := s.strg.URL(*c.PhotoPath)
			photoURL = &url
		}
		candidateDTOs[i] = PublicCandidateDTO{
			ID:             c.ID,
			SequenceNumber: c.SequenceNumber,
			Name:           c.Name,
			Title:          c.Title,
			Vision:         c.Vision,
			PhotoURL:       photoURL,
		}
	}

	// 8. Footer Settings
	footer, err := s.repo.GetFooter(ctx)
	if err != nil {
		s.logger.Error("Failed to fetch footer settings", zap.Error(err))
		return nil, err
	}

	return &PublicHomeResponse{
		General: WebsiteGeneralDTO{
			SiteName:            general.SiteName,
			Tagline:             general.Tagline,
			Theme:               general.Theme,
			PrimaryColor:        general.PrimaryColor,
			SecondaryColor:      general.SecondaryColor,
			DefaultLightTheme:   general.DefaultLightTheme,
			DefaultDarkTheme:    general.DefaultDarkTheme,
			RegistrationEnabled: general.RegistrationEnabled,
			MaintenanceMode:     general.MaintenanceMode,
			SEOTitle:            general.SEOTitle,
			SEODescription:      general.SEODescription,
			SEOImageURL:         general.SEOImageURL,
			FaviconURL:          general.FaviconURL,
		},
		Hero: WebsiteHeroDTO{
			HeroBadge:           hero.HeroBadge,
			HeroTitle:           hero.HeroTitle,
			HeroDescription:     hero.HeroDescription,
			PrimaryCTALabel:     hero.PrimaryCTALabel,
			PrimaryCTAURL:       hero.PrimaryCTAURL,
			PrimaryCTAEnabled:   hero.PrimaryCTAEnabled,
			SecondaryCTALabel:   hero.SecondaryCTALabel,
			SecondaryCTAURL:     hero.SecondaryCTAURL,
			SecondaryCTAEnabled: hero.SecondaryCTAEnabled,
			BackgroundMode:      hero.BackgroundMode,
			HeroStatus:          hero.HeroStatus,
			IsPublished:         hero.IsPublished,
		},
		CurrentPhase:  currentPhase,
		Countdown:     countdown,
		CTA:           cta,
		Timeline:      timelineDTOs,
		Announcements: announcementDTOs,
		CandidateCMS: WebsiteCandidateCMSDTO{
			SectionTitle:       candSettings.SectionTitle,
			SectionDescription: candSettings.SectionDescription,
			RegistrationStatus: candSettings.RegistrationStatus,
			EmptyStateMessage:  candSettings.EmptyStateMessage,
			PublicationMessage: candSettings.PublicationMessage,
		},
		Candidates: candidateDTOs,
		Footer: WebsiteFooterDTO{
			OrganizationName: footer.OrganizationName,
			Description:      footer.Description,
			Copyright:        footer.Copyright,
			OfficialBadge:    footer.OfficialBadge,
			Tagline:          footer.Tagline,
		},
	}, nil
}

func (s *service) GetPublicTimeline(ctx context.Context) ([]PublicTimelineDTO, error) {
	phases, err := s.repo.GetTimelinePhases(ctx, true)
	if err != nil {
		return nil, err
	}

	now := time.Now().UTC()
	dtos := make([]PublicTimelineDTO, len(phases))
	for i, p := range phases {
		status := "upcoming"
		if p.CurrentIndicator || ((now.After(p.StartDate) || now.Equal(p.StartDate)) && (now.Before(p.EndDate) || now.Equal(p.EndDate))) {
			status = "active"
		} else if now.After(p.EndDate) {
			status = "past"
		}

		dtos[i] = PublicTimelineDTO{
			ID:               p.ID,
			Title:            p.Title,
			Description:      p.Description,
			StartDate:        p.StartDate,
			EndDate:          p.EndDate,
			DisplayOrder:     p.DisplayOrder,
			RegistrationType: p.RegistrationType,
			Status:           status,
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
	return s.repo.UpdateGeneral(ctx, entity)
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
	return s.repo.UpdateHero(ctx, entity)
}

func (s *service) GetAdminTimeline(ctx context.Context) ([]WebsiteTimelinePhase, error) {
	return s.repo.GetTimelinePhases(ctx, false)
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
	return s.repo.CreateTimelinePhase(ctx, entity)
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
	return s.repo.UpdateTimelinePhase(ctx, entity)
}

func (s *service) DeleteAdminTimeline(ctx context.Context, id string) error {
	return s.repo.DeleteTimelinePhase(ctx, id)
}

func (s *service) ReorderAdminTimeline(ctx context.Context, req *ReorderTimelinePhasesRequest) error {
	return s.repo.ReorderTimelinePhases(ctx, req.Items)
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
	return s.repo.CreateAnnouncement(ctx, entity)
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
	return s.repo.UpdateAnnouncement(ctx, entity)
}

func (s *service) DeleteAdminAnnouncement(ctx context.Context, id string) error {
	return s.repo.DeleteAnnouncement(ctx, id)
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
	return s.repo.UpdateCandidateSettings(ctx, entity)
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
	return s.repo.UpdateFooter(ctx, entity)
}
