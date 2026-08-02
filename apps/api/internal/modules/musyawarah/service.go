package musyawarah

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"io"
	"path/filepath"
	"time"

	"github.com/trisfproject/muskom/apps/api/platform/storage"
	"go.uber.org/zap"
)

var (
	ErrConfigNotFound = errors.New("musyawarah configuration not found")
)

type Service interface {
	GetConfig(ctx context.Context) (*MusyawarahResponse, error)
	UpdateConfig(ctx context.Context, req *UpdateMusyawarahRequest) (*MusyawarahResponse, error)
	GetSettings(ctx context.Context) (*SettingsResponse, error)
	UpdateSettings(ctx context.Context, req *SettingsRequest) (*SettingsResponse, error)
	GetTimeline(ctx context.Context) (*TimelineResponse, error)
	UpdateTimeline(ctx context.Context, req *TimelineRequest) (*TimelineResponse, error)
	GetMedia(ctx context.Context) (*MediaResponse, error)
	UploadMedia(ctx context.Context, mediaType string, file io.Reader, filename string, contentType string) (*MediaResponse, error)
	DeleteMedia(ctx context.Context, mediaType string) error
}

type service struct {
	repo    Repository
	log     *zap.Logger
	storage storage.Storage
}

func NewService(repo Repository, log *zap.Logger, strg storage.Storage) Service {
	return &service{repo: repo, log: log, storage: strg}
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
		Slug:                       evt.Slug,
		Theme:                      evt.Theme,
		Tagline:                    evt.Tagline,
		Description:                evt.Description,
		Location:                   evt.Location,
		Year:                       evt.Year,
		StartDate:                  evt.StartDate,
		EndDate:                    evt.EndDate,
		Timezone:                   evt.Timezone,
		Venue:                      evt.Venue,
		Address:                    evt.Address,
		GoogleMapsURL:              evt.GoogleMapsURL,
		City:                       evt.City,
		Province:                   evt.Province,
		MeetingType:                evt.MeetingType,
		Status:                     evt.Status,
		MaxParticipants:            stg.RegistrationLimit,
		PublishResult:              stg.ShowLiveResult,
		AllowCandidateRegistration: stg.AllowCandidateRegistration,
	}

	if evt.LogoPath != nil && *evt.LogoPath != "" {
		url := s.storage.URL(*evt.LogoPath)
		res.LogoPath = &url
	}
	if evt.BannerPath != nil && *evt.BannerPath != "" {
		url := s.storage.URL(*evt.BannerPath)
		res.BannerPath = &url
	}
	if evt.CoverPath != nil && *evt.CoverPath != "" {
		url := s.storage.URL(*evt.CoverPath)
		res.CoverPath = &url
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
	evt.Slug = req.Slug
	evt.Theme = req.Theme
	evt.Tagline = req.Tagline
	evt.Description = req.Description
	evt.Location = req.Location
	evt.Status = req.Status
	evt.Year = req.Year
	evt.StartDate = req.StartDate
	evt.EndDate = req.EndDate
	evt.Timezone = req.Timezone
	evt.Venue = req.Venue
	evt.Address = req.Address
	evt.GoogleMapsURL = req.GoogleMapsURL
	evt.City = req.City
	evt.Province = req.Province
	evt.MeetingType = req.MeetingType

	if req.BannerPath != nil {
		evt.BannerPath = req.BannerPath
	}
	if req.LogoPath != nil {
		evt.LogoPath = req.LogoPath
	}

	stg, err := s.repo.GetSettings(ctx, evt.ID)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		return nil, err
	}

	stg.RegistrationLimit = req.MaxParticipants
	stg.ShowLiveResult = req.PublishResult
	stg.AllowCandidateRegistration = req.AllowCandidateRegistration

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

func (s *service) GetSettings(ctx context.Context) (*SettingsResponse, error) {
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

	return &SettingsResponse{
		MaxParticipants:            stg.RegistrationLimit,
		RegistrationApprovalMode:   stg.RegistrationApprovalMode,
		CandidateApprovalMode:      stg.CandidateApprovalMode,
		EnableAttendance:           stg.EnableAttendance,
		AttendanceQRExpiration:     stg.AttendanceQRExpiration,
		AttendanceRadius:           stg.AttendanceRadius,
		EnableVoting:               stg.EnableVoting,
		AllowRevote:                stg.AllowRevote,
		ShowLiveResult:             stg.ShowLiveResult,
		PublishFinalResult:         stg.PublishFinalResult,
		AllowCandidateRegistration: stg.AllowCandidateRegistration,
		ShowCandidateList:          stg.ShowCandidateList,
		ShowTimeline:               stg.ShowTimeline,
		ShowStatistics:             stg.ShowStatistics,
		ShowAnnouncements:          stg.ShowAnnouncements,
	}, nil
}

