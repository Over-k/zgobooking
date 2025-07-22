"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  Shield, 
  Award, 
  Users, 
  Quote,
  CheckCircle,
  Heart,
  MessageSquare,
  TrendingUp,
  Globe
} from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    location: "New York, USA",
    rating: 5,
    text: "Amazing experience! The booking process was seamless and the property exceeded all expectations. Will definitely use again.",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    verified: true,
    date: "2 weeks ago",
    property: "Luxury Apartment in Manhattan"
  },
  {
    name: "Marco Rodriguez",
    location: "Barcelona, Spain",
    rating: 5,
    text: "Perfect vacation rental in Tokyo! Clean, well-located, and the host was incredibly helpful. Highly recommend!",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    verified: true,
    date: "1 month ago",
    property: "Modern Studio in Shibuya"
  },
  {
    name: "Emily Chen",
    location: "Singapore",
    rating: 5,
    text: "Great platform with reliable hosts. I've booked multiple times and always had wonderful experiences. Trust this service completely.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    verified: true,
    date: "3 days ago",
    property: "Beachfront Villa in Bali"
  }
];

const trustBadges = [
  {
    icon: Shield,
    title: "Secure Platform",
    description: "SSL encrypted & PCI compliant",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50 dark:bg-blue-900/10"
  },
  {
    icon: Award,
    title: "Award Winning",
    description: "Best Travel Platform 2024",
    color: "from-yellow-500 to-orange-500",
    bgColor: "bg-yellow-50 dark:bg-yellow-900/10"
  },
  {
    icon: Users,
    title: "Trusted Community",
    description: "500K+ verified users",
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-50 dark:bg-purple-900/10"
  },
  {
    icon: CheckCircle,
    title: "Quality Assured",
    description: "100% verified properties",
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-50 dark:bg-green-900/10"
  }
];

const stats = [
  {
    number: "4.9",
    label: "Average Rating",
    suffix: "/5",
    icon: Star,
    color: "from-yellow-500 to-orange-500"
  },
  {
    number: "500K+",
    label: "Happy Guests",
    suffix: "",
    icon: Heart,
    color: "from-pink-500 to-rose-500"
  },
  {
    number: "99.9%",
    label: "Uptime",
    suffix: "",
    icon: TrendingUp,
    color: "from-green-500 to-emerald-500"
  },
  {
    number: "24/7",
    label: "Support",
    suffix: "",
    icon: MessageSquare,
    color: "from-blue-500 to-cyan-500"
  }
];

export function TrustSection() {
  const [hoveredTestimonial, setHoveredTestimonial] = useState<number | null>(null);
  const [hoveredBadge, setHoveredBadge] = useState<number | null>(null);

  return (
    <div className="space-y-16 py-16">
      {/* Enhanced Header */}
      <div className="text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 mb-6">
          <Globe className="w-5 h-5 text-green-600 dark:text-green-400" />
          <span className="text-sm font-medium text-green-700 dark:text-green-300">
            Trusted Worldwide
          </span>
        </div>
        <h2 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-green-900 to-blue-900 dark:from-white dark:via-green-100 dark:to-blue-100 bg-clip-text text-transparent mb-4">
          Loved by Travelers
        </h2>
        <p className="text-xl text-muted-foreground">
          Join millions of satisfied guests who trust our platform
        </p>
      </div>

      {/* Enhanced Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={index} 
              className="text-center p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900"
            >
              <div className={`w-12 h-12 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${stat.color} p-3 shadow-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.number}
                <span className="text-lg text-muted-foreground">{stat.suffix}</span>
              </div>
              <p className="text-sm text-muted-foreground font-medium">
                {stat.label}
              </p>
            </Card>
          );
        })}
      </div>

      {/* Enhanced Testimonials */}
      <div className="space-y-8">
        <div className="text-center">
          <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            What Our Guests Say
          </h3>
          <p className="text-lg text-muted-foreground">
            Real stories from real travelers
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index} 
              className={`transition-all duration-500 cursor-pointer border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 ${
                hoveredTestimonial === index 
                  ? 'shadow-2xl -translate-y-2 scale-105' 
                  : 'hover:shadow-lg'
              }`}
              onMouseEnter={() => setHoveredTestimonial(index)}
              onMouseLeave={() => setHoveredTestimonial(null)}
            >
              <CardContent className="p-8">
                {/* Enhanced Quote Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center transition-all duration-300 ${
                    hoveredTestimonial === index ? 'scale-110 shadow-lg' : ''
                  }`}>
                    <Quote className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-5 h-5 text-yellow-400 fill-yellow-400 transition-all duration-300 ${
                          hoveredTestimonial === index ? 'scale-125' : ''
                        }`}
                        style={{ animationDelay: `${i * 50}ms` }}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Enhanced Quote Text */}
                <blockquote className="text-gray-700 dark:text-gray-300 mb-6 text-lg leading-relaxed italic relative">
                  "{testimonial.text}"
                </blockquote>
                
                {/* Property Info */}
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Stayed at: {testimonial.property}
                  </p>
                </div>
                
                {/* Enhanced User Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="relative">
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.name}
                        className={`w-14 h-14 rounded-full object-cover ring-4 ring-white dark:ring-gray-800 transition-all duration-300 ${
                          hoveredTestimonial === index ? 'ring-blue-200 dark:ring-blue-800' : ''
                        }`}
                      />
                      {testimonial.verified && (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-gray-900 dark:text-white">
                          {testimonial.name}
                        </h4>
                        {testimonial.verified && (
                          <Badge variant="outline" className="text-xs bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                            <CheckCircle className="w-3 h-3 mr-1 text-green-600 dark:text-green-400" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {testimonial.location}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {testimonial.date}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Enhanced Trust Badges */}
      <div className="space-y-8">
        <div className="text-center">
          <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Why Trust Us?
          </h3>
          <p className="text-lg text-muted-foreground">
            Security and quality you can count on
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {trustBadges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <Card
                key={index}
                className={`text-center p-6 transition-all duration-500 cursor-pointer border-0 ${badge.bgColor} ${
                  hoveredBadge === index 
                    ? 'shadow-2xl -translate-y-2 scale-105' 
                    : 'hover:shadow-lg'
                }`}
                onMouseEnter={() => setHoveredBadge(index)}
                onMouseLeave={() => setHoveredBadge(null)}
              >
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${badge.color} flex items-center justify-center transition-all duration-300 ${
                  hoveredBadge === index ? 'scale-110 shadow-lg' : ''
                }`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-bold text-xl text-gray-900 dark:text-white mb-2">
                  {badge.title}
                </h4>
                <p className="text-muted-foreground">
                  {badge.description}
                </p>
                
                {/* Progress indicator */}
                <div className={`mt-4 w-12 h-1 mx-auto rounded-full transition-all duration-500 ${
                  hoveredBadge === index
                    ? `bg-gradient-to-r ${badge.color} scale-150`
                    : 'bg-gray-200 dark:bg-gray-700 scale-75'
                }`} />
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}