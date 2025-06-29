import React from 'react';
import { Resource } from '../../types';
import { Link } from 'react-router-dom';
import { Clock, User, Tag, Video, BookOpen, Dumbbell, PenTool as Tool, Music } from 'lucide-react';
import { format } from 'date-fns';

type ResourceCardProps = {
  resource: Resource;
  variant?: 'standard' | 'featured' | 'latest';
};

export const ResourceCard: React.FC<ResourceCardProps> = ({ resource, variant = 'standard' }) => {
  const defaultImage = 'https://images.pexels.com/photos/3758105/pexels-photo-3758105.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';

  const imageUrl = resource.thumbnail_url || defaultImage;
  
  // Use default image if thumbnail_url is missing
  const processedImageUrl = imageUrl; 
  
  // Get appropriate icon based on resource type
  const getResourceIcon = (type?: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4 text-purple-400" />;
      case 'audio':
        return <Music className="w-4 h-4 text-green-400" />;
      case 'exercise':
        return <Dumbbell className="w-4 h-4 text-yellow-400" />;
      case 'tool':
        return <Tool className="w-4 h-4 text-red-400" />;
      case 'article':
      default:
        return <BookOpen className="w-4 h-4 text-blue-400" />;
    }
  };
  
  // Format duration (if exists)
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (variant === 'featured') {
    return (
      <Link to={`/resources/${resource.id}`} className="flex h-full flex-1 flex-col gap-4 rounded-lg min-w-60 group cursor-pointer">
        <div 
          className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl flex flex-col transition-transform group-hover:scale-[1.02]"
          style={{ backgroundImage: `url(${processedImageUrl})` }}
        ></div>
        <div>
          <div className="flex items-center mb-1">
            {resource.type && (
              <span className="mr-2 flex items-center text-accent-teal">
                {getResourceIcon(resource.type)}
              </span>
            )}
            <p className="text-gray-800 text-base font-medium leading-normal group-hover:text-accent-teal transition-colors">{resource.title}</p>
          </div>
          <p className="text-gray-600 text-sm font-normal leading-normal">
            {resource.content.substring(0, 60)}...
          </p>
        </div>
      </Link>
    );
  }

  if (variant === 'latest') {
    return (
      <Link to={`/resources/${resource.id}`} className="flex items-stretch justify-between gap-4 rounded-xl hover:bg-neutral-light-gray transition-all duration-300 p-2 -m-2 cursor-pointer group">
        <div className="flex flex-[2_2_0px] flex-col gap-4 justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center">
              {resource.type && (
                <span className="flex items-center text-accent-teal text-sm mr-2">
                  {getResourceIcon(resource.type)}
                </span>
              )}
              <p className="text-gray-600 text-sm font-normal leading-normal">
                {resource.category && resource.category.length > 0 ? resource.category[0] : 'Article'}
              </p>
            </div>
            <p className="text-gray-800 text-base font-bold leading-tight group-hover:text-accent-teal transition-colors">{resource.title}</p>
            <p className="text-gray-600 text-sm font-normal leading-normal">
              {resource.content.substring(0, 80)}...
            </p>
          </div>
          <div className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 flex-row-reverse bg-accent-teal text-white text-sm font-medium leading-normal w-fit group-hover:bg-accent-teal/90 transition-colors">
            <span className="truncate">Read More</span>
          </div>
        </div>
        <div
          className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl flex-1 transition-transform group-hover:scale-[1.02]"
          style={{ backgroundImage: `url(${processedImageUrl})` }}
        ></div>
      </Link>
    );
  }

  // Default standard card
  return (
    <Link to={`/resources/${resource.id}`}>
      <div className="h-full bg-white border border-gray-200 rounded-xl shadow-sm transition-all duration-200 overflow-hidden group hover:shadow-md hover:border-accent-teal/30 cursor-pointer">
        <div className="aspect-video overflow-hidden">
          <img
            src={processedImageUrl}
            alt={resource.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-2 mb-3">
            {resource.category && resource.category.slice(0, 2).map((cat) => (
              <span 
                key={cat} 
                className="px-2 py-1 text-xs rounded-full bg-pastel-teal/30 text-accent-teal border border-accent-teal/20 flex items-center"
              >
                {cat}
              </span>
            ))}
            {resource.category && resource.category.length > 2 && (
              <span className="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-600">
                +{resource.category.length - 2} more
              </span>
            )}
          </div>
          <div className="flex items-center mb-2">
            {resource.type && (
              <span className="flex items-center mr-3 px-2 py-0.5 text-xs rounded-full border border-gray-200 text-gray-600">
                {getResourceIcon(resource.type)}
                <span className="ml-1 capitalize">
                  {resource.type}
                </span>
                {resource.duration && resource.type === 'video' && (
                  <span className="ml-1">• {formatDuration(resource.duration)}</span>
                )}
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-800 line-clamp-2 mb-2 group-hover:text-accent-teal transition-colors">
            {resource.title}
          </h3>
          
          <p className="text-sm text-gray-600 line-clamp-3 mb-4"> 
            {resource.content.substring(0, 120)}...
          </p>
          
          {resource.category && resource.category.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              <Tag className="h-3.5 w-3.5 text-accent-teal mr-1" />
              {resource.category.slice(0, 3).map(cat => (
                <span key={cat} className="text-xs px-2 py-0.5 rounded-full bg-pastel-teal/30 text-accent-teal border border-accent-teal/20">
                  {cat}
                </span>
              ))}
            </div>
          )}
          
          <div className="flex items-center justify-between text-xs text-gray-500 mt-auto">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-1 text-gray-500" />
              <span>{resource.author}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1 text-gray-500" />
              <span>{format(new Date(resource.created_at), 'MMM d, yyyy')}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};