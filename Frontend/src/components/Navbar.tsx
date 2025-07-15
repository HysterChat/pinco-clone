import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    // Check if user is logged in by looking for token
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Pricing', path: '#pricing', isScroll: true },
    { name: 'Features', path: '#features', isScroll: true },
    { name: 'How it works', path: '#how-it-works', isScroll: true },
  ];

  const handleNavClick = (item: { path: string, isScroll?: boolean }) => {
    setIsMenuOpen(false);

    if (item.isScroll) {
      // If we're not on the homepage, first navigate to homepage then scroll
      if (location.pathname !== '/') {
        navigate('/');
        // Wait for navigation to complete before scrolling
        setTimeout(() => {
          const element = document.getElementById(item.path.substring(1));
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      } else {
        // If already on homepage, just scroll
        const element = document.getElementById(item.path.substring(1));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    } else {
      // For non-scroll items, just navigate
      navigate(item.path);
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-white border-b border-white/10 sticky top-0 z-50 shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to={isLoggedIn ? "/dashboard" : "/"} className="z-10">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex-shrink-0 flex items-center py-2"
            >
              <img
                src="./eval8.png"
                alt="eval8 ai company logo"
                className="h-12 w-auto"
              />
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Nav Items */}
            <div className="flex items-center space-x-4">
              {navItems.map((item) => (
                <motion.div key={item.name} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  {item.isScroll ? (
                    <Button
                      variant="ghost"
                      className="text-primary/90 hover:text-black hover:bg-primary/10"
                      onClick={() => handleNavClick(item)}
                    >
                      {item.name}
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      className="text-primary/90 hover:text-black hover:bg-primary/10"
                      asChild
                    >
                      <Link to={item.path}>{item.name}</Link>
                    </Button>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Auth Buttons */}
            {isLoggedIn ? (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="bg-primary hover:bg-black text-white shadow-md hover:shadow-lg transition-all duration-300" asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
              </motion.div>
            ) : (
              <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="ghost" className="text-primary/90 hover:text-black hover:bg-primary/10" asChild>
                    <Link to="/login">Login</Link>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button className="bg-primary hover:bg-black text-white shadow-md hover:shadow-lg transition-all duration-300" asChild>
                    <Link to="/signup">Start a Free Trial</Link>
                  </Button>
                </motion.div>
              </>
            )}

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="ml-2"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-black" />
              ) : (
                <Moon className="h-5 w-5 text-black" />
              )}
            </Button>
          </div>

          {/* Mobile menu button and theme toggle */}
          <div className="md:hidden flex items-center space-x-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-primary/90 hover:text-orange-500 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </motion.button>

            {/* Theme Toggle Mobile */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-black" />
              ) : (
                <Moon className="h-5 w-5 text-black" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <motion.div
          initial={false}
          animate={isMenuOpen ? { height: "auto", opacity: 1, paddingTop: "0.5rem", paddingBottom: "0.75rem" } : { height: 0, opacity: 0, paddingTop: "0rem", paddingBottom: "0rem" }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="md:hidden overflow-hidden border-t border-white/10"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white">
            <div className="flex flex-col space-y-2 px-3 py-2">
              {/* Nav Items */}
              {navItems.map((item) => (
                item.isScroll ? (
                  <Button
                    key={item.name}
                    variant="ghost"
                    className="justify-start text-primary/90 hover:text-black hover:bg-primary/10 font-medium"
                    onClick={() => handleNavClick(item)}
                  >
                    {item.name}
                  </Button>
                ) : (
                  <Button
                    key={item.name}
                    variant="ghost"
                    className="justify-start text-primary/90 hover:text-black hover:bg-primary/10 font-medium"
                    asChild
                  >
                    <Link to={item.path} onClick={() => setIsMenuOpen(false)}>{item.name}</Link>
                  </Button>
                )
              ))}

              {/* Auth Buttons */}
              {isLoggedIn ? (
                <Button className="justify-start bg-primary hover:bg-black text-white font-medium shadow-md" asChild>
                  <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button variant="ghost" className="justify-start text-primary/90 hover:text-black hover:bg-primary/10 font-medium" asChild>
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>Login</Link>
                  </Button>
                  <Button className="justify-start bg-primary hover:bg-black text-white font-medium shadow-md" asChild>
                    <Link to="/signup" onClick={() => setIsMenuOpen(false)}>Start a Free Trial</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.nav>
  );
};

export default Navbar;







