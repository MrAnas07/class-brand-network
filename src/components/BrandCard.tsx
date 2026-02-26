import React from 'react';

interface BrandCardProps {
  brandName: string;
  description: string;
  category?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  followers?: number;
  onFollow?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
  className?: string;
}

const BrandCard: React.FC<BrandCardProps> = ({
  brandName,
  description,
  category = '',
  instagramUrl,
  facebookUrl,
  followers = 0,
  onFollow,
  onEdit,
  onDelete,
  showActions = false,
  className = ''
}) => {
  const isValidUrl = (url: string): boolean => {
    if (!url) return false;
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === 'https:';
    } catch {
      return false;
    }
  };

  return (
    <div className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 group ${className}`}>
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-pink-600 group-hover:text-pink-700 transition-colors duration-300">
              {brandName}
            </h3>
            <span className="text-sm text-gray-600">
              {category}
            </span>
          </div>
          <span className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            {followers} followers
          </span>
        </div>

        <p className="text-gray-600 mb-4 text-sm">
          {description}
        </p>

        <div className="flex space-x-2">
          {instagramUrl && isValidUrl(instagramUrl) && (
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold px-4 py-1.5 rounded-full text-sm shadow-md hover:opacity-90 transition-all"
            >
              Instagram
            </a>
          )}

          {facebookUrl && isValidUrl(facebookUrl) && (
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold px-4 py-1.5 rounded-full text-sm shadow-md hover:opacity-90 transition-all"
            >
              Facebook
            </a>
          )}
        </div>

        <button
          onClick={onFollow}
          className="mt-4 w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-2 rounded-lg hover:shadow-lg hover:scale-[1.02] transition-all font-semibold"
        >
          Follow
        </button>

        {showActions && onEdit && onDelete && (
          <div className="flex gap-2 mt-3">
            <button
              onClick={onEdit}
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold py-2 px-4 rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all"
            >
              Edit
            </button>
            <button
              onClick={onDelete}
              className="flex-1 bg-red-50 border-2 border-red-400 text-red-500 font-semibold py-2 px-4 rounded-xl hover:bg-red-500 hover:text-red-500 transition-all"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandCard;