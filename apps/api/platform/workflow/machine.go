package workflow

import (
	"context"
	"errors"
	"fmt"
)

var (
	ErrInvalidTransition = errors.New("invalid state transition")
	ErrUnauthorized      = errors.New("unauthorized to perform this transition")
	ErrValidationFailed  = errors.New("transition validation failed")
)

type StateMachine struct {
	def *Definition
}

func NewStateMachine(def *Definition) *StateMachine {
	return &StateMachine{
		def: def,
	}
}

func (sm *StateMachine) FindTransition(from State, event Event) (*Transition, error) {
	for _, t := range sm.def.Transitions {
		if t.From == from && t.Event == event {
			return &t, nil
		}
	}
	return nil, fmt.Errorf("%w: cannot transition from %s via %s", ErrInvalidTransition, from, event)
}

func (sm *StateMachine) CanTransition(from State, event Event, roleCode string, hasPermission func(string) bool) bool {
	t, err := sm.FindTransition(from, event)
	if err != nil {
		return false
	}

	// Check permissions
	if t.RequiredPermission != "" {
		if !hasPermission(t.RequiredPermission) {
			return false
		}
	}

	// Check roles if explicitly defined
	if len(t.RequiredRole) > 0 {
		roleFound := false
		for _, r := range t.RequiredRole {
			if r == roleCode || roleCode == "SUPER_ADMIN" {
				roleFound = true
				break
			}
		}
		if !roleFound {
			return false
		}
	}

	return true
}

// Validate executes the transition logic without mutating anything, returning the target state if valid
func (sm *StateMachine) Validate(ctx context.Context, entityID string, from State, event Event, roleCode string, hasPermission func(string) bool) (State, error) {
	t, err := sm.FindTransition(from, event)
	if err != nil {
		return "", err
	}

	if !sm.CanTransition(from, event, roleCode, hasPermission) {
		return "", ErrUnauthorized
	}

	if t.Validator != nil {
		if err := t.Validator(ctx, entityID); err != nil {
			return "", fmt.Errorf("%w: %v", ErrValidationFailed, err)
		}
	}

	return t.To, nil
}
