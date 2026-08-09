package voting

import (
	"context"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/jmoiron/sqlx"
	"github.com/stretchr/testify/assert"
)

func TestRepository_IsParticipantEligible(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("an error '%s' was not expected when opening a stub database connection", err)
	}
	defer db.Close()

	sqlxDB := sqlx.NewDb(db, "sqlmock")
	repo := NewRepository(sqlxDB)

	ctx := context.Background()
	participantID := "part-123"
	eventID := "evt-1"

	query := `SELECT COUNT\(p\.id\) FROM participants p JOIN attendance a ON a\.participant_id = p\.id WHERE p\.id = \$1 AND p\.status IN \('Verified', 'VERIFIED', 'Approved', 'APPROVED'\) AND p\.deleted_at IS NULL AND a\.undone_at IS NULL`

	tests := []struct {
		name          string
		mockCount     int
		expectedValid bool
	}{
		{
			name:          "APPROVED + sudah check-in + attendance belum undone => BOLEH vote",
			mockCount:     1,
			expectedValid: true,
		},
		{
			name:          "VERIFIED + sudah check-in + attendance belum undone => BOLEH vote",
			mockCount:     1,
			expectedValid: true,
		},
		{
			name:          "APPROVED + belum check-in => DITOLAK dengan ErrParticipantNotEligible",
			mockCount:     0,
			expectedValid: false,
		},
		{
			name:          "PENDING + sudah check-in => DITOLAK",
			mockCount:     0,
			expectedValid: false,
		},
		{
			name:          "REJECTED + sudah check-in => DITOLAK",
			mockCount:     0,
			expectedValid: false,
		},
		{
			name:          "APPROVED + pernah check-in tetapi check-in sudah di-undo (undone_at IS NOT NULL) => DITOLAK",
			mockCount:     0,
			expectedValid: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			rows := sqlmock.NewRows([]string{"count"}).AddRow(tt.mockCount)
			mock.ExpectQuery(query).WithArgs(participantID).WillReturnRows(rows)

			eligible, err := repo.IsParticipantEligible(ctx, eventID, participantID)

			assert.NoError(t, err)
			assert.Equal(t, tt.expectedValid, eligible)
			assert.NoError(t, mock.ExpectationsWereMet())
		})
	}
}

func TestRepository_GetBallotCandidates(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("an error '%s' was not expected when opening a stub database connection", err)
	}
	defer db.Close()

	sqlxDB := sqlx.NewDb(db, "sqlmock")
	repo := NewRepository(sqlxDB)

	ctx := context.Background()
	eventID := "evt-1"

	query := `SELECT c\.id, COALESCE\(c\.candidate_number, c\.display_order, 0\) as number, c\.full_name as name, c\.profile_photo as photo_path, c\.vision, c\.mission FROM candidates c WHERE c\.deleted_at IS NULL AND c\.status IN \('Verified', 'VERIFIED', 'Approved', 'APPROVED'\) ORDER BY number ASC`

	t.Run("Should return only valid candidates without Draft", func(t *testing.T) {
		rows := sqlmock.NewRows([]string{"id", "number", "name", "photo_path", "vision", "mission"}).
			AddRow("cand-1", 1, "Candidate A", "url1", "vis1", "mis1").
			AddRow("cand-2", 2, "Candidate B", "url2", "vis2", "mis2")

		mock.ExpectQuery(query).WillReturnRows(rows)

		candidates, err := repo.GetBallotCandidates(ctx, eventID)

		assert.NoError(t, err)
		assert.Len(t, candidates, 2)
		assert.Equal(t, "Candidate A", candidates[0].Name)
		assert.Equal(t, "Candidate B", candidates[1].Name)
		assert.NoError(t, mock.ExpectationsWereMet())
	})
}
