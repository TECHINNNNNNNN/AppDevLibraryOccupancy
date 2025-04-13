import React, { useState, useCallback, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, RefreshCw, Crop, Upload, X } from "lucide-react";
import ReactCrop, { Crop as CropType, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageUploaderProps {
  onImageChange: (file: File | null, imageUrl: string | null) => void;
  maxSize?: number; // in MB
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onImageChange,
  maxSize = 5 // Default max size is 5MB
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<CropType>();
  const [isCropping, setIsCropping] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  
  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        setError(`File is too large. Maximum size is ${maxSize}MB.`);
        return;
      }
      
      // Check file type
      if (!file.type.match('image.*')) {
        setError('Only image files are allowed.');
        return;
      }
      
      setError(null);
      setIsLoading(true);
      
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        setIsLoading(false);
        setIsCropping(true);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const onImageLoaded = useCallback((img: HTMLImageElement) => {
    imgRef.current = img;
    
    const { width, height } = img;
    
    // Create default crop that covers most of the image
    // and maintains a 4:3 aspect ratio
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 80,
        },
        4 / 3,
        width,
        height
      ),
      width,
      height
    );
    
    setCrop(crop);
  }, []);
  
  const applyCrop = async () => {
    if (!imgRef.current || !crop) return;
    
    const image = imgRef.current;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    // Create canvas to draw cropped image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      setError('Could not process image. Please try again.');
      return;
    }
    
    // Set canvas dimensions to cropped area
    const pixelCrop = {
      x: crop.x * scaleX,
      y: crop.y * scaleY,
      width: crop.width * scaleX,
      height: crop.height * scaleY,
    };
    
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    
    // Draw the cropped image onto the canvas
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );
    
    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (!blob) {
        setError('Could not process image. Please try again.');
        return;
      }
      
      // Create file from blob
      const file = new File([blob], 'seat-image.jpg', { type: 'image/jpeg' });
      
      // Get data URL for preview
      const reader = new FileReader();
      reader.onload = () => {
        const imageUrl = reader.result as string;
        onImageChange(file, imageUrl);
        setSelectedImage(imageUrl);
        setIsCropping(false);
      };
      reader.readAsDataURL(blob);
    }, 'image/jpeg', 0.85); // JPEG at 85% quality for better compression
  };
  
  const resetImage = () => {
    setSelectedImage(null);
    setCrop(undefined);
    setIsCropping(false);
    setError(null);
    onImageChange(null, null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}
        
        {isLoading ? (
          <div className="flex items-center justify-center h-48 bg-gray-50">
            <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
          </div>
        ) : selectedImage ? (
          <div className="relative">
            {isCropping ? (
              <div className="space-y-2">
                <div className="overflow-hidden">
                  <ReactCrop
                    crop={crop}
                    onChange={c => setCrop(c)}
                    aspect={4 / 3}
                    onImageLoad={onImageLoaded}
                  >
                    <img src={selectedImage} alt="Upload preview" className="max-w-full" />
                  </ReactCrop>
                </div>
                <div className="p-3 space-x-2 flex">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={resetImage}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={applyCrop}
                    className="flex-1"
                  >
                    <Crop className="h-4 w-4 mr-1" />
                    Apply Crop
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="relative w-full">
                  <img 
                    src={selectedImage} 
                    alt="Upload preview" 
                    className="w-full object-cover max-h-64"
                  />
                  <button 
                    onClick={resetImage}
                    className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1 text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="p-4">
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary-500 transition-colors"
              onClick={() => inputRef.current?.click()}
            >
              <Camera className="h-8 w-8 mx-auto text-gray-400 mb-4" />
              <p className="text-sm font-medium text-gray-900 mb-1">Add a photo of your seat</p>
              <p className="text-xs text-gray-500 mb-4">
                Help others find your spot with a picture
              </p>
              <Button size="sm" variant="outline" className="gap-1">
                <Upload className="h-3 w-3" />
                Upload Image
              </Button>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={onSelectFile}
                className="hidden"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImageUploader; 