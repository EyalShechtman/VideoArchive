'use client';

import { Search } from 'lucide-react';
import { useState, useEffect } from 'react';

interface FilterBarProps {
  onSearch: (query: string) => void;
  onSchoolFilter: (schools: string[]) => void;
  onTagFilter: (tags: string[]) => void;
  videos: Array<{
    metadata: {
      school: string;
      tags: string[];
    };
  }>;
}

export default function FilterBar({ onSearch, onSchoolFilter, onTagFilter, videos }: FilterBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Modify the unique extraction to include an index
  const uniqueSchools = Array.from(
    new Set(videos.map(video => video.metadata.school))
  ).map((school, index) => ({
    id: `school-${index}`,
    name: school
  }));

  const uniqueTags = Array.from(
    new Set(videos.flatMap(video => video.metadata.tags))
  ).map((tag, index) => ({
    id: `tag-${index}`,
    name: tag
  }));

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const handleSchoolToggle = (school: string) => {
    const updatedSchools = selectedSchools.includes(school)
      ? selectedSchools.filter(s => s !== school)
      : [...selectedSchools, school];
    setSelectedSchools(updatedSchools);
    onSchoolFilter(updatedSchools);
  };

  const handleTagToggle = (tag: string) => {
    const updatedTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(updatedTags);
    onTagFilter(updatedTags);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search videos..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2 rounded-lg border ${
            showFilters ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-300 text-gray-700'
          }`}
        >
          Filters {selectedSchools.length + selectedTags.length > 0 && `(${selectedSchools.length + selectedTags.length})`}
        </button>
      </div>

      {showFilters && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
          <div>
            <h3 className="font-medium mb-2">Schools</h3>
            <div className="flex flex-wrap gap-2">
              {uniqueSchools.map((school) => (
                <label
                  key={school.id}
                  className={`inline-flex items-center px-3 py-1 rounded-full cursor-pointer ${
                    selectedSchools.includes(school.name)
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={selectedSchools.includes(school.name)}
                    onChange={() => handleSchoolToggle(school.name)}
                  />
                  {school.name}
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {uniqueTags.map((tag) => (
                <label
                  key={tag.id}
                  className={`inline-flex items-center px-3 py-1 rounded-full cursor-pointer ${
                    selectedTags.includes(tag.name)
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={selectedTags.includes(tag.name)}
                    onChange={() => handleTagToggle(tag.name)}
                  />
                  {tag.name}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 