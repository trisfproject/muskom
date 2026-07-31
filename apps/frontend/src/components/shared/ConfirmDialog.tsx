import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
        <h2 className="text-lg font-bold mb-2">{title}</h2>
        <div className="text-sm text-slate-500 mb-6">
          {description}
        </div>
        <div className="flex justify-end gap-2">
          <Button 
            className="bg-transparent text-slate-900 border border-slate-200 hover:bg-slate-100" 
            onClick={onCancel} 
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button 
            className="bg-blue-600 text-white hover:bg-blue-700" 
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
