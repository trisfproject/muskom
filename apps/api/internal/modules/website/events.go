package website

import (
	"context"

	"go.uber.org/zap"
)

const (
	EventGeneralUpdated      = "website.general.updated"
	EventHeroUpdated         = "website.hero.updated"
	EventTimelineUpdated     = "website.timeline.updated"
	EventAnnouncementUpdated = "website.announcement.updated"
	EventCandidateUpdated    = "website.candidate.updated"
	EventFooterUpdated       = "website.footer.updated"
	EventInformationUpdated  = "website.information.updated"
)

// TriggerCacheInvalidation publishes a mutation event and invalidates the public home cache.
func TriggerCacheInvalidation(ctx context.Context, cache Cache, logger *zap.Logger, eventName string) {
	if logger != nil {
		logger.Info("Website CMS mutation event triggered", zap.String("event", eventName))
	}
	if cache != nil {
		if err := cache.InvalidatePublicHome(ctx); err != nil && logger != nil {
			logger.Warn("Failed to invalidate cache on event", zap.String("event", eventName), zap.Error(err))
		}
	}
}
