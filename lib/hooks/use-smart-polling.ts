/**
 * Smart Polling Hook
 * Implements intelligent polling strategies to reduce unnecessary API calls
 */

import { useEffect, useRef, useState } from 'react';

interface SmartPollingOptions {
  /** Initial polling interval in milliseconds */
  initialInterval?: number;
  /** Maximum polling interval in milliseconds */
  maxInterval?: number;
  /** Multiplier for exponential backoff */
  backoffMultiplier?: number;
  /** Whether to stop polling when tab is not visible */
  pauseOnHidden?: boolean;
  /** Whether to use exponential backoff */
  useBackoff?: boolean;
  /** Callback to compare if data has changed */
  hasDataChanged?: (oldData: any, newData: any) => boolean;
}

const DEFAULT_OPTIONS: Required<SmartPollingOptions> = {
  initialInterval: 30000, // 30 seconds
  maxInterval: 300000, // 5 minutes
  backoffMultiplier: 2,
  pauseOnHidden: true,
  useBackoff: true,
  hasDataChanged: (oldData, newData) => JSON.stringify(oldData) !== JSON.stringify(newData),
};

/**
 * Custom hook for smart polling that:
 * - Pauses when tab is hidden
 * - Uses exponential backoff when data doesn't change
 * - Resets interval when data changes
 */
export function useSmartPolling(options: SmartPollingOptions = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const [isVisible, setIsVisible] = useState(true);
  const [currentInterval, setCurrentInterval] = useState(opts.initialInterval);
  const previousDataRef = useRef<any>(null);
  const unchangedCountRef = useRef(0);

  // Track page visibility
  useEffect(() => {
    if (!opts.pauseOnHidden) return;

    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [opts.pauseOnHidden]);

  // Calculate next interval based on data changes
  const updateInterval = (newData: any) => {
    if (!opts.useBackoff) return;

    const hasChanged = opts.hasDataChanged(previousDataRef.current, newData);
    
    if (hasChanged) {
      // Data changed - reset to initial interval
      unchangedCountRef.current = 0;
      setCurrentInterval(opts.initialInterval);
    } else {
      // Data unchanged - increase interval
      unchangedCountRef.current += 1;
      
      if (unchangedCountRef.current >= 2) {
        // After 2 consecutive unchanged responses, start backing off
        const newInterval = Math.min(
          currentInterval * opts.backoffMultiplier,
          opts.maxInterval
        );
        setCurrentInterval(newInterval);
      }
    }
    
    previousDataRef.current = newData;
  };

  // Reset interval to initial value
  const resetInterval = () => {
    unchangedCountRef.current = 0;
    setCurrentInterval(opts.initialInterval);
  };

  return {
    /** Current polling interval in milliseconds */
    refetchInterval: isVisible ? currentInterval : false,
    /** Whether the page is currently visible */
    isVisible,
    /** Current interval value in milliseconds */
    currentInterval,
    /** Update interval based on new data */
    updateInterval,
    /** Reset interval to initial value */
    resetInterval,
    /** Whether polling is currently active */
    isPollingActive: isVisible,
  };
}

/**
 * Hook to get smart polling configuration for React Query
 * Returns refetchInterval that can be directly used in useQuery
 */
export function useSmartPollingConfig(options: SmartPollingOptions = {}) {
  const { refetchInterval, updateInterval } = useSmartPolling(options);
  
  return {
    refetchInterval,
    /** Call this in onSuccess callback with the new data */
    onDataReceived: updateInterval,
  };
}

/**
 * Get refetch interval based on page visibility
 * Simple helper that only pauses on hidden tab
 */
export function useVisibilityAwarePolling(interval: number = 30000) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return isVisible ? interval : false;
}
