/**
 * Saved Filters Utility
 * Manages saved filter presets in localStorage
 */

import type { AdvancedFilters } from "@/components/maintenance/advanced-filters";

export interface SavedFilter {
  id: string;
  name: string;
  filters: AdvancedFilters;
  createdAt: string;
}

const STORAGE_KEY = "maintenance_saved_filters";

/**
 * Get all saved filters
 */
export function getSavedFilters(): SavedFilter[] {
  if (typeof window === "undefined") return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error("Failed to load saved filters:", error);
    return [];
  }
}

/**
 * Save a new filter preset
 */
export function saveFilter(name: string, filters: AdvancedFilters): SavedFilter {
  const savedFilters = getSavedFilters();
  const newFilter: SavedFilter = {
    id: `filter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    filters,
    createdAt: new Date().toISOString(),
  };
  
  savedFilters.push(newFilter);
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedFilters));
  } catch (error) {
    console.error("Failed to save filter:", error);
    throw new Error("Failed to save filter. Storage may be full.");
  }
  
  return newFilter;
}

/**
 * Delete a saved filter
 */
export function deleteFilter(filterId: string): void {
  const savedFilters = getSavedFilters();
  const filtered = savedFilters.filter((f) => f.id !== filterId);
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Failed to delete filter:", error);
    throw new Error("Failed to delete filter.");
  }
}

/**
 * Update a saved filter
 */
export function updateFilter(filterId: string, updates: Partial<SavedFilter>): SavedFilter | null {
  const savedFilters = getSavedFilters();
  const index = savedFilters.findIndex((f) => f.id === filterId);
  
  if (index === -1) return null;
  
  savedFilters[index] = { ...savedFilters[index], ...updates };
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedFilters));
    return savedFilters[index];
  } catch (error) {
    console.error("Failed to update filter:", error);
    throw new Error("Failed to update filter.");
  }
}

