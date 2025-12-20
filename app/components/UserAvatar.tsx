'use client';

import { User } from '@supabase/supabase-js';

interface UserAvatarProps {
  user: User | null;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
}

export default function UserAvatar({ user, size = 'md', showName = false }: UserAvatarProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  const avatarUrl = user?.user_metadata?.avatar_url;
  const fullName = user?.user_metadata?.full_name || user?.user_metadata?.user_name;
  const email = user?.email || '';

  // 이니셜 생성: 이름이 있으면 첫 글자들, 없으면 이메일 앞 2글자
  const getInitials = () => {
    if (fullName) {
      const parts = fullName.split(' ').filter(Boolean);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return fullName.slice(0, 2).toUpperCase();
    }
    return email.slice(0, 2).toUpperCase();
  };

  return (
    <div className="flex items-center gap-2">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt="Profile"
          className={`${sizeClasses[size]} rounded-full object-cover ring-2 ring-white shadow-sm`}
        />
      ) : (
        <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-[var(--color-spark)] to-[var(--color-mint)] flex items-center justify-center text-white font-bold ring-2 ring-white shadow-sm`}>
          {getInitials()}
        </div>
      )}
      {showName && fullName && (
        <span className="text-sm text-[var(--color-text)] hidden sm:inline truncate max-w-[120px]">
          {fullName}
        </span>
      )}
    </div>
  );
}
