package voting

import "errors"

// Common voting errors
var (
	ErrSessionClosed          = errors.New("voting session is closed")
	ErrSessionNotRunning      = errors.New("voting session is not running")
	ErrAlreadyVoted           = errors.New("participant has already voted")
	ErrNotCheckedIn           = errors.New("participant is not checked in")
	ErrParticipantNotEligible = errors.New("participant is not eligible to vote (not verified or not checked-in)")
	ErrCandidateInvalid       = errors.New("candidate is not valid or not approved")
)
