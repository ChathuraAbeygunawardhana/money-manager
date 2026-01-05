"use client";

import { useEffect, useRef, useState } from "react";

interface PerformanceMetrics {
  renderTime: number;
  updateCount: number;
  lastUpdate: number;
  averageRenderTime: number;
}

interface PerformanceMonitorProps {
  componentName: string;
  enabled?: boolean;
  onMetrics?: (metrics: PerformanceMetrics) => void;
  children: React.ReactNode;
}

export default function PerformanceMonitor({ 
  componentName, 
  enabled = process.env.NODE_ENV === 'development',
  onMetrics,
  children 
}: PerformanceMonitorProps) {
  const renderStartTime = useRef<number>(0);
  const updateCount = useRef<number>(0);
  const renderTimes = useRef<number[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    updateCount: 0,
    lastUpdate: 0,
    averageRenderTime: 0,
  });

  useEffect(() => {
    if (!enabled) return;

    renderStartTime.current = performance.now();
  });

  useEffect(() => {
    if (!enabled) return;

    const renderEndTime = performance.now();
    const renderTime = renderEndTime - renderStartTime.current;
    
    updateCount.current += 1;
    renderTimes.current.push(renderTime);
    
    // Keep only last 10 render times for average calculation
    if (renderTimes.current.length > 10) {
      renderTimes.current = renderTimes.current.slice(-10);
    }
    
    const averageRenderTime = renderTimes.current.reduce((sum, time) => sum + time, 0) / renderTimes.current.length;
    
    const newMetrics: PerformanceMetrics = {
      renderTime,
      updateCount: updateCount.current,
      lastUpdate: Date.now(),
      averageRenderTime,
    };
    
    setMetrics(newMetrics);
    onMetrics?.(newMetrics);
    
    // Log performance warnings
    if (renderTime > 100) {
      console.warn(`🐌 Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
    }
    
    if (updateCount.current > 50) {
      console.warn(`🔄 High update count in ${componentName}: ${updateCount.current} updates`);
    }
    
    if (averageRenderTime > 50) {
      console.warn(`📊 High average render time in ${componentName}: ${averageRenderTime.toFixed(2)}ms`);
    }
  });

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {children}
      
      {/* Performance overlay - only show in development */}
      <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white text-xs p-2 rounded-lg font-mono z-50 max-w-xs">
        <div className="font-semibold mb-1">{componentName}</div>
        <div>Last render: {metrics.renderTime.toFixed(1)}ms</div>
        <div>Updates: {metrics.updateCount}</div>
        <div>Avg render: {metrics.averageRenderTime.toFixed(1)}ms</div>
        <div className={`mt-1 px-1 rounded text-xs ${
          metrics.averageRenderTime > 50 ? 'bg-red-600' :
          metrics.averageRenderTime > 25 ? 'bg-yellow-600' : 'bg-green-600'
        }`}>
          {metrics.averageRenderTime > 50 ? 'SLOW' :
           metrics.averageRenderTime > 25 ? 'OK' : 'FAST'}
        </div>
      </div>
    </div>
  );
}

// Hook for programmatic performance monitoring
export function usePerformanceMonitor(componentName: string, enabled = process.env.NODE_ENV === 'development') {
  const renderStartTime = useRef<number>(0);
  const updateCount = useRef<number>(0);
  const renderTimes = useRef<number[]>([]);

  useEffect(() => {
    if (!enabled) return;
    renderStartTime.current = performance.now();
  });

  useEffect(() => {
    if (!enabled) return;

    const renderEndTime = performance.now();
    const renderTime = renderEndTime - renderStartTime.current;
    
    updateCount.current += 1;
    renderTimes.current.push(renderTime);
    
    if (renderTimes.current.length > 10) {
      renderTimes.current = renderTimes.current.slice(-10);
    }
    
    const averageRenderTime = renderTimes.current.reduce((sum, time) => sum + time, 0) / renderTimes.current.length;
    
    // Performance logging
    if (renderTime > 100) {
      console.warn(`🐌 Slow render in ${componentName}: ${renderTime.toFixed(2)}ms`);
    }
  });
}