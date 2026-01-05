/**
 * Test to reproduce and verify fix for infinite render issue
 */

import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProgressiveMessages } from '@/lib/hooks/useProgressiveMessages';
import React from 'react';

// Mock fetch
global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

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

  it('should not cause infinite re-renders when messages update', async () => {
    const messages = [
      { id: '1', content: 'Message 1', user_name: 'User 1', user_id: 'user1', created_at: 1000 },
      { id: '2', content: 'Message 2', user_name: 'User 2', user_id: 'user2', created_at: 2000 },
    ];

    // Mock successful fetch
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => messages,
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
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    const initialRenderCount = renderCount;

    // Simulate new message arriving
    const updatedMessages = [
      ...messages,
      { id: '3', content: 'Message 3', user_name: 'User 3', user_id: 'user3', created_at: 3000 },
    ];

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => updatedMessages,
    } as Response);

    // Trigger query invalidation (simulating new message)
    act(() => {
      queryClient.invalidateQueries({ queryKey: ['messages', 'test-room'] });
    });

    // Wait for update to process
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
    });

    const finalRenderCount = renderCount;
    const additionalRenders = finalRenderCount - initialRenderCount;

    // Should not have excessive re-renders (allow for reasonable React updates)
    expect(additionalRenders).toBeLessThan(10);
    
    // Verify the hook is working correctly
    expect(result.current.messages).toHaveLength(3);
    expect(result.current.totalMessages).toBe(3);
  });

  it('should handle rapid message updates without infinite loops', async () => {
    let messageCount = 1;
    
    // Mock fetch to return increasing number of messages
    mockFetch.mockImplementation(async () => {
      const messages = Array.from({ length: messageCount }, (_, i) => ({
        id: `msg-${i}`,
        content: `Message ${i + 1}`,
        user_name: `User ${i + 1}`,
        user_id: `user${i + 1}`,
        created_at: 1000 + i * 1000,
      }));
      
      return {
        ok: true,
        json: async () => messages,
      } as Response;
    });

    let renderCount = 0;
    const { result } = renderHook(
      () => {
        renderCount++;
        return useProgressiveMessages('test-room', true);
      },
      { wrapper }
    );

    // Simulate rapid updates
    for (let i = 0; i < 5; i++) {
      messageCount++;
      
      act(() => {
        queryClient.invalidateQueries({ queryKey: ['messages', 'test-room'] });
      });
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });
    }

    // Should not have excessive renders even with rapid updates
    expect(renderCount).toBeLessThan(50);
    
    // Should have the latest messages
    expect(result.current.totalMessages).toBe(6);
  });

  it('should stabilize after initial load', async () => {
    const messages = [
      { id: '1', content: 'Message 1', user_name: 'User 1', user_id: 'user1', created_at: 1000 },
    ];

    mockFetch.mockResolvedValue({
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

    // Wait for initial load and stabilization
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
    });

    const stabilizedRenderCount = renderCount;

    // Wait a bit more to see if there are additional renders
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
    });

    const finalRenderCount = renderCount;

    // Should not continue rendering after stabilization
    expect(finalRenderCount - stabilizedRenderCount).toBeLessThan(3);
    
    // Should have loaded the message
    expect(result.current.messages).toHaveLength(1);
  });
});