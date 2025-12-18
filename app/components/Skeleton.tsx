'use client';

/**
 * 스켈레톤 로딩 컴포넌트
 */

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({
  className = '',
  variant = 'text',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) {
  const baseClasses = 'bg-[var(--color-cream-dark)]';

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  };

  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  };

  const style: React.CSSProperties = {
    width: width || (variant === 'text' ? '100%' : undefined),
    height: height || (variant === 'text' ? '1em' : undefined),
  };

  return (
    <div
      className={`${baseClasses} ${animationClasses[animation]} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
}

/**
 * 아티클 생성 중 스켈레톤
 */
export function ArticleSkeleton() {
  return (
    <div className="card-elevated p-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Skeleton variant="circular" width={32} height={32} />
        <Skeleton variant="text" width="40%" height={24} />
      </div>

      {/* 제목 */}
      <Skeleton variant="text" width="60%" height={28} className="mb-4" />

      {/* 본문 */}
      <div className="space-y-3 mb-6">
        <Skeleton variant="text" width="100%" height={16} />
        <Skeleton variant="text" width="95%" height={16} />
        <Skeleton variant="text" width="100%" height={16} />
        <Skeleton variant="text" width="88%" height={16} />
        <Skeleton variant="text" width="100%" height={16} />
        <Skeleton variant="text" width="92%" height={16} />
        <Skeleton variant="text" width="75%" height={16} />
      </div>

      {/* 메타 정보 */}
      <div className="flex gap-3">
        <Skeleton variant="rectangular" width={80} height={28} />
        <Skeleton variant="rectangular" width={60} height={28} />
        <Skeleton variant="rectangular" width={100} height={28} />
      </div>
    </div>
  );
}

/**
 * 문제 생성 중 스켈레톤
 */
export function QuestionSkeleton() {
  return (
    <div className="question-card animate-fade-in">
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Skeleton variant="rectangular" width={120} height={24} />
              <Skeleton variant="text" width={40} height={16} />
            </div>
            <Skeleton variant="text" width="80%" height={24} />
          </div>
          <Skeleton variant="rectangular" width={60} height={32} />
        </div>

        {/* 지문 */}
        <div className="p-6 bg-[var(--color-cream)] rounded-xl">
          <Skeleton variant="text" width={40} height={16} className="mb-3" />
          <div className="space-y-2">
            <Skeleton variant="text" width="100%" height={16} />
            <Skeleton variant="text" width="97%" height={16} />
            <Skeleton variant="text" width="100%" height={16} />
            <Skeleton variant="text" width="85%" height={16} />
            <Skeleton variant="text" width="100%" height={16} />
            <Skeleton variant="text" width="90%" height={16} />
          </div>
        </div>

        {/* 선택지 */}
        <div>
          <Skeleton variant="text" width={60} height={16} className="mb-3" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-[var(--color-cream)] rounded-lg">
                <Skeleton variant="circular" width={24} height={24} />
                <Skeleton variant="text" width={`${70 + Math.random() * 20}%`} height={16} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 문제 목록 스켈레톤 (아카이브용)
 */
export function ArchiveListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="p-4 bg-white rounded-xl border border-[var(--color-spark)]/10">
          <Skeleton variant="rectangular" width={100} height={20} className="mb-2" />
          <Skeleton variant="text" width="80%" height={18} className="mb-1" />
          <Skeleton variant="text" width={120} height={14} />
        </div>
      ))}
    </div>
  );
}

/**
 * 진행률 표시 컴포넌트
 */
interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
  showPercentage?: boolean;
}

export function ProgressBar({
  current,
  total,
  label,
  showPercentage = true,
}: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <span className="text-sm font-medium text-[var(--color-text)]">
              {label}
            </span>
          )}
          {showPercentage && (
            <span className="text-sm text-[var(--color-text-muted)]">
              {current}/{total} ({percentage}%)
            </span>
          )}
        </div>
      )}
      <div className="w-full h-2 bg-[var(--color-cream-dark)] rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[var(--color-spark)] to-[var(--color-mint)] rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

/**
 * 로딩 스피너 (개선된 버전)
 */
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export function LoadingSpinner({ size = 'md', text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizeClasses[size]} border-4 border-[var(--color-spark)]/20 border-t-[var(--color-spark)] rounded-full animate-spin`}
      />
      {text && (
        <p className="text-sm text-[var(--color-text-muted)] animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}

/**
 * 전체 페이지 로딩
 */
export function PageLoader({ text }: { text?: string }) {
  return (
    <div className="min-h-screen bg-[var(--color-cream)] flex items-center justify-center">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
}
