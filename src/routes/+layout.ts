// Client-side layout load - no server dependencies
export const prerender = true;
export const ssr = false;

export const load = async () => {
  // Return empty data for static site
  // Authentication will be handled client-side
  return {
    session: null,
    user: null,
  };
};
