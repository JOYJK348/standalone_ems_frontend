import api from '@/lib/api';

export interface BrandingSettings {
    platform_logo_url: string;
    platform_favicon_url: string;
    platform_tagline: string;
    system_name: string;
}

class BrandingService {
    private static instance: BrandingService;
    private cache: BrandingSettings | null = null;
    private cacheTime: number = 0;
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    private constructor() { }

    static getInstance(): BrandingService {
        if (!BrandingService.instance) {
            BrandingService.instance = new BrandingService();
        }
        return BrandingService.instance;
    }

    /**
     * Fetch branding settings from global settings
     */
    async getBrandingSettings(): Promise<BrandingSettings> {
        // Return cached data if still valid
        if (this.cache && (Date.now() - this.cacheTime) < this.CACHE_DURATION) {
            return this.cache;
        }

        try {
            const response = await api.get('/core/global-settings');
            const settings = response.data.data;

            // Extract branding-related settings
            const branding: BrandingSettings = {
                platform_logo_url: this.getSettingValue(settings, 'platform_logo_url', '/logo.svg'),
                platform_favicon_url: this.getSettingValue(settings, 'platform_favicon_url', '/favicon.ico'),
                platform_tagline: this.getSettingValue(settings, 'platform_tagline', 'Advanced Enterprise Architecture'),
                system_name: this.getSettingValue(settings, 'system_name', 'Agaran EMS')
            };

            // Update cache
            this.cache = branding;
            this.cacheTime = Date.now();

            // Update favicon dynamically
            this.updateFavicon(branding.platform_favicon_url);

            return branding;
        } catch (error) {
            console.error('[BrandingService] Failed to fetch branding settings:', error);

            // Return defaults on error
            return {
                platform_logo_url: '/logo.svg',
                platform_favicon_url: '/favicon.ico',
                platform_tagline: 'Advanced Enterprise Architecture',
                system_name: 'Agaran EMS'
            };
        }
    }

    /**
     * Get a specific setting value from the settings array
     */
    private getSettingValue(settings: any[], key: string, defaultValue: string): string {
        const setting = settings.find(s => s.key === key);
        return setting?.value || defaultValue;
    }

    /**
     * Dynamically update the favicon
     */
    private updateFavicon(faviconUrl: string) {
        try {
            // Only run in browser environment
            if (typeof window === 'undefined' || typeof document === 'undefined') {
                return;
            }

            // Remove existing favicon links safely
            const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
            existingFavicons.forEach(link => {
                try {
                    if (link.parentNode) {
                        link.parentNode.removeChild(link);
                    }
                } catch (e) {
                    // Silently ignore if already removed
                }
            });

            // Add new favicon
            const link = document.createElement('link');
            link.rel = 'icon';
            link.type = 'image/x-icon';
            link.href = faviconUrl;

            // Ensure head exists before appending
            if (document.head) {
                document.head.appendChild(link);
                console.log(`[BrandingService] Favicon updated: ${faviconUrl}`);
            }
        } catch (error) {
            // Silently fail - favicon update is not critical
            console.warn('[BrandingService] Failed to update favicon:', error);
        }
    }

    /**
     * Update branding settings (Platform Admin only)
     */
    async updateBrandingSettings(settings: Partial<BrandingSettings>): Promise<boolean> {
        try {
            const settingsArray = Object.entries(settings).map(([key, value]) => ({
                group: 'BRANDING',
                key,
                value,
                is_system_setting: true
            }));

            await api.post('/core/global-settings', settingsArray);

            // Clear cache to force refresh
            this.cache = null;
            this.cacheTime = 0;

            return true;
        } catch (error) {
            console.error('[BrandingService] Failed to update branding settings:', error);
            return false;
        }
    }

    /**
     * Clear cache (useful for testing)
     */
    clearCache() {
        this.cache = null;
        this.cacheTime = 0;
    }
}

export const brandingService = BrandingService.getInstance();
