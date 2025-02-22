'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function GoogleCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      console.log('Received code:', code); // Debug log
      
      if (code) {
        try {
          const response = await fetch('http://localhost:8000/api/auth/google/callback', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code: code }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Authentication failed');
          }

          const data = await response.json();
          console.log('Auth response:', data); // Debug log
          
          // Store user info and token in localStorage
          localStorage.setItem('user', JSON.stringify(data));
          localStorage.setItem('google_access_token', data.token);
          
          // Redirect to home page
          router.push('/');
        } catch (error) {
          console.error('Error during authentication:', error);
          router.push('/login?error=auth_failed');
        }
      } else {
        console.error('No code received'); // Debug log
        router.push('/login?error=no_code');
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Authenticating...</h1>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    </div>
  );
} 