import React from 'react';
import { Button } from '../components/ui/button';
import { Facebook, Instagram, Linkedin, Youtube } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Footer: React.FC = () => {
  const navigate = useNavigate();

  const handleHashLink = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    e.preventDefault();

    // If we're not on the homepage, navigate there first
    if (window.location.pathname !== '/') {
      navigate('/');
      // Wait for navigation to complete before scrolling
      setTimeout(() => {
        scrollToSection(hash);
      }, 100);
    } else {
      // If we're already on the homepage, just scroll
      scrollToSection(hash);
    }
  };

  const scrollToSection = (hash: string) => {
    const element = document.getElementById(hash);
    if (element) {
      // Add a small delay to ensure the element is rendered
      setTimeout(() => {
        const headerOffset = 80; // Adjust this value based on your header height
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }, 100);
    }
  };

  return (
    <footer className="bg-gray-900 text-gray-300 py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
          {/* Company Info */}
          <div className="col-span-1 flex flex-col items-center md:items-start">
            <div className="mb-4">
              <img
                src="/pinco.png"
                alt="Pinco Logo"
                className="h-12 w-auto"
              />
            </div>

            <p className="text-gray-400 mb-6 max-w-xs md:max-w-none">
              Empowering individuals to ace their interviews with practice session cured by AI lead reasearch.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors duration-300">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors duration-300">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors duration-300">
                <Linkedin className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors duration-300">
                <Youtube className="h-5 w-5" />
              </Button>
            </div>
          </div>

       

          {/* Legal */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/terms" className="text-gray-400 hover:text-white transition-colors text-base">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors text-base">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/payment-terms" className="text-gray-400 hover:text-white transition-colors text-base">
                  Payment Terms
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="text-gray-400 hover:text-white transition-colors text-base">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* FAQ */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">FAQ</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/faq" className="text-gray-400 hover:text-white transition-colors text-base">
                  What is eval8?
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-400 hover:text-white transition-colors text-base">
                  How does the mock interview work?
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-400 hover:text-white transition-colors text-base">
                  Is it useful for freshers or only experienced candidates?
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-400 hover:text-white transition-colors text-base">
                  Can I use eval8 on my phone?
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-400 hover:text-white transition-colors text-base">
                  More FAQs
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800">
          <p className="text-center text-gray-400 text-sm">
            © 2025 eval8 (promoted by Hysteresis Pvt Ltd). All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

