package public

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"github.com/trisfproject/muskom/apps/api/platform/storage"
	"go.uber.org/zap"
)

type Service interface {
	GetPublicHome(ctx context.Context) (*HomeResponse, error)
}

type service struct {
	repo   Repository
	strg   storage.Storage
	logger *zap.Logger
}

func NewService(repo Repository, strg storage.Storage, logger *zap.Logger) Service {
	return &service{repo: repo, strg: strg, logger: logger}
}

func (s *service) GetPublicHome(ctx context.Context) (*HomeResponse, error) {
	// Fetch active event
	event, err := s.repo.GetActiveEvent(ctx)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			// HOTFIX: Return 200 OK with empty data instead of error
			return &HomeResponse{
				Event:         nil,
				Settings:      SettingsDTO{},
				Timeline:      []TimelineDTO{},
				CurrentPhase:  CurrentPhaseDTO{Name: "Belum Ada Jadwal", IsActive: false},
				Announcements: []AnnouncementDTO{},
				Candidates:    []CandidateDTO{},
			}, nil
		}
		s.logger.Error("Failed to fetch active event", zap.Error(err))
		return nil, err
	}

	// Fetch settings
	settings, err := s.repo.GetSettings(ctx, event.ID)
	if err != nil {
		s.logger.Error("Failed to fetch settings", zap.Error(err))
		return nil, err
	}

	// Fetch timelines
	var timelines []PublicTimeline
	if settings.ShowTimeline {
		timelines, err = s.repo.GetTimelines(ctx, event.ID)
		if err != nil {
			s.logger.Error("Failed to fetch timelines", zap.Error(err))
			return nil, err
		}
	} else {
		timelines = []PublicTimeline{}
	}

	// Compute current phase
	now := time.Now()
	var currentPhase CurrentPhaseDTO
	var activeTimeline *PublicTimeline
	var nextTimeline *PublicTimeline

	for i, t := range timelines {
		if now.After(t.StartDate) && now.Before(t.EndDate) {
			activeTimeline = &timelines[i]
			if i+1 < len(timelines) {
				nextTimeline = &timelines[i+1]
			}
			break
		} else if now.Before(t.StartDate) && activeTimeline == nil {
			nextTimeline = &timelines[i]
			break
		}
	}

	if activeTimeline != nil {
		currentPhase = CurrentPhaseDTO{
			Name:     activeTimeline.Title,
			EndDate:  &activeTimeline.EndDate,
			IsActive: true,
		}
	} else if nextTimeline != nil {
		currentPhase = CurrentPhaseDTO{
			Name:     "Menunggu: " + nextTimeline.Title,
			EndDate:  &nextTimeline.StartDate,
			IsActive: false,
		}
	} else if len(timelines) > 0 {
		last := timelines[len(timelines)-1]
		currentPhase = CurrentPhaseDTO{
			Name:     last.Title + " (Selesai)",
			EndDate:  &last.EndDate,
			IsActive: false,
		}
	} else {
		currentPhase = CurrentPhaseDTO{
			Name:     "Belum Ada Jadwal",
			EndDate:  nil,
			IsActive: false,
		}
	}

	// Map timelines to DTO
	timelineDTOs := make([]TimelineDTO, len(timelines))
	for i, t := range timelines {
		timelineDTOs[i] = TimelineDTO{
			ID:          t.ID,
			Title:       t.Title,
			Description: t.Description,
			StartDate:   t.StartDate,
			EndDate:     t.EndDate,
		}
	}

	// Fetch announcements
	var announcements []PublicAnnouncement
	if settings.ShowAnnouncements {
		announcements, err = s.repo.GetAnnouncements(ctx, event.ID)
		if err != nil {
			s.logger.Error("Failed to fetch announcements", zap.Error(err))
			return nil, err
		}
	} else {
		announcements = []PublicAnnouncement{}
	}

	announcementDTOs := make([]AnnouncementDTO, len(announcements))
	for i, a := range announcements {
		announcementDTOs[i] = AnnouncementDTO{
			ID:          a.ID,
			Title:       a.Title,
			Content:     a.Content,
			PublishedAt: a.PublishedAt,
			CreatedAt:   a.CreatedAt,
		}
	}

	// Fetch candidates
	var candidates []PublicCandidate
	if settings.ShowCandidateList {
		candidates, err = s.repo.GetCandidates(ctx)
		if err != nil {
			s.logger.Error("Failed to fetch candidates", zap.Error(err))
			return nil, err
		}
	} else {
		candidates = []PublicCandidate{}
	}

	candidateDTOs := make([]CandidateDTO, len(candidates))
	for i, c := range candidates {
		var photoURL *string
		if c.PhotoPath != nil {
			url := s.strg.URL(*c.PhotoPath)
			photoURL = &url
		}
		candidateDTOs[i] = CandidateDTO{
			ID:             c.ID,
			SequenceNumber: c.SequenceNumber,
			Name:           c.Name,
			Title:          c.Title,
			Vision:         c.Vision,
			PhotoURL:       photoURL,
		}
	}

	return &HomeResponse{
		Event: &EventDTO{
			Name:      event.Name,
			Theme:     event.Theme,
			Location:  event.Location,
			EventDate: event.EventDate,
			Status:    event.Status,
		},
		Settings: SettingsDTO{
			RegistrationApprovalMode: settings.RegistrationApprovalMode,
			ShowCandidateList:        settings.ShowCandidateList,
			ShowTimeline:             settings.ShowTimeline,
			ShowAnnouncements:        settings.ShowAnnouncements,
		},
		Timeline:      timelineDTOs,
		CurrentPhase:  currentPhase,
		Announcements: announcementDTOs,
		Candidates:    candidateDTOs,
	}, nil
}
