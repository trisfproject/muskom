package musyawarah

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"go.uber.org/zap"
)

var (
	ErrConfigNotFound = errors.New("musyawarah configuration not found")
)

type Service interface {
	GetConfig(ctx context.Context) (*MusyawarahResponse, error)
	UpdateConfig(ctx context.Context, req *UpdateMusyawarahRequest) (*MusyawarahResponse, error)
	GetTimeline(ctx context.Context) (*TimelineResponse, error)
	UpdateTimeline(ctx context.Context, req *TimelineRequest) (*TimelineResponse, error)
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

func (s *service) GetTimeline(ctx context.Context) (*TimelineResponse, error) {
	evt, err := s.repo.GetActiveEvent(ctx)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrConfigNotFound
		}
		return nil, err
	}

	phases, err := s.repo.GetPhases(ctx, evt.ID)
	if err != nil {
		return nil, err
	}

	res := &TimelineResponse{}
	for _, p := range phases {
		dto := TimelinePhaseDTO{StartAt: p.StartAt, EndAt: p.EndAt}
		switch p.Phase {
		case "REGISTRATION":
			res.Registration = dto
		case "CANDIDATE_REGISTRATION":
			res.CandidateRegistration = dto
		case "VERIFICATION":
			res.Verification = dto
		case "CAMPAIGN":
			res.Campaign = dto
		case "COOLING_OFF":
			res.CoolingOff = dto
		case "VOTING":
			res.Voting = dto
		case "RESULT_PUBLICATION":
			res.ResultPublication = dto
		}
	}
	return res, nil
}

func (s *service) validateTimeline(req *TimelineRequest) error {
	type PhaseInfo struct {
		Name  string
		Phase TimelinePhaseDTO
	}

	phases := []PhaseInfo{
		{"Registration", req.Registration},
		{"Candidate Registration", req.CandidateRegistration},
		{"Verification", req.Verification},
		{"Campaign", req.Campaign},
		{"Cooling-off", req.CoolingOff},
		{"Voting", req.Voting},
		{"Result Publication", req.ResultPublication},
	}

	var lastValidEnd *time.Time
	var lastValidName string

	for _, p := range phases {
		start := p.Phase.StartAt
		end := p.Phase.EndAt

		if start != nil && end != nil {
			if start.After(*end) || start.Equal(*end) {
				return fmt.Errorf("%s start date must be before end date", p.Name)
			}
		}

		if start != nil {
			if lastValidEnd != nil && start.Before(*lastValidEnd) {
				return fmt.Errorf("%s must start after %s finishes", p.Name, lastValidName)
			}
		} else if end != nil {
			if lastValidEnd != nil && end.Before(*lastValidEnd) {
				return fmt.Errorf("%s must end after %s finishes", p.Name, lastValidName)
			}
		}

		if end != nil {
			lastValidEnd = end
			lastValidName = p.Name
		} else if start != nil {
			lastValidEnd = start
			lastValidName = p.Name
		}
	}

	return nil
}

func (s *service) UpdateTimeline(ctx context.Context, req *TimelineRequest) (*TimelineResponse, error) {
	if err := s.validateTimeline(req); err != nil {
		return nil, err
	}

	evt, err := s.repo.GetActiveEvent(ctx)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrConfigNotFound
		}
		return nil, err
	}

	phases := []MusyawarahPhase{
		{Phase: "REGISTRATION", StartAt: req.Registration.StartAt, EndAt: req.Registration.EndAt},
		{Phase: "CANDIDATE_REGISTRATION", StartAt: req.CandidateRegistration.StartAt, EndAt: req.CandidateRegistration.EndAt},
		{Phase: "VERIFICATION", StartAt: req.Verification.StartAt, EndAt: req.Verification.EndAt},
		{Phase: "CAMPAIGN", StartAt: req.Campaign.StartAt, EndAt: req.Campaign.EndAt},
		{Phase: "COOLING_OFF", StartAt: req.CoolingOff.StartAt, EndAt: req.CoolingOff.EndAt},
		{Phase: "VOTING", StartAt: req.Voting.StartAt, EndAt: req.Voting.EndAt},
		{Phase: "RESULT_PUBLICATION", StartAt: req.ResultPublication.StartAt, EndAt: req.ResultPublication.EndAt},
	}

	tx, err := s.repo.BeginTx(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	for _, p := range phases {
		if err := s.repo.UpsertPhase(ctx, tx, evt.ID, &p); err != nil {
			return nil, err
		}
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	return s.GetTimeline(ctx)
}
