import React, { useEffect, useState, useCallback } from 'react';
import { Search, BookOpen, Video, Dumbbell as Barbell, Users, Heart, Trees as Tree, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ResourceCard } from '../components/resources/ResourceCard';
import { useResourceStore } from '../store/resourceStore';
import { Link, useNavigate } from 'react-router-dom';

export const ResourcesPage: React.FC = () => {
  const { 
    resources, 
    categories,
    fetchResources,
    fetchCategories,
    searchResources,
    isLoading,
    error
  } = useResourceStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeResourceType, setActiveResourceType] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const resourcesPerPage = 6;
  
  const navigate = useNavigate();

  // Use useCallback to memoize search function
  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const query = {
      text: searchTerm,
      category: selectedCategory || undefined,
      type: activeResourceType || undefined
    };
    searchResources(query.text, query.category);
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, activeResourceType, searchResources]);

  useEffect(() => {
    fetchResources();
    fetchCategories();
    
    // Cleanup realtime subscription when component unmounts
    return () => {
      const store = useResourceStore.getState();
      store.cleanupRealtimeSubscription();
    };
  }, [fetchResources, fetchCategories]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
    setActiveResourceType(null);
    fetchResources();
    setCurrentPage(1);
  };

  // Handle tab changes
  const handleResourceTypeChange = (type: string | null) => {
    setActiveResourceType(type);
    
    // Search with the current filters plus the new type
    const query = searchTerm;
    const category = selectedCategory || undefined;
    
    // If type is 'all', we pass null to fetch all types
    const resourceType = type === 'all' ? null : type;
    
    // For now we're just using the existing search function,
    // but in the future we could extend it to filter by type as well
    searchResources(query, category);
    setCurrentPage(1);
  };

  // Calculate pagination
  const indexOfLastResource = currentPage * resourcesPerPage;
  const indexOfFirstResource = indexOfLastResource - resourcesPerPage;
  const currentResources = resources.slice(indexOfFirstResource, indexOfLastResource);
  const totalPages = Math.ceil(resources.length / resourcesPerPage);

  const paginate = (pageNumber: number) => {
    // Ensure page number is within valid range
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
    
    // Scroll to top of resources section
    window.scrollTo({
      top: document.getElementById('latest-resources')?.offsetTop || 0,
      behavior: 'smooth'
    });
  };

  // Featured resources - first 3 resources
  const featuredResources = resources.slice(0, 3);
  
  // Latest resources - filtered and paginated results
  const latestResources = currentResources;

  return (
    <div className="relative bg-neutral-off-white text-gray-700 min-h-screen -mx-4 -my-6 px-4 py-6">
      <div className="max-w-[960px] mx-auto">
        {/* Header */}
        <div className="flex flex-wrap justify-between gap-3 p-4">
          <div className="flex min-w-72 flex-col gap-3">
            <p className="text-gray-800 tracking-tight text-[32px] font-bold leading-tight">Resources</p>
            <p className="text-gray-600 text-sm font-normal leading-normal">
              Explore articles, videos, and exercises to support your mental well-being.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 py-3">
          <form onSubmit={handleSearch} className="relative">
            <div className="flex w-full flex-1 items-stretch rounded-xl h-12">
              <div className="text-gray-500 flex border border-r-0 border-gray-200 bg-white items-center justify-center pl-4 rounded-l-xl">
                <Search className={`w-5 h-5 text-gray-500 ${isLoading ? 'animate-pulse' : ''}`} />
              </div>
              <input
                type="text"
                placeholder="Search resources..."
                value={searchTerm || ''}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 min-w-0 resize-none overflow-hidden rounded-r-xl text-gray-800 focus:outline-none focus:ring-1 focus:ring-accent-teal border border-l-0 border-gray-200 bg-white h-full placeholder:text-gray-400 px-4 rounded-l-none pl-2 text-base font-normal leading-normal"
              />
              <Button
                type="submit"
                className="ml-3 bg-accent-teal hover:bg-accent-teal/90 px-3 rounded-xl text-white "
                isLoading={isLoading}
              >
                Search
              </Button>
              <Button
                type="button"
                
                className="bg-transparent border rounded-xl px-2 ml-2 flex items-center border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-800 focus:ring-2 focus:ring-accent-teal/50"
                icon={<Filter className="w-4 h-4" />}
                onClick={clearFilters}
              >
                Reset
              </Button>
            </div>
          </form>
        </div>
        
        {/* Tabs */}
        <div className="pb-3">
          <div className="flex border-b border-gray-200 px-4 gap-8">
            <button
              onClick={() => handleResourceTypeChange('all')}
              className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 ${
                activeResourceType === null ? 'border-b-accent-teal text-accent-teal' : 'border-b-transparent text-gray-600 hover:text-accent-teal'
              }`}
            >
              <p className={`text-sm font-bold leading-normal tracking-[0.015em]`}>
                All
              </p>
            </button>
            <button
              onClick={() => handleResourceTypeChange('article')}
              className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 ${
                activeResourceType === 'article' ? 'border-b-accent-teal text-accent-teal' : 'border-b-transparent text-gray-600 hover:text-accent-teal'}`}
            >
              <p className="text-sm font-bold leading-normal tracking-[0.015em] flex items-center">
                <BookOpen className="w-3.5 h-3.5 mr-1.5" /> Articles
              </p>
            </button>
            <button
              onClick={() => handleResourceTypeChange('video')}
              className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 ${
                activeResourceType === 'video' ? 'border-b-accent-teal text-accent-teal' : 'border-b-transparent text-gray-600 hover:text-accent-teal'}`}
            >
              <p className="text-sm font-bold leading-normal tracking-[0.015em] flex items-center">
                <Video className="w-3.5 h-3.5 mr-1.5" /> Videos
              </p>
            </button>
            <button
              onClick={() => handleResourceTypeChange('exercise')}
              className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 ${
                activeResourceType === 'exercise' ? 'border-b-accent-teal text-accent-teal' : 'border-b-transparent text-gray-600 hover:text-accent-teal'}`}
            >
              <p className="text-sm font-bold leading-normal tracking-[0.015em] flex items-center">
                <Barbell className="w-3.5 h-3.5 mr-1.5" /> Exercises
              </p>
            </button>
          </div>
        </div>

        {/* Error and Status Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start mx-4">
            <div className="text-red-600">
              <p className="font-medium">Error Fetching Resources</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Featured Section */}
        <h2 className="text-gray-800 text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Featured</h2>
        <div className="flex overflow-y-auto [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex items-stretch p-4 gap-3">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse flex-1 min-w-60 rounded-lg">
                  <div className="aspect-video bg-gray-200 rounded-xl mb-4"></div>
                  <div className="h-5 bg-gray-200 rounded-xl w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded-xl w-full"></div>
                </div>
              ))
            ) : featuredResources.length > 0 ? (
              featuredResources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} variant="featured" />
              ))
            ) : (
              <div className="flex items-center justify-center w-full py-8">
                <p className="text-gray-600">No featured resources found</p>
              </div>
            )}
          </div>
        </div>

        {/* Categories */}
        <h2 className="text-gray-800 text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Categories</h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-4">
          {categories.map((category, index) => (
            <button 
              key={index}
              onClick={() => { 
                setSelectedCategory(category);
                searchResources(searchTerm, category); 
                setCurrentPage(1);
              }}
              className={`flex flex-1 gap-3 rounded-lg border transition-all duration-200 ${
                selectedCategory === category 
                  ? 'border-accent-teal bg-pastel-teal/30' 
                  : 'border-gray-200 bg-white hover:border-accent-teal/50'
              } p-4 items-center transition-colors`}
            >
              {index === 0 && <BookOpen className="w-6 h-6 text-accent-teal" />}
              {index === 1 && <Video className="w-6 h-6 text-accent-teal" />}
              {index === 2 && <Barbell className="w-6 h-6 text-accent-teal" />}
              {index === 3 && <Users className="w-6 h-6 text-accent-teal" />}
              {index === 4 && <Heart className="w-6 h-6 text-accent-teal" />}
              {index === 5 && <Tree className="w-6 h-6 text-accent-teal" />}
              <h2 className="text-gray-800 text-base font-bold leading-tight">{category}</h2>
            </button>
          ))}
          {categories.length === 0 && Array(6).fill(0).map((_, i) => (
            <div key={i} className="flex flex-1 gap-3 rounded-lg border border-gray-200 bg-white p-4 items-center">
              {i === 0 && <BookOpen className="w-6 h-6 text-accent-teal" />}
              {i === 1 && <Video className="w-6 h-6 text-accent-teal" />}
              {i === 2 && <Barbell className="w-6 h-6 text-accent-teal" />}
              {i === 3 && <Users className="w-6 h-6 text-accent-teal" />}
              {i === 4 && <Heart className="w-6 h-6 text-accent-teal" />}
              {i === 5 && <Tree className="w-6 h-6 text-accent-teal" />}
              <h2 className="text-gray-800 text-base font-bold leading-tight">
                {i === 0 ? 'Articles' : 
                 i === 1 ? 'Videos' : 
                 i === 2 ? 'Exercises' :
                 i === 3 ? 'Community' :
                 i === 4 ? 'Self-Care' : 'Nature'}
              </h2>
            </div>
          ))}
        </div>

        {/* Latest Resources */}
        <h2 id="latest-resources" className="text-gray-800 text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Latest Resources</h2>
        
        {isLoading ? (
          <div className="space-y-4 p-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl">
                <div className="flex items-stretch justify-between gap-4">
                  <div className="flex-[2_2_0px] space-y-2">
                    <div className="h-4 bg-gray-200 rounded-xl w-1/4 mb-1"></div>
                    <div className="h-5 bg-gray-200 rounded-xl w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded-xl w-full"></div>
                    <div className="h-8 bg-gray-200 rounded-xl w-24 mt-4"></div>
                  </div>
                  <div className="aspect-video flex-1 bg-gray-200 rounded-xl"></div>
                </div>
              </div>
            ))}
          </div>
        ) : latestResources.length > 0 ? (
          latestResources.map((resource) => (
            <div key={resource.id} className="p-4">
              <ResourceCard resource={resource} variant="latest" />
            </div>
          ))
        ) : (
          <div className="p-4 text-center py-6">
            <p className="text-gray-600">No resources found matching your search criteria</p>
            <button 
              onClick={clearFilters} 
              className="mt-4 px-4 py-2 bg-accent-teal text-white rounded-lg hover:bg-accent-teal/90 transition-colors"
            > 
              Clear filters
            </button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center p-4">
            <button 
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`flex w-10 h-10 items-center justify-center ${
                currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100 hover:rounded-full'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            {[...Array(totalPages)].map((_, idx) => {
              const pageNumber = idx + 1;
              
              // Show logic: always show first and last pages, and 1 page around current page
              const shouldShow = pageNumber === 1 || 
                               pageNumber === totalPages || 
                               (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1);
              
              // Show ellipsis before and after shown pages
              if (!shouldShow) {
                // Show ellipsis after first page
                if (pageNumber === 2 && currentPage > 3) {
                  return <span key={pageNumber} className="text-white">...</span>;
                }
                // Show ellipsis before last page
                if (pageNumber === totalPages - 1 && currentPage < totalPages - 2) {
                  return <span key={pageNumber} className="text-white">...</span>;
                }
                // Hide other pages
                return null;
              }
              
              return (
                <button
                  key={pageNumber}
                  onClick={() => paginate(pageNumber)}
                  className={`text-sm ${pageNumber === currentPage 
                    ? 'font-bold bg-accent-teal text-white' 
                    : 'font-normal text-gray-600 hover:bg-gray-100'
                  } flex w-10 h-10 items-center justify-center rounded-full`}
                >
                  {pageNumber}
                </button>
              );
            })}
            
            <button 
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`flex w-10 h-10 items-center justify-center ${
                currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100 hover:rounded-full'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};