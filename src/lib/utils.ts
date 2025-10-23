import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatTime = (val: number) => {
  const mins = Math.floor(val / 60);
  const secs = Math.floor(val % 60);
  return `${mins.toString()}:${secs.toString().padStart(2, '0')}`;
};
