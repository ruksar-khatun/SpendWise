import React, { useState } from 'react';
import { User } from 'lucide-react';

interface UserAvatarProps {
  src?: string;
  alt?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src = '/avatar.svg',
  alt = 'User avatar',
  className = '',
  size = 'md',
}) => {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  }[size];

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  }[size];

  // If error loading or empty, show neutral vector fallback
  if (hasError || !src) {
    return (
      <div
        className={`${sizeClasses} rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 flex-shrink-0 ${className}`}
        aria-label={alt}
      >
        <User className={iconSizes} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      className={`${sizeClasses} rounded-full object-cover flex-shrink-0 bg-slate-100 dark:bg-slate-800 ${className}`}
    />
  );
};
