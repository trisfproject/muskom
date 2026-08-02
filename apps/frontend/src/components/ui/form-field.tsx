import React from "react";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({ 
  label, 
  required, 
  error, 
  description, 
  children, 
  className 
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="block text-sm font-medium text-slate-300">
        {label}
        {required && <span className="text-rose-500 ml-1">*</span>}
      </label>
      
      {children}
      
      {description && !error && (
        <p className="text-xs text-slate-500 mt-1">{description}</p>
      )}
      
      {error && (
        <p className="text-xs text-rose-500 mt-1 font-medium">{error}</p>
      )}
    </div>
  );
}
