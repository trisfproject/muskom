/**
 * Data mappers convert backend DTOs into frontend-friendly models.
 * Used to isolate the UI from backend schema changes.
 */
export function mapAttendanceStatus(status: string) {
  return status;
}
