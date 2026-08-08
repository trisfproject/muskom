package registration

import (
	"context"
	"testing"

	"github.com/jmoiron/sqlx"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"go.uber.org/zap/zaptest"

	"github.com/trisfproject/muskom/apps/api/internal/modules/notification"
	"github.com/trisfproject/muskom/apps/api/platform/config"
	"github.com/trisfproject/muskom/apps/api/platform/mailer"
)

type MockMailer struct {
	mock.Mock
}

func (m *MockMailer) SendRegistrationConfirmation(to, participantName, regNumber, musyawarahName, company, regTime, status string) error {
	args := m.Called(to, participantName, regNumber, musyawarahName, company, regTime, status)
	return args.Error(0)
}

func (m *MockMailer) SendVerification(to, participantName, regNumber, musyawarahName string) error {
	args := m.Called(to, participantName, regNumber, musyawarahName)
	return args.Error(0)
}

func (m *MockMailer) SendRejection(to, participantName, musyawarahName, reason string) error {
	args := m.Called(to, participantName, musyawarahName, reason)
	return args.Error(0)
}

func (m *MockMailer) SendTestEmail(to string) error {
	args := m.Called(to)
	return args.Error(0)
}

func (m *MockMailer) TestConnection() error {
	args := m.Called()
	return args.Error(0)
}

func (m *MockMailer) SendRaw(to, subject, bodyHTML string) error {
	args := m.Called(to, subject, bodyHTML)
	return args.Error(0)
}

func (m *MockMailer) SendRawWithAttachments(to, subject, bodyHTML string, attachments []mailer.Attachment) error {
	args := m.Called(to, subject, bodyHTML, attachments)
	return args.Error(0)
}

type MockNotifRepository struct {
	mock.Mock
}

