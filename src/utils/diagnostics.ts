// Diagnostics utility to track app performance and issues

export class AppDiagnostics {
  private static instance: AppDiagnostics;
  private dataLoadCalls: Map<string, number> = new Map();
  private navigationHistory: Array<{ screen: string; timestamp: number }> = [];
  private errorLog: Array<{ error: string; timestamp: number; context?: any }> = [];

  private constructor() {}

  static getInstance(): AppDiagnostics {
    if (!AppDiagnostics.instance) {
      AppDiagnostics.instance = new AppDiagnostics();
    }
    return AppDiagnostics.instance;
  }

  trackDataLoad(action: string) {
    const count = this.dataLoadCalls.get(action) || 0;
    this.dataLoadCalls.set(action, count + 1);
    
    if (count > 3) {
      console.warn(`⚠️ WARNING: ${action} called ${count + 1} times! Possible memory leak or infinite loop.`);
    }
    
    console.log(`📊 Data Load: ${action} (Call #${count + 1})`);
  }

  trackNavigation(screen: string) {
    this.navigationHistory.push({ screen, timestamp: Date.now() });
    
    // Keep only last 20 navigation events
    if (this.navigationHistory.length > 20) {
      this.navigationHistory.shift();
    }
    
    // Check for rapid navigation (possible loop)
    const recentNavs = this.navigationHistory.slice(-5);
    const screens = recentNavs.map(n => n.screen);
    const uniqueScreens = new Set(screens);
    
    if (screens.length >= 5 && uniqueScreens.size === 1) {
      console.error(`🚨 NAVIGATION LOOP DETECTED: Navigating to ${screen} repeatedly!`);
    }
    
    console.log(`🗺️ Navigation: ${screen}`);
  }

  logError(error: any, context?: any) {
    this.errorLog.push({
      error: error.toString(),
      timestamp: Date.now(),
      context
    });
    
    console.error(`❌ Error logged:`, error, context);
  }

  getReport() {
    return {
      dataLoadCalls: Object.fromEntries(this.dataLoadCalls),
      recentNavigation: this.navigationHistory.slice(-10),
      recentErrors: this.errorLog.slice(-10),
      summary: {
        totalDataLoads: Array.from(this.dataLoadCalls.values()).reduce((a, b) => a + b, 0),
        totalNavigations: this.navigationHistory.length,
        totalErrors: this.errorLog.length
      }
    };
  }

  reset() {
    this.dataLoadCalls.clear();
    this.navigationHistory = [];
    this.errorLog = [];
    console.log('🔄 Diagnostics reset');
  }
}

export const diagnostics = AppDiagnostics.getInstance(); 