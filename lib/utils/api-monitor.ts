/**
 * API Call Monitor
 * Development utility to track and log API polling patterns
 */

interface ApiCallStats {
  queryKey: string;
  callCount: number;
  lastCallTime: number;
  averageInterval: number;
  isPolling: boolean;
}

class ApiCallMonitor {
  private stats: Map<string, ApiCallStats> = new Map();
  private enabled: boolean = process.env.NODE_ENV === 'development';

  /**
   * Record an API call
   */
  recordCall(queryKey: string | readonly unknown[]) {
    if (!this.enabled) return;

    const key = JSON.stringify(queryKey);
    const now = Date.now();
    const existing = this.stats.get(key);

    if (existing) {
      const interval = now - existing.lastCallTime;
      const avgInterval = (existing.averageInterval * existing.callCount + interval) / (existing.callCount + 1);
      
      this.stats.set(key, {
        ...existing,
        callCount: existing.callCount + 1,
        lastCallTime: now,
        averageInterval: avgInterval,
      });
    } else {
      this.stats.set(key, {
        queryKey: key,
        callCount: 1,
        lastCallTime: now,
        averageInterval: 0,
        isPolling: false,
      });
    }
  }

  /**
   * Mark a query as using polling
   */
  markAsPolling(queryKey: string | readonly unknown[], interval: number | false) {
    if (!this.enabled) return;

    const key = JSON.stringify(queryKey);
    const existing = this.stats.get(key);

    if (existing) {
      this.stats.set(key, {
        ...existing,
        isPolling: interval !== false,
      });
    }
  }

  /**
   * Get statistics for all queries
   */
  getStats(): ApiCallStats[] {
    return Array.from(this.stats.values());
  }

  /**
   * Get statistics for a specific query
   */
  getQueryStats(queryKey: string | readonly unknown[]): ApiCallStats | undefined {
    const key = JSON.stringify(queryKey);
    return this.stats.get(key);
  }

  /**
   * Print statistics to console
   */
  printStats() {
    if (!this.enabled) return;

    console.group('📊 API Call Statistics');
    
    const stats = this.getStats();
    const totalCalls = stats.reduce((sum, s) => sum + s.callCount, 0);
    
    console.log(`Total API Calls: ${totalCalls}`);
    console.log(`Unique Endpoints: ${stats.length}`);
    console.log('\nPer Query:');
    
    stats
      .sort((a, b) => b.callCount - a.callCount)
      .forEach(stat => {
        const avgIntervalSec = (stat.averageInterval / 1000).toFixed(1);
        const pollStatus = stat.isPolling ? '🔄 Polling' : '📍 Manual';
        
        console.log(`\n${pollStatus} ${stat.queryKey}`);
        console.log(`  Calls: ${stat.callCount}`);
        console.log(`  Avg Interval: ${avgIntervalSec}s`);
        console.log(`  Last Call: ${new Date(stat.lastCallTime).toLocaleTimeString()}`);
      });
    
    console.groupEnd();
  }

  /**
   * Get warnings for queries with excessive polling
   */
  getWarnings(): string[] {
    if (!this.enabled) return [];

    const warnings: string[] = [];
    const stats = this.getStats();

    stats.forEach(stat => {
      // Warn if polling faster than 10 seconds
      if (stat.isPolling && stat.averageInterval < 10000 && stat.callCount > 5) {
        warnings.push(
          `⚠️ ${stat.queryKey} is polling every ${(stat.averageInterval / 1000).toFixed(1)}s. Consider using slower interval.`
        );
      }

      // Warn if too many calls in short time
      if (stat.callCount > 100) {
        warnings.push(
          `⚠️ ${stat.queryKey} has made ${stat.callCount} calls. Consider caching or longer staleTime.`
        );
      }
    });

    return warnings;
  }

  /**
   * Reset all statistics
   */
  reset() {
    this.stats.clear();
  }

  /**
   * Enable/disable monitoring
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }
}

// Singleton instance
export const apiCallMonitor = new ApiCallMonitor();

// Expose to window for debugging
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).apiMonitor = {
    getStats: () => apiCallMonitor.getStats(),
    printStats: () => apiCallMonitor.printStats(),
    getWarnings: () => apiCallMonitor.getWarnings(),
    reset: () => apiCallMonitor.reset(),
    enable: () => apiCallMonitor.setEnabled(true),
    disable: () => apiCallMonitor.setEnabled(false),
  };
  
  // Only log once on initial load
  if (!(window as any).__apiMonitorInitialized) {
    console.log('💡 API Monitor available:');
    console.log('  window.apiMonitor.printStats() - View statistics');
    console.log('  window.apiMonitor.getWarnings() - View warnings');
    console.log('  window.apiMonitor.reset() - Reset counters');
    (window as any).__apiMonitorInitialized = true;
  }
}

/**
 * React Query plugin to automatically track API calls
 */
export function createApiMonitorPlugin() {
  return {
    onFetch: (context: any) => {
      apiCallMonitor.recordCall(context.queryKey);
      apiCallMonitor.markAsPolling(
        context.queryKey,
        context.options.refetchInterval
      );
    },
  };
}

/**
 * Hook to display API call warnings in development
 * Call this manually when you want to check warnings, not automatically
 */
export function useApiCallWarnings(autoLog = false) {
  if (process.env.NODE_ENV !== 'development') return;

  // Only auto-log if explicitly enabled
  if (autoLog && typeof window !== 'undefined') {
    const interval = setInterval(() => {
      const warnings = apiCallMonitor.getWarnings();
      if (warnings.length > 0) {
        console.group('⚠️ API Call Warnings');
        warnings.forEach(w => console.warn(w));
        console.groupEnd();
      }
    }, 60000); // Increased to 60 seconds to reduce noise

    return () => clearInterval(interval);
  }
}
