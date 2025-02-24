'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SearchBar from '@/components/SearchBar';
import { useRouter } from 'next/navigation';
import FilterBar from '@/components/FilterBar';

interface Video {
  id: string;
  filename: string;
  metadata: {
    title: string;
    description: string;
    tags: string[];
    school: string;
  };
}

export default function VideosPage() {
  const router = useRouter();
  const [videos, setVideos] = useState<Video[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    // Check for password authentication
    const isAuthenticated = localStorage.getItem('password_authenticated');
    if (!isAuthenticated) {
      router.push('/');
      return;
    }

    // Check for Google authentication
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchVideos = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/videos');
        const data = await response.json();
        setVideos(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching videos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, []); // Remove router from dependencies

  const filteredVideos = videos.filter(video => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      video.metadata.title.toLowerCase().includes(searchLower) ||
      video.metadata.description.toLowerCase().includes(searchLower);

    const matchesSchools = 
      selectedSchools.length === 0 || 
      selectedSchools.includes(video.metadata.school);

    const matchesTags = 
      selectedTags.length === 0 || 
      video.metadata.tags.some(tag => selectedTags.includes(tag));

    return matchesSearch && matchesSchools && matchesTags;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Video Archive</h1>
          <Link 
            href="/upload"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            Upload New Video
          </Link>
        </div>

        <div className="mb-8">
          <FilterBar 
            onSearch={setSearchQuery}
            onSchoolFilter={setSelectedSchools}
            onTagFilter={setSelectedTags}
            videos={videos}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <div key={video.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {!video.filename.endsWith('.zip') && (
                <video 
                  className="w-full h-48 object-cover"
                  src={`http://localhost:8000/uploads/${video.filename}`}
                  controls
                  preload="metadata"
                />
              )}
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">{video.metadata.title}</h3>
                <p className="text-gray-600 mb-2">{video.metadata.description}</p>
                <p className="text-gray-500 mb-2">School: {video.metadata.school}</p>
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

        {filteredVideos.length === 0 && (
          <p className="text-center text-gray-500 mt-8">
            {searchQuery ? 'No videos match your search.' : 'No videos uploaded yet.'}
          </p>
        )}
      </div>
    </main>
  );
} 