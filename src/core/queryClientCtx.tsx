'use client';

import { QueryClient, QueryClientProvider as RQProvider } from '@tanstack/react-query';
import { FC, ReactNode } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    },
  },
});

export const QueryClientProvider: FC<{ children?: ReactNode }> = ({ children }) => (
  <RQProvider client={queryClient}>{children}</RQProvider>
);
