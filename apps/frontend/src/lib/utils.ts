import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normalizes a phone number to standard WhatsApp format (628...).
 * Strips non-digit characters and ensures the correct country code prefix.
 */
export function formatWhatsAppNumber(phone?: string): string | null {
  if (!phone) return null;
  // Strip all non-digit characters
  let digits = phone.replace(/\D/g, "");
  
  if (digits.length < 9) return null; // Too short to be a valid number

  if (digits.startsWith("08")) {
    digits = "62" + digits.substring(1);
  } else if (digits.startsWith("8")) {
    digits = "62" + digits;
  }
  
  return digits;
}
