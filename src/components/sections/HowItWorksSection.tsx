"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Search, CreditCard, MapPin, CheckCircle, ArrowRight, Sparkles, Shield, Clock, Award } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Search & Discover",
    description:
      "Browse thousands of unique properties worldwide. Use filters to find exactly what you're looking for.",
    step: "01",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    icon: CreditCard,
    title: "Book Securely", 
    description:
      "Reserve your perfect stay with our secure payment system. Instant confirmation guaranteed.",
    step: "02",
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
  {
    icon: MapPin,
    title: "Arrive & Enjoy",
    description:
      "Check in seamlessly and enjoy your stay. Our hosts are always ready to help make it memorable.",
    step: "03",
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-50 dark:bg-green-900/20",
    iconColor: "text-green-600 dark:text-green-400",
  },
];

const features = [
  {
    icon: Shield,
    title: "Verified Properties",
    description: "All listings are verified for quality and safety",
    color: "from-blue-500 to-cyan-500",
    stat: "100%",
  },
  {
    icon: Clock,
    title: "24/7 Support",
    description: "Round-the-clock customer service when you need it",
    color: "from-purple-500 to-pink-500",
    stat: "24/7",
  },
  {
    icon: CheckCircle,
    title: "Secure Payments",
    description: "Your payment information is always protected",
    color: "from-green-500 to-emerald-500",
    stat: "256bit",
  },
  {
    icon: Award,
    title: "Top Rated",
    description: "Consistently rated 5 stars by our community",
    color: "from-yellow-500 to-orange-500",
    stat: "4.9★",
  },
];

export function HowItWorksSection() {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  return (
    <div className="space-y-16 py-16">
      {/* Enhanced Title Section */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 mb-6">
          <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
            Simple Process
          </span>
        </div>
        <h2 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent mb-4">
          How It Works
        </h2>
        <p className="text-xl text-muted-foreground">
          Your perfect getaway is just three simple steps away
        </p>
      </div>

      {/* Enhanced Steps Section */}
      <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Enhanced Connection Line */}
          <div className="hidden md:block absolute top-20 left-1/6 right-1/6 h-1 bg-gradient-to-r from-blue-200 via-purple-200 to-green-200 rounded-full z-0">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 rounded-full opacity-0 animate-pulse" />
          </div>

          {/* Animated Progress Dots */}
          <div className="hidden md:block absolute top-[76px] left-1/6 right-1/6 z-10">
            <div className="flex justify-between">
              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  className={`w-4 h-4 rounded-full transition-all duration-500 ${
                    hoveredStep === index
                      ? 'bg-gradient-to-r ' + steps[index].color + ' scale-125 shadow-lg'
                      : 'bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card
                key={index}
                className={`relative z-20 text-center transition-all duration-500 border-2 cursor-pointer group ${
                  hoveredStep === index 
                    ? 'shadow-2xl -translate-y-2 border-transparent' 
                    : 'hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600'
                } ${step.bgColor}`}
                onMouseEnter={() => setHoveredStep(index)}
                onMouseLeave={() => setHoveredStep(null)}
              >
                <CardContent className="p-8">
                  <div className="relative mb-6">
                    {/* Enhanced Icon Container */}
                    <div className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-4 transition-all duration-500 ${
                      hoveredStep === index 
                        ? `bg-gradient-to-r ${step.color} shadow-lg scale-110` 
                        : 'bg-white dark:bg-gray-800 shadow-md'
                    }`}>
                      <Icon className={`w-10 h-10 transition-all duration-500 ${
                        hoveredStep === index ? 'text-white' : step.iconColor
                      }`} />
                    </div>

                    {/* Enhanced Step Number */}
                    <div className={`absolute -top-1 -right-1 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                      hoveredStep === index 
                        ? `bg-gradient-to-r ${step.color} text-white scale-110 shadow-lg` 
                        : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                    }`}>
                      {step.step}
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-foreground mb-4 transition-colors duration-300">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>

                  {/* Arrow for next step */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute -right-4 top-1/2 transform -translate-y-1/2 z-30">
                      <ArrowRight className={`w-6 h-6 transition-all duration-500 ${
                        hoveredStep === index ? step.iconColor + ' scale-125' : 'text-gray-400'
                      }`} />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Enhanced Features Section */}
      <div className="bg-gradient-to-br from-card to-card dark:from-gray-900 dark:to-gray-800 rounded-3xl p-12 shadow-xl">
        <div className="text-center mb-12">
          <h3 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4">
            Why Choose Us?
          </h3>
          <p className="text-xl text-muted-foreground">
            Trusted by millions of travelers worldwide
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="text-center group cursor-pointer"
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                {/* Enhanced Icon with Stats */}
                <div className="relative mb-6">
                  <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center transition-all duration-500 ${
                    hoveredFeature === index
                      ? `bg-gradient-to-r ${feature.color} shadow-lg scale-110 -translate-y-1`
                      : 'bg-white dark:bg-gray-800 shadow-md'
                  }`}>
                    <Icon className={`w-8 h-8 transition-all duration-500 ${
                      hoveredFeature === index ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                    }`} />
                  </div>

                  {/* Floating stat */}
                  <div className={`absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-bold transition-all duration-500 ${
                    hoveredFeature === index
                      ? `bg-gradient-to-r ${feature.color} text-white shadow-lg scale-110`
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}>
                    {feature.stat}
                  </div>
                </div>

                <h4 className="font-bold text-xl text-foreground mb-3 transition-colors duration-300">
                  {feature.title}
                </h4>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover indicator */}
                <div className={`mt-4 w-12 h-1 mx-auto rounded-full transition-all duration-500 ${
                  hoveredFeature === index
                    ? `bg-gradient-to-r ${feature.color} scale-150`
                    : 'bg-gray-200 dark:bg-gray-700 scale-75'
                }`} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}