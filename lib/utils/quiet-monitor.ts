/**
 * Quiet API Monitor - Non-intrusive monitoring utility
 * Only logs when you explicitly ask for it
 */

import { apiCallMonitor } from './api-monitor';

let autoLogInterval: NodeJS.Timeout | null = null;

/**
 * Setup API monitor commands in console
 * These won't log anything until you call them
 */
export function setupQuietMonitor() {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
    return;
  }

  // Only initialize once
  if ((window as any).__quietMonitorSetup) return;
  (window as any).__quietMonitorSetup = true;

  // Expose clean commands
  (window as any).api = {
    /**
     * Show current statistics
     */
    stats: () => {
      apiCallMonitor.printStats();
    },

    /**
     * Show warnings
     */
    warnings: () => {
      const warnings = apiCallMonitor.getWarnings();
      if (warnings.length === 0) {
        console.log('✅ No API warnings - everything looks good!');
      } else {
        console.group('⚠️ API Call Warnings');
        warnings.forEach(w => console.warn(w));
        console.groupEnd();
      }
    },

    /**
     * Get summary without logging
     */
    summary: () => {
      const stats = apiCallMonitor.getStats();
      const totalCalls = stats.reduce((sum, s) => sum + s.callCount, 0);
      const pollingQueries = stats.filter(s => s.isPolling).length;
      
      return {
        totalCalls,
        uniqueEndpoints: stats.length,
        pollingQueries,
        manualQueries: stats.length - pollingQueries,
      };
    },

    /**
     * Reset all counters
     */
    reset: () => {
      apiCallMonitor.reset();
      console.log('🔄 API monitor reset');
    },

    /**
     * Start auto-logging every N seconds
     */
    watch: (intervalSeconds = 30) => {
      if (autoLogInterval) {
        clearInterval(autoLogInterval);
      }
      
      console.log(`👀 Watching API calls every ${intervalSeconds}s. Call api.stopWatch() to stop.`);
      
      autoLogInterval = setInterval(() => {
        const summary = (window as any).api.summary();
        console.log(`📊 [${new Date().toLocaleTimeString()}] API Stats:`, summary);
        
        const warnings = apiCallMonitor.getWarnings();
        if (warnings.length > 0) {
          console.warn(`⚠️ ${warnings.length} warning(s)`);
        }
      }, intervalSeconds * 1000);
    },

    /**
     * Stop auto-logging
     */
    stopWatch: () => {
      if (autoLogInterval) {
        clearInterval(autoLogInterval);
        autoLogInterval = null;
        console.log('⏸️ Stopped watching API calls');
      }
    },

    /**
     * Show help
     */
    help: () => {
      console.log(`
🔍 API Monitor Commands:

  api.stats()       - Show detailed statistics
  api.warnings()    - Show any warnings
  api.summary()     - Get quick summary
  api.reset()       - Reset all counters
  api.watch(30)     - Auto-log every 30 seconds
  api.stopWatch()   - Stop auto-logging
  api.help()        - Show this help

Example:
  api.watch(10)     - Watch every 10 seconds
  api.stats()       - View current stats
  api.stopWatch()   - Stop watching
      `);
    },
  };

  // Silent initialization - only show help on first load
  const hasShownWelcome = sessionStorage.getItem('apiMonitorWelcome');
  if (!hasShownWelcome) {
    console.log('💡 Type api.help() to see API monitoring commands');
    sessionStorage.setItem('apiMonitorWelcome', 'true');
  }
}

/**
 * Cleanup on page unload
 */
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (autoLogInterval) {
      clearInterval(autoLogInterval);
    }
  });
}
