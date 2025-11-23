'use client';

import { useEffect, useState }

const VideoSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden">
    <div className="w-full h-48 bg-gray-200 animate-pulse"></div>
    <div className="p-5">
      <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse mb-3"></div>
      <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-2"></div>
      <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse mb-4"></div>
      <div className="flex flex-wrap gap-2">
        <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
    </div>
  </div>
);

const VideoGridSkeleton = () => (
  <main className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
    <div className="max-w-screen-xl mx-auto">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center mb-8">
        <div className="h-10 w-1/4 bg-gray-300 rounded animate-pulse"></div>
        <div className="h-10 w-32 bg-gray-300 rounded animate-pulse"></div>
      </div>

      {/* FilterBar Skeleton */}
      <div className="h-24 md:h-16 w-full bg-white border border-gray-200 rounded-lg p-6 animate-pulse mb-8"></div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <VideoSkeleton key={i} />
        ))}
      </div>
    </div>
  </main>
); from 'react';
import Link from 'next/link';
import SearchBar from '@/components/SearchBar';
import { useRouter } from 'next/navigation';
import FilterBar from '@/components/FilterBar';
import { File } from 'lucide-react';

interface Video {
  _id: string;
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
    return <VideoGridSkeleton />;
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Video Archive</h1>
          <Link
            href="/upload"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredVideos.map((video) => (
            <div key={video._id} className="bg-white rounded-lg shadow-md overflow-hidden group transform transition-shadow duration-300 hover:shadow-xl">
              <div className="relative w-full h-48 bg-gray-200">
                {video.filename.endsWith('.zip') ? (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                    <File size={48} />
                    <span className="mt-2 text-sm font-medium">ZIP Archive</span>
                  </div>
                ) : (
                  <video 
                    className="w-full h-full object-cover"
                    src={`http://localhost:8000/uploads/${video.filename}`}
                    controls
                    preload="metadata"
                  />
                )}
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-800 truncate">{video.metadata.title}</h3>
                <p className="text-gray-600 text-sm mt-1 h-10 overflow-hidden">{video.metadata.description}</p>
                <p className="text-gray-500 text-xs mt-2">School: {video.metadata.school}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {video.metadata.tags.map((tag, index) => (
                    <span 
                      key={`${video._id}-${index}`}
                      className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredVideos.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-gray-700">No Videos Found</h3>
            <p className="text-gray-500 mt-2">
              {searchQuery || selectedSchools.length > 0 || selectedTags.length > 0
                ? 'Try adjusting your search or filters.'
                : 'There are no videos uploaded yet. Why not upload one?'}
            </p>
          </div>
        )}
      </div>
    </main>
  );
} 