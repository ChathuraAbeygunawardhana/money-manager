"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface InboxImage {
  id: string;
  imageUrl: string;
  content: string;
  createdAt: number;
  sender: {
    name: string;
    email: string;
  };
  recipient: {
    name: string;
    email: string;
  };
}

export default function InboxImagesPage() {
  const { data: session } = useSession();
  const [images, setImages] = useState<InboxImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<InboxImage | null>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/inbox-images");
      
      if (!response.ok) {
        throw new Error("Failed to fetch images");
      }
      
      const data = await response.json();
      setImages(data.images);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  if (!session || session.user.role !== "admin") {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          Access denied. Admin privileges required.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Inbox Images</h1>
        <p className="text-gray-600 mt-2">View all images shared in direct messages</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading images...</div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">Error: {error}</div>
          <button
            onClick={fetchImages}
            className="mt-2 text-red-600 hover:text-red-800 cursor-pointer"
          >
            Try again
          </button>
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">No images found in inbox messages</div>
          <p className="text-sm text-gray-400">
            Images shared in direct messages will appear here
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-600">
            Found {images.length} image{images.length !== 1 ? 's' : ''} in inbox messages
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {images.map((image) => (
              <div
                key={image.id}
                className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                <div className="aspect-square relative">
                  <img
                    src={image.imageUrl}
                    alt="Shared image"
                    className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity duration-200"
                    onClick={() => setSelectedImage(image)}
                  />
                </div>
                
                <div className="p-4">
                  <div className="text-sm text-gray-600 mb-2">
                    <div className="font-medium text-gray-900">
                      {image.sender.name} → {image.recipient.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatDate(image.createdAt)}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setSelectedImage(image)}
                      className="text-gray-600 hover:text-gray-900 cursor-pointer text-sm"
                      title="View full image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                      View
                    </button>
                    
                    <a
                      href={image.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-gray-900 cursor-pointer text-sm"
                      title="Open in new tab"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                        <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-1a1 1 0 10-2 0v1H5V7h1a1 1 0 000-2H5z" />
                      </svg>
                      Open
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-lg border border-gray-200 shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedImage.sender.name} → {selectedImage.recipient.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {formatDate(selectedImage.createdAt)}
                </p>
              </div>
              <button
                onClick={() => setSelectedImage(null)}
                className="text-gray-600 hover:text-gray-900 cursor-pointer"
                title="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4 flex items-center justify-center bg-gray-50 max-h-[70vh] overflow-auto">
              <img
                src={selectedImage.imageUrl}
                alt="Shared image"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>
            
            <div className="p-4 border-t border-gray-200 flex gap-4">
              <a
                href={selectedImage.imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-900 border border-gray-300 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200 cursor-pointer text-center"
              >
                Open in New Tab
              </a>
              <button
                onClick={() => setSelectedImage(null)}
                className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-all duration-200 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}