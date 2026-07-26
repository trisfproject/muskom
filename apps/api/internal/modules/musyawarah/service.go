package musyawarah

import (
	"context"
	"database/sql"
	"errors"

	"go.uber.org/zap"
)

var (
	ErrConfigNotFound = errors.New("musyawarah configuration not found")
)

type Service interface {
	GetConfig(ctx context.Context) (*MusyawarahResponse, error)
	UpdateConfig(ctx context.Context, req *UpdateMusyawarahRequest) (*MusyawarahResponse, error)
}

type service struct {
	repo Repository
	log  *zap.Logger
}

func NewService(repo Repository, log *zap.Logger) Service {
	return &service{repo: repo, log: log}
}

func (s *service) GetConfig(ctx context.Context) (*MusyawarahResponse, error) {
	evt, err := s.repo.GetActiveEvent(ctx)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrConfigNotFound
		}
		return nil, err
	}

	stg, err := s.repo.GetSettings(ctx, evt.ID)
	if err != nil {
		return nil, err
	}

	phases, err := s.repo.GetPhases(ctx, evt.ID)
	if err != nil {
		return nil, err
	}

	res := &MusyawarahResponse{
		ID:                         evt.ID,
		Name:                       evt.Name,
		Theme:                      evt.Theme,
		Location:                   evt.Location,
		BannerPath:                 evt.BannerPath,
		LogoPath:                   evt.LogoPath,
		Status:                     evt.Status,
		MaxParticipants:            stg.RegistrationLimit,
		PublishResult:              stg.ShowLiveResult,
		AllowCandidateRegistration: stg.AllowCandidateRegistration,
	}

	for _, p := range phases {
		switch p.Phase {
		case "REGISTRATION":
			res.RegistrationStart = p.StartAt
			res.RegistrationEnd = p.EndAt
		case "CANDIDATE_REGISTRATION":
			res.CandidateRegistrationStart = p.StartAt
			res.CandidateRegistrationEnd = p.EndAt
		case "VOTING":
			res.VotingStart = p.StartAt
			res.VotingEnd = p.EndAt
		}
	}

	return res, nil
}

func (s *service) UpdateConfig(ctx context.Context, req *UpdateMusyawarahRequest) (*MusyawarahResponse, error) {
	evt, err := s.repo.GetActiveEvent(ctx)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrConfigNotFound
		}
		return nil, err
	}

	evt.Name = req.Name
	evt.Theme = req.Theme
	evt.Location = req.Location
	evt.BannerPath = req.BannerPath
	evt.LogoPath = req.LogoPath
	evt.Status = req.Status

	stg := &MusyawarahSettings{
		RegistrationLimit:          req.MaxParticipants,
		ShowLiveResult:             req.PublishResult,
		AllowCandidateRegistration: req.AllowCandidateRegistration,
	}

	phases := []MusyawarahPhase{
		{Phase: "REGISTRATION", StartAt: req.RegistrationStart, EndAt: req.RegistrationEnd},
		{Phase: "CANDIDATE_REGISTRATION", StartAt: req.CandidateRegistrationStart, EndAt: req.CandidateRegistrationEnd},
		{Phase: "VOTING", StartAt: req.VotingStart, EndAt: req.VotingEnd},
	}

	tx, err := s.repo.BeginTx(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	if err := s.repo.UpdateEvent(ctx, tx, evt); err != nil {
		return nil, err
	}

	if err := s.repo.UpdateSettings(ctx, tx, evt.ID, stg); err != nil {
		return nil, err
	}

	for _, p := range phases {
		if err := s.repo.UpsertPhase(ctx, tx, evt.ID, &p); err != nil {
			return nil, err
		}
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	return s.GetConfig(ctx)
}
