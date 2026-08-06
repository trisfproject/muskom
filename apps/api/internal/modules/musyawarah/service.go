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
	ErrConfigNotFound     = errors.New("musyawarah configuration not found")
	ErrMusyawarahNotFound = errors.New("musyawarah not found")
)

func CalculateLifecycleState(status string, phases []MusyawarahPhase) string {
	if status == "DRAFT" || status == "ARCHIVED" || status == "CANCELLED" || status == "COMPLETED" {
		return status
	}

	now := time.Now()

	phaseMap := make(map[string]MusyawarahPhase)
	for _, p := range phases {
		phaseMap[p.Phase] = p
	}

	isActive := func(pName string) bool {
		p, ok := phaseMap[pName]
		if !ok || p.StartAt == nil || p.EndAt == nil {
			return false
		}
		return now.After(*p.StartAt) && now.Before(*p.EndAt)
	}

	if isActive("RESULT_PUBLICATION") {
		return "RESULT_PUBLICATION"
	}
	if isActive("VOTING") {
		return "VOTING"
	}
	if isActive("ATTENDANCE_CHECK_IN") {
		return "ATTENDANCE"
	}
	if isActive("COOLING_OFF") {
		return "COOLING_DOWN"
	}
	if isActive("CAMPAIGN") {
		return "CAMPAIGN"
	}
	if isActive("CANDIDATE_VERIFICATION") {
		return "VERIFICATION"
	}
	if isActive("ADMINISTRATIVE_VERIFICATION") {
		return "VERIFICATION"
	}
	if isActive("CANDIDATE_REGISTRATION") {
		return "CANDIDATE_REGISTRATION"
	}
	if isActive("REGISTRATION") {
		return "REGISTRATION"
	}

	return "UPCOMING"
}

type Service interface {
	// Multi-event CRUD
	ListAll(ctx context.Context) ([]MusyawarahListItem, error)
	GetByID(ctx context.Context, id string) (*MusyawarahResponse, error)
	Create(ctx context.Context, req *CreateMusyawarahRequest) (*MusyawarahResponse, error)
	UpdateByID(ctx context.Context, id string, req *UpdateMusyawarahRequest) (*MusyawarahResponse, error)
	Activate(ctx context.Context, id string) (*MusyawarahResponse, error)
	Deactivate(ctx context.Context, id string) (*MusyawarahResponse, error)
	Archive(ctx context.Context, id string) (*MusyawarahResponse, error)
	Clone(ctx context.Context, id string) (*MusyawarahResponse, error)
	Publish(ctx context.Context, id string) (*MusyawarahResponse, error)
	Delete(ctx context.Context, id string) error

	// Active event (backward compat)
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
	logger  *zap.Logger
	storage storage.Storage
}

func NewService(repo Repository, logger *zap.Logger, strg storage.Storage) Service {
	return &service{repo: repo, logger: logger, storage: strg}
}

// --- Multi-event CRUD ---

func (s *service) ListAll(ctx context.Context) ([]MusyawarahListItem, error) {
	events, err := s.repo.ListEvents(ctx)
	if err != nil {
		return nil, err
	}

	items := make([]MusyawarahListItem, 0, len(events))
	for _, e := range events {
		// Compute lifecycle state from event_phases
		phases, _ := s.repo.GetPhases(ctx, e.ID)
		lifecycleState := CalculateLifecycleState(e.Status, phases)

		items = append(items, MusyawarahListItem{
			ID:                         e.ID,
			Name:                       e.Name,
			Slug:                       e.Slug,
			Theme:                      e.Theme,
			Status:                     e.Status,
			LifecycleState:             lifecycleState,
			IsActive:                   e.IsActive,
			PeriodStart:                e.PeriodStart,
			PeriodEnd:                  e.PeriodEnd,
			EventDate:                  e.EventDate,
			RegistrationOpen:           e.RegistrationOpen,
			RegistrationClose:          e.RegistrationClose,
			CandidateRegistrationOpen:  e.CandidateRegistrationOpen,
			CandidateRegistrationClose: e.CandidateRegistrationClose,
			CreatedAt:                  e.CreatedAt,
		})
	}
	return items, nil
}

func (s *service) GetByID(ctx context.Context, id string) (*MusyawarahResponse, error) {
	evt, err := s.repo.GetEventByID(ctx, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrMusyawarahNotFound
		}
		return nil, err
	}
	return s.buildResponse(ctx, evt)
}

