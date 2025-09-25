import React, { useState, useCallback, useRef } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Upload, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from './ui/toast';
import { validateImageFile, compressImage, createThumbnail } from '../lib/imageUtils';

interface BatchImage {
  id: string;
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
  cartoonImageUrl?: string;
  storageId?: string;
}

interface BatchProcessorProps {
  userId: string;
  cartoonStyle: string;
  onComplete?: (results: BatchImage[]) => void;
}

export const BatchProcessor: React.FC<BatchProcessorProps> = ({
  userId,
  cartoonStyle,
  onComplete
}) => {
  const [images, setImages] = useState<BatchImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const saveUploadedImage = useMutation(api.files.saveUploadedImage);
  const cartoonifyImage = useMutation(api.files.cartoonifyImage);

  const handleFileSelect = useCallback(async (files: FileList) => {
    const newImages: BatchImage[] = [];
    
    for (let i = 0; i < Math.min(files.length, 10); i++) { // Limit to 10 images
      const file = files[i];
      
      // Validate image file
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        addToast(`Invalid file: ${file.name} - ${validation.error}`, 'error');
        continue;
      }

      // Create preview
      const preview = await createThumbnail(file, 200);
      
      newImages.push({
        id: `${Date.now()}-${i}`,
        file,
        preview,
        status: 'pending'
      });
    }

    setImages(prev => [...prev, ...newImages]);
  }, [addToast]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFileSelect(files);
    }
  }, [handleFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files) {
      handleFileSelect(files);
    }
  }, [handleFileSelect]);

  const removeImage = useCallback((id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  }, []);

  const processBatch = useCallback(async () => {
    if (images.length === 0) return;

    setIsProcessing(true);
    const updatedImages = [...images];

    // Update all images to uploading status
    setImages(prev => prev.map(img => ({ ...img, status: 'uploading' as const })));

    try {
      // Process images sequentially to avoid overwhelming the API
      for (let i = 0; i < updatedImages.length; i++) {
        const image = updatedImages[i];
        
        try {
          // Update status to processing
          setImages(prev => prev.map(img => 
            img.id === image.id ? { ...img, status: 'processing' } : img
          ));

          // Compress image
          const compressedFile = await compressImage(image.file, 0.85);
          
          // Upload to Convex
          const uploadUrl = await generateUploadUrl();
          const result = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": compressedFile.type },
            body: compressedFile,
          });

          if (!result.ok) {
            throw new Error(`Upload failed: ${result.statusText}`);
          }

          const { storageId } = await result.json();

          // Save image metadata
          await saveUploadedImage({
            storageId,
            userId,
          });

          // Start cartoonification
          await cartoonifyImage({ storageId, style: cartoonStyle });

          // Update status to completed (we'll get the actual cartoon URL from the database)
          setImages(prev => prev.map(img => 
            img.id === image.id ? { 
              ...img, 
              status: 'completed',
              storageId 
            } : img
          ));

        } catch (error) {
          console.error(`Error processing image ${image.id}:`, error);
          setImages(prev => prev.map(img => 
            img.id === image.id ? { 
              ...img, 
              status: 'error',
              error: error instanceof Error ? error.message : 'Unknown error'
            } : img
          ));
        }

        // Add delay between requests to avoid rate limiting
        if (i < updatedImages.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      addToast(`Batch processing completed! ${images.length} images processed.`, 'success');
      onComplete?.(images);

    } catch (error) {
      console.error('Batch processing error:', error);
      addToast('Batch processing failed. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  }, [images, userId, cartoonStyle, generateUploadUrl, saveUploadedImage, cartoonifyImage, addToast, onComplete]);

  const clearAll = useCallback(() => {
    setImages([]);
  }, []);

  const getStatusIcon = (status: BatchImage['status']) => {
    switch (status) {
      case 'pending':
        return <div className="w-4 h-4 rounded-full bg-gray-300" />;
      case 'uploading':
      case 'processing':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card className="p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4">Batch Image Processing</h3>
          <p className="text-sm text-gray-600 mb-4">
            Upload up to 10 images at once for batch cartoon transformation
          </p>
          
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-400 transition-colors cursor-pointer"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Drop images here or click to upload</p>
            <p className="text-sm text-gray-500">Supports JPG, PNG, WebP (max 10MB each)</p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </Card>

      {/* Image Grid */}
      {images.length > 0 && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold">
              Selected Images ({images.length}/10)
            </h4>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={clearAll}
                disabled={isProcessing}
              >
                Clear All
              </Button>
              <Button
                onClick={processBatch}
                disabled={isProcessing || images.length === 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Process ${images.length} Images`
                )}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {images.map((image) => (
              <div key={image.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={image.preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Status overlay */}
                <div className="absolute top-2 left-2">
                  {getStatusIcon(image.status)}
                </div>

                {/* Remove button */}
                <button
                  onClick={() => removeImage(image.id)}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={isProcessing}
                >
                  <X className="w-3 h-3" />
                </button>

                {/* Error message */}
                {image.status === 'error' && image.error && (
                  <div className="absolute bottom-0 left-0 right-0 bg-red-500 text-white text-xs p-1 rounded-b-lg">
                    {image.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};