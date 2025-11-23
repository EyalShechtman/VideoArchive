'use client';

import { Search, X } from 'lucide-react';
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

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedSchools([]);
    setSelectedTags([]);
    onSearch('');
    onSchoolFilter([]);
    onTagFilter([]);
  };

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
    <div className="space-y-4 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search videos by title or description..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2 rounded-lg border font-semibold transition-colors ${
            showFilters ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Filters {selectedSchools.length + selectedTags.length > 0 && `(${selectedSchools.length + selectedTags.length})`}
        </button>
      </div>

      {showFilters && (
        <div className="pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <h3 className="font-medium mb-3 text-gray-700">Schools</h3>
              <div className="flex flex-wrap gap-2">
                {uniqueSchools.map((school) => (
                  <label
                    key={school.id}
                    className={`inline-flex items-center px-3 py-1 rounded-full cursor-pointer text-sm font-medium transition-colors ${
                      selectedSchools.includes(school.name)
                        ? 'bg-blue-500 text-white shadow'
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
              <h3 className="font-medium mb-3 text-gray-700">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {uniqueTags.map((tag) => (
                  <label
                    key={tag.id}
                    className={`inline-flex items-center px-3 py-1 rounded-full cursor-pointer text-sm font-medium transition-colors ${
                      selectedTags.includes(tag.name)
                        ? 'bg-blue-500 text-white shadow'
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
        </div>
      )}

      {(selectedSchools.length > 0 || selectedTags.length > 0) && (
        <div className="pt-4 border-t border-gray-200 flex flex-wrap items-center gap-2">
          <h3 className="font-medium text-sm text-gray-600 mr-2">Active Filters:</h3>
          {selectedSchools.map(school => (
            <div key={school} className="flex items-center bg-blue-100 text-blue-800 text-sm font-medium pl-3 pr-1 py-1 rounded-full">
              <span>{school}</span>
              <button onClick={() => handleSchoolToggle(school)} className="ml-1.5 p-0.5 rounded-full hover:bg-blue-200 focus:outline-none">
                <X size={14} />
              </button>
            </div>
          ))}
          {selectedTags.map(tag => (
            <div key={tag} className="flex items-center bg-blue-100 text-blue-800 text-sm font-medium pl-3 pr-1 py-1 rounded-full">
              <span>{tag}</span>
              <button onClick={() => handleTagToggle(tag)} className="ml-1.5 p-0.5 rounded-full hover:bg-blue-200 focus:outline-none">
                <X size={14} />
              </button>
            </div>
          ))}
          <button
            onClick={handleClearFilters}
            className="text-sm text-blue-600 hover:underline ml-auto"
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
} 