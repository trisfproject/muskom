package website

import (
	"github.com/trisfproject/muskom/apps/api/platform/storage"
)

// Mapper provides translation methods between database entities, domain models, and wire DTOs.
type Mapper struct {
	storage storage.Storage
}

// NewMapper creates a new Website Engine mapper.
func NewMapper(strg storage.Storage) *Mapper {
	return &Mapper{storage: strg}
}

// MapGeneral maps WebsiteGeneralSettings entity to DTOs (General, Metadata, FeatureFlags, Navigation).
func (m *Mapper) MapGeneral(g *WebsiteGeneralSettings) (WebsiteGeneralDTO, PublicMetadataDTO, PublicFeatureFlagsDTO, []PublicNavigationItemDTO) {
	if g == nil {
		g = &WebsiteGeneralSettings{}
	}

	generalDTO := WebsiteGeneralDTO{
		SiteName:            g.SiteName,
		Tagline:             g.Tagline,
		Theme:               g.Theme,
		PrimaryColor:        g.PrimaryColor,
		SecondaryColor:      g.SecondaryColor,
		DefaultLightTheme:   g.DefaultLightTheme,
		DefaultDarkTheme:    g.DefaultDarkTheme,
		RegistrationEnabled: g.RegistrationEnabled,
		MaintenanceMode:     g.MaintenanceMode,
		SEOTitle:            g.SEOTitle,
		SEODescription:      g.SEODescription,
		SEOImageURL:         g.SEOImageURL,
		FaviconURL:          g.FaviconURL,
	}

	metadataDTO := PublicMetadataDTO{
		SiteName:       g.SiteName,
		Tagline:        g.Tagline,
		SEOTitle:       g.SEOTitle,
		SEODescription: g.SEODescription,
		SEOImageURL:    g.SEOImageURL,
		FaviconURL:     g.FaviconURL,
	}

	flagsDTO := PublicFeatureFlagsDTO{
		RegistrationEnabled: g.RegistrationEnabled,
		MaintenanceMode:     g.MaintenanceMode,
		DefaultLightTheme:   g.DefaultLightTheme,
		DefaultDarkTheme:    g.DefaultDarkTheme,
	}

	navigationDTO := []PublicNavigationItemDTO{
		{Label: "Beranda", Href: "#hero", IsExternal: false},
		{Label: "Jadwal", Href: "#agenda", IsExternal: false},
		{Label: "Pengumuman", Href: "#announcements", IsExternal: false},
		{Label: "Bursa Calon", Href: "#candidates", IsExternal: false},
	}

	return generalDTO, metadataDTO, flagsDTO, navigationDTO
}

// MapHero maps WebsiteHeroSettings entity to WebsiteHeroDTO.
func (m *Mapper) MapHero(h *WebsiteHeroSettings, g *WebsiteGeneralSettings) WebsiteHeroDTO {
	if h == nil {
		h = &WebsiteHeroSettings{}
	}
	if g == nil {
		g = &WebsiteGeneralSettings{}
	}

	return WebsiteHeroDTO{
		HeroBadge:           h.HeroBadge,
		HeroTitle:           g.SiteName,
		HeroDescription:     g.Tagline,
		PrimaryCTALabel:     h.PrimaryCTALabel,
		PrimaryCTAURL:       h.PrimaryCTAURL,
		PrimaryCTAEnabled:   h.PrimaryCTAEnabled,
		SecondaryCTALabel:   h.SecondaryCTALabel,
		SecondaryCTAURL:     h.SecondaryCTAURL,
		SecondaryCTAEnabled: h.SecondaryCTAEnabled,
		BackgroundMode:      h.BackgroundMode,
		HeroStatus:          h.HeroStatus,
		IsPublished:         h.IsPublished,
	}
}

