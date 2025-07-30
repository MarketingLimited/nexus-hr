import * as React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface LazyLoaderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  onIntersect?: () => void;
}

export function LazyLoader({
  children,
  fallback,
  className,
  threshold = 0.1,
  rootMargin = "50px",
  triggerOnce = true,
  onIntersect,
}: LazyLoaderProps) {
  const [isIntersecting, setIsIntersecting] = React.useState(false);
  const [hasIntersected, setHasIntersected] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting;
        setIsIntersecting(isVisible);

        if (isVisible) {
          setHasIntersected(true);
          onIntersect?.();

          if (triggerOnce) {
            observer.unobserve(element);
          }
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, triggerOnce, onIntersect]);

  const shouldShowContent = triggerOnce ? hasIntersected : isIntersecting;

  return (
    <div ref={ref} className={cn("min-h-[100px]", className)}>
      {shouldShowContent ? children : fallback}
    </div>
  );
}

// Lazy component wrapper
interface LazyComponentProps {
  loader: () => Promise<{ default: React.ComponentType<any> }>;
  fallback?: React.ReactNode;
  className?: string;
  [key: string]: any;
}

export function LazyComponent({
  loader,
  fallback = <LazyComponentSkeleton />,
  className,
  ...props
}: LazyComponentProps) {
  const [Component, setComponent] = React.useState<React.ComponentType<any> | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const loadComponent = React.useCallback(async () => {
    if (Component || loading) return;

    setLoading(true);
    setError(null);

    try {
      const module = await loader();
      setComponent(() => module.default);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [loader, Component, loading]);

  if (error) {
    return (
      <div className={cn("p-4 text-center text-destructive", className)}>
        <p>Failed to load component</p>
        <button
          onClick={() => {
            setError(null);
            loadComponent();
          }}
          className="mt-2 text-sm underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!Component) {
    return (
      <LazyLoader onIntersect={loadComponent} className={className}>
        {loading ? fallback : <div>Click to load</div>}
      </LazyLoader>
    );
  }

  return <Component {...props} />;
}

// Default skeleton for lazy components
export function LazyComponentSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-8 w-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

// Lazy image component with progressive loading
interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function LazyImage({
  src,
  alt,
  fallback,
  className,
  onLoad,
  onError,
  ...props
}: LazyImageProps) {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);
  const [imageSrc, setImageSrc] = React.useState<string>("");

  const handleImageLoad = () => {
    setImageLoaded(true);
    onLoad?.();
  };

  const handleImageError = () => {
    setImageError(true);
    if (fallback) {
      setImageSrc(fallback);
      setImageError(false);
    }
    onError?.();
  };

  return (
    <LazyLoader
      onIntersect={() => setImageSrc(src)}
      fallback={<Skeleton className={cn("w-full h-48", className)} />}
    >
      <div className="relative">
        {!imageLoaded && !imageError && (
          <Skeleton className={cn("absolute inset-0 w-full h-full", className)} />
        )}
        <img
          src={imageSrc}
          alt={alt}
          className={cn(
            "transition-opacity duration-300",
            imageLoaded ? "opacity-100" : "opacity-0",
            className
          )}
          onLoad={handleImageLoad}
          onError={handleImageError}
          {...props}
        />
      </div>
    </LazyLoader>
  );
}