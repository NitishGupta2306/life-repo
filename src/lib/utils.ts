import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatLevel(level: number): string {
  return `Level ${level}`
}

export function formatXP(xp: number): string {
  if (xp >= 1000000) return `${(xp / 1000000).toFixed(1)}M XP`
  if (xp >= 1000) return `${(xp / 1000).toFixed(1)}K XP`
  return `${xp} XP`
}

export function calculateXPProgress(currentXP: number, level: number): { current: number; needed: number; percentage: number } {
  const xpForLevel = level * 1000 // Simple formula: level * 1000 XP needed for next level
  const currentLevelXP = currentXP % 1000
  const neededXP = xpForLevel - currentLevelXP
  const percentage = (currentLevelXP / xpForLevel) * 100
  
  return {
    current: currentLevelXP,
    needed: neededXP,
    percentage: Math.min(percentage, 100)
  }
}

export function formatResourceValue(value: number, max: number = 100): string {
  return `${value}/${max}`
}

export function getResourceColor(value: number, max: number = 100): string {
  const percentage = (value / max) * 100
  if (percentage >= 80) return 'text-green-600'
  if (percentage >= 60) return 'text-yellow-600'
  if (percentage >= 40) return 'text-orange-600'
  return 'text-red-600'
}