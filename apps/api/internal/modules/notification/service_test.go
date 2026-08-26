package notification

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"go.uber.org/zap/zaptest"

	"github.com/jmoiron/sqlx"
)

// ---------------------------------------------------------------------------
// MockRepository — implements Repository interface for unit testing
// ---------------------------------------------------------------------------

type MockRepository struct {
	mock.Mock
}

func (m *MockRepository) GetTemplateByName(ctx context.Context, name string, channel Channel) (*NotificationTemplate, error) {
	args := m.Called(ctx, name, channel)
	if args.Get(0) != nil {
		return args.Get(0).(*NotificationTemplate), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockRepository) GetTemplateByID(ctx context.Context, id string) (*NotificationTemplate, error) {
	args := m.Called(ctx, id)
	if args.Get(0) != nil {
		return args.Get(0).(*NotificationTemplate), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockRepository) CreateTemplate(ctx context.Context, tpl *NotificationTemplate) error {
	return m.Called(ctx, tpl).Error(0)
}

func (m *MockRepository) CreateJob(ctx context.Context, job *NotificationJob) error {
	return m.Called(ctx, job).Error(0)
}

func (m *MockRepository) CreateJobTx(ctx context.Context, tx *sqlx.Tx, job *NotificationJob) error {
	return m.Called(ctx, tx, job).Error(0)
}

func (m *MockRepository) GetPendingJobs(ctx context.Context, limit int) ([]NotificationJob, error) {
	args := m.Called(ctx, limit)
	if args.Get(0) != nil {
		return args.Get(0).([]NotificationJob), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockRepository) UpdateJobStatus(ctx context.Context, id string, status JobStatus, errMsg *string) error {
	return m.Called(ctx, id, status, errMsg).Error(0)
}

func (m *MockRepository) CreateHistory(ctx context.Context, history *NotificationHistory) error {
	return m.Called(ctx, history).Error(0)
}

func (m *MockRepository) ListJobs(ctx context.Context, eventID string) ([]NotificationJob, error) {
	args := m.Called(ctx, eventID)
	if args.Get(0) != nil {
		return args.Get(0).([]NotificationJob), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockRepository) ListHistory(ctx context.Context, page, limit int) ([]NotificationHistory, int, error) {
	args := m.Called(ctx, page, limit)
	if args.Get(0) != nil {
		return args.Get(0).([]NotificationHistory), args.Int(1), args.Error(2)
	}
	return nil, args.Int(1), args.Error(2)
}

func (m *MockRepository) ListTemplates(ctx context.Context) ([]NotificationTemplate, error) {
	args := m.Called(ctx)
	if args.Get(0) != nil {
		return args.Get(0).([]NotificationTemplate), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockRepository) UpdateTemplate(ctx context.Context, id string, subject *string, body string) error {
	return m.Called(ctx, id, subject, body).Error(0)
}

func (m *MockRepository) RetryJob(ctx context.Context, id string) error {
	return m.Called(ctx, id).Error(0)
}

func (m *MockRepository) CreateInAppNotification(ctx context.Context, notif *InAppNotification) error {
	return m.Called(ctx, notif).Error(0)
}

func (m *MockRepository) ListInAppNotifications(ctx context.Context, userID *string, limit int, offset int) ([]InAppNotification, int, error) {
	args := m.Called(ctx, userID, limit, offset)
	if args.Get(0) != nil {
		return args.Get(0).([]InAppNotification), args.Int(1), args.Error(2)
	}
	return nil, args.Int(1), args.Error(2)
}

func (m *MockRepository) GetUnreadInAppCount(ctx context.Context, userID *string) (int, error) {
	args := m.Called(ctx, userID)
	return args.Int(0), args.Error(1)
}

func (m *MockRepository) MarkInAppRead(ctx context.Context, id string) error {
	return m.Called(ctx, id).Error(0)
}

func (m *MockRepository) MarkAllInAppRead(ctx context.Context, userID *string) error {
	return m.Called(ctx, userID).Error(0)
}

func (m *MockRepository) DeleteInAppNotification(ctx context.Context, id string) error {
	return m.Called(ctx, id).Error(0)
}

func (m *MockRepository) GetWebsiteIdentity(ctx context.Context) (map[string]interface{}, error) {
	args := m.Called(ctx)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(map[string]interface{}), args.Error(1)
}

func (m *MockRepository) GetEligibleReminderRecipients(ctx context.Context) ([]ReminderRecipient, error) {
	args := m.Called(ctx)
	if args.Get(0) != nil {
		return args.Get(0).([]ReminderRecipient), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockRepository) GetEligibleRecipientsByIDs(ctx context.Context, ids []string) ([]ReminderRecipient, error) {
	args := m.Called(ctx, ids)
	if args.Get(0) != nil {
		return args.Get(0).([]ReminderRecipient), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockRepository) QueueUniqueCampaignJob(ctx context.Context, job *NotificationJob, campaignID string) (bool, error) {
	args := m.Called(ctx, job, campaignID)
	return args.Bool(0), args.Error(1)
}

func (m *MockRepository) SaveDraft(ctx context.Context, draft *BroadcastDraft) error {
	return m.Called(ctx, draft).Error(0)
}

func (m *MockRepository) GetActiveDraft(ctx context.Context, campaignID string) (*BroadcastDraft, error) {
	args := m.Called(ctx, campaignID)
	if args.Get(0) != nil {
		return args.Get(0).(*BroadcastDraft), args.Error(1)
	}
	return nil, args.Error(1)
}

func (m *MockRepository) MarkDraftAsSent(ctx context.Context, campaignID string) error {
	return m.Called(ctx, campaignID).Error(0)
}

// ---------------------------------------------------------------------------
// MockMailer
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

func testSvc(t *testing.T) (*service, *MockRepository) {
	t.Helper()
	mockRepo := new(MockRepository)
	svc := &service{
		repo: mockRepo,
		log:  zaptest.NewLogger(t),
	}
	mockRepo.On("MarkDraftAsSent", mock.Anything, mock.Anything).Return(nil).Maybe()
	return svc, mockRepo
}

func defaultBlastReq(ids ...string) BlastRequest {
	return BlastRequest{
		RecipientIDs: ids,
		Subject:      "Pengingat Kehadiran — MUSYAWARAH KOMITKABE 2026",
		Body:         "<html><body>Hadir yuk!</body></html>",
	}
}

func tpl() *NotificationTemplate { return &NotificationTemplate{ID: "tpl-123"} }

const campaignID = "event_musyawarah_komitkabe_2026_reminder"

// ---------------------------------------------------------------------------
// TestPreviewMusyawarahReminder — preview must be read-only
// ---------------------------------------------------------------------------

func TestPreviewMusyawarahReminder(t *testing.T) {
	ctx := context.Background()
	svc, mockRepo := testSvc(t)

	// Preview uses GetEligibleReminderRecipients — same query as Blast (single source of truth)
	recipients := []ReminderRecipient{
		{ID: "1", Email: "a@test.com", FullName: "Alice", RegistrationNumber: "REG-001", Status: "APPROVED"},
		{ID: "2", Email: "b@test.com", FullName: "Bob", RegistrationNumber: "REG-002", Status: "VERIFIED"},
	}
	mockRepo.On("GetEligibleReminderRecipients", ctx).Return(recipients, nil)
	subj := "Pengingat Kehadiran — MUSYAWARAH KOMITKABE 2026"
	mockRepo.On("GetTemplateByName", ctx, "event_musyawarah_reminder", ChannelEmail).Return(&NotificationTemplate{
		Subject: &subj,
		Body:    "<body>Preview</body>",
	}, nil)

	res, err := svc.PreviewMusyawarahReminder(ctx)
	assert.NoError(t, err)
	assert.Equal(t, 2, res["eligible_count"]) // derived from len(recipients), not a separate COUNT query
	assert.Equal(t, &subj, res["subject"])
	assert.Equal(t, "<body>Preview</body>", res["body"])
	assert.Equal(t, recipients, res["recipients"])

	// CRITICAL: Preview must NEVER create notification_jobs
	mockRepo.AssertNotCalled(t, "QueueUniqueCampaignJob")
	mockRepo.AssertExpectations(t)
}

// ---------------------------------------------------------------------------
// TestBlastMusyawarahReminder — select 1 recipient
// ---------------------------------------------------------------------------

func TestBlastMusyawarahReminder_SelectOne(t *testing.T) {
	ctx := context.Background()
	svc, mockRepo := testSvc(t)

	eligible := []ReminderRecipient{
		{ID: "r1", Email: "a@example.com", FullName: "Alice", RegistrationNumber: "REG-001", Status: "APPROVED"},
	}
	mockRepo.On("GetEligibleRecipientsByIDs", ctx, []string{"r1"}).Return(eligible, nil)
	mockRepo.On("GetTemplateByName", ctx, "event_musyawarah_reminder", ChannelEmail).Return(tpl(), nil)
	matchA := mock.MatchedBy(func(j *NotificationJob) bool { return j.Recipient == "a@example.com" })
	mockRepo.On("QueueUniqueCampaignJob", ctx, matchA, campaignID).Return(true, nil)

	result, err := svc.BlastMusyawarahReminder(ctx, "admin", defaultBlastReq("r1"))
	assert.NoError(t, err)
	assert.Equal(t, 1, result.Requested)
	assert.Equal(t, 1, result.Eligible)
	assert.Equal(t, 1, result.Queued)
	assert.Equal(t, 0, result.Skipped)
	mockRepo.AssertExpectations(t)
}

// ---------------------------------------------------------------------------
// TestBlastMusyawarahReminder — select 7 of 19
// ---------------------------------------------------------------------------

func TestBlastMusyawarahReminder_SelectPartial(t *testing.T) {
	ctx := context.Background()
	svc, mockRepo := testSvc(t)

	// Simulate 7 selected, all eligible
	ids := []string{"r1", "r2", "r3", "r4", "r5", "r6", "r7"}
	eligible := make([]ReminderRecipient, 7)
	for i, id := range ids {
		eligible[i] = ReminderRecipient{ID: id, Email: id + "@x.com", FullName: "User", Status: "APPROVED"}
	}
	mockRepo.On("GetEligibleRecipientsByIDs", ctx, ids).Return(eligible, nil)
	mockRepo.On("GetTemplateByName", ctx, "event_musyawarah_reminder", ChannelEmail).Return(tpl(), nil)
	for _, r := range eligible {
		email := r.Email
		match := mock.MatchedBy(func(j *NotificationJob) bool { return j.Recipient == email })
		mockRepo.On("QueueUniqueCampaignJob", ctx, match, campaignID).Return(true, nil)
	}

	result, err := svc.BlastMusyawarahReminder(ctx, "admin", defaultBlastReq(ids...))
	assert.NoError(t, err)
	assert.Equal(t, 7, result.Requested)
	assert.Equal(t, 7, result.Eligible)
	assert.Equal(t, 7, result.Queued)
	mockRepo.AssertExpectations(t)
}

// ---------------------------------------------------------------------------
// TestBlastMusyawarahReminder — unselected recipients are not queued
// ---------------------------------------------------------------------------

func TestBlastMusyawarahReminder_UnselectedNotQueued(t *testing.T) {
	ctx := context.Background()
	svc, mockRepo := testSvc(t)

	// Only r1 is selected; r2 is not in request
	eligible := []ReminderRecipient{
		{ID: "r1", Email: "r1@x.com", FullName: "R1", Status: "APPROVED"},
	}
	mockRepo.On("GetEligibleRecipientsByIDs", ctx, []string{"r1"}).Return(eligible, nil)
	mockRepo.On("GetTemplateByName", ctx, "event_musyawarah_reminder", ChannelEmail).Return(tpl(), nil)
	matchR1 := mock.MatchedBy(func(j *NotificationJob) bool { return j.Recipient == "r1@x.com" })
	mockRepo.On("QueueUniqueCampaignJob", ctx, matchR1, campaignID).Return(true, nil)

	result, err := svc.BlastMusyawarahReminder(ctx, "admin", defaultBlastReq("r1"))
	assert.NoError(t, err)
	assert.Equal(t, 1, result.Queued)
	// r2@x.com must NEVER be called
	mockRepo.AssertNotCalled(t, "QueueUniqueCampaignJob", ctx,
		mock.MatchedBy(func(j *NotificationJob) bool { return j.Recipient == "r2@x.com" }), campaignID)
	mockRepo.AssertExpectations(t)
}

// ---------------------------------------------------------------------------
// TestBlastMusyawarahReminder — server-side rejects deleted/ineligible
// ---------------------------------------------------------------------------

func TestBlastMusyawarahReminder_IneligibleSkipped(t *testing.T) {
	ctx := context.Background()
	svc, mockRepo := testSvc(t)

	// Request has 3 IDs; server-side validation returns only 2 (one was deleted/rejected)
	ids := []string{"r1", "r2-deleted", "r3"}
	eligible := []ReminderRecipient{
		{ID: "r1", Email: "r1@x.com", Status: "APPROVED"},
		{ID: "r3", Email: "r3@x.com", Status: "VERIFIED"},
	}
	mockRepo.On("GetEligibleRecipientsByIDs", ctx, ids).Return(eligible, nil)
	mockRepo.On("GetTemplateByName", ctx, "event_musyawarah_reminder", ChannelEmail).Return(tpl(), nil)
	for _, r := range eligible {
		email := r.Email
		m := mock.MatchedBy(func(j *NotificationJob) bool { return j.Recipient == email })
		mockRepo.On("QueueUniqueCampaignJob", ctx, m, campaignID).Return(true, nil)
	}

	result, err := svc.BlastMusyawarahReminder(ctx, "admin", defaultBlastReq(ids...))
	assert.NoError(t, err)
	assert.Equal(t, 3, result.Requested)
	assert.Equal(t, 2, result.Eligible)
	assert.Equal(t, 2, result.Queued)
	assert.Equal(t, 1, result.Skipped) // r2-deleted was skipped by server validation
	mockRepo.AssertExpectations(t)
}

// ---------------------------------------------------------------------------
// TestBlastMusyawarahReminder — empty selection is rejected
// ---------------------------------------------------------------------------

func TestBlastMusyawarahReminder_EmptySelection(t *testing.T) {
	ctx := context.Background()
	svc, _ := testSvc(t)

	_, err := svc.BlastMusyawarahReminder(ctx, "admin", BlastRequest{
		RecipientIDs: []string{},
		Subject:      "Subject",
		Body:         "<body></body>",
	})
	assert.ErrorIs(t, err, ErrNoRecipientsSelected)
}

// ---------------------------------------------------------------------------
// TestBlastMusyawarahReminder — edited subject and body are used
// ---------------------------------------------------------------------------

func TestBlastMusyawarahReminder_CustomSubjectBody(t *testing.T) {
	ctx := context.Background()
	svc, mockRepo := testSvc(t)

	eligible := []ReminderRecipient{
		{ID: "r1", Email: "a@x.com", Status: "APPROVED"},
	}
	mockRepo.On("GetEligibleRecipientsByIDs", ctx, []string{"r1"}).Return(eligible, nil)
	mockRepo.On("GetTemplateByName", ctx, "event_musyawarah_reminder", ChannelEmail).Return(tpl(), nil)

	customSubj := "Pengingat Khusus Direksi"
	customBody := "<html>Special message</html>"

	// Verify custom_subject and custom_body appear in the queued job payload
	matchCustom := mock.MatchedBy(func(j *NotificationJob) bool {
		if j.Recipient != "a@x.com" || j.Payload == nil {
			return false
		}
		return contains(*j.Payload, "custom_subject") && contains(*j.Payload, "custom_body")
	})
	mockRepo.On("QueueUniqueCampaignJob", ctx, matchCustom, campaignID).Return(true, nil)

	result, err := svc.BlastMusyawarahReminder(ctx, "admin", BlastRequest{
		RecipientIDs: []string{"r1"},
		Subject:      customSubj,
		Body:         customBody,
	})
	assert.NoError(t, err)
	assert.Equal(t, 1, result.Queued)
	mockRepo.AssertExpectations(t)
}

func contains(s, sub string) bool {
	return len(s) >= len(sub) && (s == sub || len(s) > 0 && stringContains(s, sub))
}
func stringContains(s, sub string) bool {
	for i := 0; i <= len(s)-len(sub); i++ {
		if s[i:i+len(sub)] == sub {
			return true
		}
	}
	return false
}

// ---------------------------------------------------------------------------
// TestBlastMusyawarahReminder — idempotency: duplicate blast is safe
// ---------------------------------------------------------------------------

func TestBlastMusyawarahReminder_Idempotency(t *testing.T) {
	ctx := context.Background()
	svc, mockRepo := testSvc(t)

	recipients := []ReminderRecipient{
		{ID: "u1", Email: "user1@example.com", FullName: "User One", Status: "APPROVED"},
		{ID: "u2", Email: "user2@example.com", FullName: "User Two", Status: "VERIFIED"},
	}
	ids := []string{"u1", "u2"}

	matchUser1 := mock.MatchedBy(func(j *NotificationJob) bool { return j.Recipient == "user1@example.com" })
	matchUser2 := mock.MatchedBy(func(j *NotificationJob) bool { return j.Recipient == "user2@example.com" })

	// Blast 1: both recipients get queued
	mockRepo.On("GetEligibleRecipientsByIDs", ctx, ids).Return(recipients, nil).Once()
	mockRepo.On("GetTemplateByName", ctx, "event_musyawarah_reminder", ChannelEmail).Return(tpl(), nil).Once()
	mockRepo.On("QueueUniqueCampaignJob", ctx, matchUser1, campaignID).Return(true, nil).Once()
	mockRepo.On("QueueUniqueCampaignJob", ctx, matchUser2, campaignID).Return(true, nil).Once()

	r1, err := svc.BlastMusyawarahReminder(ctx, "admin", defaultBlastReq(ids...))
	assert.NoError(t, err)
	assert.Equal(t, 2, r1.Queued)
	assert.Equal(t, 0, r1.Skipped)

	// Blast 2: same campaign — advisory lock / idempotency check returns false for both
	mockRepo.On("GetEligibleRecipientsByIDs", ctx, ids).Return(recipients, nil).Once()
	mockRepo.On("GetTemplateByName", ctx, "event_musyawarah_reminder", ChannelEmail).Return(tpl(), nil).Once()
	mockRepo.On("QueueUniqueCampaignJob", ctx, matchUser1, campaignID).Return(false, nil).Once()
	mockRepo.On("QueueUniqueCampaignJob", ctx, matchUser2, campaignID).Return(false, nil).Once()

	r2, err2 := svc.BlastMusyawarahReminder(ctx, "admin", defaultBlastReq(ids...))
	assert.NoError(t, err2)
	assert.Equal(t, 0, r2.Queued)
	assert.Equal(t, 2, r2.Skipped) // both already sent, correctly skipped

	mockRepo.AssertExpectations(t)
}

// ---------------------------------------------------------------------------
// TestBlastMusyawarahReminder — partial idempotency: one already sent, one new
// ---------------------------------------------------------------------------

func TestBlastMusyawarahReminder_PartialIdempotency(t *testing.T) {
	ctx := context.Background()
	svc, mockRepo := testSvc(t)

	recipients := []ReminderRecipient{
		{ID: "u1", Email: "user1@example.com", Status: "APPROVED"},
		{ID: "u2", Email: "user2@example.com", Status: "VERIFIED"},
	}
	ids := []string{"u1", "u2"}

	mockRepo.On("GetEligibleRecipientsByIDs", ctx, ids).Return(recipients, nil)
	mockRepo.On("GetTemplateByName", ctx, "event_musyawarah_reminder", ChannelEmail).Return(tpl(), nil)
	matchUser1 := mock.MatchedBy(func(j *NotificationJob) bool { return j.Recipient == "user1@example.com" })
	matchUser2 := mock.MatchedBy(func(j *NotificationJob) bool { return j.Recipient == "user2@example.com" })
	mockRepo.On("QueueUniqueCampaignJob", ctx, matchUser1, campaignID).Return(false, nil) // already sent
	mockRepo.On("QueueUniqueCampaignJob", ctx, matchUser2, campaignID).Return(true, nil)  // new

	result, err := svc.BlastMusyawarahReminder(ctx, "admin", defaultBlastReq(ids...))
	assert.NoError(t, err)
	assert.Equal(t, 2, result.Requested)
	assert.Equal(t, 2, result.Eligible)
	assert.Equal(t, 1, result.Queued)
	assert.Equal(t, 1, result.Skipped)
	mockRepo.AssertExpectations(t)
}

// ---------------------------------------------------------------------------
// TestBlastMusyawarahReminder — mixed eligible/ineligible selection
// ---------------------------------------------------------------------------

func TestBlastMusyawarahReminder_MixedEligibility(t *testing.T) {
	ctx := context.Background()
	svc, mockRepo := testSvc(t)

	// Frontend sent 5 IDs; 2 are now ineligible (rejected/deleted)
	ids := []string{"ok1", "bad1", "ok2", "bad2", "ok3"}
	eligible := []ReminderRecipient{
		{ID: "ok1", Email: "ok1@x.com", Status: "APPROVED"},
		{ID: "ok2", Email: "ok2@x.com", Status: "VERIFIED"},
		{ID: "ok3", Email: "ok3@x.com", Status: "APPROVED"},
	}
	mockRepo.On("GetEligibleRecipientsByIDs", ctx, ids).Return(eligible, nil)
	mockRepo.On("GetTemplateByName", ctx, "event_musyawarah_reminder", ChannelEmail).Return(tpl(), nil)
	for _, r := range eligible {
		email := r.Email
		m := mock.MatchedBy(func(j *NotificationJob) bool { return j.Recipient == email })
		mockRepo.On("QueueUniqueCampaignJob", ctx, m, campaignID).Return(true, nil)
	}

	result, err := svc.BlastMusyawarahReminder(ctx, "admin", defaultBlastReq(ids...))
	assert.NoError(t, err)
	assert.Equal(t, 5, result.Requested)
	assert.Equal(t, 3, result.Eligible)
	assert.Equal(t, 3, result.Queued)
	assert.Equal(t, 2, result.Skipped) // bad1 + bad2 dropped by server-side validation
	mockRepo.AssertExpectations(t)
}