func (s *service) validateDates(periodStart, periodEnd, regOpen, regClose, candOpen, candClose, eventDate *time.Time) error {
	if periodStart != nil && periodEnd != nil && periodStart.After(*periodEnd) {
		return errors.New("period start must be before period end")
	}
	if regOpen != nil && regClose != nil && regOpen.After(*regClose) {
		return errors.New("registration open must be before registration close")
	}
	if candOpen != nil && candClose != nil && candOpen.After(*candClose) {
		return errors.New("candidate registration open must be before candidate registration close")
	}
	if eventDate != nil {
		if regClose != nil && eventDate.Before(*regClose) {
			return errors.New("event date (voting date) must be after participant registration is closed")
		}
		if candClose != nil && eventDate.Before(*candClose) {
			return errors.New("event date (voting date) must be after candidate registration is closed")
		}
	}
	return nil
}

func (s *service) Create(ctx context.Context, req *CreateMusyawarahRequest) (*MusyawarahResponse, error) {
	if err := s.validateDates(req.PeriodStart, req.PeriodEnd, req.RegistrationOpen, req.RegistrationClose, req.CandidateRegistrationOpen, req.CandidateRegistrationClose, req.EventDate); err != nil {
		return nil, err
	}

	evt := &MusyawarahEvent{
		Name:                       req.Name,
		Slug:                       req.Slug,
		Theme:                      req.Theme,
		Description:                req.Description,
		PeriodStart:                req.PeriodStart,
		PeriodEnd:                  req.PeriodEnd,
		EventDate:                  req.EventDate,
		RegistrationOpen:           req.RegistrationOpen,
		RegistrationClose:          req.RegistrationClose,
		CandidateRegistrationOpen:  req.CandidateRegistrationOpen,
		CandidateRegistrationClose: req.CandidateRegistrationClose,
		Location:                   req.LocationName,
		Address:                    req.Address,
		GoogleMapsURL:              req.GoogleMapsURL,
	}

	// Assuming context contains user info, mock user here if not available
	user := "system"
	evt.CreatedBy = &user

	created, err := s.repo.CreateEvent(ctx, evt)
	if err != nil {
		return nil, err
	}

	s.logger.Info("AuditLog", zap.String("operation", "CREATE"), zap.String("user", user), zap.String("id", created.ID))

	return s.GetByID(ctx, created.ID)
}

func (s *service) UpdateByID(ctx context.Context, id string, req *UpdateMusyawarahRequest) (*MusyawarahResponse, error) {
	if err := s.validateDates(req.PeriodStart, req.PeriodEnd, req.RegistrationOpen, req.RegistrationClose, req.CandidateRegistrationOpen, req.CandidateRegistrationClose, req.EventDate); err != nil {
		return nil, err
	}

	evt, err := s.repo.GetEventByID(ctx, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrMusyawarahNotFound
		}
		return nil, err
	}

	evt.Name = req.Name
	evt.Slug = req.Slug
	evt.Theme = req.Theme
	evt.Description = req.Description
	evt.PeriodStart = req.PeriodStart
	evt.PeriodEnd = req.PeriodEnd
	evt.EventDate = req.EventDate
	evt.RegistrationOpen = req.RegistrationOpen
	evt.RegistrationClose = req.RegistrationClose
	evt.CandidateRegistrationOpen = req.CandidateRegistrationOpen
	evt.CandidateRegistrationClose = req.CandidateRegistrationClose
	evt.Location = req.LocationName
	evt.Address = req.Address
	evt.GoogleMapsURL = req.GoogleMapsURL

	user := "system"
	evt.UpdatedBy = &user

	tx, err := s.repo.BeginTx(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	if err := s.repo.UpdateEvent(ctx, tx, evt); err != nil {
		return nil, err
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	s.logger.Info("AuditLog", zap.String("operation", "UPDATE"), zap.String("user", user), zap.String("id", evt.ID))

	return s.GetByID(ctx, id)
}

func (s *service) Activate(ctx context.Context, id string) (*MusyawarahResponse, error) {
	evt, err := s.repo.GetEventByID(ctx, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrMusyawarahNotFound
		}
		return nil, err
	}

	if evt.Status == "ARCHIVED" {
		return nil, errors.New("cannot activate an archived event")
	}

	if evt.LogoPath == nil || *evt.LogoPath == "" {
		return nil, errors.New("musyawarah must have a logo before it can be activated")
	}

	tx, err := s.repo.BeginTx(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	if err := s.repo.DeactivateAll(ctx, tx); err != nil {
		return nil, err
	}
	if err := s.repo.SetActive(ctx, tx, id); err != nil {
		return nil, err
	}
	if err := tx.Commit(); err != nil {
		return nil, err
	}

	s.logger.Info("AuditLog", zap.String("operation", "ACTIVATE"), zap.String("user", "system"), zap.String("id", id))

	return s.GetByID(ctx, id)
}

func (s *service) Deactivate(ctx context.Context, id string) (*MusyawarahResponse, error) {
	_, err := s.repo.GetEventByID(ctx, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrMusyawarahNotFound
		}
		return nil, err
	}

	tx, err := s.repo.BeginTx(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	if err := s.repo.DeactivateAll(ctx, tx); err != nil {
		return nil, err
	}
	if err := tx.Commit(); err != nil {
		return nil, err
	}

	s.logger.Info("AuditLog", zap.String("operation", "DEACTIVATE"), zap.String("user", "system"), zap.String("id", id))

	return s.GetByID(ctx, id)
}

func (s *service) Archive(ctx context.Context, id string) (*MusyawarahResponse, error) {
	_, err := s.repo.GetEventByID(ctx, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrMusyawarahNotFound
		}
		return nil, err
	}

	if err := s.repo.ArchiveEvent(ctx, id); err != nil {
		return nil, err
	}

	s.logger.Info("AuditLog", zap.String("operation", "ARCHIVE"), zap.String("user", "system"), zap.String("id", id))

	return s.GetByID(ctx, id)
}

