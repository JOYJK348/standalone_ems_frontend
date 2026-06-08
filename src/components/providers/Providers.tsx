'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { FeatureAccessProvider } from '@/contexts/FeatureAccessContext';

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: { queries: { staleTime: 60 * 1000, retry: 1 } }
    }));

    return (
        <QueryClientProvider client={queryClient}>
            <FeatureAccessProvider>
                {children}
                <Toaster position="top-right" richColors closeButton duration={3000} />
            </FeatureAccessProvider>
        </QueryClientProvider>
    );
}
