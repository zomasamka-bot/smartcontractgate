// Pi SDK Initialization
// This script ensures the Pi SDK is loaded before the app initializes

(function() {
  console.log('[SmartContract Control Gate] Checking for Pi SDK...');
  
  if (typeof window !== 'undefined') {
    // Check if running in Pi Browser
    if (window.Pi) {
      console.log('[SmartContract Control Gate] Pi SDK detected');
    } else {
      console.log('[SmartContract Control Gate] Not running in Pi Browser - wallet features will be disabled');
    }
  }
})();
