package website

import (
	"context"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"go.uber.org/zap"
)

type mockRepository struct {
	general   *WebsiteGeneralSettings
	hero      *WebsiteHeroSettings
	phases    []WebsiteTimelinePhase
	announces []WebsiteAnnouncement
	candidate *WebsiteCandidateSettings
	footer    *WebsiteFooterSettings
}

func (m *mockRepository) GetGeneral(ctx context.Context) (*WebsiteGeneralSettings, error) {
	return m.general, nil
}
func (m *mockRepository) UpdateGeneral(ctx context.Context, s *WebsiteGeneralSettings) (*WebsiteGeneralSettings, error) {
	m.general = s
	return m.general, nil
}
func (m *mockRepository) GetHero(ctx context.Context) (*WebsiteHeroSettings, error) {
	return m.hero, nil
}
func (m *mockRepository) UpdateHero(ctx context.Context, h *WebsiteHeroSettings) (*WebsiteHeroSettings, error) {
	m.hero = h
	return m.hero, nil
}
func (m *mockRepository) GetTimelinePhases(ctx context.Context, publicOnly bool) ([]WebsiteTimelinePhase, error) {
	return m.phases, nil
}
func (m *mockRepository) GetTimelinePhaseByID(ctx context.Context, id string) (*WebsiteTimelinePhase, error) {
	for _, p := range m.phases {
		if p.ID == id {
			return &p, nil
		}
	}
	return nil, nil
}
func (m *mockRepository) CreateTimelinePhase(ctx context.Context, p *WebsiteTimelinePhase) (*WebsiteTimelinePhase, error) {
	p.ID = "new-id"
	m.phases = append(m.phases, *p)
	return p, nil
}
func (m *mockRepository) UpdateTimelinePhase(ctx context.Context, p *WebsiteTimelinePhase) (*WebsiteTimelinePhase, error) {
	for i, ph := range m.phases {
		if ph.ID == p.ID {
			m.phases[i] = *p
			return p, nil
		}
	}
	return p, nil
}
func (m *mockRepository) DeleteTimelinePhase(ctx context.Context, id string) error {
	var remaining []WebsiteTimelinePhase
	for _, p := range m.phases {
		if p.ID != id {
			remaining = append(remaining, p)
		}
	}
	m.phases = remaining
	return nil
}
func (m *mockRepository) ReorderTimelinePhases(ctx context.Context, items []ReorderTimelinePhaseItem) error {
	return nil
}
func (m *mockRepository) GetAnnouncements(ctx context.Context, publicOnly bool) ([]WebsiteAnnouncement, error) {
	return m.announces, nil
}
func (m *mockRepository) GetAnnouncementByID(ctx context.Context, id string) (*WebsiteAnnouncement, error) {
	for _, a := range m.announces {
		if a.ID == id {
			return &a, nil
		}
	}
	return nil, nil
}
func (m *mockRepository) GetAnnouncementBySlug(ctx context.Context, slug string) (*WebsiteAnnouncement, error) {
	for _, a := range m.announces {
		if a.Slug == slug {
			return &a, nil
		}
	}
	return nil, nil
}
func (m *mockRepository) CreateAnnouncement(ctx context.Context, a *WebsiteAnnouncement) (*WebsiteAnnouncement, error) {
	a.ID = "new-ann-id"
	m.announces = append(m.announces, *a)
	return a, nil
}
func (m *mockRepository) UpdateAnnouncement(ctx context.Context, a *WebsiteAnnouncement) (*WebsiteAnnouncement, error) {
	for i, an := range m.announces {
		if an.ID == a.ID {
			m.announces[i] = *a
			return a, nil
		}
	}
	return a, nil
}
func (m *mockRepository) DeleteAnnouncement(ctx context.Context, id string) error {
	var remaining []WebsiteAnnouncement
	for _, a := range m.announces {
		if a.ID != id {
			remaining = append(remaining, a)
		}
	}
	m.announces = remaining
	return nil
}
func (m *mockRepository) GetCandidateSettings(ctx context.Context) (*WebsiteCandidateSettings, error) {
	return m.candidate, nil
}
func (m *mockRepository) UpdateCandidateSettings(ctx context.Context, c *WebsiteCandidateSettings) (*WebsiteCandidateSettings, error) {
	m.candidate = c
	return m.candidate, nil
}
func (m *mockRepository) GetCandidates(ctx context.Context) ([]CandidateEntity, error) {
	return []CandidateEntity{}, nil
}
func (m *mockRepository) GetFooter(ctx context.Context) (*WebsiteFooterSettings, error) {
	return m.footer, nil
}
func (m *mockRepository) UpdateFooter(ctx context.Context, f *WebsiteFooterSettings) (*WebsiteFooterSettings, error) {
	m.footer = f
	return m.footer, nil
}

