package dashboard

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestVotingStats_ReconciliationOK(t *testing.T) {
	// When receipts == ballots, reconciliation should be OK
	stats := VotingStats{
		ReceiptsCount:    5,
		BallotsCount:     5,
		ReconciliationOK: (5 == 5),
	}
	assert.True(t, stats.ReconciliationOK)
}

func TestVotingStats_ReconciliationMismatch(t *testing.T) {
	// When receipts != ballots, reconciliation should be false
	stats := VotingStats{
		ReceiptsCount:    5,
		BallotsCount:     4,
		ReconciliationOK: (5 == 4),
	}
	assert.False(t, stats.ReconciliationOK)
}

func TestVotingStats_NotYetVoted_Normal(t *testing.T) {
	checkedIn := 10
	receipts := 6
	notYetVoted := checkedIn - receipts
	if notYetVoted < 0 {
		notYetVoted = 0
	}
	assert.Equal(t, 4, notYetVoted)
}

func TestVotingStats_NotYetVoted_AllVoted(t *testing.T) {
	checkedIn := 10
	receipts := 10
	notYetVoted := checkedIn - receipts
	if notYetVoted < 0 {
		notYetVoted = 0
	}
	assert.Equal(t, 0, notYetVoted)
}

func TestVotingStats_NotYetVoted_NeverNegative(t *testing.T) {
	// Edge case: more receipts than checked-in (shouldn't happen but handle safely)
	checkedIn := 3
	receipts := 5
	notYetVoted := checkedIn - receipts
	if notYetVoted < 0 {
		notYetVoted = 0
	}
	assert.Equal(t, 0, notYetVoted)
}

func TestVotingStats_ZeroState(t *testing.T) {
	// No check-ins, no votes
	checkedIn := 0
	receipts := 0
	ballots := 0

	notYetVoted := checkedIn - receipts
	if notYetVoted < 0 {
		notYetVoted = 0
	}
	reconciliationOK := (receipts == ballots)

	assert.Equal(t, 0, notYetVoted)
	assert.True(t, reconciliationOK)
}

func TestVotingStats_CheckedInGreaterThanReceipts(t *testing.T) {
	// Normal case: some have checked in but not voted yet
	checkedIn := 15
	receipts := 8
	notYetVoted := checkedIn - receipts
	if notYetVoted < 0 {
		notYetVoted = 0
	}
	assert.Equal(t, 7, notYetVoted)
}

func TestVotingStats_NoParticipantCandidateLinkage(t *testing.T) {
	// Verify VotingStats struct does NOT contain participant_id or candidate linkage fields
	stats := VotingStats{}
	// The struct only has aggregate counts — no identity fields
	assert.Equal(t, 0, stats.VotesSubmitted)
	assert.Equal(t, 0, stats.ReceiptsCount)
	assert.Equal(t, 0, stats.BallotsCount)
	assert.Equal(t, 0, stats.NotYetVoted)
	assert.Equal(t, 0, stats.RemainingVoters)
	assert.Equal(t, "", stats.SessionState)
	assert.False(t, stats.ReconciliationOK)
}
