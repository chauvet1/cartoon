import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { 
  Share2, 
  Facebook, 
  Twitter, 
  Instagram, 
  Copy, 
  Download, 
  MessageCircle,
  Mail,
  Link as LinkIcon,
  Check
} from 'lucide-react';

interface SocialSharingProps {
  imageUrl: string;
  originalImageUrl?: string;
  style: string;
  userName?: string;
  onClose?: () => void;
}

export const SocialSharing: React.FC<SocialSharingProps> = ({
  imageUrl,
  originalImageUrl,
  style,
  userName,
  onClose
}) => {
  const [copied, setCopied] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [showBeforeAfter, setShowBeforeAfter] = useState(false);

  const shareUrl = window.location.href;
  const shareTitle = `Check out my ${style} cartoon transformation!`;
  const shareText = customMessage || `Created with Paperbag - Transform your photos into cartoon art!`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSocialShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(shareTitle);
    const encodedText = encodeURIComponent(shareText);

    let shareUrl_platform = '';

    switch (platform) {
      case 'twitter':
        shareUrl_platform = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'facebook':
        shareUrl_platform = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'instagram':
        // Instagram doesn't support direct sharing, so we'll copy the image
        handleDownload(imageUrl, 'cartoon-for-instagram.jpg');
        return;
      case 'whatsapp':
        shareUrl_platform = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
        break;
      case 'telegram':
        shareUrl_platform = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
        break;
      case 'email':
        shareUrl_platform = `mailto:?subject=${encodedTitle}&body=${encodedText}%0A%0A${encodedUrl}`;
        break;
    }

    if (shareUrl_platform) {
      window.open(shareUrl_platform, '_blank', 'width=600,height=400');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      handleCopyLink();
    }
  };

  const createBeforeAfterImage = () => {
    // This would create a side-by-side comparison image
    // For now, we'll just toggle the display
    setShowBeforeAfter(!showBeforeAfter);
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Share Your Creation</h3>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        )}
      </div>

      {/* Image Preview */}
      <div className="space-y-4">
        <div className="relative">
          <img
            src={imageUrl}
            alt="Cartoon transformation"
            className="w-full max-w-md mx-auto rounded-lg shadow-md"
          />
          
          {showBeforeAfter && originalImageUrl && (
            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
              <div className="bg-white p-4 rounded-lg max-w-sm">
                <h4 className="font-medium mb-2">Before & After</h4>
                <div className="grid grid-cols-2 gap-2">
                  <img
                    src={originalImageUrl}
                    alt="Original"
                    className="w-full h-20 object-cover rounded"
                  />
                  <img
                    src={imageUrl}
                    alt="Cartoon"
                    className="w-full h-20 object-cover rounded"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDownload(imageUrl, 'cartoon-image.jpg')}
          >
            <Download className="w-4 h-4 mr-1" />
            Download
          </Button>
          
          {originalImageUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={createBeforeAfterImage}
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              {showBeforeAfter ? 'Hide' : 'Show'} Before/After
            </Button>
          )}
        </div>
      </div>

      {/* Custom Message */}
      <div>
        <label className="block text-sm font-medium mb-2">Custom Message</label>
        <Input
          placeholder="Add a custom message to your share..."
          value={customMessage}
          onChange={(e) => setCustomMessage(e.target.value)}
          maxLength={280}
        />
        <p className="text-xs text-gray-500 mt-1">
          {customMessage.length}/280 characters
        </p>
      </div>

      {/* Social Media Buttons */}
      <div className="space-y-4">
        <h4 className="font-medium">Share on Social Media</h4>
        
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={() => handleSocialShare('twitter')}
            className="flex items-center gap-2"
          >
            <Twitter className="w-4 h-4 text-blue-400" />
            Twitter
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleSocialShare('facebook')}
            className="flex items-center gap-2"
          >
            <Facebook className="w-4 h-4 text-blue-600" />
            Facebook
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleSocialShare('instagram')}
            className="flex items-center gap-2"
          >
            <Instagram className="w-4 h-4 text-pink-500" />
            Instagram
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleSocialShare('whatsapp')}
            className="flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4 text-green-500" />
            WhatsApp
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleSocialShare('telegram')}
            className="flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4 text-blue-500" />
            Telegram
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleSocialShare('email')}
            className="flex items-center gap-2"
          >
            <Mail className="w-4 h-4 text-gray-600" />
            Email
          </Button>
        </div>
      </div>

      {/* Copy Link */}
      <div className="space-y-3">
        <h4 className="font-medium">Copy Link</h4>
        
        <div className="flex gap-2">
          <Input
            value={shareUrl}
            readOnly
            className="flex-1"
          />
          <Button
            onClick={handleCopyLink}
            variant={copied ? "default" : "outline"}
            className={copied ? "bg-green-600 hover:bg-green-700" : ""}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-1" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Native Share */}
      {navigator.share && (
        <Button
          onClick={handleNativeShare}
          className="w-full"
          size="lg"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      )}

      {/* Embed Code */}
      <div className="space-y-3">
        <h4 className="font-medium">Embed Code</h4>
        <div className="bg-gray-100 p-3 rounded-lg">
          <code className="text-sm text-gray-700">
            {`<img src="${imageUrl}" alt="${style} cartoon transformation" />`}
          </code>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            navigator.clipboard.writeText(`<img src="${imageUrl}" alt="${style} cartoon transformation" />`);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
        >
          <Copy className="w-4 h-4 mr-1" />
          Copy Embed Code
        </Button>
      </div>
    </Card>
  );
};