func TestGetPublicHome(t *testing.T) {
	now := time.Now().UTC()
	past := now.Add(-48 * time.Hour)
	future := now.Add(48 * time.Hour)

	repo := &mockRepository{
		general: &WebsiteGeneralSettings{
			SiteName:            "MUSKOM",
			Tagline:             "Together We Shape the Future",
			Theme:               "modern-tech",
			RegistrationEnabled: true,
		},
		hero: &WebsiteHeroSettings{
			HeroBadge:           "Together We Shape the Future",
			HeroTitle:           "Musyawarah Terpadu",
			PrimaryCTALabel:     "Daftar Calon",
			PrimaryCTAURL:       "/register/candidate",
			PrimaryCTAEnabled:   true,
			SecondaryCTALabel:   "Daftar Peserta",
			SecondaryCTAURL:     "/register",
			SecondaryCTAEnabled: true,
		},
		phases: []WebsiteTimelinePhase{
			{
				ID:               "phase-1",
				Title:            "Penjaringan Bakal Calon Ketua Umum",
				StartDate:        past,
				EndDate:          future,
				DisplayOrder:     1,
				RegistrationType: "CANDIDATE",
				CurrentIndicator: true,
				IsPublished:      true,
			},
		},
		announces: []WebsiteAnnouncement{
			{
				ID:          "ann-1",
				Title:       "Test Announcement",
				Slug:        "test-announcement",
				Category:    "Berita",
				IsPublished: true,
				PublishedAt: now,
			},
		},
		candidate: &WebsiteCandidateSettings{
			SectionTitle:       "Bursa Calon",
			RegistrationStatus: "PENJARINGAN",
		},
		footer: &WebsiteFooterSettings{
			OrganizationName: "MUSKOM",
			Copyright:        "© 2026 MUSKOM",
		},
	}

	logger := zap.NewNop()
	svc := NewService(repo, nil, logger)

	res, err := svc.GetPublicHome(context.Background())
	assert.NoError(t, err)
	assert.NotNil(t, res)

	// General & Hero
	assert.Equal(t, "MUSKOM", res.General.SiteName)
	assert.Equal(t, "Together We Shape the Future", res.General.Tagline)
	assert.Equal(t, "Musyawarah Terpadu", res.Hero.HeroTitle)

	// Timeline Engine check
	assert.True(t, res.CurrentPhase.IsActive)
	assert.Equal(t, "Penjaringan Bakal Calon Ketua Umum", res.CurrentPhase.Name)
	assert.NotNil(t, res.Countdown)

	// CTA Prioritization check: "CANDIDATE" phase means candidate CTA is "primary" style
	assert.Equal(t, "primary", res.CTA.CandidateRegistration.Style)
	assert.Equal(t, "outline", res.CTA.ParticipantRegistration.Style)
	assert.True(t, res.CTA.CandidateRegistration.Open)
	assert.True(t, res.CTA.ParticipantRegistration.Open)
}
