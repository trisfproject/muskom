import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';

export function useAnchorNav(sectionIds: string[], offset: number = 100) {
  const [activeSection, setActiveSection] = useState<string>('/');
  const pathname = usePathname();

  // Scroll spy and active state
  useEffect(() => {
    if (pathname !== '/') {
      // Highlight navigation based on path prefix (e.g., /informasi/* -> /#informasi)
      const matchedSection = sectionIds.find(id => pathname.startsWith(`/${id}`));
      if (matchedSection) {
        setActiveSection(`/#${matchedSection}`);
      }
      return;
    }

    const handleScroll = () => {
      const scrollPosition = window.scrollY + offset + 150; // extra margin for active threshold
      let current = '/';
      for (const section of sectionIds) {
        const el = document.getElementById(section);
        if (el && el.offsetTop <= scrollPosition) {
          current = `/#${section}`;
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sectionIds, offset, pathname]);

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
