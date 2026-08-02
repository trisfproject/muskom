"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { musyawarahAdminService } from "@/services/admin/musyawarah";
import { MusyawarahListItem } from "@/types/musyawarah";
import { SectionHeader } from "@/components/ui/section-header";
import Link from "next/link";
import { Archive, Calendar, MapPin } from "lucide-react";

export default function ArchivePage() {
  const [events, setEvents] = useState<MusyawarahListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchArchivedEvents = async () => {
    try {
      const data = await musyawarahAdminService.list();
      const archived = data.filter(e => e.status === 'ARCHIVED');
      setEvents(archived);
    } catch (error) {
      toast.error("Gagal mengambil daftar arsip");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchivedEvents();
  }, []);

  if (loading) return <div className="p-8 pg-muted">Memuat...</div>;

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Arsip Musyawarah" 
        description="Daftar seluruh acara musyawarah yang telah selesai dan diarsipkan."
      />

      {events.length === 0 ? (
        <div className="pg-surface border pg-border rounded-xl p-12 text-center">
          <Archive className="w-12 h-12 pg-muted mx-auto mb-4 opacity-20" />
          <h3 className="text-lg font-medium pg-text mb-2">Belum ada arsip</h3>
          <p className="text-sm pg-muted">
            Acara musyawarah yang telah selesai dan diubah statusnya menjadi &quot;ARCHIVED&quot; akan muncul di sini.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id} className="pg-surface border pg-border rounded-xl p-5 hover:border-primary/50 transition-colors group">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold pg-text text-lg">{event.name}</h3>
                  {event.theme && (
                    <p className="text-xs pg-muted mt-1 italic">&quot;{event.theme}&quot;</p>
                  )}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 shrink-0">
                  Arsip
                </span>
              </div>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-xs pg-muted">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{event.event_date ? new Date(event.event_date).toLocaleDateString('id-ID') : 'Tanggal tidak diset'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs pg-muted">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{event.slug}</span>
                </div>
              </div>
              
              <div className="pt-4 border-t pg-border flex justify-end">
                <Link 
                  href={`/admin/musyawarah/${event.id}/general`}
                  className="text-xs font-medium text-primary group-hover:text-primary-active transition-colors"
                >
                  Lihat Detail &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
