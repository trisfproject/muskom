"use client";

import React, { useEffect, useState, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { useCheckIn } from "@/services/attendance/mutations";
import { CheckCircle2, AlertCircle, Scan, Search, RefreshCw, XCircle, Camera, CameraOff } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { PageHeader } from "@/components/admin/PageHeader";

// ── Types ────────────────────────────────────────────────────────────────────

interface CameraDevice {
  id: string;
  label: string;
}

// ── Main content ─────────────────────────────────────────────────────────────

function CheckInContent() {
  const searchParams = useSearchParams();
  const scanParam = searchParams.get("scan");

  const [manualInput, setManualInput] = useState("");
  const [scannerActive, setScannerActive] = useState(false);
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScannerReady, setIsScannerReady] = useState(false);

  const [successData, setSuccessData] = useState<any>(null);
  const [errorData, setErrorData] = useState<{ message: string; isDuplicate?: boolean } | null>(null);

  const html5QrRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = "qr-reader-container";
  const checkInMutation = useCheckIn();

  // ── Enumerate cameras on mount ─────────────────────────────────────────────
  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        console.log("[QR] Available cameras:", devices);
        const cams: CameraDevice[] = devices.map((d) => ({
          id: d.id,
          label: d.label || `Camera ${d.id}`,
        }));
        setCameras(cams);

        // Auto-select: prefer back camera (label contains "back"/"environment"/facing back)
        const backCam = cams.find((c) =>
          /back|rear|environment/i.test(c.label)
        );
        const preferred = backCam ?? cams[0];
        if (preferred) {
          setSelectedCameraId(preferred.id);
          console.log("[QR] Auto-selected camera:", preferred.label, preferred.id);
        }
      })
      .catch((err) => {
        console.warn("[QR] Could not enumerate cameras:", err);
        // Not a hard error — user can still start scanning
      });
  }, []);

  // ── Handle URL param ───────────────────────────────────────────────────────
  useEffect(() => {
    if (scanParam && !successData && !errorData && !checkInMutation.isPending) {
      handleCheckIn(scanParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanParam]);

  // ── Start scanner ──────────────────────────────────────────────────────────
  const startScanner = useCallback(async () => {
    setCameraError(null);
    setIsScannerReady(false);

    // Destroy previous instance if any
    if (html5QrRef.current) {
      try {
        if (html5QrRef.current.isScanning) {
          await html5QrRef.current.stop();
        }
        await html5QrRef.current.clear();
      } catch (_) {}
      html5QrRef.current = null;
    }

    let qrInstance: Html5Qrcode;
    try {
      qrInstance = new Html5Qrcode(scannerContainerId, {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      });
      html5QrRef.current = qrInstance;
    } catch (err) {
      console.error("[QR] Failed to instantiate Html5Qrcode:", err);
      setCameraError("Gagal menginisialisasi scanner.");
      return;
    }

    // Build camera constraint:
    // If a specific deviceId is selected, use that; otherwise use facingMode environment.
    const cameraIdOrConstraint: string | MediaTrackConstraints = selectedCameraId
      ? selectedCameraId
      : ({ facingMode: { ideal: "environment" } } as MediaTrackConstraints);

    const config = {
      fps: 15,
      qrbox: { width: 280, height: 280 },
      aspectRatio: 1.0,
      disableFlip: false,
      videoConstraints: selectedCameraId
        ? { deviceId: { exact: selectedCameraId } }
        : { facingMode: { ideal: "environment" } },
    };

    console.log("[QR] Starting scanner. cameraId:", selectedCameraId || "(facingMode: environment)");

    try {
      await qrInstance.start(
        cameraIdOrConstraint,
        config,
        (decodedText) => {
          console.log("[QR] Decoded:", decodedText);
          const parts = decodedText.split("/checkin/");
          const regNum = parts.length > 1 ? parts[1].trim() : decodedText.trim();
          stopScanner();
          handleCheckIn(regNum);
        },
        (scanError) => {
          // Routine scan frame failures — suppress logs unless debugging
          // console.debug("[QR] Frame scan error:", scanError);
        }
      );

      setIsScannerReady(true);
      setScannerActive(true);
      console.log("[QR] Scanner started successfully");
    } catch (err: any) {
      console.error("[QR] getUserMedia / start error:", err);
      let msg = "Gagal mengakses kamera.";
      if (err?.name === "NotAllowedError" || err?.message?.includes("Permission")) {
        msg = "Izin kamera ditolak. Buka pengaturan browser dan izinkan akses kamera.";
      } else if (err?.name === "NotFoundError") {
        msg = "Kamera tidak ditemukan pada perangkat ini.";
      } else if (err?.name === "NotReadableError") {
        msg = "Kamera sedang digunakan oleh aplikasi lain.";
      } else if (err?.name === "OverconstrainedError") {
        msg = "Konfigurasi kamera tidak didukung. Mencoba ulang dengan kamera default...";
        // Retry with basic video: true
        retryWithBasicConstraint(qrInstance);
        return;
      }
      setCameraError(msg);
      setScannerActive(false);
    }
  }, [selectedCameraId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fallback: retry with basic video constraint
  const retryWithBasicConstraint = async (qrInstance: Html5Qrcode) => {
    try {
      await qrInstance.start(
        { facingMode: "environment" },
        { fps: 15, qrbox: { width: 280, height: 280 } },
        (decodedText) => {
          const parts = decodedText.split("/checkin/");
          const regNum = parts.length > 1 ? parts[1].trim() : decodedText.trim();
          stopScanner();
          handleCheckIn(regNum);
        },
        () => {}
      );
      setIsScannerReady(true);
      setScannerActive(true);
      console.log("[QR] Scanner started with fallback constraint");
    } catch (err2) {
      console.error("[QR] Fallback also failed:", err2);
      setCameraError("Kamera tidak dapat diakses. Pastikan browser memiliki izin kamera.");
      setScannerActive(false);
    }
  };

  // ── Stop scanner ───────────────────────────────────────────────────────────
  const stopScanner = useCallback(async () => {
    setScannerActive(false);
    setIsScannerReady(false);
    if (html5QrRef.current) {
      try {
        if (html5QrRef.current.isScanning) {
          await html5QrRef.current.stop();
        }
        await html5QrRef.current.clear();
      } catch (_) {}
      html5QrRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [stopScanner]);

  // ── Check-in ───────────────────────────────────────────────────────────────
  const handleCheckIn = (regNum: string) => {
    setSuccessData(null);
    setErrorData(null);

    checkInMutation.mutate(regNum, {
      onSuccess: (data) => {
        if (data.is_new) {
          setSuccessData(data);
        } else {
          setErrorData({
            message: "Peserta sudah melakukan check-in sebelumnya.",
            isDuplicate: true,
          });
        }
      },
      onError: (err: any) => {
        const msg = err?.response?.data?.message || "Terjadi kesalahan sistem";
        setErrorData({ message: msg });
      },
    });
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    stopScanner();
    handleCheckIn(manualInput.trim());
  };

  const resetScanner = () => {
    setSuccessData(null);
    setErrorData(null);
    setManualInput("");
    setCameraError(null);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  const showScannerPanel = !successData && !errorData && !checkInMutation.isPending;

  return (
    <div className="max-w-2xl mx-auto p-2 sm:p-4 md:p-8">
      <PageHeader
        title="QR Check-in"
        description="Scan QR Code peserta atau masukkan nomor registrasi secara manual."
      />

      <div className="grid grid-cols-1 gap-6">
        {/* ── Processing ── */}
        {checkInMutation.isPending && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm flex flex-col items-center justify-center text-center">
            <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <h3 className="text-lg font-bold pg-text">Memproses Check-in...</h3>
          </div>
        )}

        {/* ── Success ── */}
        {successData && !checkInMutation.isPending && (
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mb-1">
              CHECK-IN BERHASIL
            </h2>
            <div className="w-full max-w-sm mt-6 p-4 bg-white dark:bg-slate-900 rounded-xl border border-emerald-100 dark:border-emerald-800/50 space-y-3 text-left">
              <div>
                <div className="text-xs font-semibold text-slate-500">Nama Peserta</div>
                <div className="font-bold pg-text text-lg">{successData.participant_name || "-"}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500">Nomor Registrasi</div>
                <div className="font-mono text-sm pg-text font-bold">{successData.registration_number || "-"}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500">Waktu Check-in</div>
                <div className="font-semibold text-sm pg-text">
                  {successData.checked_in_at
                    ? format(new Date(successData.checked_in_at), "dd MMM yyyy, HH:mm", { locale: idLocale })
                    : format(new Date(), "dd MMM yyyy, HH:mm", { locale: idLocale })}
                </div>
              </div>
            </div>
            <button
              onClick={resetScanner}
              className="mt-8 px-6 py-3 min-h-[44px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-2 transition-colors w-full max-w-sm justify-center"
            >
              <Scan className="w-5 h-5" />
              Scan Peserta Berikutnya
            </button>
          </div>
        )}

        {/* ── Error ── */}
        {errorData && !checkInMutation.isPending && (
          <div
            className={`${
              errorData.isDuplicate
                ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50"
                : "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/50"
            } border rounded-2xl p-6 md:p-8 shadow-sm flex flex-col items-center text-center`}
          >
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                errorData.isDuplicate
                  ? "bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400"
                  : "bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400"
              }`}
            >
              {errorData.isDuplicate ? <AlertCircle className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
            </div>
            <h2
              className={`text-xl font-bold mb-2 ${
                errorData.isDuplicate ? "text-amber-700 dark:text-amber-400" : "text-rose-700 dark:text-rose-400"
              }`}
            >
              {errorData.isDuplicate ? "Sudah Check-in" : "Check-in Gagal"}
            </h2>
            <p className="pg-text font-medium mb-6">{errorData.message}</p>
            <button
              onClick={resetScanner}
              className={`px-6 py-3 min-h-[44px] font-bold rounded-xl flex items-center gap-2 transition-colors w-full max-w-sm justify-center text-white ${
                errorData.isDuplicate
                  ? "bg-amber-600 hover:bg-amber-700"
                  : "bg-rose-600 hover:bg-rose-700"
              }`}
            >
              <Scan className="w-5 h-5" />
              Coba Scan Ulang
            </button>
          </div>
        )}

        {/* ── Scanner panel ── */}
        {showScannerPanel && (
          <div className="space-y-4">
            {/* Camera selection */}
            {cameras.length > 1 && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                <label className="text-xs font-semibold pg-muted mb-2 block">Pilih Kamera</label>
                <select
                  value={selectedCameraId}
                  onChange={(e) => {
                    setSelectedCameraId(e.target.value);
                    // If scanner is running, restart with new camera
                    if (scannerActive) {
                      stopScanner().then(() => {
                        setTimeout(() => startScanner(), 200);
                      });
                    }
                  }}
                  className="w-full min-h-[44px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm pg-text focus:outline-none focus:border-blue-600"
                >
                  {cameras.map((cam) => (
                    <option key={cam.id} value={cam.id}>
                      {cam.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* QR reader container — Html5Qrcode mounts the video element here */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              {/* The div that Html5Qrcode will mount into */}
              <div
                id={scannerContainerId}
                className="w-full"
                style={{ minHeight: scannerActive ? "320px" : "0px" }}
              />

              {/* Camera error message */}
              {cameraError && (
                <div className="p-4 flex items-start gap-3 bg-rose-50 dark:bg-rose-950/30 border-t border-rose-200 dark:border-rose-800/50">
                  <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-rose-700 dark:text-rose-400">{cameraError}</p>
                </div>
              )}

              {/* Start / Stop controls */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex gap-3 justify-center">
                {!scannerActive ? (
                  <button
                    onClick={startScanner}
                    className="flex items-center gap-2 px-6 py-2.5 min-h-[44px] bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors text-sm"
                  >
                    <Camera className="w-4 h-4" />
                    Mulai Scan
                  </button>
                ) : (
                  <button
                    onClick={stopScanner}
                    className="flex items-center gap-2 px-6 py-2.5 min-h-[44px] bg-slate-600 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors text-sm"
                  >
                    <CameraOff className="w-4 h-4" />
                    Hentikan Scan
                  </button>
                )}
              </div>
            </div>

            {/* Manual input */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold pg-text mb-4 text-center">Atau masukkan secara manual</h3>
              <form onSubmit={handleManualSubmit} className="flex gap-2 max-w-sm mx-auto">
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Contoh: MK-A302-1CE9"
                  className="flex-1 min-h-[44px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm pg-text focus:outline-none focus:border-blue-600 font-mono"
                />
                <button
                  type="submit"
                  disabled={!manualInput.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2.5 min-h-[44px] min-w-[44px] rounded-xl font-bold flex items-center justify-center transition-colors"
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminCheckInPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <CheckInContent />
    </Suspense>
  );
}
