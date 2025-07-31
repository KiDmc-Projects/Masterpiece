// Client-side auth callback - redirect to home
export const prerender = true;
export const ssr = false;

export const load = async () => {
  // For static site, just redirect to home
  // Real auth will be handled client-side
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
  
  return {};
};