
import React, { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { Menu, X, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleDropdownToggle = (dropdown: string) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const programDropdowns = {
    camps: [
      // { name: 'Summer Camps', path: '/camps/summer' },
      { name: '5-Day Kenyan Experiences', path: '/camps/kenyan-experiences' },
      { name: 'Nairobi Day Camps', path: '/programs/day-camps' }
    ],
    schools: [
      { name: 'Homeschooling Program', path: '/programs/homeschooling' },
      { name: 'Little Forest Explorers', path: '/programs/little-forest' },
      { name: 'School Experience', path: '/programs/school-experience' }
    ],
    groups: [
      { name: 'Team Building', path: '/programs/team-building' },
      { name: 'Kenyan Experiences', path: '/programs/kenyan-experiences' }
    ],
    about: [
      { name: 'Meet Our Team', path: '/about/team' },
      { name: 'Who We Are', path: '/about/who-we-are' },
      { name: 'What We Do', path: '/about/what-we-do' }
    ]
  };

  return (
    <nav 
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300 px-4 md:px-8",
        isScrolled 
          ? "py-2 glass-card bg-white/90 shadow-sm" 
          : "py-4 bg-transparent"
      )}
    >
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className={cn(
              "text-xl md:text-2xl font-bold transition-colors duration-300",
              isScrolled ? "text-forest-800" : "text-white"
            )}>
              Amuse.Ke
            </span>
          </Link>

          <ul className="hidden md:flex items-center space-x-8">
            <li>
              <Link 
                to="/" 
                className={cn(
                  "font-medium hover-lift",
                  isScrolled 
                    ? "text-gray-700 hover:text-forest-600" 
                    : "text-white hover:text-forest-100"
                )}
              >
                Home
              </Link>
            </li>
            <li>
              <Link 
                to="/announcements" 
                className={cn(
                  "font-medium hover-lift",
                  isScrolled 
                    ? "text-gray-700 hover:text-forest-600" 
                    : "text-white hover:text-forest-100"
                )}
              >
                Announcements
              </Link>
            </li>
            {/* About Dropdown */}
            <li className="relative group">
              <button 
                className={cn(
                  "font-medium hover-lift flex items-center gap-1",
                  isScrolled 
                    ? "text-gray-700 hover:text-forest-600" 
                    : "text-white hover:text-forest-100"
                )}
                onMouseEnter={() => setActiveDropdown('about')}
              >
                About
                <ChevronDown size={16} />
              </button>
              <div 
                className={cn(
                  "absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border opacity-0 invisible transition-all duration-200 z-50",
                  activeDropdown === 'about' && "opacity-100 visible"
                )}
                onMouseEnter={() => setActiveDropdown('about')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                {programDropdowns.about.map((item) => (
                  <Link 
                    key={item.path}
                    to={item.path}
                    className="block px-4 py-3 text-gray-700 hover:bg-forest-50 hover:text-forest-600 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </li>
            
            {/* Camps Dropdown */}
            <li className="relative group">
              <button 
                className={cn(
                  "font-medium hover-lift flex items-center gap-1",
                  isScrolled 
                    ? "text-gray-700 hover:text-forest-600" 
                    : "text-white hover:text-forest-100"
                )}
                onMouseEnter={() => setActiveDropdown('camps')}
              >
                Camps
                <ChevronDown size={16} />
              </button>
              <div 
                className={cn(
                  "absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border opacity-0 invisible transition-all duration-200 z-50",
                  activeDropdown === 'camps' && "opacity-100 visible"
                )}
                onMouseEnter={() => setActiveDropdown('camps')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                {programDropdowns.camps.map((item) => (
                  <Link 
                    key={item.path}
                    to={item.path}
                    className="block px-4 py-3 text-gray-700 hover:bg-forest-50 hover:text-forest-600 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </li>

            {/* Schools Dropdown */}
            <li className="relative group">
              <button 
                className={cn(
                  "font-medium hover-lift flex items-center gap-1",
                  isScrolled 
                    ? "text-gray-700 hover:text-forest-600" 
                    : "text-white hover:text-forest-100"
                )}
                onMouseEnter={() => setActiveDropdown('schools')}
              >
                Schools
                <ChevronDown size={16} />
              </button>
              <div 
                className={cn(
                  "absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border opacity-0 invisible transition-all duration-200 z-50",
                  activeDropdown === 'schools' && "opacity-100 visible"
                )}
                onMouseEnter={() => setActiveDropdown('schools')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                {programDropdowns.schools.map((item) => (
                  <Link 
                    key={item.path}
                    to={item.path}
                    className="block px-4 py-3 text-gray-700 hover:bg-forest-50 hover:text-forest-600 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </li>

            {/* Group Activities Dropdown */}
            <li className="relative group">
              <button 
                className={cn(
                  "font-medium hover-lift flex items-center gap-1",
                  isScrolled 
                    ? "text-gray-700 hover:text-forest-600" 
                    : "text-white hover:text-forest-100"
                )}
                onMouseEnter={() => setActiveDropdown('groups')}
              >
                Group Activities
                <ChevronDown size={16} />
              </button>
              <div 
                className={cn(
                  "absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border opacity-0 invisible transition-all duration-200 z-50",
                  activeDropdown === 'groups' && "opacity-100 visible"
                )}
                onMouseEnter={() => setActiveDropdown('groups')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                {programDropdowns.groups.map((item) => (
                  <Link 
                    key={item.path}
                    to={item.path}
                    className="block px-4 py-3 text-gray-700 hover:bg-forest-50 hover:text-forest-600 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </li>

            <li>
              <Link 
                to="/gallery" 
                className={cn(
                  "font-medium hover-lift",
                  isScrolled 
                    ? "text-gray-700 hover:text-forest-600" 
                    : "text-white hover:text-forest-100"
                )}
              >
                Gallery
              </Link>
            </li>
            <li>
              <Link 
                to="/contact" 
                className={cn(
                  "font-medium hover-lift",
                  isScrolled 
                    ? "text-gray-700 hover:text-forest-600" 
                    : "text-white hover:text-forest-100"
                )}
              >
                Contact
              </Link>
            </li>
          </ul>

          <div className="flex items-center">
            <button 
              className="md:hidden"
              onClick={toggleMobileMenu}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? (
                <X className={isScrolled ? "text-gray-800" : "text-white"} size={24} />
              ) : (
                <Menu className={isScrolled ? "text-gray-800" : "text-white"} size={24} />
              )}
            </button>
          </div>
        </div>

        <div className={cn(
          "md:hidden absolute left-0 right-0 top-full px-4 py-2 transition-all duration-300 ease-in-out transform origin-top",
          mobileMenuOpen 
            ? "opacity-100 scale-y-100" 
            : "opacity-0 scale-y-0 pointer-events-none",
          "glass-card mt-2 rounded-lg"
        )}>
          <ul className="py-2 space-y-1">
            <li>
              <Link 
                to="/" 
                className="block py-2 px-4 font-medium text-gray-800 hover:text-forest-600 hover:bg-gray-50 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
            </li>
            <li>
              <Link 
                to="/announcements" 
                className="block py-2 px-4 font-medium text-gray-800 hover:text-forest-600 hover:bg-gray-50 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Announcements
              </Link>
            </li>
            {/* About Submenu */}
            <li>
              <div className="py-1">
                <div className="px-4 py-1 text-sm font-semibold text-gray-500 uppercase tracking-wider">About</div>
                {programDropdowns.about.map((item) => (
                  <Link 
                    key={item.path}
                    to={item.path}
                    className="block py-2 px-6 text-sm text-gray-700 hover:text-forest-600 hover:bg-gray-50 rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </li>
            
            {/* Camps Submenu */}
            <li>
              <div className="py-1">
                <div className="px-4 py-1 text-sm font-semibold text-gray-500 uppercase tracking-wider">Camps</div>
                {programDropdowns.camps.map((item) => (
                  <Link 
                    key={item.path}
                    to={item.path}
                    className="block py-2 px-6 text-sm text-gray-700 hover:text-forest-600 hover:bg-gray-50 rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </li>

            {/* Schools Submenu */}
            <li>
              <div className="py-1">
                <div className="px-4 py-1 text-sm font-semibold text-gray-500 uppercase tracking-wider">Schools</div>
                {programDropdowns.schools.map((item) => (
                  <Link 
                    key={item.path}
                    to={item.path}
                    className="block py-2 px-6 text-sm text-gray-700 hover:text-forest-600 hover:bg-gray-50 rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </li>

            {/* Group Activities Submenu */}
            <li>
              <div className="py-1">
                <div className="px-4 py-1 text-sm font-semibold text-gray-500 uppercase tracking-wider">Group Activities</div>
                {programDropdowns.groups.map((item) => (
                  <Link 
                    key={item.path}
                    to={item.path}
                    className="block py-2 px-6 text-sm text-gray-700 hover:text-forest-600 hover:bg-gray-50 rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </li>

            <li>
              <Link 
                to="/gallery" 
                className="block py-2 px-4 font-medium text-gray-800 hover:text-forest-600 hover:bg-gray-50 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Gallery
              </Link>
            </li>
            <li>
              <Link 
                to="/contact" 
                className="block py-2 px-4 font-medium text-gray-800 hover:text-forest-600 hover:bg-gray-50 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
