/**
 * Hierarchy Service - Local Storage Only
 * Supabase has been removed, using MongoDB backend instead.
 * Hierarchy data is stored in localStorage.
 */

/**
 * Save hierarchy data (stub - hierarchy is saved directly in localStorage by the component)
 */
export const saveHierarchyToSupabase = async (hierarchy, employees) => {
  // No-op: Hierarchy is saved to localStorage directly in the Hierarchy component
  console.log('Hierarchy saved to localStorage');
  return true;
};

/**
 * Load hierarchy data (stub - returns null to use localStorage fallback)
 */
export const loadHierarchyFromSupabase = async () => {
  // Return null to trigger localStorage fallback in the component
  return null;
};

/**
 * Delete hierarchy data (stub)
 */
export const deleteHierarchyFromSupabase = async () => {
  // No-op: Deletion is handled in localStorage directly
  console.log('Hierarchy deletion handled in localStorage');
  return true;
};
