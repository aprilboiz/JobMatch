"use client";

type Dictionary = {
    [key: string]: string;
};

// Helper function to get a flat key value or return the key (CLIENT-SIDE)
export const t = (dict: Dictionary, key: string): string => {
    if (!dict || typeof dict !== 'object') {
        console.warn('Dictionary is not an object:', dict);
        return key;
    }

    return dict[key] || key;
}; 