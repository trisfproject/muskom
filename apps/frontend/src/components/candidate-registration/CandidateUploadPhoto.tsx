import { useState, useRef } from 'react';
import { Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CandidateUploadPhotoProps {
  value?: File;
  onChange: (file?: File) => void;
  error?: string;
}

export function CandidateUploadPhoto({ onChange, error }: CandidateUploadPhotoProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        return; // Validation handled by Zod in parent
      }
      onChange(file);
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };

  const clearFile = () => {
    onChange(undefined);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col items-center">
      <div 
        className={cn(
          "relative w-32 h-40 rounded-xl overflow-hidden border-2 border-dashed flex items-center justify-center bg-slate-50 transition-colors",
          error ? "border-red-400 bg-red-50" : "border-slate-300 hover:border-blue-400 hover:bg-blue-50/50 cursor-pointer"
        )}
        onClick={() => !preview && fileInputRef.current?.click()}
      >
        {preview ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <Button type="button" className="rounded-full h-8 w-8 bg-red-500 text-white hover:bg-red-600" onClick={(e) => { e.stopPropagation(); clearFile(); }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center p-2">
            <Camera className={cn("h-8 w-8 mx-auto mb-2", error ? "text-red-400" : "text-slate-400")} />
            <span className="text-xs font-medium text-slate-500">Upload Photo</span>
          </div>
        )}
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".jpg,.jpeg,.png,.webp"
        className="hidden"
      />
      
      {error && <p className="text-red-500 text-xs mt-2 font-medium">{error}</p>}
      
      {!preview && !error && (
        <p className="text-slate-400 text-xs mt-2 text-center">JPG or PNG<br/>Max 5MB</p>
      )}
      {preview && (
        <Button type="button" className="mt-2 h-auto p-0 text-sm bg-transparent text-slate-500 hover:text-slate-700 underline shadow-none" onClick={() => fileInputRef.current?.click()}>
          Replace Photo
        </Button>
      )}
    </div>
  );
}
