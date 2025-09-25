import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ZoomIn, ZoomOut, RotateCcw, RotateCw, Move, Settings } from 'lucide-react';

interface RealTimePreviewProps {
  originalImage: string;
  cartoonImage?: string;
  onStyleChange: (style: string) => void;
  onIntensityChange: (intensity: number) => void;
  onSettingsChange: (settings: PreviewSettings) => void;
}

interface PreviewSettings {
  zoom: number;
  rotation: number;
  brightness: number;
  contrast: number;
  saturation: number;
  showComparison: boolean;
  splitPosition: number; // 0-100, where to split the comparison view
}

export const RealTimePreview: React.FC<RealTimePreviewProps> = ({
  originalImage,
  cartoonImage,
  onStyleChange,
  onIntensityChange,
  onSettingsChange
}) => {
  const [settings, setSettings] = useState<PreviewSettings>({
    zoom: 100,
    rotation: 0,
    brightness: 0,
    contrast: 0,
    saturation: 0,
    showComparison: true,
    splitPosition: 50
  });

  const [isDragging, setIsDragging] = useState(false);
  const [activeTool, setActiveTool] = useState<'move' | 'zoom' | 'rotate'>('move');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const styles = [
    { id: "simpsons", name: "Simpsons" },
    { id: "studio-ghibli", name: "Studio Ghibli" },
    { id: "family-guy", name: "Family Guy" },
    { id: "disney", name: "Disney" },
    { id: "anime", name: "Anime" },
    { id: "comic-book", name: "Comic Book" },
    { id: "south-park", name: "South Park" }
  ];

  const updateSettings = useCallback((newSettings: Partial<PreviewSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    onSettingsChange(updatedSettings);
  }, [settings, onSettingsChange]);

  const handleZoom = useCallback((direction: 'in' | 'out') => {
    const zoomStep = 10;
    const newZoom = direction === 'in' 
      ? Math.min(settings.zoom + zoomStep, 300)
      : Math.max(settings.zoom - zoomStep, 25);
    
    updateSettings({ zoom: newZoom });
  }, [settings.zoom, updateSettings]);

  const handleRotate = useCallback((direction: 'left' | 'right') => {
    const rotationStep = 90;
    const newRotation = direction === 'right'
      ? (settings.rotation + rotationStep) % 360
      : (settings.rotation - rotationStep + 360) % 360;
    
    updateSettings({ rotation: newRotation });
  }, [settings.rotation, updateSettings]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (activeTool === 'move') {
      setIsDragging(true);
    }
  }, [activeTool]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && activeTool === 'move') {
      // Handle panning logic here
      // This would update the image position
    }
  }, [isDragging, activeTool]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const zoomStep = 5;
    const newZoom = e.deltaY < 0
      ? Math.min(settings.zoom + zoomStep, 300)
      : Math.max(settings.zoom - zoomStep, 25);
    
    updateSettings({ zoom: newZoom });
  }, [settings.zoom, updateSettings]);

  const renderPreview = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate image dimensions
    const imageWidth = canvas.width * (settings.zoom / 100);
    const imageHeight = canvas.height * (settings.zoom / 100);
    const x = (canvas.width - imageWidth) / 2;
    const y = (canvas.height - imageHeight) / 2;

    // Apply filters
    ctx.filter = `brightness(${100 + settings.brightness}%) contrast(${100 + settings.contrast}%) saturate(${100 + settings.saturation}%)`;

    if (settings.showComparison && cartoonImage) {
      // Draw split comparison
      const splitX = canvas.width * (settings.splitPosition / 100);
      
      // Original image (left side)
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, splitX, canvas.height);
      ctx.clip();
      
      const originalImg = new Image();
      originalImg.onload = () => {
        ctx.drawImage(originalImg, x, y, imageWidth, imageHeight);
      };
      originalImg.src = originalImage;
      
      ctx.restore();

      // Cartoon image (right side)
      ctx.save();
      ctx.beginPath();
      ctx.rect(splitX, 0, canvas.width - splitX, canvas.height);
      ctx.clip();
      
      const cartoonImg = new Image();
      cartoonImg.onload = () => {
        ctx.drawImage(cartoonImg, x, y, imageWidth, imageHeight);
      };
      cartoonImg.src = cartoonImage;
      
      ctx.restore();

      // Draw split line
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(splitX, 0);
      ctx.lineTo(splitX, canvas.height);
      ctx.stroke();

      // Draw split handle
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(splitX, canvas.height / 2, 8, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    } else {
      // Draw single image
      const img = new Image();
      img.onload = () => {
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((settings.rotation * Math.PI) / 180);
        ctx.translate(-imageWidth / 2, -imageHeight / 2);
        ctx.drawImage(img, 0, 0, imageWidth, imageHeight);
        ctx.restore();
      };
      img.src = cartoonImage || originalImage;
    }
  }, [settings, originalImage, cartoonImage]);

  useEffect(() => {
    renderPreview();
  }, [renderPreview]);

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Real-time Preview</h3>
        <div className="flex items-center gap-2">
          <Button
            variant={settings.showComparison ? "default" : "outline"}
            size="sm"
            onClick={() => updateSettings({ showComparison: !settings.showComparison })}
          >
            Comparison
          </Button>
        </div>
      </div>

      {/* Preview Canvas */}
      <div 
        ref={containerRef}
        className="relative border rounded-lg overflow-hidden bg-gray-100"
        style={{ height: '400px' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-move"
          style={{ 
            transform: `rotate(${settings.rotation}deg)`,
            filter: `brightness(${100 + settings.brightness}%) contrast(${100 + settings.contrast}%) saturate(${100 + settings.saturation}%)`
          }}
        />
        
        {/* Zoom indicator */}
        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {settings.zoom}%
        </div>

        {/* Tool indicator */}
        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {activeTool === 'move' && <Move className="w-3 h-3 inline mr-1" />}
          {activeTool === 'zoom' && <ZoomIn className="w-3 h-3 inline mr-1" />}
          {activeTool === 'rotate' && <RotateCw className="w-3 h-3 inline mr-1" />}
          {activeTool}
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        {/* Tool Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Tool</label>
          <div className="flex gap-2">
            <Button
              variant={activeTool === 'move' ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTool('move')}
            >
              <Move className="w-4 h-4 mr-1" />
              Move
            </Button>
            <Button
              variant={activeTool === 'zoom' ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTool('zoom')}
            >
              <ZoomIn className="w-4 h-4 mr-1" />
              Zoom
            </Button>
            <Button
              variant={activeTool === 'rotate' ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTool('rotate')}
            >
              <RotateCw className="w-4 h-4 mr-1" />
              Rotate
            </Button>
          </div>
        </div>

        {/* Zoom Controls */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Zoom: {settings.zoom}%
          </label>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleZoom('out')}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Slider
              value={[settings.zoom]}
              onValueChange={([value]) => updateSettings({ zoom: value })}
              min={25}
              max={300}
              step={5}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleZoom('in')}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Rotation Controls */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Rotation: {settings.rotation}°
          </label>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRotate('left')}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Slider
              value={[settings.rotation]}
              onValueChange={([value]) => updateSettings({ rotation: value })}
              min={0}
              max={360}
              step={1}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRotate('right')}
            >
              <RotateCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Image Adjustments */}
        <div className="space-y-3">
          <h4 className="font-medium">Image Adjustments</h4>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Brightness: {settings.brightness > 0 ? '+' : ''}{settings.brightness}%
            </label>
            <Slider
              value={[settings.brightness]}
              onValueChange={([value]) => updateSettings({ brightness: value })}
              min={-50}
              max={50}
              step={1}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Contrast: {settings.contrast > 0 ? '+' : ''}{settings.contrast}%
            </label>
            <Slider
              value={[settings.contrast]}
              onValueChange={([value]) => updateSettings({ contrast: value })}
              min={-50}
              max={50}
              step={1}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Saturation: {settings.saturation > 0 ? '+' : ''}{settings.saturation}%
            </label>
            <Slider
              value={[settings.saturation]}
              onValueChange={([value]) => updateSettings({ saturation: value })}
              min={-50}
              max={50}
              step={1}
            />
          </div>
        </div>

        {/* Split Position (only when comparison is enabled) */}
        {settings.showComparison && (
          <div>
            <label className="block text-sm font-medium mb-1">
              Split Position: {settings.splitPosition}%
            </label>
            <Slider
              value={[settings.splitPosition]}
              onValueChange={([value]) => updateSettings({ splitPosition: value })}
              min={10}
              max={90}
              step={1}
            />
          </div>
        )}

        {/* Reset Button */}
        <Button
          variant="outline"
          onClick={() => {
            setSettings({
              zoom: 100,
              rotation: 0,
              brightness: 0,
              contrast: 0,
              saturation: 0,
              showComparison: true,
              splitPosition: 50
            });
          }}
          className="w-full"
        >
          <Settings className="w-4 h-4 mr-2" />
          Reset All Settings
        </Button>
      </div>
    </Card>
  );
};