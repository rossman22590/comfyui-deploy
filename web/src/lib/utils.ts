import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isComfyUIWorkflow(text: string): boolean {
  try {
    const json = JSON.parse(text);
    return (
      typeof json === 'object' &&
      json !== null &&
      json.hasOwnProperty('nodes') &&
      json.hasOwnProperty('last_node_id')
    );
  } catch (e) {
    return false;
  }
}

// Add the generateUniqueId function
export function generateUniqueId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

// Format time for display
export function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