func (s *service) Clone(ctx context.Context, id string) (*MusyawarahResponse, error) {
	_, err := s.repo.GetEventByID(ctx, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrMusyawarahNotFound
		}
		return nil, err
	}

	clonedEvent, err := s.repo.CloneEvent(ctx, id, "system")
	if err != nil {
		return nil, err
	}

	s.logger.Info("AuditLog", zap.String("operation", "CLONE"), zap.String("user", "system"), zap.String("source_id", id), zap.String("new_id", clonedEvent.ID))

	return s.GetByID(ctx, clonedEvent.ID)
}

func (s *service) Publish(ctx context.Context, id string) (*MusyawarahResponse, error) {
	evt, err := s.repo.GetEventByID(ctx, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrMusyawarahNotFound
		}
		return nil, err
	}

	if evt.Status == "ARCHIVED" {
		return nil, errors.New("cannot publish an archived event")
	}

	if evt.LogoPath == nil || *evt.LogoPath == "" {
		return nil, errors.New("musyawarah must have a logo before it can be scheduled")
	}

	evt.Status = "SCHEDULED"
	user := "system"
	evt.UpdatedBy = &user

	tx, err := s.repo.BeginTx(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	if err := s.repo.UpdateEvent(ctx, tx, evt); err != nil {
		return nil, err
	}
	if err := tx.Commit(); err != nil {
		return nil, err
	}

	s.logger.Info("AuditLog", zap.String("operation", "PUBLISH"), zap.String("user", user), zap.String("id", evt.ID))

	return s.GetByID(ctx, id)
}

func (s *service) Delete(ctx context.Context, id string) error {
	evt, err := s.repo.GetEventByID(ctx, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrMusyawarahNotFound
		}
		return err
	}

	user := "system"
	err = s.repo.SoftDeleteEvent(ctx, id, user)
	if err == nil {
		s.logger.Info("AuditLog", zap.String("operation", "DELETE"), zap.String("user", user), zap.String("id", evt.ID))
	}
	return err
}

// buildResponse constructs a MusyawarahResponse from a MusyawarahEvent
func (s *service) buildResponse(ctx context.Context, evt *MusyawarahEvent) (*MusyawarahResponse, error) {
	// Compute lifecycle state
	phases, _ := s.repo.GetPhases(ctx, evt.ID)
	lifecycleState := CalculateLifecycleState(evt.Status, phases)

	res := &MusyawarahResponse{
		ID:                         evt.ID,
		Name:                       evt.Name,
		Slug:                       evt.Slug,
		Theme:                      evt.Theme,
		Description:                evt.Description,
		PeriodStart:                evt.PeriodStart,
		PeriodEnd:                  evt.PeriodEnd,
		LocationName:               evt.Location,
		Address:                    evt.Address,
		GoogleMapsURL:              evt.GoogleMapsURL,
		EventDate:                  evt.EventDate,
		RegistrationOpen:           evt.RegistrationOpen,
		RegistrationClose:          evt.RegistrationClose,
		CandidateRegistrationOpen:  evt.CandidateRegistrationOpen,
		CandidateRegistrationClose: evt.CandidateRegistrationClose,
		Status:                     evt.Status,
		LifecycleState:             lifecycleState,
		IsActive:                   evt.IsActive,
		CreatedAt:                  evt.CreatedAt,
		UpdatedAt:                  evt.UpdatedAt,
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

	return res, nil
}

// --- Active event (backward compat) ---

func (s *service) GetConfig(ctx context.Context) (*MusyawarahResponse, error) {
	evt, err := s.repo.GetActiveEvent(ctx)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrConfigNotFound
		}
		return nil, err
	}
	return s.buildResponse(ctx, evt)
}

