import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';

export interface NavItem {
  href: string;
}

export function useAnchorNav(navItems: NavItem[], offset: number = 100) {
  const [activeSection, setActiveSection] = useState<string>('/');
  const pathname = usePathname();

  // Scroll spy and active state
  useEffect(() => {
    // 1. Route-based navigation active state (when not on landing page)
    if (pathname !== '/') {
      // Find matching route for paths like /admin/*
      const routeMatch = navItems.find(item => !item.href.startsWith('/#') && item.href !== '/' && pathname.startsWith(item.href));
      if (routeMatch) {
        setActiveSection(routeMatch.href);
        return;
      }

      // Find matching section for paths like /informasi/*
      const sectionMatch = navItems.find(item => item.href.startsWith('/#') && pathname.startsWith(item.href.replace('/#', '/')));
      if (sectionMatch) {
        setActiveSection(sectionMatch.href);
        return;
      }
      
      setActiveSection('');
      return;
    }

    // 2. Section-based navigation (IntersectionObserver)
    const sectionItems = navItems.filter(item => item.href.startsWith('/#'));
    
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
    };

    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(`/#${entry.target.id}`);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sectionItems.forEach(item => {
      const id = item.href.replace('/#', '');
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    // Handle top of page (Beranda)
    const handleScrollTop = () => {
      if (window.scrollY < 200) {
        setActiveSection('/');
      }
    };
    window.addEventListener('scroll', handleScrollTop, { passive: true });
    handleScrollTop(); // Initial check
    
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScrollTop);
    };
  }, [navItems, pathname]);

  // Handle incoming hash navigation (from other pages)
  useEffect(() => {
    if (pathname === '/' && window.location.hash) {
      const id = window.location.hash.substring(1);
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => {
          window.scrollTo({
            top: el.offsetTop - offset,
            behavior: 'smooth'
          });
        }, 100);
      }
    }
  }, [pathname, offset]);

  const handleNavClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    const isAnchor = href.startsWith('#') || href.startsWith('/#');
    if (!isAnchor) return;
    
    const targetId = href.split('#')[1];

    // If already on the landing page, perform smooth scrolling without reloading
    if (pathname === '/') {
      e.preventDefault();
      
      if (targetId === '') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        window.history.pushState(null, '', `/`);
        return;
      }

      const el = document.getElementById(targetId);
      if (el) {
        window.scrollTo({
          top: el.offsetTop - offset,
          behavior: 'smooth'
        });
        window.history.pushState(null, '', `/#${targetId}`);
      }
    }
  }, [pathname, offset]);

  return { activeSection, handleNavClick };
}
