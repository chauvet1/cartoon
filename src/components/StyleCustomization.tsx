import React, { useState, useCallback } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Palette, Mix, Upload, Wand2 } from 'lucide-react';

interface StyleCustomizationProps {
  selectedStyle: string;
  onStyleChange: (style: string) => void;
  onIntensityChange: (intensity: number) => void;
  onColorPaletteChange: (palette: string) => void;
  onStyleMixChange: (mix: StyleMix) => void;
}

interface StyleMix {
  primary: string;
  secondary: string;
  ratio: number; // 0-100, percentage of primary style
}

interface CustomStyle {
  id: string;
  name: string;
  description: string;
  preview: string;
}

export const StyleCustomization: React.FC<StyleCustomizationProps> = ({
  selectedStyle,
  onStyleChange,
  onIntensityChange,
  onColorPaletteChange,
  onStyleMixChange
}) => {
  const [intensity, setIntensity] = useState(75);
  const [colorPalette, setColorPalette] = useState('original');
  const [styleMix, setStyleMix] = useState<StyleMix>({
    primary: selectedStyle,
    secondary: 'simpsons',
    ratio: 100
  });
  const [customStyles, setCustomStyles] = useState<CustomStyle[]>([]);

  const baseStyles = [
    { id: "simpsons", name: "Simpsons", description: "Iconic yellow cartoon style" },
    { id: "studio-ghibli", name: "Studio Ghibli", description: "Soft, detailed anime style" },
    { id: "family-guy", name: "Family Guy", description: "Simple, bold cartoon style" },
    { id: "disney", name: "Disney", description: "Classic animation style" },
    { id: "anime", name: "Anime", description: "Japanese animation style" },
    { id: "comic-book", name: "Comic Book", description: "Bold, graphic style" },
    { id: "south-park", name: "South Park", description: "Simple geometric style" }
  ];

  const colorPalettes = [
    { id: 'original', name: 'Original Colors', description: 'Keep original color scheme' },
    { id: 'vibrant', name: 'Vibrant', description: 'Bright, saturated colors' },
    { id: 'pastel', name: 'Pastel', description: 'Soft, muted colors' },
    { id: 'monochrome', name: 'Monochrome', description: 'Black and white' },
    { id: 'sepia', name: 'Sepia', description: 'Vintage brown tones' },
    { id: 'neon', name: 'Neon', description: 'Electric, glowing colors' }
  ];

  const handleIntensityChange = useCallback((value: number[]) => {
    const newIntensity = value[0];
    setIntensity(newIntensity);
    onIntensityChange(newIntensity);
  }, [onIntensityChange]);

  const handleColorPaletteChange = useCallback((palette: string) => {
    setColorPalette(palette);
    onColorPaletteChange(palette);
  }, [onColorPaletteChange]);

  const handleStyleMixChange = useCallback((field: keyof StyleMix, value: string | number) => {
    const newMix = { ...styleMix, [field]: value };
    setStyleMix(newMix);
    onStyleMixChange(newMix);
  }, [styleMix, onStyleMixChange]);

  const handleCustomStyleUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // In a real implementation, you'd upload this to train a custom model
    const newStyle: CustomStyle = {
      id: `custom-${Date.now()}`,
      name: file.name.split('.')[0],
      description: 'Custom uploaded style',
      preview: URL.createObjectURL(file)
    };

    setCustomStyles(prev => [...prev, newStyle]);
  }, []);

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Wand2 className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Style Customization</h3>
      </div>

      {/* Style Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">Cartoon Style</label>
        <Select value={selectedStyle} onValueChange={onStyleChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a style" />
          </SelectTrigger>
          <SelectContent>
            {baseStyles.map((style) => (
              <SelectItem key={style.id} value={style.id}>
                <div>
                  <div className="font-medium">{style.name}</div>
                  <div className="text-xs text-gray-500">{style.description}</div>
                </div>
              </SelectItem>
            ))}
            {customStyles.map((style) => (
              <SelectItem key={style.id} value={style.id}>
                <div className="flex items-center gap-2">
                  <img src={style.preview} alt={style.name} className="w-6 h-6 rounded object-cover" />
                  <div>
                    <div className="font-medium">{style.name}</div>
                    <div className="text-xs text-gray-500">{style.description}</div>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Style Intensity */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Style Intensity: {intensity}%
        </label>
        <Slider
          value={[intensity]}
          onValueChange={handleIntensityChange}
          min={10}
          max={100}
          step={5}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Subtle</span>
          <span>Extreme</span>
        </div>
      </div>

      {/* Color Palette */}
      <div>
        <label className="block text-sm font-medium mb-2">Color Palette</label>
        <Select value={colorPalette} onValueChange={handleColorPaletteChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select color palette" />
          </SelectTrigger>
          <SelectContent>
            {colorPalettes.map((palette) => (
              <SelectItem key={palette.id} value={palette.id}>
                <div>
                  <div className="font-medium">{palette.name}</div>
                  <div className="text-xs text-gray-500">{palette.description}</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Style Mixing */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Mix className="w-4 h-4 text-purple-600" />
          <label className="text-sm font-medium">Style Mixing</label>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Primary Style</label>
            <Select 
              value={styleMix.primary} 
              onValueChange={(value) => handleStyleMixChange('primary', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {baseStyles.map((style) => (
                  <SelectItem key={style.id} value={style.id}>
                    {style.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-xs text-gray-600 mb-1">Secondary Style</label>
            <Select 
              value={styleMix.secondary} 
              onValueChange={(value) => handleStyleMixChange('secondary', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {baseStyles.map((style) => (
                  <SelectItem key={style.id} value={style.id}>
                    {style.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-600 mb-1">
            Mix Ratio: {styleMix.ratio}% {baseStyles.find(s => s.id === styleMix.primary)?.name}
          </label>
          <Slider
            value={[styleMix.ratio]}
            onValueChange={([value]) => handleStyleMixChange('ratio', value)}
            min={0}
            max={100}
            step={10}
            className="w-full"
          />
        </div>
      </div>

      {/* Custom Style Upload */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Upload className="w-4 h-4 text-green-600" />
          <label className="text-sm font-medium">Custom Styles</label>
        </div>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleCustomStyleUpload}
            className="hidden"
            id="custom-style-upload"
          />
          <label
            htmlFor="custom-style-upload"
            className="cursor-pointer text-sm text-gray-600 hover:text-gray-800"
          >
            Upload a reference image to create a custom style
          </label>
          <p className="text-xs text-gray-500 mt-1">
            Upload an image that represents the style you want to replicate
          </p>
        </div>

        {customStyles.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {customStyles.map((style) => (
              <div key={style.id} className="flex items-center gap-2 p-2 border rounded">
                <img src={style.preview} alt={style.name} className="w-8 h-8 rounded object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{style.name}</div>
                  <div className="text-xs text-gray-500">Custom</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview */}
      <div className="pt-4 border-t">
        <div className="text-sm text-gray-600">
          <strong>Preview:</strong> {baseStyles.find(s => s.id === selectedStyle)?.name} style 
          at {intensity}% intensity with {colorPalettes.find(p => p.id === colorPalette)?.name.toLowerCase()} colors
          {styleMix.ratio < 100 && ` mixed with ${baseStyles.find(s => s.id === styleMix.secondary)?.name}`}
        </div>
      </div>
    </Card>
  );
};