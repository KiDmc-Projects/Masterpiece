import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Create language store with default 'ru' language
function createLanguageStore() {
    const { subscribe, set, update } = writable('ru');

    return {
        subscribe,
        set,
        update,
        // Initialize language from localStorage or default to 'ru'
        init: () => {
            if (browser) {
                const saved = localStorage.getItem('quiz-language');
                if (saved && (saved === 'ru' || saved === 'en')) {
                    set(saved);
                }
            }
        },
        // Save language to localStorage
        setLanguage: (lang) => {
            set(lang);
            if (browser) {
                localStorage.setItem('quiz-language', lang);
            }
        }
    };
}

export const language = createLanguageStore();