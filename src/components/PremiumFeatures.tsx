import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Crown, 
  Zap, 
  Shield, 
  Download, 
  Upload, 
  Settings, 
  BarChart3,
  Users,
  Code,
  Palette,
  Sparkles,
  Clock,
  CheckCircle
} from 'lucide-react';

interface PremiumFeature {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'processing' | 'quality' | 'tools' | 'collaboration' | 'api' | 'customization';
  requiredPlan: 'pro' | 'business' | 'enterprise';
  isEnabled: boolean;
  usage?: {
    current: number;
    limit: number;
    unit: string;
  };
}

interface PremiumFeaturesProps {
  userPlan: 'free' | 'pro' | 'business' | 'enterprise';
  onUpgrade: (plan: string) => void;
  className?: string;
}

export const PremiumFeatures: React.FC<PremiumFeaturesProps> = ({
  userPlan,
  onUpgrade,
  className
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const features: PremiumFeature[] = [
    {
      id: 'high-res',
      name: 'Ultra High Resolution',
      description: 'Generate cartoon images up to 4K resolution for crystal-clear results',
      icon: <Download className="w-5 h-5" />,
      category: 'quality',
      requiredPlan: 'pro',
      isEnabled: userPlan !== 'free',
      usage: userPlan === 'pro' ? { current: 45, limit: 100, unit: 'images' } : undefined
    },
    {
      id: 'priority-processing',
      name: 'Priority Processing',
      description: 'Skip the queue and get your images processed in seconds, not minutes',
      icon: <Zap className="w-5 h-5" />,
      category: 'processing',
      requiredPlan: 'pro',
      isEnabled: userPlan !== 'free'
    },
    {
      id: 'batch-processing',
      name: 'Batch Processing',
      description: 'Process up to 10 images simultaneously for maximum efficiency',
      icon: <Upload className="w-5 h-5" />,
      category: 'processing',
      requiredPlan: 'pro',
      isEnabled: userPlan !== 'free',
      usage: userPlan === 'pro' ? { current: 8, limit: 20, unit: 'batches' } : undefined
    },
    {
      id: 'custom-styles',
      name: 'Custom Style Training',
      description: 'Upload reference images to train your own unique cartoon styles',
      icon: <Palette className="w-5 h-5" />,
      category: 'customization',
      requiredPlan: 'business',
      isEnabled: userPlan === 'business' || userPlan === 'enterprise'
    },
    {
      id: 'advanced-editing',
      name: 'Advanced Editing Tools',
      description: 'Professional-grade post-processing with filters, adjustments, and effects',
      icon: <Settings className="w-5 h-5" />,
      category: 'tools',
      requiredPlan: 'pro',
      isEnabled: userPlan !== 'free'
    },
    {
      id: 'api-access',
      name: 'API Access',
      description: 'Integrate Paperbag into your applications with our RESTful API',
      icon: <Code className="w-5 h-5" />,
      category: 'api',
      requiredPlan: 'business',
      isEnabled: userPlan === 'business' || userPlan === 'enterprise',
      usage: userPlan === 'business' ? { current: 1250, limit: 10000, unit: 'API calls' } : undefined
    },
    {
      id: 'team-collaboration',
      name: 'Team Collaboration',
      description: 'Share projects, manage team members, and collaborate on cartoon transformations',
      icon: <Users className="w-5 h-5" />,
      category: 'collaboration',
      requiredPlan: 'business',
      isEnabled: userPlan === 'business' || userPlan === 'enterprise'
    },
    {
      id: 'analytics',
      name: 'Usage Analytics',
      description: 'Detailed insights into your usage patterns, popular styles, and performance metrics',
      icon: <BarChart3 className="w-5 h-5" />,
      category: 'tools',
      requiredPlan: 'business',
      isEnabled: userPlan === 'business' || userPlan === 'enterprise'
    },
    {
      id: 'white-label',
      name: 'White-Label Solution',
      description: 'Remove Paperbag branding and customize the interface for your brand',
      icon: <Shield className="w-5 h-5" />,
      category: 'customization',
      requiredPlan: 'enterprise',
      isEnabled: userPlan === 'enterprise'
    },
    {
      id: 'dedicated-support',
      name: 'Dedicated Support',
      description: 'Get priority support with dedicated account managers and faster response times',
      icon: <Clock className="w-5 h-5" />,
      category: 'collaboration',
      requiredPlan: 'enterprise',
      isEnabled: userPlan === 'enterprise'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Features', count: features.length },
    { id: 'processing', name: 'Processing', count: features.filter(f => f.category === 'processing').length },
    { id: 'quality', name: 'Quality', count: features.filter(f => f.category === 'quality').length },
    { id: 'tools', name: 'Tools', count: features.filter(f => f.category === 'tools').length },
    { id: 'collaboration', name: 'Collaboration', count: features.filter(f => f.category === 'collaboration').length },
    { id: 'api', name: 'API', count: features.filter(f => f.category === 'api').length },
    { id: 'customization', name: 'Customization', count: features.filter(f => f.category === 'customization').length },
  ];

  const filteredFeatures = selectedCategory === 'all' 
    ? features 
    : features.filter(feature => feature.category === selectedCategory);

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'pro': return 'text-blue-600 bg-blue-100';
      case 'business': return 'text-purple-600 bg-purple-100';
      case 'enterprise': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRequiredPlanIcon = (plan: string) => {
    switch (plan) {
      case 'pro': return <Crown className="w-3 h-3" />;
      case 'business': return <Shield className="w-3 h-3" />;
      case 'enterprise': return <Sparkles className="w-3 h-3" />;
      default: return null;
    }
  };

  const getUpgradePlan = (requiredPlan: string) => {
    if (userPlan === 'free') return requiredPlan;
    if (userPlan === 'pro' && requiredPlan === 'business') return 'business';
    if (userPlan === 'business' && requiredPlan === 'enterprise') return 'enterprise';
    return null;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Crown className="w-6 h-6 text-yellow-500" />
          <h2 className="text-2xl font-bold text-gray-900">Premium Features</h2>
        </div>
        <p className="text-gray-600">
          Unlock powerful features to take your cartoon transformations to the next level
        </p>
      </div>

      {/* Current Plan Status */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Current Plan: {userPlan.charAt(0).toUpperCase() + userPlan.slice(1)}</h3>
            <p className="text-sm text-gray-600">
              {userPlan === 'free' && 'Upgrade to unlock premium features'}
              {userPlan === 'pro' && 'You have access to Pro features'}
              {userPlan === 'business' && 'You have access to Business features'}
              {userPlan === 'enterprise' && 'You have access to all Enterprise features'}
            </p>
          </div>
          {userPlan !== 'enterprise' && (
            <Button onClick={() => onUpgrade('upgrade')}>
              Upgrade Plan
            </Button>
          )}
        </div>
      </Card>

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

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFeatures.map((feature) => {
          const upgradePlan = getUpgradePlan(feature.requiredPlan);
          const canUpgrade = upgradePlan && userPlan !== 'enterprise';
          
          return (
            <Card
              key={feature.id}
              className={`p-6 ${
                feature.isEnabled ? 'border-green-200 bg-green-50' : 'border-gray-200'
              }`}
            >
              {/* Feature Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    feature.isEnabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{feature.name}</h3>
                    <Badge className={getPlanColor(feature.requiredPlan)}>
                      {getRequiredPlanIcon(feature.requiredPlan)}
                      <span className="ml-1">{feature.requiredPlan}</span>
                    </Badge>
                  </div>
                </div>
                
                {feature.isEnabled && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
              </div>

              {/* Feature Description */}
              <p className="text-sm text-gray-600 mb-4">{feature.description}</p>

              {/* Usage Stats */}
              {feature.usage && (
                <div className="bg-white rounded-lg p-3 mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Usage this month</span>
                    <span className="font-medium">
                      {feature.usage.current} / {feature.usage.limit} {feature.usage.unit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(feature.usage.current / feature.usage.limit) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="flex gap-2">
                {feature.isEnabled ? (
                  <Button variant="outline" size="sm" className="flex-1">
                    Use Feature
                  </Button>
                ) : canUpgrade ? (
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => onUpgrade(upgradePlan!)}
                  >
                    Upgrade to {upgradePlan}
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" className="flex-1" disabled>
                    Not Available
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Upgrade CTA */}
      {userPlan !== 'enterprise' && (
        <Card className="p-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Unlock More?</h3>
          <p className="text-lg mb-6">
            Upgrade your plan to access premium features and take your cartoon transformations to the next level.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => onUpgrade('pro')}
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Pro
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-white border-white hover:bg-white hover:text-purple-600"
              onClick={() => onUpgrade('business')}
            >
              <Shield className="w-4 h-4 mr-2" />
              Upgrade to Business
            </Button>
          </div>
        </Card>
      )}

      {/* Feature Comparison */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Feature Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Feature</th>
                <th className="text-center py-2">Free</th>
                <th className="text-center py-2">Pro</th>
                <th className="text-center py-2">Business</th>
                <th className="text-center py-2">Enterprise</th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature) => (
                <tr key={feature.id} className="border-b">
                  <td className="py-2 font-medium">{feature.name}</td>
                  <td className="text-center py-2">
                    {feature.requiredPlan === 'free' ? '✓' : '✗'}
                  </td>
                  <td className="text-center py-2">
                    {['free', 'pro'].includes(feature.requiredPlan) ? '✓' : '✗'}
                  </td>
                  <td className="text-center py-2">
                    {['free', 'pro', 'business'].includes(feature.requiredPlan) ? '✓' : '✗'}
                  </td>
                  <td className="text-center py-2">✓</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};