func (s *service) UpdateConfig(ctx context.Context, req *UpdateMusyawarahRequest) (*MusyawarahResponse, error) {
	evt, err := s.repo.GetActiveEvent(ctx)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrConfigNotFound
		}
		return nil, err
	}
	return s.UpdateByID(ctx, evt.ID, req)
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

	tx, err := s.repo.BeginTx(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

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

func (s *service) UpdateTimeline(ctx context.Context, req *TimelineRequest) (*TimelineResponse, error) {
	evt, err := s.repo.GetActiveEvent(ctx)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrConfigNotFound
		}
		return nil, err
	}

	tx, err := s.repo.BeginTx(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	phaseMap := map[string]TimelinePhaseDTO{
		"REGISTRATION":                req.Registration,
		"CANDIDATE_REGISTRATION":      req.CandidateRegistration,
		"ADMINISTRATIVE_VERIFICATION": req.AdministrativeVerification,
		"CANDIDATE_VERIFICATION":      req.CandidateVerification,
		"CAMPAIGN":                    req.Campaign,
		"COOLING_OFF":                 req.CoolingOff,
		"ATTENDANCE_CHECK_IN":         req.AttendanceCheckIn,
		"VOTING":                      req.Voting,
		"RESULT_PUBLICATION":          req.ResultPublication,
	}

	for phaseName, dto := range phaseMap {
		p := MusyawarahPhase{
			Phase:   phaseName,
			StartAt: dto.StartAt,
			EndAt:   dto.EndAt,
		}
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

	var logoURL, bannerURL, coverURL *string
	if evt.LogoPath != nil && *evt.LogoPath != "" {
		u := s.storage.URL(*evt.LogoPath)
		logoURL = &u
	}
	if evt.BannerPath != nil && *evt.BannerPath != "" {
		u := s.storage.URL(*evt.BannerPath)
		bannerURL = &u
	}
	if evt.CoverPath != nil && *evt.CoverPath != "" {
		u := s.storage.URL(*evt.CoverPath)
		coverURL = &u
	}

	return &MediaResponse{
		LogoURL:   logoURL,
		BannerURL: bannerURL,
		CoverURL:  coverURL,
	}, nil
}

func (s *service) UploadMedia(ctx context.Context, mediaType string, file io.Reader, filename string, contentType string) (*MediaResponse, error) {
	evt, err := s.repo.GetActiveEvent(ctx)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrConfigNotFound
		}
		return nil, err
	}

	if contentType != "image/png" && contentType != "image/jpeg" && contentType != "image/webp" {
		return nil, errors.New("invalid content type, must be PNG, JPEG, or WebP")
	}

	ext := filepath.Ext(filename)
	customFilename := fmt.Sprintf("%s_%d%s", mediaType, time.Now().Unix(), ext)

	fileInfo, err := s.storage.Upload(ctx, file, customFilename)
	if err != nil {
		return nil, err
	}

	if err := s.repo.UpdateMedia(ctx, evt.ID, mediaType, &fileInfo.Path); err != nil {
		return nil, err
	}

	return s.GetMedia(ctx)
}

func (s *service) DeleteMedia(ctx context.Context, mediaType string) error {
	evt, err := s.repo.GetActiveEvent(ctx)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrConfigNotFound
		}
		return err
	}

	var currentPath *string
	switch mediaType {
	case "logo":
		currentPath = evt.LogoPath
	case "banner":
		currentPath = evt.BannerPath
	case "cover":
		currentPath = evt.CoverPath
	}

	if currentPath != nil && *currentPath != "" {
		_ = s.storage.Delete(ctx, *currentPath)
	}

	return s.repo.UpdateMedia(ctx, evt.ID, mediaType, nil)
}
