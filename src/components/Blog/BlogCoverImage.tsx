'use client';
import { EducationServiceRoutes } from '@/lib/api';
import { useEffect, useState } from 'react';

export default function BlogCoverImage({ blogId }: { blogId: string }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      try {
        setLoading(true);
        setError(false);
        //string url = 
        const response = await fetch(`${EducationServiceRoutes.blogs}/${blogId}/coverblog`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setImageUrl(url);
        
      } catch (err) {
        console.error('Erreur lors du chargement de l\'image', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (blogId) {
      loadImage();

    }

    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [blogId]);

  if (loading) {
    return <div>Chargement...</div>;
  }

 if (error || !imageUrl) {
    return <img src="/Gemini_Blog_Default_Cover.png" alt="Image par défaut" style={{ width: 900,height: 300 }} />;
  }
        console.log("============================================================="+blogId);

  return <img src={imageUrl} alt="Image de couverture" style={{  width: 900,height: 250 }} />;
}