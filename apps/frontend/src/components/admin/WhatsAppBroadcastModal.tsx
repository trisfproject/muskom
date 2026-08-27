"use client";

import React, { useState } from "react";
import { X, Send, AlertTriangle, CheckCircle2 } from "lucide-react";
import { AdminParticipantResponse } from "@/services/participant-admin";
import { formatWhatsAppNumber } from "@/lib/utils";

interface WhatsAppBroadcastModalProps {
  recipients: AdminParticipantResponse[];
  onClose: () => void;
}

const DEFAULT_TEMPLATE = `Halo Pak/Bu [Nama],

Mau mengingatkan kembali terkait KONGRES KOMITKABE 2026, Sabtu, 29 Agustus 2026.

Acara akan dilaksanakan di Kawana Golf Residence Jababeka, mulai pukul 08.00 WIB.

Boleh saya konfirmasi, apakah Bapak/Ibu bisa hadir di acara tersebut? Kami sedang finalisasi persiapan dan jumlah kehadiran peserta.

Mohon konfirmasinya ya, Pak/Bu. Terima kasih.`;

export function WhatsAppBroadcastModal({
  recipients,
  onClose,
}: WhatsAppBroadcastModalProps) {
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE);

  const getMessageForParticipant = (name: string) => {
    return template.replace(/\[Nama\]/g, name);
  };

  const handleOpenWhatsApp = (phone: string, name: string) => {
    const formatted = formatWhatsAppNumber(phone);
    if (!formatted) return;

    const message = getMessageForParticipant(name);
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${formatted}?text=${encodedMessage}`;
    window.open(url, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-xl shadow-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Send className="w-5 h-5 text-green-500" /> Broadcast WhatsApp
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col md:flex-row gap-6">
          {/* Template Editor */}
          <div className="flex-1 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Template Pesan
              </label>
              <textarea
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                rows={12}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-sm focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none transition-all resize-y text-slate-800 dark:text-slate-200"
                placeholder="Ketik pesan..."
              />
              <p className="text-xs text-slate-500 mt-2">
                Gunakan <strong>[Nama]</strong> untuk otomatis diganti dengan nama
                peserta.
              </p>
            </div>
          </div>

          {/* Recipient List */}
          <div className="w-full md:w-1/2 flex flex-col gap-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Daftar Penerima ({recipients.length})
              </h3>
              <p className="text-xs text-slate-500">
                Pesan tidak akan dikirim otomatis. Tombol di bawah akan membuka
                WhatsApp Web/App untuk Anda.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {recipients.map((p) => {
                const formatted = formatWhatsAppNumber(p.phone);
                const isValid = !!formatted;

                return (
                  <div
                    key={p.id}
                    className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {p.participant_name}
                      </p>
                      <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                        {isValid ? (
                          <span className="text-green-600 dark:text-green-400">
                            +{formatted}
                          </span>
                        ) : (
                          <span className="text-red-500 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Nomor tidak valid
                          </span>
                        )}
                      </p>
                    </div>

                    <button
                      disabled={!isValid}
                      onClick={() => handleOpenWhatsApp(p.phone, p.participant_name)}
                      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-green-500 hover:bg-green-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="w-3 h-3" />
                      Buka WA
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
