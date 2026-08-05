# Feature Flags Reference

Feature toggles are stored in `event_settings` table linked to active `Musyawarah`:

- `registration_approval_mode`: `AUTO` | `MANUAL`
- `candidate_approval_mode`: `AUTO` | `MANUAL`
- `enable_attendance`: `true` | `false` (Controls QR check-in feature)
- `attendance_qr_expiration`: Time-to-live in seconds for QR refresh
- `enable_voting`: `true` | `false` (Master voting toggle)
- `allow_revote`: `true` | `false` (Allows revoting within active session)
- `show_live_result`: `true` | `false` (Exposes real-time tally graph to voters)
- `publish_final_result`: `true` | `false` (Publishes official election results)
- `allow_candidate_registration`: `true` | `false` (Opens public candidate application)
- `show_candidate_list`: `true` | `false` (Displays candidate section on landing page)
- `show_timeline`: `true` | `false` (Displays event timeline on landing page)
- `show_statistics`: `true` | `false` (Displays live statistics widget on landing page)
- `show_announcements`: `true` | `false` (Displays announcements section on landing page)
