import React, { useState, useRef, useCallback } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Camera, Upload, RotateCcw, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';

interface MobileCameraProps {
  onImageCapture: (imageData: string) => void;
  onImageSelect: (file: File) => void;
  className?: string;
}

export const MobileCamera: React.FC<MobileCameraProps> = ({
  onImageCapture,
  onImageSelect,
  className
}) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [flashMode, setFlashMode] = useState<'off' | 'on' | 'auto'>('off');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      setIsCapturing(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions.');
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0);

    // Convert to data URL
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    onImageCapture(imageData);
    
    stopCamera();
  }, [onImageCapture, stopCamera]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelect(file);
    }
  }, [onImageSelect]);

  const toggleFacingMode = useCallback(() => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    if (isCapturing) {
      stopCamera();
      setTimeout(startCamera, 100);
    }
  }, [isCapturing, stopCamera, startCamera]);

  const toggleFlash = useCallback(() => {
    setFlashMode(prev => {
      switch (prev) {
        case 'off': return 'on';
        case 'on': return 'auto';
        case 'auto': return 'off';
        default: return 'off';
      }
    });
  }, []);

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        {/* Camera View */}
        {isCapturing ? (
          <div className="relative aspect-square bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />
            
            {/* Camera Controls Overlay */}
            <div className="absolute inset-0 flex flex-col justify-between p-4">
              {/* Top Controls */}
              <div className="flex justify-between items-start">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={stopCamera}
                  className="bg-black/50 text-white border-white/20"
                >
                  Cancel
                </Button>
                
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={toggleFlash}
                    className="bg-black/50 text-white border-white/20"
                  >
                    {flashMode === 'off' && '⚡'}
                    {flashMode === 'on' && '⚡'}
                    {flashMode === 'auto' && '⚡'}
                  </Button>
                </div>
              </div>

              {/* Bottom Controls */}
              <div className="flex justify-center items-center gap-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={toggleFacingMode}
                  className="bg-black/50 text-white border-white/20"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
                
                <Button
                  onClick={capturePhoto}
                  className="w-16 h-16 rounded-full bg-white border-4 border-white/50"
                >
                  <div className="w-12 h-12 rounded-full bg-white" />
                </Button>
                
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-black/50 text-white border-white/20"
                >
                  <Upload className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="aspect-square bg-gray-100 rounded-lg flex flex-col items-center justify-center space-y-4">
            <Camera className="w-16 h-16 text-gray-400" />
            <div className="text-center">
              <h3 className="font-medium text-gray-900 mb-2">Capture or Upload</h3>
              <p className="text-sm text-gray-600 mb-4">
                Take a photo with your camera or select from gallery
              </p>
              
              <div className="flex gap-3">
                <Button onClick={startCamera} className="flex-1">
                  <Camera className="w-4 h-4 mr-2" />
                  Camera
                </Button>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Gallery
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Hidden Canvas for Photo Capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Mobile-Specific Tips */}
        <div className="bg-blue-50 rounded-lg p-3">
          <h4 className="text-sm font-medium text-blue-900 mb-1">Mobile Tips</h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Hold your phone steady for best results</li>
            <li>• Ensure good lighting for better cartoon quality</li>
            <li>• Tap to focus on your subject</li>
            <li>• Use portrait mode for better face detection</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};