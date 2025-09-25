import React, { useState, useEffect, useCallback } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Sparkles, 
  TrendingUp, 
  Clock, 
  Heart, 
  Download,
  Eye,
  Zap,
  Star,
  Users
} from 'lucide-react';

interface Recommendation {
  id: string;
  type: 'style' | 'trending' | 'similar' | 'personalized';
  title: string;
  description: string;
  confidence: number; // 0-100
  reason: string;
  imageUrl?: string;
  style?: string;
  metadata?: {
    popularity?: number;
    successRate?: number;
    userSatisfaction?: number;
    processingTime?: number;
  };
}

interface SmartRecommendationsProps {
  currentImage?: string;
  userHistory?: any[];
  onRecommendationClick: (recommendation: Recommendation) => void;
  className?: string;
}

export const SmartRecommendations: React.FC<SmartRecommendationsProps> = ({
  currentImage,
  userHistory = [],
  onRecommendationClick,
  className
}) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Mock AI analysis - in production, this would use actual AI
  const analyzeImage = useCallback((imageUrl: string): Promise<any> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate AI analysis
        resolve({
          dominantColors: ['#FFD700', '#FF6B6B', '#4ECDC4'],
          faceDetected: true,
          sceneType: 'portrait',
          mood: 'cheerful',
          complexity: 'medium',
          suggestedStyles: ['simpsons', 'anime', 'disney']
        });
      }, 1000);
    });
  }, []);

  const generateRecommendations = useCallback(async () => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    let mockRecommendations: Recommendation[] = [];

    // Style recommendations based on current image
    if (currentImage) {
      const analysis = await analyzeImage(currentImage);
      
      mockRecommendations.push({
        id: 'style-1',
        type: 'style',
        title: 'Simpsons Style',
        description: 'Perfect for your portrait! Yellow skin tone matches your photo.',
        confidence: 92,
        reason: 'Face detected with warm skin tones',
        style: 'simpsons',
        metadata: {
          popularity: 85,
          successRate: 94,
          userSatisfaction: 4.8,
          processingTime: 45
        }
      });

      mockRecommendations.push({
        id: 'style-2',
        type: 'style',
        title: 'Anime Style',
        description: 'Great for expressive portraits like yours.',
        confidence: 88,
        reason: 'Portrait with good facial features',
        style: 'anime',
        metadata: {
          popularity: 78,
          successRate: 91,
          userSatisfaction: 4.6,
          processingTime: 52
        }
      });
    }

    // Trending recommendations
    mockRecommendations.push({
      id: 'trending-1',
      type: 'trending',
      title: 'Studio Ghibli Style',
      description: 'Trending this week! Users love the soft, dreamy look.',
      confidence: 95,
      reason: 'Currently trending with 200% increase in usage',
      style: 'studio-ghibli',
      metadata: {
        popularity: 92,
        successRate: 89,
        userSatisfaction: 4.9,
        processingTime: 48
      }
    });

    mockRecommendations.push({
      id: 'trending-2',
      type: 'trending',
      title: 'Comic Book Style',
      description: 'Popular for action shots and dynamic poses.',
      confidence: 87,
      reason: 'High engagement on social media',
      style: 'comic-book',
      metadata: {
        popularity: 76,
        successRate: 87,
        userSatisfaction: 4.4,
        processingTime: 41
      }
    });

    // Similar user recommendations
    mockRecommendations.push({
      id: 'similar-1',
      type: 'similar',
      title: 'Family Guy Style',
      description: 'Users with similar photos loved this style.',
      confidence: 83,
      reason: 'Similar users with portrait photos chose this',
      style: 'family-guy',
      metadata: {
        popularity: 71,
        successRate: 93,
        userSatisfaction: 4.5,
        processingTime: 38
      }
    });

    // Personalized recommendations based on user history
    if (userHistory.length > 0) {
      mockRecommendations.push({
        id: 'personalized-1',
        type: 'personalized',
        title: 'Disney Style',
        description: 'Based on your previous choices, you might love this!',
        confidence: 79,
        reason: 'You often choose colorful, family-friendly styles',
        style: 'disney',
        metadata: {
          popularity: 88,
          successRate: 92,
          userSatisfaction: 4.7,
          processingTime: 44
        }
      });
    }

    setRecommendations(mockRecommendations);
    setIsLoading(false);
  }, [currentImage, userHistory, analyzeImage]);

  useEffect(() => {
    generateRecommendations();
  }, [generateRecommendations]);

  const getRecommendationIcon = (type: Recommendation['type']) => {
    switch (type) {
      case 'style':
        return <Sparkles className="w-4 h-4" />;
      case 'trending':
        return <TrendingUp className="w-4 h-4" />;
      case 'similar':
        return <Users className="w-4 h-4" />;
      case 'personalized':
        return <Star className="w-4 h-4" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 bg-green-100';
    if (confidence >= 80) return 'text-blue-600 bg-blue-100';
    if (confidence >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  const filteredRecommendations = selectedCategory === 'all' 
    ? recommendations 
    : recommendations.filter(rec => rec.type === selectedCategory);

  const categories = [
    { id: 'all', name: 'All', count: recommendations.length },
    { id: 'style', name: 'Style', count: recommendations.filter(r => r.type === 'style').length },
    { id: 'trending', name: 'Trending', count: recommendations.filter(r => r.type === 'trending').length },
    { id: 'similar', name: 'Similar', count: recommendations.filter(r => r.type === 'similar').length },
    { id: 'personalized', name: 'For You', count: recommendations.filter(r => r.type === 'personalized').length },
  ];

  if (isLoading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Smart Recommendations</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={generateRecommendations}
        >
          Refresh
        </Button>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.name} ({category.count})
          </Button>
        ))}
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {filteredRecommendations.map((recommendation) => (
          <div
            key={recommendation.id}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onRecommendationClick(recommendation)}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {getRecommendationIcon(recommendation.type)}
                <h4 className="font-medium">{recommendation.title}</h4>
                <Badge className={getConfidenceColor(recommendation.confidence)}>
                  {recommendation.confidence}%
                </Badge>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-3">{recommendation.description}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-gray-500">
                {recommendation.metadata?.popularity && (
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {recommendation.metadata.popularity}% popular
                  </div>
                )}
                {recommendation.metadata?.successRate && (
                  <div className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    {recommendation.metadata.successRate}% success
                  </div>
                )}
                {recommendation.metadata?.processingTime && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {recommendation.metadata.processingTime}s
                  </div>
                )}
              </div>
              
              <Button size="sm" variant="outline">
                Try This Style
              </Button>
            </div>

            <div className="mt-2 text-xs text-gray-500">
              <strong>Why:</strong> {recommendation.reason}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredRecommendations.length === 0 && (
        <div className="text-center py-8">
          <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No recommendations found</h4>
          <p className="text-gray-500">
            Try uploading an image or selecting a different category.
          </p>
        </div>
      )}

      {/* AI Insights */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <h4 className="font-medium text-blue-900">AI Insights</h4>
        </div>
        <p className="text-sm text-blue-800">
          Our AI analyzes your image content, user preferences, and trending styles to suggest 
          the best cartoon transformations for your photos.
        </p>
      </div>
    </Card>
  );
};