/**
 * Check if the current device is mobile based on screen width
 */
export function isMobile(): boolean {
  return window.innerWidth <= 767;
}

/**
 * Check if the current device is tablet
 */
export function isTablet(): boolean {
  return window.innerWidth >= 768 && window.innerWidth <= 1024;
}

/**
 * Check if the current device is desktop
 */
export function isDesktop(): boolean {
  return window.innerWidth > 1024;
}

/**
 * Check if the current device is mobile or tablet
 */
export function isMobileOrTablet(): boolean {
  return isMobile() || isTablet();
}

/**
 * Get the current breakpoint
 */
export function getCurrentBreakpoint(): 'mobile' | 'tablet' | 'desktop' {
  if (isMobile()) return 'mobile';
  if (isTablet()) return 'tablet';
  return 'desktop';
}

/**
 * Check if touch is supported
 */
export function isTouchDevice(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// For backward compatibility
export const MobileDetector = {
  isMobile,
  isTablet,
  isDesktop,
  isMobileOrTablet,
  getCurrentBreakpoint,
  isTouchDevice
};