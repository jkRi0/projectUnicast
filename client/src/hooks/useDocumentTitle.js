import { useEffect } from 'react';

export const useDocumentTitle = (title) => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title ? `${title} - UniEvent` : 'UniEvent - Personalized Event Planning';
    
    return () => {
      document.title = previousTitle;
    };
  }, [title]);
};

