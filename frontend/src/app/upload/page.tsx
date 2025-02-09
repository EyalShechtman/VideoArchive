'use client';

import VideoUploader from '@/components/VideoUploader';
import Link from 'next/link';

export default function UploadPage() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Upload Video</h1>
          <Link 
            href="/"
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
          >
            Back to Videos
          </Link>
        </div>
        
        <VideoUploader />
      </div>
    </main>
  );
} 