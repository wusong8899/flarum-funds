/**
 * Helper functions for accessing Flarum model data
 * These handle both Model instances and plain object data
 */

/**
 * Get ID from Flarum model or plain object
 */
export const getId = (obj: any): string | number => {
  return typeof obj.id === 'function' ? obj.id() : obj.id;
};

/**
 * Get attribute value from Flarum model or plain object
 */
export const getAttr = (obj: any, attr: string): any => {
  if (typeof obj[attr] === 'function') {
    return obj[attr]();
  }
  return obj.attributes ? obj.attributes[attr] : obj[attr];
};

/**
 * Get string representation of ID for comparison
 */
export const getIdString = (obj: any): string => {
  return String(getId(obj));
};

/**
 * Find platform by ID with proper type handling
 */
export const findPlatformById = (platforms: any[], platformId: string | number): any => {
  const platformIdStr = String(platformId);
  return platforms.find(p => {
    const pId = getId(p);
    return String(pId) === platformIdStr;
  });
};

/**
 * Safely extract and convert date attribute to Date object
 */
export const getDateFromAttr = (obj: any, attr: string): Date => {
  const dateStr = getAttr(obj, attr);
  return dateStr ? new Date(dateStr) : new Date();
};