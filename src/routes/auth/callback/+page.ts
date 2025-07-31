// Client-side auth callback
export const prerender = true;
export const ssr = false;

export const load = async () => {
  // Let the Svelte component handle the auth callback
  return {};
};