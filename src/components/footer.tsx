"use client";
import { useState } from "react";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  Youtube,
  Globe,
  Heart,
  Home,
  Shield,
  Award,
  Users,
  Smartphone,
  Download
} from "lucide-react";

const footerSections = [
  {
    title: "Company",
    links: [
      { label: "About Us", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Press", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Contact", href: "#" }
    ]
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "#" },
      { label: "Safety", href: "#" },
      { label: "Cancellation", href: "#" },
      { label: "Disability Support", href: "#" },
      { label: "Report Issue", href: "#" }
    ]
  },
  {
    title: "Hosting",
    links: [
      { label: "Become a Host", href: "#" },
      { label: "Host Resources", href: "#" },
      { label: "Community Forum", href: "#" },
      { label: "Hosting Academy", href: "#" },
      { label: "Responsible Hosting", href: "#" }
    ]
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Cookie Policy", href: "#" },
      { label: "Sitemap", href: "#" },
      { label: "Accessibility", href: "#" }
    ]
  }
];

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook", color: "hover:text-blue-600" },
  { icon: Twitter, href: "#", label: "Twitter", color: "hover:text-blue-400" },
  { icon: Instagram, href: "#", label: "Instagram", color: "hover:text-pink-600" },
  { icon: Linkedin, href: "#", label: "LinkedIn", color: "hover:text-blue-700" },
  { icon: Youtube, href: "#", label: "YouTube", color: "hover:text-red-600" }
];

const trustBadges = [
  { icon: Shield, label: "Secure Platform" },
  { icon: Award, label: "Award Winning" },
  { icon: Users, label: "Trusted by 500K+" },
  { icon: Globe, label: "Global Reach" }
];

export default function Footer() {
  const [hoveredSection, setHoveredSection] = useState<number | null>(null);
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 " />
      
      {/* Main Footer Content */}
      <div className="container relative z-10 mx-auto px-4 py-16">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold">Zgobooking</h3>
            </div>
            
            <p className="text-gray-300 leading-relaxed">
              Discover unique places to stay around the world. From cozy apartments to luxury villas, 
              we help you find the perfect accommodation for your next adventure.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-300">
                <MapPin className="w-5 h-5 text-blue-400" />
                <span>123 Travel Street, Adventure City, AC 12345</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Phone className="w-5 h-5 text-green-400" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Mail className="w-5 h-5 text-purple-400" />
                <span>hello@Zgobooking.com</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-4">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    className={`w-12 h-12 bg-gray-800 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-gray-700 ${social.color}`}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section, index) => (
            <div
              key={index}
              className="space-y-4"
              onMouseEnter={() => setHoveredSection(index)}
              onMouseLeave={() => setHoveredSection(null)}
            >
              <h4 className={`text-lg font-semibold transition-colors duration-300 ${
                hoveredSection === index ? 'text-blue-400' : 'text-white'
              }`}>
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* App Download Section */}
        <div className="bg-gray-800/50 rounded-3xl p-8 mb-12 text-center">
          <h3 className="text-2xl font-bold mb-4">
            Get Our Mobile App
          </h3>
          <p className="text-gray-300 mb-6">
            Book on the go with our mobile app. Available for iOS and Android.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="flex items-center gap-3 px-6 py-3 bg-black rounded-2xl hover:bg-gray-800 transition-all duration-300 hover:scale-105">
              <Smartphone className="w-6 h-6" />
              <div className="text-left">
                <div className="text-xs text-gray-400">Download on the</div>
                <div className="text-sm font-semibold">App Store</div>
              </div>
            </button>
            <button className="flex items-center gap-3 px-6 py-3 bg-black rounded-2xl hover:bg-gray-800 transition-all duration-300 hover:scale-105">
              <Download className="w-6 h-6" />
              <div className="text-left">
                <div className="text-xs text-gray-400">Get it on</div>
                <div className="text-sm font-semibold">Google Play</div>
              </div>
            </button>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {trustBadges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <div
                key={index}
                className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-2xl hover:bg-gray-800 transition-all duration-300 hover:scale-105"
              >
                <Icon className="w-6 h-6 text-blue-400" />
                <span className="text-sm font-medium">{badge.label}</span>
              </div>
            );
          })}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-gray-400">
            <span>© {new Date().getFullYear()} Zgobooking. Made with</span>
            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            <span>for travelers worldwide</span>
          </div>
          
          <div className="flex items-center gap-6 text-sm">
            <select className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>🇺🇸 English (US)</option>
              <option>🇪🇸 Español</option>
              <option>🇫🇷 Français</option>
              <option>🇩🇪 Deutsch</option>
            </select>
            
            <select className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>$ USD</option>
              <option>€ EUR</option>
              <option>£ GBP</option>
              <option>¥ JPY</option>
            </select>
          </div>
        </div>
      </div>
    </footer>
  );
}