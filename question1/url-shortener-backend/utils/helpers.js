// Helper functions
export function isAlphanumeric(str) {
  return /^[a-zA-Z0-9]+$/.test(str);
}

export function getExpiry(minutes) {
  return new Date(Date.now() + minutes * 60000);
}
