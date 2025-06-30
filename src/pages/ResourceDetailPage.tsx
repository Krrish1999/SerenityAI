import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Tag, ChevronRight, Clock, Play, Video, AlertTriangle, ExternalLink } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useResourceStore } from '../store/resourceStore';
import { format } from 'date-fns';

export const ResourceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentResource, resources, fetchResourceById, fetchResources, isLoading, error } = useResourceStore();

  useEffect(() => {
    if (id) {
      fetchResourceById(id);
      fetchResources(); // For the "related resources" section
    }
  }, [id]);

  // Transform YouTube URLs to use the privacy-enhanced domain
  const getEmbedUrl = (url?: string): string => {
    if (!url) return '';
    
    // Handle YouTube URLs
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      // Extract video ID
      let videoId = '';
      
      if (url.includes('youtube.com/embed/')) {
        // Already in embed format
        videoId = url.split('/embed/')[1]?.split('?')[0];
      } else if (url.includes('youtube.com/watch')) {
        // Regular watch URL
        videoId = new URLSearchParams(url.split('?')[1]).get('v') || '';
      } else if (url.includes('youtu.be/')) {
        // Short URL
        videoId = url.split('youtu.be/')[1]?.split('?')[0];
      }
      
      if (videoId) {
        // Use youtube-nocookie.com for enhanced privacy and better embedding
        return `https://www.youtube-nocookie.com/embed/${videoId}`;
      }
    }
    
    return url;
  };

  if (isLoading) {
    return (
      <div className="bg-[#121118] -mx-4 -my-6 min-h-screen px-4 py-6">
        <div className="animate-pulse max-w-4xl mx-auto">
          <div className="h-8 bg-[#2b2938] rounded-xl w-1/4 mb-4"></div>
          <div className="h-40 bg-[#2b2938] rounded-xl mb-6"></div>
          <div className="h-8 bg-[#2b2938] rounded-xl w-3/4 mb-4"></div>
          <div className="h-4 bg-[#2b2938] rounded-xl w-1/3 mb-8"></div>
          <div className="h-4 bg-[#2b2938] rounded-xl w-full mb-3"></div>
          <div className="h-4 bg-[#2b2938] rounded-xl w-full mb-3"></div>
          <div className="h-4 bg-[#2b2938] rounded-xl w-full mb-3"></div>
          <div className="h-4 bg-[#2b2938] rounded-xl w-3/4 mb-3"></div>
        </div>
      </div>
    );
  }

  if (error || !currentResource) {
    return (
      <div className="bg-[#121118] -mx-4 -my-6 min-h-screen px-4 py-6 text-white">
        <div className="max-w-4xl mx-auto text-center py-10">
          <h2 className="text-xl font-semibold text-white mb-2">
            {error || "Resource not found"}
          </h2>
          <p className="text-[#a29db8] mb-6">
            We couldn't find the resource you're looking for.
          </p>
          <Button 
            onClick={() => navigate('/resources')}
            className="bg-[#2b2938] hover:bg-[#3b3948] text-white"
          >
            Browse All Resources
          </Button>
        </div>
      </div>
    );
  }

  // Default image if none is provided
  const defaultImage = 'https://images.pexels.com/photos/3758105/pexels-photo-3758105.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';

  // Format video duration
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Get related resources (excluding the current one)
  const relatedResources = resources
    .filter(r => r.id !== currentResource.id)
    .filter(r => {
      // Show resources that share at least one category
      if (currentResource.category && r.category) {
        return currentResource.category.some(cat => r.category?.includes(cat));
      }
      return false;
    })
    .slice(0, 3);

  return (
    <div className="bg-neutral-off-white -mx-4 -my-6 min-h-screen px-4 py-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-6 flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/resources')}
            className="text-gray-600 hover:text-accent-teal mr-4 flex items-center px-2 rounded-xl"
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to resources
          </Button>
        </div>

        {/* Resource Header */}
        <div className="flex flex-col mb-8">
          <div className="aspect-video w-full overflow-hidden rounded-xl mb-8">
            <img
              src={currentResource.thumbnail_url || defaultImage}
              alt={currentResource.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {currentResource.category && currentResource.category.map((cat) => (
              <span
                key={cat}
                className="px-3 py-1 text-sm rounded-full bg-pastel-teal/30 text-accent-teal border border-accent-teal/20"
              >
                {cat}
              </span>
            ))}
          </div>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            {currentResource.title} 
            {currentResource.type && currentResource.type !== 'article' && (
              <span className="inline-flex items-center ml-3 px-3 py-1 text-sm rounded-full bg-pastel-teal/30 text-accent-teal border border-accent-teal/20">
                {currentResource.type === 'video' && <Video className="w-3.5 h-3.5 mr-1.5" />}
                {currentResource.type === 'exercise' && <Play className="w-3.5 h-3.5 mr-1.5" />}
                {currentResource.type.charAt(0).toUpperCase() + currentResource.type.slice(1)}
              </span>
            )}
          </h1>
          
          <div className="flex flex-wrap items-center text-sm text-gray-600 mb-6 gap-y-2">
            <div className="flex items-center mr-6">
              <User className="w-4 h-4 mr-1 text-gray-500" />
              <span>{currentResource.author}</span>
            </div>
            
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1 text-gray-500" />
              <span>{format(new Date(currentResource.created_at), 'MMMM d, yyyy')}</span>
            </div>
            
            {currentResource.duration && (
              <div className="flex items-center ml-6">
                <Clock className="w-4 h-4 mr-1 text-gray-500" />
                <span>{formatDuration(currentResource.duration)}</span>
              </div>
            )}
          </div>
          
          {/* Content */}
          {currentResource.type === 'video' && currentResource.source_url ? (
            <div className="mb-8">
              <div className="relative pb-[56.25%] h-0 rounded-xl overflow-hidden mb-4 bg-gray-100">
                <div className="absolute inset-0 flex flex-col">
                  <iframe 
                    className="w-full h-full"
                    src={getEmbedUrl(currentResource.source_url)}
                    title={currentResource.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    onError={(e: React.SyntheticEvent<HTMLIFrameElement>) => {
                      // Hide the iframe if it fails to load
                      e.currentTarget.style.display = 'none';
                      // Show fallback
                      const fallback = e.currentTarget.parentElement?.querySelector('.video-fallback');
                      if (fallback) fallback.classList.remove('hidden');
                    }}
                  ></iframe>
                  
                  {/* Fallback if video fails to load */}
                  <div className="video-fallback hidden absolute inset-0  flex-col items-center justify-center p-6 bg-gray-100 text-gray-800">
                    <AlertTriangle className="w-12 h-12 text-accent-coral mb-4" />
                    <h3 className="text-lg font-medium mb-2 text-center">Unable to load video</h3>
                    <p className="text-sm text-center mb-4 text-gray-600">
                      The video content couldn't be embedded. This may be due to privacy settings or content restrictions.
                    </p>
                    <a 
                      href={currentResource.source_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center px-4 py-2 bg-accent-teal hover:bg-accent-teal/90 transition-colors rounded-lg text-white"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Watch on YouTube
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="prose max-w-none text-gray-700">
                {currentResource.content.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-4">{paragraph}</p>
                ))}
              </div>
            </div>
          ) : (
            <div className="prose max-w-none text-gray-700">
              {currentResource.content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="mb-4">{paragraph}</p>
              ))}
            </div>
          )}
        </div>

        {/* Related Resources Section */}
        {relatedResources.length > 0 && (
          <div className="mb-12">
            <h2 className="text-gray-800 text-[22px] font-bold leading-tight tracking-[-0.015em] mb-4">Related Resources</h2>
            <div className="flex overflow-x-auto space-x-4 pb-4 [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {relatedResources.map(resource => (
                <Link 
                  to={`/resources/${resource.id}`} 
                  key={resource.id}
                  className="min-w-[280px] flex-shrink-0 bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-accent-teal/30 transition-colors shadow-sm"
                >
                  <div className="aspect-video w-full overflow-hidden">
                    <img
                      src={resource.thumbnail_url || defaultImage}
                      alt={resource.title}
                      className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-gray-800 text-lg font-semibold line-clamp-1 mb-1">{resource.title}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-2">{resource.content.substring(0, 80)}...</p>
                    <div className="flex items-center text-sm text-accent-teal">
                      <span>Read more</span>
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};