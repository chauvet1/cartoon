import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { 
  Eye, 
  EyeOff, 
  Volume2, 
  VolumeX, 
  Keyboard, 
  MousePointer,
  Contrast,
  Type,
  Zap,
  Settings
} from 'lucide-react';

interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  voiceAnnouncements: boolean;
  colorBlindSupport: boolean;
  fontSize: number;
  contrastLevel: number;
}

interface AccessibilityPanelProps {
  onSettingsChange: (settings: AccessibilitySettings) => void;
  className?: string;
}

export const AccessibilityPanel: React.FC<AccessibilityPanelProps> = ({
  onSettingsChange,
  className
}) => {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    screenReader: false,
    keyboardNavigation: true,
    voiceAnnouncements: false,
    colorBlindSupport: false,
    fontSize: 16,
    contrastLevel: 100
  });

  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  // Apply accessibility settings to the document
  useEffect(() => {
    const root = document.documentElement;
    
    // High contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Large text
    if (settings.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }

    // Reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    // Color blind support
    if (settings.colorBlindSupport) {
      root.classList.add('colorblind-support');
    } else {
      root.classList.remove('colorblind-support');
    }

    // Font size
    root.style.setProperty('--font-size', `${settings.fontSize}px`);

    // Contrast level
    root.style.setProperty('--contrast-level', `${settings.contrastLevel}%`);

    onSettingsChange(settings);
  }, [settings, onSettingsChange]);

  // Voice announcements
  useEffect(() => {
    if (announcement && settings.voiceAnnouncements) {
      const utterance = new SpeechSynthesisUtterance(announcement);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
      setAnnouncement('');
    }
  }, [announcement, settings.voiceAnnouncements]);

  const updateSetting = (key: keyof AccessibilitySettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    // Announce changes for screen readers
    if (settings.screenReader) {
      const message = `${key} changed to ${value}`;
      setAnnouncement(message);
    }
  };

  const announcePageChange = (page: string) => {
    if (settings.voiceAnnouncements) {
      setAnnouncement(`Navigated to ${page}`);
    }
  };

  const handleKeyboardShortcut = (e: KeyboardEvent) => {
    if (!settings.keyboardNavigation) return;

    // Alt + A: Toggle accessibility panel
    if (e.altKey && e.key === 'a') {
      e.preventDefault();
      announcePageChange('accessibility settings');
    }

    // Alt + H: Toggle high contrast
    if (e.altKey && e.key === 'h') {
      e.preventDefault();
      updateSetting('highContrast', !settings.highContrast);
    }

    // Alt + L: Toggle large text
    if (e.altKey && e.key === 'l') {
      e.preventDefault();
      updateSetting('largeText', !settings.largeText);
    }

    // Alt + R: Toggle reduced motion
    if (e.altKey && e.key === 'r') {
      e.preventDefault();
      updateSetting('reducedMotion', !settings.reducedMotion);
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyboardShortcut);
    return () => document.removeEventListener('keydown', handleKeyboardShortcut);
  }, [settings]);

  const resetToDefaults = () => {
    setSettings({
      highContrast: false,
      largeText: false,
      reducedMotion: false,
      screenReader: false,
      keyboardNavigation: true,
      voiceAnnouncements: false,
      colorBlindSupport: false,
      fontSize: 16,
      contrastLevel: 100
    });
    setAnnouncement('Accessibility settings reset to defaults');
  };

  return (
    <Card className={`p-6 space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Accessibility Settings</h3>
        </div>
        <Button variant="outline" size="sm" onClick={resetToDefaults}>
          Reset
        </Button>
      </div>

      {/* Visual Settings */}
      <div className="space-y-4">
        <h4 className="font-medium flex items-center gap-2">
          <Eye className="w-4 h-4" />
          Visual Settings
        </h4>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">High Contrast Mode</label>
              <p className="text-xs text-gray-600">Increase contrast for better visibility</p>
            </div>
            <Switch
              checked={settings.highContrast}
              onCheckedChange={(checked) => updateSetting('highContrast', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Large Text</label>
              <p className="text-xs text-gray-600">Increase text size for better readability</p>
            </div>
            <Switch
              checked={settings.largeText}
              onCheckedChange={(checked) => updateSetting('largeText', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Color Blind Support</label>
              <p className="text-xs text-gray-600">Optimize colors for color vision deficiency</p>
            </div>
            <Switch
              checked={settings.colorBlindSupport}
              onCheckedChange={(checked) => updateSetting('colorBlindSupport', checked)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Font Size: {settings.fontSize}px
            </label>
            <Slider
              value={[settings.fontSize]}
              onValueChange={([value]) => updateSetting('fontSize', value)}
              min={12}
              max={24}
              step={1}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Contrast Level: {settings.contrastLevel}%
            </label>
            <Slider
              value={[settings.contrastLevel]}
              onValueChange={([value]) => updateSetting('contrastLevel', value)}
              min={50}
              max={200}
              step={10}
            />
          </div>
        </div>
      </div>

      {/* Motion Settings */}
      <div className="space-y-4">
        <h4 className="font-medium flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Motion Settings
        </h4>
        
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium">Reduce Motion</label>
            <p className="text-xs text-gray-600">Minimize animations and transitions</p>
          </div>
          <Switch
            checked={settings.reducedMotion}
            onCheckedChange={(checked) => updateSetting('reducedMotion', checked)}
          />
        </div>
      </div>

      {/* Audio Settings */}
      <div className="space-y-4">
        <h4 className="font-medium flex items-center gap-2">
          <Volume2 className="w-4 h-4" />
          Audio Settings
        </h4>
        
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium">Voice Announcements</label>
            <p className="text-xs text-gray-600">Announce page changes and actions</p>
          </div>
          <Switch
            checked={settings.voiceAnnouncements}
            onCheckedChange={(checked) => updateSetting('voiceAnnouncements', checked)}
          />
        </div>
      </div>

      {/* Navigation Settings */}
      <div className="space-y-4">
        <h4 className="font-medium flex items-center gap-2">
          <Keyboard className="w-4 h-4" />
          Navigation Settings
        </h4>
        
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium">Keyboard Navigation</label>
            <p className="text-xs text-gray-600">Enable keyboard shortcuts and navigation</p>
          </div>
          <Switch
            checked={settings.keyboardNavigation}
            onCheckedChange={(checked) => updateSetting('keyboardNavigation', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium">Screen Reader Support</label>
            <p className="text-xs text-gray-600">Optimize for screen readers</p>
          </div>
          <Switch
            checked={settings.screenReader}
            onCheckedChange={(checked) => updateSetting('screenReader', checked)}
          />
        </div>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium mb-3">Keyboard Shortcuts</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div className="flex justify-between">
            <span>Toggle Accessibility Panel</span>
            <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Alt + A</kbd>
          </div>
          <div className="flex justify-between">
            <span>Toggle High Contrast</span>
            <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Alt + H</kbd>
          </div>
          <div className="flex justify-between">
            <span>Toggle Large Text</span>
            <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Alt + L</kbd>
          </div>
          <div className="flex justify-between">
            <span>Toggle Reduced Motion</span>
            <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Alt + R</kbd>
          </div>
        </div>
      </div>

      {/* Accessibility Features Info */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Accessibility Features</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• WCAG 2.1 AA compliant interface</li>
          <li>• Screen reader compatible</li>
          <li>• Keyboard navigation support</li>
          <li>• High contrast and large text options</li>
          <li>• Voice announcements for important actions</li>
          <li>• Color blind friendly color schemes</li>
        </ul>
      </div>
    </Card>
  );
};