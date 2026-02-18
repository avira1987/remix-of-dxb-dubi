// Debug logging helper
export const debugLog = (location: string, message: string, data: any, hypothesisId: string) => {
  const logData = {
    location,
    message,
    data,
    timestamp: Date.now(),
    sessionId: 'debug-session',
    runId: 'run1',
    hypothesisId
  };
  
  // Always log to console for production debugging
  console.log('[DEBUG]', logData);
  
  // Try to send to debug server (only works in localhost)
  try {
    fetch('http://127.0.0.1:7242/ingest/eb6361b3-d1c8-4192-ba81-a2aae43466fb', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logData)
    }).catch(() => {});
  } catch (e) {
    // Ignore fetch errors
  }
};
