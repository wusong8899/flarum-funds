import app from 'flarum/forum/app';

/**
 * ConfigManager utility for flarum-funds extension
 */
export class ConfigManager {
  private static instance: ConfigManager;

  private constructor() {}

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /**
   * Check if current page is the tags page (main forum page)
   */
  public isTagsPage(): boolean {
    try {
      const routeName = app.current?.get('routeName');
      return routeName === 'index';
    } catch {
      return false;
    }
  }
}