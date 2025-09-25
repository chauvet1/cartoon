import React, { useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Heart, Share2, Download, Eye, Filter, Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';

interface GalleryImage {
  _id: string;
  originalImageUrl: string;
  cartoonImageUrl: string;
  style: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  likes: number;
  downloads: number;
  views: number;
  isLiked: boolean;
  createdAt: number;
  tags: string[];
}

interface PublicGalleryProps {
  className?: string;
}

export const PublicGallery: React.FC<PublicGalleryProps> = ({ className }) => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [filteredImages, setFilteredImages] = useState<GalleryImage[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - in production, this would come from Convex
  useEffect(() => {
    const loadGalleryImages = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockImages: GalleryImage[] = [
        {
          _id: '1',
          originalImageUrl: 'https://blessed-kudu-154.convex.cloud/api/storage/29584e0a-d68e-427b-9fa8-db983c4d9a02',
          cartoonImageUrl: 'https://blessed-kudu-154.convex.cloud/api/storage/3a464c27-627c-4eb0-b6aa-99e71070a023',
          style: 'family-guy',
          userId: 'user1',
          userName: 'Alex Johnson',
          userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
          likes: 42,
          downloads: 18,
          views: 156,
          isLiked: false,
          createdAt: Date.now() - 86400000,
          tags: ['portrait', 'family-guy', 'cartoon']
        },
        {
          _id: '2',
          originalImageUrl: 'https://blessed-kudu-154.convex.cloud/api/storage/37f27d22-9f24-470b-a568-620d16792393',
          cartoonImageUrl: 'https://blessed-kudu-154.convex.cloud/api/storage/2554ac09-b5b6-4a2e-a2a9-0e38bf6818d5',
          style: 'simpsons',
          userId: 'user2',
          userName: 'Sarah Chen',
          userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face',
          likes: 89,
          downloads: 34,
          views: 234,
          isLiked: true,
          createdAt: Date.now() - 172800000,
          tags: ['portrait', 'simpsons', 'cartoon']
        },
        {
          _id: '3',
          originalImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
          cartoonImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
          style: 'anime',
          userId: 'user3',
          userName: 'Mike Rodriguez',
          userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face',
          likes: 156,
          downloads: 67,
          views: 445,
          isLiked: false,
          createdAt: Date.now() - 259200000,
          tags: ['portrait', 'anime', 'cartoon']
        }
      ];

      setImages(mockImages);
      setFilteredImages(mockImages);
      setIsLoading(false);
    };

    loadGalleryImages();
  }, []);

  // Filter and sort images
  useEffect(() => {
    let filtered = [...images];

    // Filter by style
    if (selectedStyle !== 'all') {
      filtered = filtered.filter(img => img.style === selectedStyle);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(img => 
        img.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        img.userName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort images
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.createdAt - a.createdAt;
        case 'oldest':
          return a.createdAt - b.createdAt;
        case 'most-liked':
          return b.likes - a.likes;
        case 'most-downloaded':
          return b.downloads - a.downloads;
        case 'most-viewed':
          return b.views - a.views;
        default:
          return 0;
      }
    });

    setFilteredImages(filtered);
  }, [images, selectedStyle, searchQuery, sortBy]);

  const handleLike = (imageId: string) => {
    setImages(prev => prev.map(img => 
      img._id === imageId 
        ? { 
            ...img, 
            isLiked: !img.isLiked, 
            likes: img.isLiked ? img.likes - 1 : img.likes + 1 
          }
        : img
    ));
  };

  const handleShare = async (image: GalleryImage) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Check out this ${image.style} cartoon transformation!`,
          text: `Created by ${image.userName} using Paperbag`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleDownload = (imageUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const styles = [
    { id: 'all', name: 'All Styles' },
    { id: 'simpsons', name: 'Simpsons' },
    { id: 'family-guy', name: 'Family Guy' },
    { id: 'anime', name: 'Anime' },
    { id: 'disney', name: 'Disney' },
    { id: 'studio-ghibli', name: 'Studio Ghibli' },
    { id: 'comic-book', name: 'Comic Book' },
    { id: 'south-park', name: 'South Park' }
  ];

  const sortOptions = [
    { id: 'newest', name: 'Newest' },
    { id: 'oldest', name: 'Oldest' },
    { id: 'most-liked', name: 'Most Liked' },
    { id: 'most-downloaded', name: 'Most Downloaded' },
    { id: 'most-viewed', name: 'Most Viewed' }
  ];

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Community Gallery</h2>
        <p className="text-gray-600">Discover amazing cartoon transformations created by our community</p>
      </div>

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by tags or creator..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Select value={selectedStyle} onValueChange={setSelectedStyle}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Style" />
              </SelectTrigger>
              <SelectContent>
                {styles.map((style) => (
                  <SelectItem key={style.id} value={style.id}>
                    {style.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Image Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredImages.map((image) => (
          <Card key={image._id} className="overflow-hidden hover:shadow-lg transition-shadow">
            {/* Image */}
            <div className="relative aspect-square group">
              <img
                src={image.cartoonImageUrl}
                alt={`${image.style} transformation`}
                className="w-full h-full object-cover"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors">
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleDownload(image.cartoonImageUrl, `cartoon-${image._id}.jpg`)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Style Badge */}
              <div className="absolute top-2 left-2">
                <span className="bg-white/90 text-gray-800 text-xs font-medium px-2 py-1 rounded">
                  {styles.find(s => s.id === image.style)?.name || image.style}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              {/* User Info */}
              <div className="flex items-center gap-2 mb-3">
                <img
                  src={image.userAvatar}
                  alt={image.userName}
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-sm font-medium text-gray-900">{image.userName}</span>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {image.views}
                  </div>
                  <div className="flex items-center gap-1">
                    <Download className="w-3 h-3" />
                    {image.downloads}
                  </div>
                </div>
                <span>{new Date(image.createdAt).toLocaleDateString()}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(image._id)}
                  className={image.isLiked ? 'text-red-500' : 'text-gray-500'}
                >
                  <Heart className={`w-4 h-4 mr-1 ${image.isLiked ? 'fill-current' : ''}`} />
                  {image.likes}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleShare(image)}
                >
                  <Share2 className="w-4 h-4 mr-1" />
                  Share
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredImages.length === 0 && (
        <Card className="p-12 text-center">
          <div className="text-gray-400 mb-4">
            <Filter className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No images found</h3>
          <p className="text-gray-500">
            Try adjusting your filters or search terms to find more images.
          </p>
        </Card>
      )}
    </div>
  );
};