// Centralized image configuration for the application
export const IMAGES = {
  // Local home screen images from public/home-screen-images folder
  homeScreenImages: [
    "/home-screen-images/1.png",
    "/home-screen-images/2.png", 
    "/home-screen-images/3.png",
    "/home-screen-images/4.png",
    "/home-screen-images/RMJ8.png",
    "/home-screen-images/RMJ10.png",
    "/home-screen-images/RMJ11.png",
    "/home-screen-images/RMJ12.png",
    "/home-screen-images/RMJ13.png",
    "/home-screen-images/RMJ19.png",
    "/home-screen-images/RMJ25.png",
    "/home-screen-images/VJN1.png",
    "/home-screen-images/VJN2.png",
    "/home-screen-images/VJN5.png",
    "/home-screen-images/VJN6.png",
    "/home-screen-images/VJN7.png",
    "/home-screen-images/VJN8.png",
    "/home-screen-images/VJN9.png",
    "/home-screen-images/VJN10.png",
    "/home-screen-images/VJN12.png",
  ],

  // Hero section background images
  hero: {
    // Function to get random images from the local collection
    getRandomImages: (count: number) => {
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
    },
    
    // Grid images for desktop layout (24 images for 6x4 grid)
    grid: [
      "/home-screen-images/1.png",
      "/home-screen-images/2.png",
      "/home-screen-images/3.png",
      "/home-screen-images/4.png",
      "/home-screen-images/RMJ8.png",
      "/home-screen-images/RMJ10.png",
      "/home-screen-images/RMJ11.png",
      "/home-screen-images/RMJ12.png",
      "/home-screen-images/RMJ13.png",
      "/home-screen-images/RMJ19.png",
      "/home-screen-images/RMJ25.png",
      "/home-screen-images/VJN1.png",
      "/home-screen-images/VJN2.png",
      "/home-screen-images/VJN5.png",
      "/home-screen-images/VJN6.png",
      "/home-screen-images/VJN7.png",
      "/home-screen-images/VJN8.png",
      "/home-screen-images/VJN9.png",
      "/home-screen-images/VJN10.png",
      "/home-screen-images/VJN12.png",
      "/home-screen-images/1.png", 
      "/home-screen-images/2.png",
      "/home-screen-images/3.png",
      "/home-screen-images/4.png",
    ],
    
    // Mobile layout images
    mobile: {
      large1: "/home-screen-images/VJN1.png",
      tall: "/home-screen-images/VJN2.png",
      small1: "/home-screen-images/VJN5.png",
      small2: "/home-screen-images/VJN6.png",
      large2: "/home-screen-images/RMJ10.png",
      small3: "/home-screen-images/RMJ11.png",
      small4: "/home-screen-images/RMJ12.png",
    }
  },
  
  // Alt text descriptions for accessibility
  altTexts: {
    hero: [
      "Person using chat app",
      "Person chatting",
      "Person on phone", 
      "Person smiling",
      "Person working",
      "Person communicating",
      "Person networking",
      "Person collaborating",
      "Person socializing",
      "Person connecting",
      "Person meeting",
      "Person discussing",
      "Person sharing",
      "Person engaging",
      "Person chatting",
      "Person interacting",
      "Person talking",
      "Person connecting",
      "Person messaging",
      "Person communicating",
      "Person online",
      "Person texting",
      "Person calling",
      "Person video chatting"
    ],
    mobile: [
      "Person chatting",
      "Person connecting", 
      "Person engaged",
      "Person smiling",
      "Person working",
      "Person communicating",
      "Person networking"
    ]
  }
} as const;