/**
 * Simple test to verify the infinite render fix
 */

import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProgressiveMessages } from '@/lib/hooks/useProgressiveMessages';
import React from 'react';

// Mock fetch
global.fetch = jest.fn();

describe('Infinite Render Fix', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { 
          retry: false,
          refetchInterval: false,
          refetchOnWindowFocus: false,
        },
      },
    });
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  it('should not cause infinite re-renders', async () => {
    const messages = [
      { id: '1', content: 'Message 1', user_name: 'User 1', user_id: 'user1', created_at: 1000 },
      { id: '2', content: 'Message 2', user_name: 'User 2', user_id: 'user2', created_at: 2000 },
    ];

    // Mock successful fetch
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: true,
      json: async () => messages,
    } as Response);

    let renderCount = 0;
    const { result } = renderHook(
      () => {
        renderCount++;
        return useProgressiveMessages('test-room', true);
      },
      { wrapper }
    );

    // Wait for initial stabilization
    await new Promise(resolve => setTimeout(resolve, 100));

    // Should not have excessive re-renders
    expect(renderCount).toBeLessThan(20); // Allow for reasonable React updates
    
    // Verify the hook returns expected structure
    expect(result.current).toHaveProperty('messages');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('hasMore');
  });

  it('should handle message updates without infinite loops', async () => {
    const initialMessages = [
      { id: '1', content: 'Message 1', user_name: 'User 1', user_id: 'user1', created_at: 1000 },
    ];

    const updatedMessages = [
      ...initialMessages,
      { id: '2', content: 'Message 2', user_name: 'User 2', user_id: 'user2', created_at: 2000 },
    ];

    // Start with initial messages
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      json: async () => initialMessages,
    } as Response);

    let renderCount = 0;
    const { result, rerender } = renderHook(
      () => {
        renderCount++;
        return useProgressiveMessages('test-room', true);
      },
      { wrapper }
    );

    // Wait for initial load
    await new Promise(resolve => setTimeout(resolve, 50));
    const initialRenderCount = renderCount;

    // Mock updated messages
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      json: async () => updatedMessages,
    } as Response);

    // Trigger update by invalidating query
    queryClient.invalidateQueries({ queryKey: ['messages', 'test-room'] });

    // Wait for update
    await new Promise(resolve => setTimeout(resolve, 100));

    const finalRenderCount = renderCount;
    const additionalRenders = finalRenderCount - initialRenderCount;

    // Should not have excessive additional renders
    expect(additionalRenders).toBeLessThan(15);
  });
});