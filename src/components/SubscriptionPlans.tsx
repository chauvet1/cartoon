import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Check, Crown, Zap, Star, Users, Clock, Shield } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: string[];
  limits: {
    imagesPerMonth: number | 'unlimited';
    maxResolution: string;
    priorityProcessing: boolean;
    apiAccess: boolean;
    watermark: boolean;
  };
  popular?: boolean;
  recommended?: boolean;
}

interface SubscriptionPlansProps {
  onSelectPlan: (plan: Plan) => void;
  currentPlan?: string;
  className?: string;
}

export const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({
  onSelectPlan,
  currentPlan,
  className
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const plans: Plan[] = [
    {
      id: 'free',
      name: 'Free',
      description: 'Perfect for trying out Paperbag',
      price: { monthly: 0, yearly: 0 },
      features: [
        '3 cartoon transformations per month',
        'Standard resolution (1024x1024)',
        'Basic cartoon styles',
        'Community gallery access',
        'Email support'
      ],
      limits: {
        imagesPerMonth: 3,
        maxResolution: '1024x1024',
        priorityProcessing: false,
        apiAccess: false,
        watermark: true
      }
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'For creators and professionals',
      price: { monthly: 19, yearly: 190 },
      features: [
        '100 cartoon transformations per month',
        'High resolution (2048x2048)',
        'All cartoon styles + custom styles',
        'Priority processing',
        'Batch processing (up to 10 images)',
        'Advanced editing tools',
        'No watermarks',
        'Priority support'
      ],
      limits: {
        imagesPerMonth: 100,
        maxResolution: '2048x2048',
        priorityProcessing: true,
        apiAccess: false,
        watermark: false
      },
      popular: true
    },
    {
      id: 'business',
      name: 'Business',
      description: 'For teams and agencies',
      price: { monthly: 49, yearly: 490 },
      features: [
        'Unlimited cartoon transformations',
        'Ultra high resolution (4K)',
        'All Pro features',
        'Team collaboration',
        'API access',
        'White-label options',
        'Custom model training',
        'Dedicated support',
        'Usage analytics'
      ],
      limits: {
        imagesPerMonth: 'unlimited',
        maxResolution: '4096x4096',
        priorityProcessing: true,
        apiAccess: true,
        watermark: false
      },
      recommended: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'Custom solutions for large organizations',
      price: { monthly: 0, yearly: 0 },
      features: [
        'Custom pricing and limits',
        'On-premise deployment',
        'Custom AI model training',
        'SLA guarantees',
        'Dedicated account manager',
        'Custom integrations',
        'Advanced security features',
        '24/7 phone support'
      ],
      limits: {
        imagesPerMonth: 'unlimited',
        maxResolution: 'unlimited',
        priorityProcessing: true,
        apiAccess: true,
        watermark: false
      }
    }
  ];

  const handleSelectPlan = async (plan: Plan) => {
    setIsLoading(plan.id);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onSelectPlan(plan);
    setIsLoading(null);
  };

  const formatPrice = (price: number, cycle: 'monthly' | 'yearly') => {
    if (price === 0) return 'Free';
    
    if (cycle === 'yearly') {
      const monthlyPrice = price / 12;
      return `$${monthlyPrice.toFixed(0)}/month`;
    }
    
    return `$${price}/month`;
  };

  const getSavings = (monthlyPrice: number, yearlyPrice: number) => {
    const monthlyTotal = monthlyPrice * 12;
    const savings = monthlyTotal - yearlyPrice;
    const percentage = Math.round((savings / monthlyTotal) * 100);
    return { amount: savings, percentage };
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Plan</h2>
        <p className="text-lg text-gray-600 mb-8">
          Unlock the full potential of AI-powered cartoon transformations
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
            Monthly
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-gray-900' : 'text-gray-500'}`}>
            Yearly
          </span>
          {billingCycle === 'yearly' && (
            <Badge className="bg-green-100 text-green-800">
              Save up to 20%
            </Badge>
          )}
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = currentPlan === plan.id;
          const savings = plan.price.monthly > 0 ? getSavings(plan.price.monthly, plan.price.yearly) : null;
          
          return (
            <Card
              key={plan.id}
              className={`relative p-6 ${
                plan.popular ? 'ring-2 ring-blue-500' : ''
              } ${
                plan.recommended ? 'ring-2 ring-purple-500' : ''
              } ${
                isCurrentPlan ? 'bg-blue-50' : ''
              }`}
            >
              {/* Badges */}
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                {plan.popular && (
                  <Badge className="bg-blue-500 text-white">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                )}
                {plan.recommended && (
                  <Badge className="bg-purple-500 text-white">
                    <Crown className="w-3 h-3 mr-1" />
                    Recommended
                  </Badge>
                )}
              </div>

              {/* Plan Header */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                
                <div className="mb-2">
                  <span className="text-3xl font-bold text-gray-900">
                    {formatPrice(plan.price[billingCycle], billingCycle)}
                  </span>
                  {billingCycle === 'yearly' && savings && (
                    <div className="text-sm text-green-600">
                      Save ${savings.amount} ({savings.percentage}%)
                    </div>
                  )}
                </div>

                {plan.id === 'enterprise' && (
                  <div className="text-sm text-gray-500">Contact sales for pricing</div>
                )}
              </div>

              {/* Features */}
              <div className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Limits Summary */}
              <div className="bg-gray-50 rounded-lg p-3 mb-6">
                <div className="text-xs text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Images/month:</span>
                    <span className="font-medium">
                      {plan.limits.imagesPerMonth === 'unlimited' ? '∞' : plan.limits.imagesPerMonth}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Max resolution:</span>
                    <span className="font-medium">{plan.limits.maxResolution}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Priority processing:</span>
                    <span className="font-medium">
                      {plan.limits.priorityProcessing ? (
                        <Zap className="w-3 h-3 text-yellow-500 inline" />
                      ) : (
                        <Clock className="w-3 h-3 text-gray-400 inline" />
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>API access:</span>
                    <span className="font-medium">
                      {plan.limits.apiAccess ? (
                        <Shield className="w-3 h-3 text-green-500 inline" />
                      ) : (
                        <span className="text-gray-400">×</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Button
                onClick={() => handleSelectPlan(plan)}
                disabled={isCurrentPlan || isLoading === plan.id}
                className={`w-full ${
                  plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''
                } ${
                  plan.recommended ? 'bg-purple-600 hover:bg-purple-700' : ''
                }`}
                variant={plan.popular || plan.recommended ? 'default' : 'outline'}
              >
                {isLoading === plan.id ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : null}
                {isCurrentPlan ? 'Current Plan' : plan.id === 'enterprise' ? 'Contact Sales' : 'Get Started'}
              </Button>

              {isCurrentPlan && (
                <div className="text-center mt-2">
                  <Badge variant="secondary">Active</Badge>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Frequently Asked Questions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2">Can I change plans anytime?</h4>
            <p className="text-sm text-gray-600">
              Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">What happens to unused images?</h4>
            <p className="text-sm text-gray-600">
              Unused images don't roll over to the next month. We recommend using your full quota each month.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Is there a free trial?</h4>
            <p className="text-sm text-gray-600">
              Yes! All paid plans come with a 7-day free trial. No credit card required.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Do you offer refunds?</h4>
            <p className="text-sm text-gray-600">
              We offer a 30-day money-back guarantee for all paid plans.
            </p>
          </div>
        </div>
      </div>

      {/* Enterprise CTA */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-8 text-white text-center">
        <h3 className="text-2xl font-bold mb-4">Need a Custom Solution?</h3>
        <p className="text-lg mb-6">
          Our Enterprise plan offers custom pricing, dedicated support, and tailored features for your organization.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="secondary"
            size="lg"
            onClick={() => handleSelectPlan(plans.find(p => p.id === 'enterprise')!)}
          >
            <Users className="w-4 h-4 mr-2" />
            Contact Sales
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="text-white border-white hover:bg-white hover:text-purple-600"
          >
            Schedule Demo
          </Button>
        </div>
      </div>
    </div>
  );
};