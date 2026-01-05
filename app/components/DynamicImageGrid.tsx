"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { IMAGES } from "@/lib/images";

interface DynamicImageGridProps {
  className?: string;
}

export default function DynamicImageGrid({ className = "" }: DynamicImageGridProps) {
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Function to shuffle and get random images, ensuring we always have exactly the count needed
  const getRandomImages = (count: number) => {
    const availableImages = IMAGES.homeScreenImages;
    const result: string[] = [];
    
    // If we have enough images, just shuffle and take what we need
    if (availableImages.length >= count) {
      const shuffled = [...availableImages].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    }
    
    // If we don't have enough images, repeat them to fill the grid
    while (result.length < count) {
      const shuffled = [...availableImages].sort(() => 0.5 - Math.random());
      result.push(...shuffled);
    }
    
    return result.slice(0, count);
  };

  // Initialize images on component mount
  useEffect(() => {
    setCurrentImages(getRandomImages(24)); // 24 images for 6x4 grid
    setIsLoaded(true);
  }, []);

  // Rotate images every 5 seconds
  useEffect(() => {
    if (!isLoaded) return;

    const interval = setInterval(() => {
      setCurrentImages(getRandomImages(24));
    }, 5000); // Change images every 5 seconds

    return () => clearInterval(interval);
  }, [isLoaded]);

  // Mobile layout images (7 images for mobile grid)
  const [mobileImages, setMobileImages] = useState<string[]>([]);

  useEffect(() => {
    setMobileImages(getRandomImages(7));
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    const mobileInterval = setInterval(() => {
      setMobileImages(getRandomImages(7));
    }, 5000);

    return () => clearInterval(mobileInterval);
  }, [isLoaded]);

  if (!isLoaded) {
    return (
      <div className={`absolute inset-0 ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-blue-50/80 to-purple-50/80 z-10"></div>
        <div className="absolute inset-0 hidden md:grid grid-cols-6 grid-rows-4 gap-2 p-4 opacity-60">
          {Array.from({ length: 24 }).map((_, index) => (
            <div key={`skeleton-${index}`} className="rounded-xl overflow-hidden shadow-lg bg-gray-200 animate-pulse">
            </div>
          ))}
        </div>
        {/* Mobile skeleton */}
        <div className="absolute inset-0 md:hidden opacity-50">
          <div className="grid grid-cols-3 grid-rows-6 gap-1 p-2 h-full">
            {Array.from({ length: 7 }).map((_, index) => (
              <div key={`mobile-skeleton-${index}`} className={`bg-gray-200 animate-pulse rounded-lg ${
                index === 0 ? 'col-span-2 row-span-2' :
                index === 1 ? 'row-span-3' :
                index === 4 ? 'col-span-2 row-span-2' :
                'rounded-lg'
              }`}>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`absolute inset-0 ${className}`}>
      {/* Main background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-blue-50/80 to-purple-50/80 z-10"></div>
      
      {/* Desktop Images Grid Layout - Even Distribution */}
      <div className="absolute inset-0 hidden md:grid grid-cols-6 grid-rows-4 gap-2 p-4 opacity-60">
        {currentImages.map((src, index) => (
          <div 
            key={`grid-${index}-${src}`} 
            className="rounded-xl overflow-hidden shadow-lg transition-all duration-1000 ease-in-out transform hover:scale-105 relative"
          >
            <Image 
              src={src} 
              alt={`Chat community member ${index + 1}`}
              fill
              className="object-cover transition-opacity duration-1000"
              sizes="(max-width: 768px) 0px, (max-width: 1200px) 200px, 250px"
              priority={index < 6} // Prioritize first row for faster loading
            />
          </div>
        ))}
      </div>
      
      {/* Mobile Layout - Simplified */}
      <div className="absolute inset-0 md:hidden opacity-50">
        <div className="grid grid-cols-3 grid-rows-6 gap-1 p-2 h-full">
          {mobileImages.length >= 7 && (
            <>
              <div className="col-span-2 row-span-2 rounded-lg overflow-hidden transition-all duration-1000 relative">
                <Image 
                  src={mobileImages[0]} 
                  alt="Chat community member"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 300px, 0px"
                  priority
                />
              </div>
              <div className="row-span-3 rounded-lg overflow-hidden transition-all duration-1000 relative">
                <Image 
                  src={mobileImages[1]} 
                  alt="Chat community member"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 150px, 0px"
                />
              </div>
              <div className="rounded-lg overflow-hidden transition-all duration-1000 relative">
                <Image 
                  src={mobileImages[2]} 
                  alt="Chat community member"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 150px, 0px"
                />
              </div>
              <div className="rounded-lg overflow-hidden transition-all duration-1000 relative">
                <Image 
                  src={mobileImages[3]} 
                  alt="Chat community member"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 150px, 0px"
                />
              </div>
              <div className="col-span-2 row-span-2 rounded-lg overflow-hidden transition-all duration-1000 relative">
                <Image 
                  src={mobileImages[4]} 
                  alt="Chat community member"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 300px, 0px"
                />
              </div>
              <div className="rounded-lg overflow-hidden transition-all duration-1000 relative">
                <Image 
                  src={mobileImages[5]} 
                  alt="Chat community member"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 150px, 0px"
                />
              </div>
              <div className="rounded-lg overflow-hidden transition-all duration-1000 relative">
                <Image 
                  src={mobileImages[6]} 
                  alt="Chat community member"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 150px, 0px"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}