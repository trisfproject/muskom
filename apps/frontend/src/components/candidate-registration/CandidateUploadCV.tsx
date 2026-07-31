import { useRef } from 'react';
import { FileText, X, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CandidateUploadCVProps {
  value?: File;
  onChange: (file?: File) => void;
  error?: string;
}

export function CandidateUploadCV({ value, onChange, error }: CandidateUploadCVProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        return; // Validation handled by Zod
      }
      onChange(file);
    }
  };

  const clearFile = () => {
    onChange(undefined);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full">
      {!value ? (
        <div 
          className={cn(
            "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
            error ? "border-red-400 bg-red-50" : "border-slate-300 hover:border-blue-400 hover:bg-blue-50/50 bg-slate-50"
          )}
          onClick={() => fileInputRef.current?.click()}
        >
          <UploadCloud className={cn("h-10 w-10 mx-auto mb-3", error ? "text-red-400" : "text-blue-500")} />
          <p className="text-sm font-semibold text-slate-700 mb-1">Click to upload your CV</p>
          <p className="text-xs text-slate-500">PDF document only, up to 10MB</p>
        </div>
      ) : (
        <div className="border border-green-200 bg-green-50 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="bg-white p-2 rounded shadow-sm border border-green-100">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <div className="truncate">
              <p className="text-sm font-semibold text-slate-900 truncate">{value.name}</p>
              <p className="text-xs text-slate-500">{(value.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
            <Button type="button" className="h-8 bg-transparent border border-slate-300 text-slate-700 hover:bg-slate-100" onClick={() => fileInputRef.current?.click()}>
              Replace
            </Button>
            <Button type="button" className="h-8 w-8 bg-transparent text-slate-400 hover:text-red-600 shadow-none hover:bg-transparent" onClick={clearFile}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf"
        className="hidden"
      />
      
      {error && <p className="text-red-500 text-sm mt-2 font-medium">{error}</p>}
    </div>
  );
}
