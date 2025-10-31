import React from 'react';

interface TagCloudProps {
  tags: string[];
  onTagClick?: (tag: string) => void;
  activeTag?: string | null;
}

const TagCloud: React.FC<TagCloudProps> = ({ tags, onTagClick, activeTag }) => {
  const colors = [
    'bg-blue-100 text-blue-800 hover:bg-blue-200',
    'bg-green-100 text-green-800 hover:bg-green-200',
    'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    'bg-purple-100 text-purple-800 hover:bg-purple-200',
    'bg-pink-100 text-pink-800 hover:bg-pink-200',
    'bg-indigo-100 text-indigo-800 hover:bg-indigo-200',
    'bg-teal-100 text-teal-800 hover:bg-teal-200',
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, index) => {
        const isActive = tag === activeTag;
        const colorClasses = colors[index % colors.length];
        const activeClasses = isActive ? 'ring-2 ring-offset-1 ring-primary-500' : '';
        
        return (
            <span
              key={index}
              className={`px-3 py-1 text-sm font-medium rounded-full transition-all ${colorClasses} ${onTagClick ? 'cursor-pointer' : 'cursor-default'} ${activeClasses}`}
              onClick={() => onTagClick && onTagClick(tag)}
            >
              {tag}
            </span>
        );
      })}
    </div>
  );
};

export default TagCloud;