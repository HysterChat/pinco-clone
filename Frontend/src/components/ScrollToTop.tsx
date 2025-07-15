import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        // Force scroll to top on both route changes and page refresh
        const forceScrollToTop = () => {
            window.scrollTo(0, 0);
            // Remove any hash from URL to prevent section anchoring
            if (window.location.hash) {
                window.history.replaceState(null, '', window.location.pathname);
            }
        };

        // Handle route changes
        forceScrollToTop();

        // Handle page refresh
        window.addEventListener('load', forceScrollToTop);

        return () => {
            window.removeEventListener('load', forceScrollToTop);
        };
    }, [pathname]);

    return null;
};

export default ScrollToTop; 






