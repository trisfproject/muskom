"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";
import { useCheckIn } from "@/services/attendance/mutations";
import { CheckCircle2, AlertCircle, Scan, Search, RefreshCw, XCircle } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

function CheckInContent() {
  const searchParams = useSearchParams();
  const scanParam = searchParams.get("scan");
  
  const [manualInput, setManualInput] = useState("");
  const [isScanning, setIsScanning] = useState(true);
  
  // Results
  const [successData, setSuccessData] = useState<any>(null);
  const [errorData, setErrorData] = useState<{ message: string; isDuplicate?: boolean } | null>(null);

  const checkInMutation = useCheckIn();
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  // Initialize Scanner
  useEffect(() => {
    if (!isScanning) {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
      return;
    }

    if (!scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
          rememberLastUsedCamera: true
        },
        false
      );

      scannerRef.current.render(onScanSuccess, onScanFailure);
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isScanning]);

  // Handle URL param if passed
  useEffect(() => {
    if (scanParam && !successData && !errorData && !checkInMutation.isPending) {
      handleCheckIn(scanParam);
    }
  }, [scanParam]);

  const onScanSuccess = (decodedText: string, decodedResult: any) => {
    // Expected format: https://.../checkin/MK-XXXX
    const parts = decodedText.split("/checkin/");
    const regNum = parts.length > 1 ? parts[1] : decodedText;
    
    // Stop scanning once successful read
    setIsScanning(false);
    handleCheckIn(regNum);
  };

  const onScanFailure = (error: any) => {
    // Ignore routine scan failures
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    setIsScanning(false);
    handleCheckIn(manualInput.trim());
  };

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
            isDuplicate: true 
          });
        }
      },
      onError: (err: any) => {
        const msg = err?.response?.data?.message || "Terjadi kesalahan sistem";
        setErrorData({ message: msg });
      }
    });
  };

  const resetScanner = () => {
    setSuccessData(null);
    setErrorData(null);
    setManualInput("");
    setIsScanning(true);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold pg-text tracking-tight">QR Check-in</h1>
          <p className="text-sm pg-muted mt-1">
            Scan QR Code peserta atau masukkan nomor registrasi secara manual.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Status Display */}
        {checkInMutation.isPending && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm flex flex-col items-center justify-center text-center">
            <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <h3 className="text-lg font-bold pg-text">Memproses Check-in...</h3>
          </div>
        )}

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
              className="mt-8 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-2 transition-colors w-full max-w-sm justify-center"
            >
              <Scan className="w-5 h-5" />
              Scan Peserta Berikutnya
            </button>
          </div>
        )}

        {errorData && !checkInMutation.isPending && (
          <div className={`${errorData.isDuplicate ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50" : "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/50"} border rounded-2xl p-6 md:p-8 shadow-sm flex flex-col items-center text-center`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${errorData.isDuplicate ? "bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400" : "bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400"}`}>
              {errorData.isDuplicate ? <AlertCircle className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
            </div>
            <h2 className={`text-xl font-bold mb-2 ${errorData.isDuplicate ? "text-amber-700 dark:text-amber-400" : "text-rose-700 dark:text-rose-400"}`}>
              {errorData.isDuplicate ? "Sudah Check-in" : "Check-in Gagal"}
            </h2>
            <p className="pg-text font-medium mb-6">{errorData.message}</p>
            
            <button
              onClick={resetScanner}
              className={`px-6 py-3 font-bold rounded-xl flex items-center gap-2 transition-colors w-full max-w-sm justify-center text-white ${errorData.isDuplicate ? "bg-amber-600 hover:bg-amber-700" : "bg-rose-600 hover:bg-rose-700"}`}
            >
              <Scan className="w-5 h-5" />
              Coba Scan Ulang
            </button>
          </div>
        )}

        {/* Scanner & Manual Input */}
        <div className={`space-y-6 ${(!isScanning && !checkInMutation.isPending && !successData && !errorData) ? 'block' : isScanning ? 'block' : 'hidden'}`}>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-1 overflow-hidden shadow-sm">
            <div id="qr-reader" className="w-full border-none !border-transparent [&>div]:!border-none" />
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold pg-text mb-4 text-center">Atau masukkan secara manual</h3>
            <form onSubmit={handleManualSubmit} className="flex gap-2 max-w-sm mx-auto">
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Contoh: MK-A302-1CE9"
                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm pg-text focus:outline-none focus:border-blue-600 font-mono"
              />
              <button
                type="submit"
                disabled={!manualInput.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl font-bold flex items-center justify-center transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
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
