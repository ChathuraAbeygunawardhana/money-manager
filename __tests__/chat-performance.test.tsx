/**
 * Performance tests for chat functionality
 * Tests hook performance and identifies bottlenecks
 */

import '@testing-library/jest-dom';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProgressiveMessages } from '@/lib/hooks/useProgressiveMessages';
import React from 'react';

// Mock fetch
global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Generate test messages
const generateMessages = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `msg-${i}`,
    content: `Test message ${i + 1}`,
    user_name: `User ${i % 3 + 1}`,
    user_id: `user-${i % 3 + 1}`,
    created_at: Date.now() / 1000 - (count - i) * 60,
  }));
};

describe('Chat Performance Tests', () => {
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

  describe('Hook Performance', () => {
    it('should handle small message lists efficiently', async () => {
      const messages = generateMessages(10);
      
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

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.totalMessages).toBe(10);
      }, { timeout: 2000 });

      // Should not have excessive re-renders (allow for progressive display)
      expect(renderCount).toBeLessThan(25);
      
      // Should load messages
      expect(result.current.totalMessages).toBe(10);
    });

    it('should handle large message lists with progressive loading', async () => {
      const messages = generateMessages(100);
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => messages,
      } as Response);

      const startTime = performance.now();
      
      const { result } = renderHook(
        () => useProgressiveMessages('test-room', true),
        { wrapper }
      );

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.totalMessages).toBe(100);
      }, { timeout: 2000 });

      const endTime = performance.now();
      const loadTime = endTime - startTime;

      // Should load efficiently even with large datasets
      expect(loadTime).toBeLessThan(2000);
      
      // Should use progressive loading for large datasets
      expect(result.current.totalMessages).toBe(100);
      expect(result.current.hasMore).toBe(true);
    });

    it('should not cause infinite re-renders', async () => {
      const messages = generateMessages(5);
      
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

      // Wait for initial load and progressive display to complete
      await waitFor(() => {
        expect(result.current.totalMessages).toBe(5);
        expect(result.current.displayedCount).toBe(5);
      }, { timeout: 3000 });

      const stabilizedRenderCount = renderCount;

      // Wait a bit more to catch any additional renders
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
      });

      const finalRenderCount = renderCount;
      const additionalRenders = finalRenderCount - stabilizedRenderCount;

      // Should not continue rendering after stabilization (allow a few for cleanup)
      expect(additionalRenders).toBeLessThan(3);
    });
  });

  describe('Progressive Loading Performance', () => {
    it('should load more messages efficiently', async () => {
      const allMessages = generateMessages(50);
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => allMessages,
      } as Response);

      const { result } = renderHook(
        () => useProgressiveMessages('test-room', true),
        { wrapper }
      );

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.totalMessages).toBe(50);
        expect(result.current.hasMore).toBe(true);
      }, { timeout: 2000 });

      const initialDisplayCount = result.current.displayedCount;

      const startTime = performance.now();
      
      // Trigger load more
      act(() => {
        result.current.loadMore();
      });

      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      // Loading more should be very fast (synchronous operation)
      expect(loadTime).toBeLessThan(100);
      
      // Should have loaded more messages
      expect(result.current.displayedCount).toBeGreaterThan(initialDisplayCount);
    });

    it('should show all messages efficiently', async () => {
      const allMessages = generateMessages(100);
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => allMessages,
      } as Response);

      const { result } = renderHook(
        () => useProgressiveMessages('test-room', true),
        { wrapper }
      );

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.totalMessages).toBe(100);
        expect(result.current.hasMore).toBe(true);
      }, { timeout: 2000 });

      const startTime = performance.now();
      
      // Trigger show all
      act(() => {
        result.current.showAll();
      });

      const endTime = performance.now();
      const showAllTime = endTime - startTime;
      
      // Showing all should complete very quickly (synchronous operation)
      expect(showAllTime).toBeLessThan(100);
      
      // Should show all messages
      expect(result.current.displayedCount).toBe(100);
      expect(result.current.hasMore).toBe(false);
    });
  });

  describe('Memory Usage', () => {
    it('should handle rapid updates without memory leaks', async () => {
      let messageCount = 5;
      
      // Mock fetch to return increasing number of messages
      mockFetch.mockImplementation(async () => {
        const messages = generateMessages(messageCount);
        return {
          ok: true,
          json: async () => messages,
        } as Response;
      });

      const { result, unmount } = renderHook(
        () => useProgressiveMessages('test-room', true),
        { wrapper }
      );

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.totalMessages).toBe(5);
      }, { timeout: 2000 });

      // Simulate rapid updates
      for (let i = 0; i < 3; i++) {
        messageCount += 2;
        
        act(() => {
          queryClient.invalidateQueries({ queryKey: ['messages', 'test-room'] });
        });
        
        await waitFor(() => {
          expect(result.current.totalMessages).toBe(messageCount);
        }, { timeout: 1000 });
      }

      // Should have the latest message count
      expect(result.current.totalMessages).toBe(11);

      // Cleanup should not throw errors
      expect(() => unmount()).not.toThrow();
    });

    it('should stabilize after initial load', async () => {
      const messages = generateMessages(3); // Use fewer messages for faster test
      
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

      // Wait for initial load and progressive display to complete
      await waitFor(() => {
        expect(result.current.totalMessages).toBe(3);
        expect(result.current.displayedCount).toBe(3);
      }, { timeout: 2000 });

      const stabilizedRenderCount = renderCount;

      // Wait a bit more to see if there are additional renders
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
      });

      const finalRenderCount = renderCount;

      // Should not continue rendering after stabilization
      expect(finalRenderCount - stabilizedRenderCount).toBeLessThan(3);
      
      // Should have loaded the messages
      expect(result.current.messages).toHaveLength(3);
    });
  });
});