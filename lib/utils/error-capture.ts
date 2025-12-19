/**
 * Error Capture Utility
 * Captures console errors and warnings, preventing them from disappearing
 */

interface CapturedMessage {
  type: 'error' | 'warn' | 'log';
  timestamp: Date;
  message: string;
  stack?: string;
  args: any[];
}

class ErrorCapture {
  private messages: CapturedMessage[] = [];
  private maxMessages = 100;
  private originalConsole: {
    error: typeof console.error;
    warn: typeof console.warn;
    log: typeof console.log;
  };
  private isCapturing = false;

  constructor() {
    this.originalConsole = {
      error: console.error.bind(console),
      warn: console.warn.bind(console),
      log: console.log.bind(console),
    };
  }

  /**
   * Start capturing console messages
   */
  start() {
    if (this.isCapturing) return;
    this.isCapturing = true;

    const self = this;

    // Intercept console.error
    console.error = function (...args: any[]) {
      self.capture('error', args);
      self.originalConsole.error(...args);
    };

    // Intercept console.warn
    console.warn = function (...args: any[]) {
      self.capture('warn', args);
      self.originalConsole.warn(...args);
    };

    console.log('🎯 Error capture started. Type errors.show() to view captured errors');
  }

  /**
   * Stop capturing console messages
   */
  stop() {
    if (!this.isCapturing) return;
    this.isCapturing = false;

    console.error = this.originalConsole.error;
    console.warn = this.originalConsole.warn;
    console.log = this.originalConsole.log;

    console.log('⏸️ Error capture stopped');
  }

  /**
   * Capture a console message
   */
  private capture(type: 'error' | 'warn' | 'log', args: any[]) {
    const message: CapturedMessage = {
      type,
      timestamp: new Date(),
      message: args.map(arg => {
        if (typeof arg === 'string') return arg;
        if (arg instanceof Error) return arg.message;
        try {
          return JSON.stringify(arg);
        } catch {
          return String(arg);
        }
      }).join(' '),
      args,
    };

    // Capture stack trace for errors
    if (type === 'error' && args[0] instanceof Error) {
      message.stack = args[0].stack;
    }

    this.messages.push(message);

    // Keep only recent messages
    if (this.messages.length > this.maxMessages) {
      this.messages.shift();
    }
  }

  /**
   * Get all captured messages
   */
  getAll() {
    return [...this.messages];
  }

  /**
   * Get errors only
   */
  getErrors() {
    return this.messages.filter(m => m.type === 'error');
  }

  /**
   * Get warnings only
   */
  getWarnings() {
    return this.messages.filter(m => m.type === 'warn');
  }

  /**
   * Show captured messages in console (they stay visible)
   */
  show(type?: 'error' | 'warn' | 'all') {
    const messages = type === 'error' ? this.getErrors() :
                     type === 'warn' ? this.getWarnings() :
                     this.getAll();

    if (messages.length === 0) {
      console.log('✅ No captured messages');
      return;
    }

    console.group(`📋 Captured Messages (${messages.length})`);
    
    messages.forEach((msg, index) => {
      const time = msg.timestamp.toLocaleTimeString();
      const icon = msg.type === 'error' ? '❌' : msg.type === 'warn' ? '⚠️' : 'ℹ️';
      
      console.group(`${icon} [${time}] ${msg.type.toUpperCase()}`);
      console.log(msg.message);
      if (msg.stack) {
        console.log('Stack:', msg.stack);
      }
      console.groupEnd();
    });
    
    console.groupEnd();
  }

  /**
   * Show only unique errors (deduplicated)
   */
  showUnique() {
    const messages = this.getAll();
    const unique = new Map<string, CapturedMessage>();

    messages.forEach(msg => {
      if (!unique.has(msg.message)) {
        unique.set(msg.message, msg);
      }
    });

    console.group(`📋 Unique Messages (${unique.size})`);
    
    Array.from(unique.values()).forEach(msg => {
      const icon = msg.type === 'error' ? '❌' : msg.type === 'warn' ? '⚠️' : 'ℹ️';
      console.log(`${icon} ${msg.message}`);
    });
    
    console.groupEnd();
  }

  /**
   * Clear captured messages
   */
  clear() {
    this.messages = [];
    console.log('🗑️ Captured messages cleared');
  }

  /**
   * Get recent errors (last N)
   */
  getRecent(count = 10) {
    return this.messages.slice(-count);
  }

  /**
   * Search for specific error
   */
  search(keyword: string) {
    return this.messages.filter(m => 
      m.message.toLowerCase().includes(keyword.toLowerCase())
    );
  }
}

// Singleton instance
const errorCapture = new ErrorCapture();

// Auto-start in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  errorCapture.start();
}

// Expose to window
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).errors = {
    show: (type?: 'error' | 'warn' | 'all') => errorCapture.show(type),
    showUnique: () => errorCapture.showUnique(),
    errors: () => errorCapture.getErrors(),
    warnings: () => errorCapture.getWarnings(),
    all: () => errorCapture.getAll(),
    clear: () => errorCapture.clear(),
    search: (keyword: string) => errorCapture.search(keyword),
    recent: (count?: number) => errorCapture.getRecent(count),
    start: () => errorCapture.start(),
    stop: () => errorCapture.stop(),
    help: () => {
      console.log(`
🎯 Error Capture Commands:

  errors.show()           - Show all captured errors/warnings
  errors.show('error')    - Show only errors
  errors.show('warn')     - Show only warnings
  errors.showUnique()     - Show unique messages (deduplicated)
  errors.errors()         - Get error objects
  errors.warnings()       - Get warning objects
  errors.search('text')   - Search for specific error
  errors.recent(10)       - Show last 10 messages
  errors.clear()          - Clear captured messages
  errors.stop()           - Stop capturing
  errors.start()          - Start capturing again

The errors stay visible even as the console updates!
      `);
    }
  };

  // Show welcome message only once per session
  if (!sessionStorage.getItem('errorCaptureWelcome')) {
    console.log('🎯 Error Capture Active! Type errors.help() for commands');
    sessionStorage.setItem('errorCaptureWelcome', 'true');
  }
}

export { errorCapture };
