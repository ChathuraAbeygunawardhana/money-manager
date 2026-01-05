import { renderHook, act } from '@testing-library/react';
import { useNotificationSound } from '@/lib/hooks/useNotificationSound';

// Mock Audio constructor
const mockPlay = jest.fn();
const mockAudio = {
  play: mockPlay,
  volume: 0.5,
  currentTime: 0,
  preload: 'auto',
  addEventListener: jest.fn(),
};

// Mock Web Audio API
const mockOscillator = {
  connect: jest.fn(),
  frequency: { setValueAtTime: jest.fn() },
  start: jest.fn(),
  stop: jest.fn(),
};

const mockGainNode = {
  connect: jest.fn(),
  gain: { 
    setValueAtTime: jest.fn(),
    exponentialRampToValueAtTime: jest.fn(),
  },
};

const mockAudioContext = {
  createOscillator: jest.fn(() => mockOscillator),
  createGain: jest.fn(() => mockGainNode),
  destination: {},
  currentTime: 0,
};

// Setup mocks
beforeAll(() => {
  global.Audio = jest.fn(() => mockAudio) as any;
  global.AudioContext = jest.fn(() => mockAudioContext) as any;
  (global as any).webkitAudioContext = jest.fn(() => mockAudioContext);
});

beforeEach(() => {
  jest.clearAllMocks();
  mockPlay.mockResolvedValue(undefined);
});

describe('useNotificationSound', () => {
  it('should create audio element and play sound successfully', async () => {
    const { result } = renderHook(() => useNotificationSound());

    await act(async () => {
      result.current.playNotificationSound();
    });

    expect(global.Audio).toHaveBeenCalledWith('/notification.mp3');
    expect(mockAudio.volume).toBe(0.5);
    expect(mockAudio.currentTime).toBe(0);
    expect(mockPlay).toHaveBeenCalled();
  });

  it('should use beep fallback when audio file fails', async () => {
    mockPlay.mockRejectedValue(new Error('Audio file not found'));
    
    const { result } = renderHook(() => useNotificationSound());

    await act(async () => {
      result.current.playNotificationSound();
    });

    expect(mockPlay).toHaveBeenCalled();
    expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    expect(mockAudioContext.createGain).toHaveBeenCalled();
    expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(800, 0);
    expect(mockOscillator.start).toHaveBeenCalled();
    expect(mockOscillator.stop).toHaveBeenCalled();
  });

  it('should handle audio context creation errors gracefully', async () => {
    mockPlay.mockRejectedValue(new Error('Audio file not found'));
    global.AudioContext = jest.fn(() => {
      throw new Error('AudioContext not supported');
    });
    (global as any).webkitAudioContext = jest.fn(() => {
      throw new Error('webkitAudioContext not supported');
    });

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    const { result } = renderHook(() => useNotificationSound());

    await act(async () => {
      result.current.playNotificationSound();
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Could not create beep sound')
    );
    
    consoleSpy.mockRestore();
  });

  it('should reuse the same audio element on multiple calls', async () => {
    const { result } = renderHook(() => useNotificationSound());

    await act(async () => {
      result.current.playNotificationSound();
      result.current.playNotificationSound();
    });

    expect(global.Audio).toHaveBeenCalledTimes(1);
    expect(mockPlay).toHaveBeenCalledTimes(2);
  });

  it('should reset audio currentTime before playing', async () => {
    const { result } = renderHook(() => useNotificationSound());

    await act(async () => {
      result.current.playNotificationSound();
    });

    expect(mockAudio.currentTime).toBe(0);
    expect(mockPlay).toHaveBeenCalled();
  });
});