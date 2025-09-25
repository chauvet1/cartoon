import React, { useState, useRef, useCallback } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Slider } from './ui/slider';
import { RotateCcw, RotateCw, Crop, Zap, Download } from 'lucide-react';

interface ImageEnhancementProps {
  imageUrl: string;
  onEnhancedImage: (enhancedImageUrl: string) => void;
  onCrop: (cropData: CropData) => void;
}

interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface EnhancementSettings {
  brightness: number;
  contrast: number;
  saturation: number;
  rotation: number;
  crop: CropData | null;
}

export const ImageEnhancement: React.FC<ImageEnhancementProps> = ({
  imageUrl,
  onEnhancedImage,
  onCrop
}) => {
  const [settings, setSettings] = useState<EnhancementSettings>({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    rotation: 0,
    crop: null
  });

  const [isCropping, setIsCropping] = useState(false);
  const [cropStart, setCropStart] = useState<{ x: number; y: number } | null>(null);
  const [cropEnd, setCropEnd] = useState<{ x: number; y: number } | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const applyEnhancements = useCallback(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    // Apply rotation
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((settings.rotation * Math.PI) / 180);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    // Draw image
    ctx.drawImage(image, 0, 0);

    // Apply filters
    const { brightness, contrast, saturation } = settings;
    
    // Brightness and contrast
    ctx.filter = `brightness(${100 + brightness}%) contrast(${100 + contrast}%) saturate(${100 + saturation}%)`;
    
    // Redraw with filters
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(image, 0, 0);

    ctx.restore();

    // Convert to blob and create URL
    canvas.toBlob((blob) => {
      if (blob) {
        const enhancedUrl = URL.createObjectURL(blob);
        onEnhancedImage(enhancedUrl);
      }
    }, 'image/jpeg', 0.9);
  }, [settings, onEnhancedImage]);

  const handleCropStart = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isCropping) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCropStart({ x, y });
    setCropEnd({ x, y });
  }, [isCropping]);

  const handleCropMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isCropping || !cropStart) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCropEnd({ x, y });
  }, [isCropping, cropStart]);

  const handleCropEnd = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isCropping || !cropStart || !cropEnd) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const cropData: CropData = {
      x: Math.min(cropStart.x, x),
      y: Math.min(cropStart.y, y),
      width: Math.abs(x - cropStart.x),
      height: Math.abs(y - cropStart.y)
    };

    setSettings(prev => ({ ...prev, crop: cropData }));
    onCrop(cropData);
    setIsCropping(false);
    setCropStart(null);
    setCropEnd(null);
  }, [isCropping, cropStart, cropEnd, onCrop]);

  const resetSettings = useCallback(() => {
    setSettings({
      brightness: 0,
      contrast: 0,
      saturation: 0,
      rotation: 0,
      crop: null
    });
  }, []);

  const rotateImage = useCallback((degrees: number) => {
    setSettings(prev => ({
      ...prev,
      rotation: prev.rotation + degrees
    }));
  }, []);

  return (
    <Card className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Image Enhancement</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={resetSettings}
          >
            Reset
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCropping(!isCropping)}
          >
            <Crop className="w-4 h-4 mr-1" />
            {isCropping ? 'Cancel Crop' : 'Crop'}
          </Button>
        </div>
      </div>

      {/* Image Preview */}
      <div className="relative">
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Original"
          className="max-w-full h-auto rounded-lg"
          style={{
            filter: `brightness(${100 + settings.brightness}%) contrast(${100 + settings.contrast}%) saturate(${100 + settings.saturation}%)`,
            transform: `rotate(${settings.rotation}deg)`
          }}
          onLoad={applyEnhancements}
        />
        
        {/* Hidden canvas for processing */}
        <canvas
          ref={canvasRef}
          className="hidden"
        />
      </div>

      {/* Enhancement Controls */}
      <div className="space-y-4">
        {/* Brightness */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Brightness: {settings.brightness > 0 ? '+' : ''}{settings.brightness}%
          </label>
          <Slider
            value={[settings.brightness]}
            onValueChange={([value]) => setSettings(prev => ({ ...prev, brightness: value }))}
            min={-50}
            max={50}
            step={1}
            className="w-full"
          />
        </div>

        {/* Contrast */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Contrast: {settings.contrast > 0 ? '+' : ''}{settings.contrast}%
          </label>
          <Slider
            value={[settings.contrast]}
            onValueChange={([value]) => setSettings(prev => ({ ...prev, contrast: value }))}
            min={-50}
            max={50}
            step={1}
            className="w-full"
          />
        </div>

        {/* Saturation */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Saturation: {settings.saturation > 0 ? '+' : ''}{settings.saturation}%
          </label>
          <Slider
            value={[settings.saturation]}
            onValueChange={([value]) => setSettings(prev => ({ ...prev, saturation: value }))}
            min={-50}
            max={50}
            step={1}
            className="w-full"
          />
        </div>

        {/* Rotation */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Rotation: {settings.rotation}°
          </label>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => rotateImage(-90)}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => rotateImage(90)}
            >
              <RotateCw className="w-4 h-4" />
            </Button>
            <Slider
              value={[settings.rotation]}
              onValueChange={([value]) => setSettings(prev => ({ ...prev, rotation: value }))}
              min={-180}
              max={180}
              step={1}
              className="flex-1"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4 border-t">
        <Button
          onClick={applyEnhancements}
          className="flex-1"
        >
          <Zap className="w-4 h-4 mr-2" />
          Apply Enhancements
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            const canvas = canvasRef.current;
            if (canvas) {
              const link = document.createElement('a');
              link.download = 'enhanced-image.jpg';
              link.href = canvas.toDataURL('image/jpeg', 0.9);
              link.click();
            }
          }}
        >
          <Download className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};