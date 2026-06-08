import { useState, useEffect } from 'react';
import { platformService } from '@/services/platformService';

export interface BrandingData {
    logo_url: string;
    favicon_url: string;
    primary_color: string;
    secondary_color: string;
    name: string;
    tagline?: string;
}

export function useBranding(companyId?: string | number) {
    // Try to hydrate from localStorage for instantaneous UI consistency
    const getInitialBranding = () => {
        if (typeof window !== 'undefined') {
            const cached = localStorage.getItem(`branding_${companyId || 'platform'}`);
            if (cached) {
                try {
                    return JSON.parse(cached);
                } catch (e) { }
            }
        }
        return {
            logo_url: '',
            favicon_url: '/favicon.ico',
            primary_color: '#0066FF', // Standard Durkkas Blue as fallback
            secondary_color: '#0052CC',
            name: 'Durkkas',
            tagline: 'Advanced Enterprise Architecture'
        };
    };

    const [branding, setBranding] = useState<BrandingData>(getInitialBranding());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Clear mismatched local cache if context changes
        const currentContext = companyId ? `company_${companyId}` : 'platform';
        const cachedContext = localStorage.getItem('last_branding_context');

        if (cachedContext && cachedContext !== currentContext) {
            console.log(`[useBranding] Context changed from ${cachedContext} to ${currentContext}, clearing local cache.`);
        }

        localStorage.setItem('last_branding_context', currentContext);
        loadBranding();
    }, [companyId]);

    const loadBranding = async () => {
        setLoading(true);
        try {
            let data: any = null;

            if (companyId) {
                // Fetch Company Branding
                const companyBranding = await platformService.getCompanyBranding(companyId.toString());
                if (companyBranding && companyBranding.primary_color) {
                    data = {
                        logo_url: companyBranding.logo_url,
                        favicon_url: companyBranding.favicon_url,
                        primary_color: companyBranding.primary_color,
                        secondary_color: companyBranding.secondary_color,
                        name: 'Workspace',
                        tagline: companyBranding.footer_text
                    };
                }
            }

            // Fallback to Platform Branding if no company branding or not in company context
            if (!data) {
                const platformBranding = await platformService.getPlatformBranding();
                if (platformBranding) {
                    data = {
                        logo_url: platformBranding.logo_url,
                        favicon_url: platformBranding.favicon_url,
                        primary_color: platformBranding.primary_color,
                        secondary_color: platformBranding.secondary_color,
                        name: platformBranding.platform_name || 'Durkkas',
                        tagline: platformBranding.tagline
                    };
                }
            }

            if (data) {
                // Remove empty keys to allow defaults
                Object.keys(data).forEach(key => {
                    if (data[key] === null || data[key] === undefined || data[key] === '') {
                        delete data[key];
                    }
                });

                const finalBranding = { ...branding, ...data };
                setBranding(finalBranding);

                // Persistent cache for next load
                if (typeof window !== 'undefined') {
                    localStorage.setItem(`branding_${companyId || 'platform'}`, JSON.stringify(finalBranding));
                }

                // Dynamic Favicon Update
                if (data.favicon_url) {
                    updateFavicon(data.favicon_url);
                }

                // Dynamic CSS Variables for Colors
                if (data.primary_color) {
                    document.documentElement.style.setProperty('--brand-primary', data.primary_color);
                }
                if (data.secondary_color) {
                    document.documentElement.style.setProperty('--brand-secondary', data.secondary_color);
                }
            }

        } catch (error) {
            console.error('[useBranding] Failed to load branding:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateFavicon = (url: string) => {
        if (typeof window === 'undefined') return;
        const link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']") || document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        link.href = url;
        document.getElementsByTagName('head')[0].appendChild(link);
    };

    return {
        branding,
        loading,
        reload: loadBranding
    };
}
