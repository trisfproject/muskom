import api from '@/lib/api';
import { MusyawarahEvent, UpdateEventPayload } from '@/types/event';

export const eventService = {
  async getEvent(): Promise<MusyawarahEvent | null> {
    try {
      const response = await api.get('/admin/musyawarah');
      const events = response.data.data;
      if (Array.isArray(events) && events.length > 0) {
        const evt = events.find((e: any) => e.is_active) || events[0];
        // Map backend field names to frontend aliases for backward compatibility
        return {
          ...evt,
          registration_start: evt.registration_open,
          registration_end: evt.registration_close,
          candidate_registration_start: evt.candidate_registration_open,
          candidate_registration_end: evt.candidate_registration_close,
        };
      }
      return null;
    } catch (error: unknown) {
      const err = error as { response?: { status?: number } };
      if (err.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  async updateEvent(id: string, payload: UpdateEventPayload): Promise<MusyawarahEvent> {
    const reqPayload = {
      name: payload.name,
      slug: payload.slug,
      theme: payload.theme,
      description: payload.description,
      location_name: payload.location,
      address: payload.address,
      google_maps_url: payload.google_maps_url,
      event_date: payload.start_date || (new Date()).toISOString(), // ensure required field
      registration_open: payload.registration_start,
      registration_close: payload.registration_end,
      candidate_registration_open: payload.candidate_registration_start,
      candidate_registration_close: payload.candidate_registration_end,
    };
    
    // Fallback required fields if missing from UI
    if (!reqPayload.registration_open) reqPayload.registration_open = new Date().toISOString();
    if (!reqPayload.registration_close) reqPayload.registration_close = new Date().toISOString();
    if (!reqPayload.candidate_registration_open) reqPayload.candidate_registration_open = new Date().toISOString();
    if (!reqPayload.candidate_registration_close) reqPayload.candidate_registration_close = new Date().toISOString();
    
    const response = await api.put(`/admin/musyawarah/${id}`, reqPayload);
    return response.data.data;
  },

  async updateSettings(payload: any): Promise<any> {
    const reqPayload = {
      max_participants: payload.max_participants ? Number(payload.max_participants) : undefined,
      registration_approval_mode: 'AUTOMATIC',
      candidate_approval_mode: 'AUTOMATIC',
      enable_attendance: true,
      attendance_qr_expiration: 60,
      attendance_radius: 100,
      enable_voting: true,
      allow_revote: false,
      show_live_result: true,
      publish_final_result: payload.publish_result !== undefined ? payload.publish_result : true,
      allow_candidate_registration: payload.allow_candidate_registration !== undefined ? payload.allow_candidate_registration : true,
      show_candidate_list: true,
      show_timeline: true,
      show_statistics: true,
      show_announcements: true,
    };
    
    const response = await api.put('/admin/musyawarah/settings', reqPayload);
    return response.data.data;
  },

  async updateTimeline(payload: any): Promise<any> {
    const reqPayload = {
      registration: {
        start_at: payload.registration_start || null,
        end_at: payload.registration_end || null
      },
      candidate_registration: {
        start_at: payload.candidate_registration_start || null,
        end_at: payload.candidate_registration_end || null
      },
      voting: {
        start_at: payload.voting_start || null,
        end_at: payload.voting_end || null
      }
    };
    
    const response = await api.put('/admin/musyawarah/timeline', reqPayload);
    return response.data.data;
  }
};