func (s *service) UpdateSettings(ctx context.Context, req *SettingsRequest) (*SettingsResponse, error) {
	evt, err := s.repo.GetActiveEvent(ctx)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrConfigNotFound
		}
		return nil, err
	}

	stg := &MusyawarahSettings{
		RegistrationLimit:          req.MaxParticipants,
		RegistrationApprovalMode:   req.RegistrationApprovalMode,
		CandidateApprovalMode:      req.CandidateApprovalMode,
		EnableAttendance:           req.EnableAttendance,
		AttendanceQRExpiration:     req.AttendanceQRExpiration,
		AttendanceRadius:           req.AttendanceRadius,
		EnableVoting:               req.EnableVoting,
		AllowRevote:                req.AllowRevote,
		ShowLiveResult:             req.ShowLiveResult,
		PublishFinalResult:         req.PublishFinalResult,
		AllowCandidateRegistration: req.AllowCandidateRegistration,
		ShowCandidateList:          req.ShowCandidateList,
		ShowTimeline:               req.ShowTimeline,
		ShowStatistics:             req.ShowStatistics,
		ShowAnnouncements:          req.ShowAnnouncements,
	}

	tx, err := s.repo.BeginTx(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	if err := s.repo.UpdateSettings(ctx, tx, evt.ID, stg); err != nil {
		return nil, err
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	return s.GetSettings(ctx)
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
		case "ADMINISTRATIVE_VERIFICATION":
			res.AdministrativeVerification = dto
		case "CANDIDATE_VERIFICATION":
			res.CandidateVerification = dto
		case "CAMPAIGN":
			res.Campaign = dto
		case "COOLING_OFF":
			res.CoolingOff = dto
		case "ATTENDANCE_CHECK_IN":
			res.AttendanceCheckIn = dto
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
		{"Administrative Verification", req.AdministrativeVerification},
		{"Candidate Verification", req.CandidateVerification},
		{"Campaign", req.Campaign},
		{"Cooling-off", req.CoolingOff},
		{"Attendance Check-in", req.AttendanceCheckIn},
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
		{Phase: "ADMINISTRATIVE_VERIFICATION", StartAt: req.AdministrativeVerification.StartAt, EndAt: req.AdministrativeVerification.EndAt},
		{Phase: "CANDIDATE_VERIFICATION", StartAt: req.CandidateVerification.StartAt, EndAt: req.CandidateVerification.EndAt},
		{Phase: "CAMPAIGN", StartAt: req.Campaign.StartAt, EndAt: req.Campaign.EndAt},
		{Phase: "COOLING_OFF", StartAt: req.CoolingOff.StartAt, EndAt: req.CoolingOff.EndAt},
		{Phase: "ATTENDANCE_CHECK_IN", StartAt: req.AttendanceCheckIn.StartAt, EndAt: req.AttendanceCheckIn.EndAt},
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

func (s *service) GetMedia(ctx context.Context) (*MediaResponse, error) {
	evt, err := s.repo.GetActiveEvent(ctx)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrConfigNotFound
		}
		return nil, err
	}

	res := &MediaResponse{}
	if evt.LogoPath != nil && *evt.LogoPath != "" {
		url := s.storage.URL(*evt.LogoPath)
		res.LogoURL = &url
	}
	if evt.BannerPath != nil && *evt.BannerPath != "" {
		url := s.storage.URL(*evt.BannerPath)
		res.BannerURL = &url
	}
	if evt.CoverPath != nil && *evt.CoverPath != "" {
		url := s.storage.URL(*evt.CoverPath)
		res.CoverURL = &url
	}
	return res, nil
}

func (s *service) UploadMedia(ctx context.Context, mediaType string, file io.Reader, filename string, contentType string) (*MediaResponse, error) {
	if mediaType != "logo" && mediaType != "banner" && mediaType != "cover" {
		return nil, errors.New("invalid media type")
	}

	if contentType != "image/png" && contentType != "image/jpeg" && contentType != "image/webp" {
		return nil, errors.New("invalid content type, must be PNG, JPEG, or WebP")
	}

	evt, err := s.repo.GetActiveEvent(ctx)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrConfigNotFound
		}
		return nil, err
	}

	var oldPath *string
	switch mediaType {
	case "logo":
		oldPath = evt.LogoPath
	case "banner":
		oldPath = evt.BannerPath
	case "cover":
		oldPath = evt.CoverPath
	}

	ext := filepath.Ext(filename)
	if ext == "" {
		switch contentType {
		case "image/png":
			ext = ".png"
		case "image/jpeg":
			ext = ".jpg"
		case "image/webp":
			ext = ".webp"
		}
	}
	newFileName := fmt.Sprintf("%s_%s_%d%s", evt.ID, mediaType, time.Now().UnixNano(), ext)

	fileInfo, err := s.storage.Upload(ctx, file, newFileName)
	if err != nil {
		s.log.Error("Failed to upload media", zap.Error(err))
		return nil, errors.New("failed to upload file")
	}

	if err := s.repo.UpdateMedia(ctx, evt.ID, mediaType, &fileInfo.Path); err != nil {
		_ = s.storage.Delete(ctx, fileInfo.Path)
		return nil, err
	}

	if oldPath != nil && *oldPath != "" {
		if err := s.storage.Delete(ctx, *oldPath); err != nil {
			s.log.Warn("Failed to delete old media file", zap.String("path", *oldPath), zap.Error(err))
		}
	}

	return s.GetMedia(ctx)
}

func (s *service) DeleteMedia(ctx context.Context, mediaType string) error {
	if mediaType != "logo" && mediaType != "banner" && mediaType != "cover" {
		return errors.New("invalid media type")
	}

	evt, err := s.repo.GetActiveEvent(ctx)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrConfigNotFound
		}
		return err
	}

	var oldPath *string
	switch mediaType {
	case "logo":
		oldPath = evt.LogoPath
	case "banner":
		oldPath = evt.BannerPath
	case "cover":
		oldPath = evt.CoverPath
	}

	if oldPath == nil || *oldPath == "" {
		return nil
	}

	if err := s.repo.UpdateMedia(ctx, evt.ID, mediaType, nil); err != nil {
		return err
	}

	if err := s.storage.Delete(ctx, *oldPath); err != nil {
		s.log.Warn("Failed to delete media file from storage", zap.String("path", *oldPath), zap.Error(err))
	}

	return nil
}
