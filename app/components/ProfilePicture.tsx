'use client';

interface ProfilePictureProps {
  src?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl'
};

export default function ProfilePicture({ src, name, size = 'md', className = '' }: ProfilePictureProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (src) {
    return (
      <img
        src={src}
        alt={`${name}'s profile`}
        className={`${sizeClasses[size]} rounded-full object-cover border-2 border-gray-200 ${className}`}
      />
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-200 font-medium text-gray-600 ${className}`}>
      {getInitials(name)}
    </div>
  );
}