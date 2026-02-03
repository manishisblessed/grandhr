// Supabase has been removed - using MongoDB backend instead
// These are stub exports to prevent import errors in any remaining references

export const supabase = null;

// Helper function to check if user is authenticated (always returns false since Supabase is disabled)
export const isAuthenticated = async () => {
  return false;
};

// Helper function to get current user (always returns null since Supabase is disabled)
export const getCurrentUser = async () => {
  return null;
};
