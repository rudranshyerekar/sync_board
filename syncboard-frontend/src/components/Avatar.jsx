import React from 'react';

// Generates a consistent background color based on the user's name
const getColorFromName = (name) => {
  if (!name) return 'bg-gray-400';
  const colors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
    'bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-teal-500'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export const Avatar = ({ 
  user, 
  size = 'md', 
  showPresence = false, 
  className = '' 
}) => {
  if (!user) return null;

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : '?';

  const bgColor = user.avatarUrl ? '' : getColorFromName(user.name);

  return (
    <div className={`relative inline-block ${className}`}>
      <div className={`
        ${sizeClasses[size]} 
        rounded-full flex items-center justify-center font-medium text-white shadow-sm border-2 border-white
        ${bgColor}
      `}>
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt={user.name} className="w-full h-full rounded-full object-cover" />
        ) : (
          initials
        )}
      </div>

      {showPresence && (
        <span className={`
          absolute bottom-0 right-0 block w-2.5 h-2.5 rounded-full border-2 border-white
          ${user.presence === 'Online' ? 'bg-success' : 
            user.presence === 'Idle' ? 'bg-warning' : 
            'bg-gray-400'}
        `} />
      )}
    </div>
  );
};
