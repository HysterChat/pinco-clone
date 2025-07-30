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
    <footer className="bg-primary-950 text-primary/80 py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
          {/* Company Info */}
          <div className="col-span-1 flex flex-col items-center md:items-start">
            <div className="mb-4">
              <img
                src="../eval8.png"
                alt="eval8 ai Logo"
                className="h-12 w-auto"
              />
            </div>

            <p className="text-primary/60 mb-6 max-w-xs md:max-w-none">
              Empowering individuals to ace their interviews with practice session cured by AI lead reasearch.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className="text-primary/60 hover:text-white hover:bg-primary rounded-full transition-colors duration-300">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-primary/60 hover:text-white hover:bg-primary rounded-full transition-colors duration-300">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-primary/60 hover:text-white hover:bg-primary rounded-full transition-colors duration-300">
                <Linkedin className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-primary/60 hover:text-white hover:bg-primary rounded-full transition-colors duration-300">
                <Youtube className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Contact Us */}
          <div>
            <h4 className="text-lg font-semibold text-primary mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="text-primary/60">
                <p className="text-base">Office 2, 1st Floor, 32nd Cross Rd, 4th T Block East, 4th Block, Jayanagar,</p>
                <p className="text-base">Bengaluru, Karnataka 560041</p>
              </li>
              <li>
                <a href="mailto:gokul@hysteresis.in" className="text-primary/60 hover:text-black dark:hover:text-white transition-colors text-base">
                  gokul@hysteresis.in
                </a>
              </li>
              <li>
                <a href="tel:+918208117943" className="text-primary/60 hover:text-black dark:hover:text-white transition-colors text-base">
                  +91 8208117943
                </a>
              </li>
              <li>
                {/* <Link to="/contact" className="text-gray-400 hover:text-white transition-colors text-base">
                  View on Map
                </Link> */}
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-lg font-semibold text-primary mb-4">Legal</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/terms" className="text-primary/60 hover:text-black dark:hover:text-white transition-colors text-base">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-primary/60 hover:text-black dark:hover:text-white transition-colors text-base">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/payment-terms" className="text-primary/60 hover:text-black dark:hover:text-white transition-colors text-base">
                  Payment Terms
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="text-primary/60 hover:text-black dark:hover:text-white transition-colors text-base">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* FAQ */}
          <div>
            <h4 className="text-lg font-semibold text-primary mb-4">FAQ</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/faq" className="text-primary/60 hover:text-black dark:hover:text-white transition-colors text-base">
                  What is eval8 ai?
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-primary/60 hover:text-black dark:hover:text-white transition-colors text-base">
                  How does the mock interview work?
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-primary/60 hover:text-black dark:hover:text-white transition-colors text-base">
                  Is it useful for freshers or only experienced candidates?
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-primary/60 hover:text-black dark:hover:text-white transition-colors text-base">
                  Can I use eval8 ai on my phone?
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-primary/60 hover:text-black dark:hover:text-white transition-colors text-base">
                  More FAQs
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-primary/30">
          <p className="text-center text-primary/60 text-sm">
            © 2025 eval8 ai (promoted by Bend Reality Mentors PVT LTD). All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;







