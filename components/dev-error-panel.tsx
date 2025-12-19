/**
 * Development Error Panel
 * Shows captured errors in the UI so you can read them
 */

'use client';

import { useEffect, useState } from 'react';
import { X, AlertCircle, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

interface CapturedError {
  type: 'error' | 'warn';
  timestamp: Date;
  message: string;
  count: number;
}

export function DevErrorPanel() {
  const [errors, setErrors] = useState<CapturedError[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    // Check for errors every 2 seconds
    const interval = setInterval(() => {
      if (typeof window !== 'undefined' && (window as any).errors) {
        const capturedErrors = (window as any).errors.errors();
        const capturedWarnings = (window as any).errors.warnings();
        
        const allMessages = [
          ...capturedErrors.map((e: any) => ({ ...e, type: 'error' as const })),
          ...capturedWarnings.map((w: any) => ({ ...w, type: 'warn' as const }))
        ];

        // Deduplicate and count
        const grouped = new Map<string, CapturedError>();
        allMessages.forEach((msg: any) => {
          const existing = grouped.get(msg.message);
          if (existing) {
            existing.count++;
          } else {
            grouped.set(msg.message, {
              type: msg.type,
              timestamp: new Date(msg.timestamp),
              message: msg.message,
              count: 1,
            });
          }
        });

        setErrors(Array.from(grouped.values()));
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  if (process.env.NODE_ENV !== 'development' || errors.length === 0 || !isVisible) {
    return null;
  }

  const errorCount = errors.filter(e => e.type === 'error').length;
  const warnCount = errors.filter(e => e.type === 'warn').length;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] max-w-md">
      <div className="bg-red-50 dark:bg-red-950 border-2 border-red-500 rounded-lg shadow-2xl">
        {/* Header */}
        <div 
          className="flex items-center justify-between p-3 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="font-bold text-red-900 dark:text-red-100">
              Development Errors
            </span>
            <span className="text-sm text-red-700 dark:text-red-300">
              {errorCount > 0 && `${errorCount} error${errorCount !== 1 ? 's' : ''}`}
              {errorCount > 0 && warnCount > 0 && ', '}
              {warnCount > 0 && `${warnCount} warning${warnCount !== 1 ? 's' : ''}`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-red-700" />
            ) : (
              <ChevronUp className="h-4 w-4 text-red-700" />
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsVisible(false);
              }}
              className="hover:bg-red-200 dark:hover:bg-red-800 rounded p-1"
            >
              <X className="h-4 w-4 text-red-700 dark:text-red-300" />
            </button>
          </div>
        </div>

        {/* Error List */}
        {isExpanded && (
          <div className="max-h-96 overflow-y-auto border-t border-red-300 dark:border-red-700">
            {errors.map((error, index) => (
              <div
                key={index}
                className="p-3 border-b border-red-200 dark:border-red-800 last:border-b-0 hover:bg-red-100 dark:hover:bg-red-900"
              >
                <div className="flex items-start gap-2">
                  {error.type === 'error' ? (
                    <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-red-700 dark:text-red-300">
                        {error.timestamp.toLocaleTimeString()}
                      </span>
                      {error.count > 1 && (
                        <span className="text-xs bg-red-200 dark:bg-red-800 text-red-900 dark:text-red-100 px-1.5 py-0.5 rounded">
                          ×{error.count}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-red-900 dark:text-red-100 break-words font-mono">
                      {error.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        {isExpanded && (
          <div className="p-2 border-t border-red-300 dark:border-red-700 bg-red-100 dark:bg-red-900">
            <p className="text-xs text-red-700 dark:text-red-300 text-center">
              Console commands: <code className="bg-red-200 dark:bg-red-800 px-1 rounded">errors.show()</code> | <code className="bg-red-200 dark:bg-red-800 px-1 rounded">errors.clear()</code>
            </p>
          </div>
        )}
      </div>

      {/* Show/Hide button when panel is hidden */}
      {!isVisible && (
        <button
          onClick={() => setIsVisible(true)}
          className="bg-red-500 hover:bg-red-600 text-white rounded-full p-3 shadow-lg"
          title="Show error panel"
        >
          <AlertCircle className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
