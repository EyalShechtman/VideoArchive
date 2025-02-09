'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Video {
  id: string;
  filename: string;
  metadata: {
    title: string;
    description: string;
    tags: string[];
  };
}

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/videos');
        const data = await response.json();
        setVideos(data);
      } catch (error) {
        console.error('Error fetching videos:', error);
      }
    };

    fetchVideos();
  }, []);

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Uploaded Videos</h1>
          <Link 
            href="/"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            Upload New Video
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div key={video.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <video 
                className="w-full h-48 object-cover"
                src={`http://localhost:8000/uploads/${video.filename}`}
                controls
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">{video.metadata.title}</h3>
                <p className="text-gray-600 mb-2">{video.metadata.description}</p>
                <div className="flex flex-wrap gap-2">
                  {video.metadata.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {videos.length === 0 && (
          <p className="text-center text-gray-500 mt-8">No videos uploaded yet.</p>
        )}
      </div>
    </main>
  );
} 