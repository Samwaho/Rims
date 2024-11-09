"use client";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// Create QueryClient instance outside component to prevent recreation on re-renders
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // Data considered fresh for 30 seconds
      gcTime: 1000 * 60 * 5, // Keep unused data in cache for 5 minutes
      retry: 2, // Retry failed requests twice
      refetchOnWindowFocus: false, // Disable automatic refetch on window focus
    },
    mutations: {
      retry: 1, // Retry failed mutations once
    },
  },
});

interface TanstackProviderProps {
  children: React.ReactNode;
}

const TanstackProvider = ({ children }: TanstackProviderProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
};

export default TanstackProvider;
