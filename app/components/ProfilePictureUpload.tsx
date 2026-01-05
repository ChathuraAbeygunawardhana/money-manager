"use client";

import { useState, useRef, useEffect } from 'react';
import { validateImageFile, convertToWebP } from '@/lib/utils/fileUpload';

interface ProfilePictureUploadProps {
  currentImage?: string;
  onImageChange: (webpImage: string | null) => void;
  disabled?: boolean;
}

export default function ProfilePictureUpload({ 
  currentImage, 
  onImageChange, 
  disabled = false 
}: ProfilePictureUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update preview when currentImage prop changes
  useEffect(() => {
    setPreview(currentImage || null);
  }, [currentImage]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setError(null);
      setIsProcessing(true);
      
      // Convert to WebP format
      const webpDataUrl = await convertToWebP(file, 0.8);
      setPreview(webpDataUrl);
      
      // Notify parent with WebP image
      onImageChange(webpDataUrl);
    } catch (err) {
      setError('Failed to process image');
      console.error('Image processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    setError(null);
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (!disabled && !isProcessing) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-900">Profile Picture</label>
      
      <div className="flex items-center space-x-4">
        {/* Profile Picture Preview */}
        <div className="relative">
          <div 
            className={`w-20 h-20 rounded-full border-2 border-gray-300 overflow-hidden bg-gray-100 flex items-center justify-center ${
              !disabled && !isProcessing ? 'cursor-pointer hover:border-gray-400' : 'cursor-not-allowed opacity-50'
            }`}
            onClick={handleClick}
          >
            {preview ? (
              <img 
                src={preview} 
                alt="Profile preview" 
                className="w-full h-full object-cover"
              />
            ) : (
              <svg 
                className="w-8 h-8 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                />
              </svg>
            )}
          </div>
          
          {/* Processing indicator */}
          {isProcessing && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            </div>
          )}
        </div>

        {/* Upload/Remove Buttons */}
        <div className="flex flex-col space-y-2">
          <button
            type="button"
            onClick={handleClick}
            disabled={disabled || isProcessing}
            className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 ${
              disabled || isProcessing
                ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 cursor-pointer'
            }`}
          >
            {isProcessing ? 'Processing...' : preview ? 'Change Photo' : 'Upload Photo'}
          </button>
          
          {preview && !isProcessing && (
            <button
              type="button"
              onClick={handleRemoveImage}
              disabled={disabled}
              className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 ${
                disabled 
                  ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed' 
                  : 'bg-white text-red-600 border-red-300 hover:bg-red-50 cursor-pointer'
              }`}
            >
              Remove
            </button>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isProcessing}
      />

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* Help text */}
      <p className="text-xs text-gray-500">
        Supported formats: JPEG, PNG, WebP. Max size: 5MB. Images will be converted to WebP format.
      </p>
    </div>
  );
}