/**
 * Navigation Component with Hamburger Menu
 * 
 * Responsive navigation:
 * - Desktop (768px+): Horizontal nav bar
 * - Mobile (390px-480px): Hamburger menu
 */

import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './Navigation.css'

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const menuRef = useRef(null)
  const navigate = useNavigate()

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
      // Close menu when resizing to desktop
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Handle click outside menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMenuOpen])

  const handleNavigation = (path) => {
    navigate(path)
    setIsMenuOpen(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const navItems = [
    { label: '📊 Dashboard', path: '/dashboard' },
    { label: '👥 Clients', path: '/clients' },
    { label: '📄 Invoices', path: '/invoices' },
    { label: '👤 Profile', path: '/profile' },
  ]

  return (
    <nav className="navigation">
      {isMobile ? (
        // Mobile: Hamburger Menu
        <div className="nav-mobile" ref={menuRef}>
          <div className="nav-header">
            <h1 className="nav-title">💼 Facturation</h1>
            <button
              className="hamburger-btn"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              <span className="hamburger-icon">
                <span className="hamburger-line"></span>
                <span className="hamburger-line"></span>
                <span className="hamburger-line"></span>
              </span>
            </button>
          </div>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div className="nav-menu-dropdown">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  className="nav-menu-item"
                  onClick={() => handleNavigation(item.path)}
                >
                  {item.label}
                </button>
              ))}
              <div className="nav-menu-divider"></div>
              <button
                className="nav-menu-item nav-logout"
                onClick={handleLogout}
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      ) : (
        // Desktop: Horizontal Navigation
        <div className="nav-desktop">
          <h1 className="nav-title">💼 Facturation</h1>
          <div className="nav-items">
            {navItems.map((item) => (
              <button
                key={item.path}
                className="nav-item-desktop"
                onClick={() => handleNavigation(item.path)}
              >
                {item.label}
              </button>
            ))}
            <button
              className="nav-item-desktop nav-logout"
              onClick={handleLogout}
            >
              🚪 Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
