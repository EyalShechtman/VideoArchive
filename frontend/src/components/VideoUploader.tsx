'use client';

import { useState, useEffect } from 'react';
import { Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import GoogleDrivePicker from './GoogleDrivePicker';

interface VideoMetadata {
  title: string;
  description: string;
  tags: string;
  school: string;
}

export default function VideoUploader() {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<VideoMetadata>({
    title: '',
    school: '',
    description: '',
    tags: ''
  });
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('user');
    setIsAuthenticated(!!user);
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    if (file.type.startsWith('video/') || file.name.endsWith('.zip')) {  // ✅ Accept ZIP files
      setSelectedFile(file);
    } else {
      alert('Please upload a video or ZIP file containing videos');
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', metadata.title);
    formData.append('school', metadata.school);
    formData.append('description', metadata.description);
    formData.append('tags', metadata.tags);

    try {
      console.log('Uploading file:', selectedFile.name, 'Type:', selectedFile.type);
      const response = await fetch('http://localhost:8000/api/videos/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }

      const result = await response.json();
      console.log('Upload successful:', result);
      
      // Clear the form
      setSelectedFile(null);
      setMetadata({
        title: '',
        description: '',
        tags: '',
        school: ''
      });
      
      // Redirect to home page
      router.push('/');
    } catch (error) {
      console.error('Error uploading video:', error);
      alert(error instanceof Error ? error.message : 'Failed to upload video. Please try again.');
    }
  };

  const handleGoogleDriveSelect = async (file: any) => {
    // Handle the selected file from Google Drive
    setSelectedFile(file);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-4">Upload Video</h2>
      
      {isAuthenticated && (
        <div className="mb-4">
          <GoogleDrivePicker onFileSelect={handleGoogleDriveSelect} />
        </div>
      )}

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center mb-4 ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto mb-4 text-gray-400" size={48} />
        <p className="text-gray-600">
          Drag and drop your video or ZIP file here, or{' '}
          <label className="text-blue-500 cursor-pointer hover:text-blue-600">
            browse
            <input
              type="file"
              className="hidden"
              accept="video/*,.zip"
              onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
            />
          </label>
        </p>
        {selectedFile && (
          <div className="mt-2 text-sm">
            <p className="text-gray-500">{selectedFile.name}</p>
            <p className="text-gray-400">
              {selectedFile.name.endsWith('.zip') 
                ? 'ZIP file containing videos' 
                : 'Video file'}
            </p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={metadata.title}
            onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={3}
            value={metadata.description}
            onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">School</label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={metadata.school}
            onChange={(e) => setMetadata({ ...metadata, school: e.target.value })}
            placeholder="nature, documentary, tutorial"
          />
        </div>


        <div>
          <label className="block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={metadata.tags}
            onChange={(e) => setMetadata({ ...metadata, tags: e.target.value })}
            placeholder="nature, documentary, tutorial"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
          disabled={!selectedFile}
        >
          Upload Video
        </button>
      </form>
    </div>
  );
} 