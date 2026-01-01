// lib/utils.ts


// Simple utility function for conditional className merging
export function cn(...classes: (string | boolean | undefined | null)[]) {
    return classes.filter(Boolean).join(' ');
}

// Helper for random skeleton widths
export function randomWidth(min: number = 60, max: number = 100): string {
    return `${Math.floor(Math.random() * (max - min) + min)}px`;
}