// MapTimelinePhases maps a list of WebsiteTimelinePhase to PublicTimelineDTO with computed status.
func (m *Mapper) MapTimelinePhases(phases []WebsiteTimelinePhase, activePhaseID *string) []PublicTimelineDTO {
	res := make([]PublicTimelineDTO, len(phases))
	for i, p := range phases {
		res[i] = PublicTimelineDTO{
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
	return res
}

// MapAnnouncements maps WebsiteAnnouncement list to PublicAnnouncementDTO.
func (m *Mapper) MapAnnouncements(announcements []WebsiteAnnouncement) []PublicAnnouncementDTO {
	res := make([]PublicAnnouncementDTO, len(announcements))
	for i, a := range announcements {
		thumb := a.ThumbnailURL
		if thumb != "" && m.storage != nil {
			thumb = m.storage.URL(thumb)
		}
		res[i] = PublicAnnouncementDTO{
			ID:           a.ID,
			Title:        a.Title,
			Slug:         a.Slug,
			Category:     a.Category,
			Summary:      a.Summary,
			Content:      a.Content,
			ThumbnailURL: thumb,
			IsPinned:     a.IsPinned,
			PublishedAt:  a.PublishedAt,
			CreatedAt:    a.CreatedAt,
		}
	}
	return res
}

// MapCandidates maps candidate settings & list of CandidateEntity to DTOs.
func (m *Mapper) MapCandidates(settings *WebsiteCandidateSettings, candidates []CandidateEntity) (WebsiteCandidateCMSDTO, []PublicCandidateDTO, PublicCandidateSectionDTO) {
	cmsDTO := WebsiteCandidateCMSDTO{
		SectionTitle:       "Bursa Calon Ketua",
		SectionDescription: "Mengenal lebih dekat visi dan misi calon pemimpin yang akan membawa perubahan untuk komunitas.",
		RegistrationStatus: "PENJARINGAN",
		EmptyStateMessage:  "Calon Ketua Umum akan dipublikasikan setelah proses verifikasi administrasi selesai.",
		PublicationMessage: "Daftar calon resmi telah ditetapkan.",
	}
	if settings != nil {
		cmsDTO.SectionTitle = settings.SectionTitle
		cmsDTO.SectionDescription = settings.SectionDescription
		cmsDTO.RegistrationStatus = settings.RegistrationStatus
		cmsDTO.EmptyStateMessage = settings.EmptyStateMessage
		cmsDTO.PublicationMessage = settings.PublicationMessage
	}

	candDTOs := make([]PublicCandidateDTO, len(candidates))
	for i, c := range candidates {
		candDTOs[i] = m.MapCandidate(&c)
	}

	sectionDTO := PublicCandidateSectionDTO{
		SectionTitle:       cmsDTO.SectionTitle,
		SectionDescription: cmsDTO.SectionDescription,
		RegistrationStatus: cmsDTO.RegistrationStatus,
		EmptyStateMessage:  cmsDTO.EmptyStateMessage,
		PublicationMessage: cmsDTO.PublicationMessage,
		Items:              candDTOs,
	}

	return cmsDTO, candDTOs, sectionDTO
}

// MapCandidate maps a single CandidateEntity to PublicCandidateDTO.
func (m *Mapper) MapCandidate(c *CandidateEntity) PublicCandidateDTO {
	var photoURL *string
	if c.PhotoPath != nil && *c.PhotoPath != "" && m.storage != nil {
		url := m.storage.URL(*c.PhotoPath)
		photoURL = &url
	}
	return PublicCandidateDTO{
		ID:             c.ID,
		SequenceNumber: c.SequenceNumber,
		Name:           c.Name,
		Title:          c.Title,
		Vision:         c.Vision,
		Biography:      c.Biography,
		Mission:        c.Mission,
		Organization:   c.Organization,
		PhotoURL:       photoURL,
	}
}

// MapFooter maps WebsiteFooterSettings entity to WebsiteFooterDTO.
func (m *Mapper) MapFooter(f *WebsiteFooterSettings) WebsiteFooterDTO {
	if f == nil {
		return WebsiteFooterDTO{
			OrganizationName: "MUSKOM",
			Description:      "Portal resmi Musyawarah KOMITKABE. Membangun proses pemilihan yang transparan, profesional, dan dapat dipercaya oleh seluruh anggota komunitas.",
			Copyright:        "© 2026 MUSKOM. Seluruh hak cipta dilindungi.",
			OfficialBadge:    "OFFICIAL PORTAL",
			Tagline:          "Dibangun untuk kemajuan bersama.",
		}
	}

	return WebsiteFooterDTO{
		OrganizationName: f.OrganizationName,
		Description:      f.Description,
		Copyright:        f.Copyright,
		OfficialBadge:    f.OfficialBadge,
		Tagline:          f.Tagline,
	}
}
