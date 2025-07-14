import 'server-only';
import { cache } from 'react';

// Define the structure of your dictionary
type Dictionary = {
    [key: string]: string;
};

const dictionaries: { [key: string]: () => Promise<Dictionary> } = {
    en: () => import('../i18n/locales/en.json').then((module) => module.default as unknown as Dictionary),
    vi: () => import('../i18n/locales/vi.json').then((module) => module.default as unknown as Dictionary),
};

export const getDictionary = cache(async (locale: string): Promise<Dictionary> => {
    const loader = dictionaries[locale] || dictionaries.en;
    return loader();
});

// Helper function to get a flat key value or return the key (SERVER-SIDE)
export const t = (dict: Dictionary, key: string): string => {
    return dict[key] || key;
}; 