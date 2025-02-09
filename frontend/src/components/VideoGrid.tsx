'use client';

interface VideoGridProps {
  searchQuery: string;
}

export default function VideoGrid({ searchQuery }: VideoGridProps) {
  // This will be replaced with actual data from the API
  const videos = [
    // Sample data structure
    // { id: 1, title: 'Sample Video', description: 'Description...', tags: ['tag1', 'tag2'] }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.length === 0 ? (
        <p className="col-span-full text-center text-gray-500">No videos found</p>
      ) : (
        videos.map((video) => (
          <div key={video.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Video preview and metadata will go here */}
          </div>
        ))
      )}
    </div>
  );
} 