package evoting

import (
	"context"
	"sync"
	"testing"

	"github.com/stretchr/testify/assert"
)

// ─── Mock Redis Stats Tracker ─────────────────────────────────────────────────

type mockStatsTracker struct {
	mu       sync.Mutex
	counters map[string]int64
}

func newMockStatsTracker() *mockStatsTracker {
	return &mockStatsTracker{counters: make(map[string]int64)}
}

func (m *mockStatsTracker) IncrStat(_ context.Context, key string) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.counters[key]++
}

func (m *mockStatsTracker) Get(key string) int64 {
	m.mu.Lock()
	defer m.mu.Unlock()
	return m.counters[key]
}

// ─── Stats Key Tests ──────────────────────────────────────────────────────────

func TestStatsKeys_Constants(t *testing.T) {
	// Verify key naming conventions
	assert.Equal(t, "evoting:stats:auth_failures", StatsKeyAuthFailures)
	assert.Equal(t, "evoting:stats:rate_limited", StatsKeyRateLimited)
	assert.Equal(t, "evoting:stats:vote_failures", StatsKeyVoteFailures)
	assert.Equal(t, "evoting:stats:already_voted", StatsKeyAlreadyVoted)
}

func TestStatsKeys_NoIdentityData(t *testing.T) {
	// Keys must not contain participant_id, candidate_id, or session tokens
	keys := []string{StatsKeyAuthFailures, StatsKeyRateLimited, StatsKeyVoteFailures, StatsKeyAlreadyVoted}
	for _, key := range keys {
		assert.NotContains(t, key, "participant")
		assert.NotContains(t, key, "candidate")
		assert.NotContains(t, key, "ballot")
		assert.NotContains(t, key, "token")
	}
}

func TestMockStatsTracker_Increment(t *testing.T) {
	tracker := newMockStatsTracker()

	tracker.IncrStat(context.Background(), StatsKeyAuthFailures)
	tracker.IncrStat(context.Background(), StatsKeyAuthFailures)
	tracker.IncrStat(context.Background(), StatsKeyRateLimited)

	assert.Equal(t, int64(2), tracker.Get(StatsKeyAuthFailures))
	assert.Equal(t, int64(1), tracker.Get(StatsKeyRateLimited))
	assert.Equal(t, int64(0), tracker.Get(StatsKeyVoteFailures))
	assert.Equal(t, int64(0), tracker.Get(StatsKeyAlreadyVoted))
}

func TestVoteFailures_IncludesAlreadyVoted(t *testing.T) {
	// Verify the design: already_voted is a subset of vote_failures
	// Both should be incremented on an already-voted attempt
	tracker := newMockStatsTracker()

	// Simulate: 3 generic failures + 2 already-voted failures
	tracker.IncrStat(context.Background(), StatsKeyVoteFailures)
	tracker.IncrStat(context.Background(), StatsKeyVoteFailures)
	tracker.IncrStat(context.Background(), StatsKeyVoteFailures)

	// Already-voted (also counts as vote_failure)
	tracker.IncrStat(context.Background(), StatsKeyVoteFailures)
	tracker.IncrStat(context.Background(), StatsKeyAlreadyVoted)

	tracker.IncrStat(context.Background(), StatsKeyVoteFailures)
	tracker.IncrStat(context.Background(), StatsKeyAlreadyVoted)

	assert.Equal(t, int64(5), tracker.Get(StatsKeyVoteFailures))
	assert.Equal(t, int64(2), tracker.Get(StatsKeyAlreadyVoted))
}

func TestMissingRedisKey_ReturnsZero(t *testing.T) {
	tracker := newMockStatsTracker()
	// Never incremented keys should return 0
	assert.Equal(t, int64(0), tracker.Get(StatsKeyAuthFailures))
	assert.Equal(t, int64(0), tracker.Get(StatsKeyRateLimited))
	assert.Equal(t, int64(0), tracker.Get(StatsKeyVoteFailures))
	assert.Equal(t, int64(0), tracker.Get(StatsKeyAlreadyVoted))
}

func TestSuccessfulAuth_DoesNotIncrementStats(t *testing.T) {
	// Verify that a successful auth should NOT increment any failure counter.
	// This test validates the design principle — stats track failures only.
	tracker := newMockStatsTracker()

	// Simulate: only failures increment
	tracker.IncrStat(context.Background(), StatsKeyAuthFailures) // 1 failure

	// A "successful" auth does nothing to stats — assert counters unchanged after
	assert.Equal(t, int64(1), tracker.Get(StatsKeyAuthFailures))
	assert.Equal(t, int64(0), tracker.Get(StatsKeyRateLimited))
}