func (m *MockNotifRepository) GetTemplateByName(ctx context.Context, name string, channel notification.Channel) (*notification.NotificationTemplate, error) {
	args := m.Called(ctx, name, channel)
	if args.Get(0) != nil {
		return args.Get(0).(*notification.NotificationTemplate), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockNotifRepository) GetTemplateByID(ctx context.Context, id string) (*notification.NotificationTemplate, error) {
	args := m.Called(ctx, id)
	if args.Get(0) != nil {
		return args.Get(0).(*notification.NotificationTemplate), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockNotifRepository) CreateTemplate(ctx context.Context, tpl *notification.NotificationTemplate) error {
	return m.Called(ctx, tpl).Error(0)
}

func (m *MockNotifRepository) CreateJob(ctx context.Context, job *notification.NotificationJob) error {
	return m.Called(ctx, job).Error(0)
}

func (m *MockNotifRepository) CreateJobTx(ctx context.Context, tx *sqlx.Tx, job *notification.NotificationJob) error {
	return m.Called(ctx, tx, job).Error(0)
}

func (m *MockNotifRepository) GetPendingJobs(ctx context.Context, limit int) ([]notification.NotificationJob, error) {
	args := m.Called(ctx, limit)
	if args.Get(0) != nil {
		return args.Get(0).([]notification.NotificationJob), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockNotifRepository) UpdateJobStatus(ctx context.Context, id string, status notification.JobStatus, errMsg *string) error {
	return m.Called(ctx, id, status, errMsg).Error(0)
}

func (m *MockNotifRepository) CreateHistory(ctx context.Context, history *notification.NotificationHistory) error {
	return m.Called(ctx, history).Error(0)
}

func (m *MockNotifRepository) ListJobs(ctx context.Context, eventID string) ([]notification.NotificationJob, error) {
	args := m.Called(ctx, eventID)
	if args.Get(0) != nil {
		return args.Get(0).([]notification.NotificationJob), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockNotifRepository) ListHistory(ctx context.Context, eventID string) ([]notification.NotificationHistory, error) {
	args := m.Called(ctx, eventID)
	if args.Get(0) != nil {
		return args.Get(0).([]notification.NotificationHistory), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockNotifRepository) ListTemplates(ctx context.Context) ([]notification.NotificationTemplate, error) {
	args := m.Called(ctx)
	if args.Get(0) != nil {
		return args.Get(0).([]notification.NotificationTemplate), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockNotifRepository) UpdateTemplate(ctx context.Context, id string, subject *string, body string) error {
	return m.Called(ctx, id, subject, body).Error(0)
}

func (m *MockNotifRepository) RetryJob(ctx context.Context, id string) error {
	return m.Called(ctx, id).Error(0)
}

func (m *MockNotifRepository) CreateInAppNotification(ctx context.Context, notif *notification.InAppNotification) error {
	return m.Called(ctx, notif).Error(0)
}

func (m *MockNotifRepository) ListInAppNotifications(ctx context.Context, userID *string, limit int, offset int) ([]notification.InAppNotification, int, error) {
	args := m.Called(ctx, userID, limit, offset)
	if args.Get(0) != nil {
		return args.Get(0).([]notification.InAppNotification), args.Int(1), args.Error(2)
	}
	return nil, args.Int(1), args.Error(2)
}

func (m *MockNotifRepository) GetUnreadInAppCount(ctx context.Context, userID *string) (int, error) {
	args := m.Called(ctx, userID)
	return args.Int(0), args.Error(1)
}

func (m *MockNotifRepository) MarkInAppRead(ctx context.Context, id string) error {
	return m.Called(ctx, id).Error(0)
}

func (m *MockNotifRepository) MarkAllInAppRead(ctx context.Context, userID *string) error {
	return m.Called(ctx, userID).Error(0)
}

func (m *MockNotifRepository) DeleteInAppNotification(ctx context.Context, id string) error {
	return m.Called(ctx, id).Error(0)
}

func TestEmailWorker_SendEmail_RegistrationReceived(t *testing.T) {
	ctx := context.Background()
	log := zaptest.NewLogger(t)
	mockRepo := new(MockRepository)
	mockMailer := new(MockMailer)
	mockNotifRepo := new(MockNotifRepository)
	cfg := &config.Config{
		AppBaseURL: "https://example.com",
	}

	worker := &EmailWorker{
		repo:      mockRepo,
		notifRepo: mockNotifRepo,
		log:       log,
		mailerSvc: mockMailer,
		cfg:       cfg,
		stopCh:    make(chan struct{}),
	}

	mockRepo.On("GetRegistrationAdminByID", ctx, "reg-123").Return(&AdminRegistrationResponse{
		ID:              "reg-123",
		ParticipantName: "Ahmad Fauzi",
		Email:           "fauzi@example.com",
	}, nil)

	mockRepo.On("GetPortalTitle", ctx).Return("Musyawarah Nasional", nil)

	subjTpl := "Registration Received - {{portal_title}}"
	bodyTpl := "<p>Hello {{.full_name}}, welcome to {{.portal_title}}</p>"
	mockNotifRepo.On("GetTemplateByName", ctx, "participant_registration_submitted", notification.ChannelEmail).Return(&notification.NotificationTemplate{
		Name:    "participant_registration_submitted",
		Channel: notification.ChannelEmail,
		Subject: &subjTpl,
		Body:    bodyTpl,
	}, nil)

	mockMailer.On("SendRawWithAttachments", "fauzi@example.com", "Registration Received - Musyawarah Nasional", "<p>Hello Ahmad Fauzi, welcome to Musyawarah Nasional</p>", []mailer.Attachment(nil)).Return(nil)

	err := worker.sendEmail(ctx, EmailLog{
		RegistrationID: "reg-123",
		RecipientEmail: "fauzi@example.com",
		EmailType:      "REGISTRATION_RECEIVED",
	})

	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
	mockNotifRepo.AssertExpectations(t)
	mockMailer.AssertExpectations(t)
}

func TestEmailWorker_SendEmail_RegistrationApproved(t *testing.T) {
	ctx := context.Background()
	log := zaptest.NewLogger(t)
	mockRepo := new(MockRepository)
	mockMailer := new(MockMailer)
	mockNotifRepo := new(MockNotifRepository)
	cfg := &config.Config{
		AppBaseURL: "https://example.com",
	}

	worker := &EmailWorker{
		repo:      mockRepo,
		notifRepo: mockNotifRepo,
		log:       log,
		mailerSvc: mockMailer,
		cfg:       cfg,
		stopCh:    make(chan struct{}),
	}

	mockRepo.On("GetRegistrationAdminByID", ctx, "reg-456").Return(&AdminRegistrationResponse{
		ID:                 "reg-456",
		ParticipantName:    "Dewi Lestari",
		RegistrationNumber: "REG-99999",
		Email:              "dewi@example.com",
	}, nil)

	mockRepo.On("GetPortalTitle", ctx).Return("Kongres Tahunan", nil)

	subjTpl := "Registration Approved - {{.portal_title}}"
	bodyTpl := "<p>Hi {{.full_name}}, your number is {{.registration_number}}, qr is {{.qr_code}}, lookup at {{.lookup_url}}</p>"
	mockNotifRepo.On("GetTemplateByName", ctx, "participant_registration_approved", notification.ChannelEmail).Return(&notification.NotificationTemplate{
		Name:    "participant_registration_approved",
		Channel: notification.ChannelEmail,
		Subject: &subjTpl,
		Body:    bodyTpl,
	}, nil)

	mockMailer.On("SendRawWithAttachments",
		"dewi@example.com",
		"Registration Approved - Kongres Tahunan",
		"<p>Hi Dewi Lestari, your number is REG-99999, qr is cid:qrcode, lookup at https://example.com/peserta?q=REG-99999</p>",
		mock.MatchedBy(func(atts []mailer.Attachment) bool {
			return len(atts) == 1 &&
				atts[0].ContentID == "qrcode" &&
				atts[0].Inline &&
				atts[0].ContentType == "image/png" &&
				len(atts[0].Data) > 0
		}),
	).Return(nil)

	err := worker.sendEmail(ctx, EmailLog{
		RegistrationID: "reg-456",
		RecipientEmail: "dewi@example.com",
		EmailType:      "REGISTRATION_APPROVED",
	})

	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
	mockNotifRepo.AssertExpectations(t)
	mockMailer.AssertExpectations(t)
}

func TestEmailWorker_SendEmail_RegistrationApproved_MissingRegNumber(t *testing.T) {
	ctx := context.Background()
	log := zaptest.NewLogger(t)
	mockRepo := new(MockRepository)
	mockMailer := new(MockMailer)
	mockNotifRepo := new(MockNotifRepository)
	cfg := &config.Config{
		AppBaseURL: "https://example.com",
	}

	worker := &EmailWorker{
		repo:      mockRepo,
		notifRepo: mockNotifRepo,
		log:       log,
		mailerSvc: mockMailer,
		cfg:       cfg,
		stopCh:    make(chan struct{}),
	}

	mockRepo.On("GetRegistrationAdminByID", ctx, "reg-no-num").Return(&AdminRegistrationResponse{
		ID:                 "reg-no-num",
		ParticipantName:    "Budi Santoso",
		RegistrationNumber: "", // Missing reg number
		Email:              "budi@example.com",
	}, nil)

	mockRepo.On("GetPortalTitle", ctx).Return("Kongres", nil)

	mockNotifRepo.On("GetTemplateByName", ctx, "participant_registration_approved", notification.ChannelEmail).Return(&notification.NotificationTemplate{
		Name:    "participant_registration_approved",
		Channel: notification.ChannelEmail,
	}, nil)

	err := worker.sendEmail(ctx, EmailLog{
		RegistrationID: "reg-no-num",
		RecipientEmail: "budi@example.com",
		EmailType:      "REGISTRATION_APPROVED",
	})

	assert.Error(t, err)
	assert.Contains(t, err.Error(), "registration number is empty")
}

func TestEmailWorker_SendEmail_RegistrationRejected(t *testing.T) {
	ctx := context.Background()
	log := zaptest.NewLogger(t)
	mockRepo := new(MockRepository)
	mockMailer := new(MockMailer)
	mockNotifRepo := new(MockNotifRepository)
	cfg := &config.Config{
		AppBaseURL: "https://example.com",
	}

	worker := &EmailWorker{
		repo:      mockRepo,
		notifRepo: mockNotifRepo,
		log:       log,
		mailerSvc: mockMailer,
		cfg:       cfg,
		stopCh:    make(chan struct{}),
	}

	mockRepo.On("GetRegistrationAdminByID", ctx, "reg-789").Return(&AdminRegistrationResponse{
		ID:              "reg-789",
		ParticipantName: "Rudi Hartono",
		SpecialNotes:    "Dokumen KTP buram",
		Email:           "rudi@example.com",
	}, nil)

	mockRepo.On("GetPortalTitle", ctx).Return("Musyawarah", nil)

	subjTpl := "Registration Status - {{.portal_title}}"
	bodyTpl := "<p>Hi {{.full_name}}, status rejected. Reason: {{.rejection_reason}}</p>"
	mockNotifRepo.On("GetTemplateByName", ctx, "participant_registration_rejected", notification.ChannelEmail).Return(&notification.NotificationTemplate{
		Name:    "participant_registration_rejected",
		Channel: notification.ChannelEmail,
		Subject: &subjTpl,
		Body:    bodyTpl,
	}, nil)

	mockMailer.On("SendRawWithAttachments",
		"rudi@example.com",
		"Registration Status - Musyawarah",
		"<p>Hi Rudi Hartono, status rejected. Reason: Dokumen KTP buram</p>",
		[]mailer.Attachment(nil),
	).Return(nil)

	err := worker.sendEmail(ctx, EmailLog{
		RegistrationID: "reg-789",
		RecipientEmail: "rudi@example.com",
		EmailType:      "REGISTRATION_REJECTED",
	})

	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
	mockNotifRepo.AssertExpectations(t)
	mockMailer.AssertExpectations(t)
}
