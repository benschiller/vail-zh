'use client';

import { useState } from 'react';
import { Space } from '@/lib/types';
import { SpaceCard } from './space-card';
import { Button } from './ui/button';

interface SpacesListProps {
  initialSpaces: Space[];
  initialNextPage: string | null;
}

export function SpacesList({ initialSpaces, initialNextPage }: SpacesListProps) {
  const [spaces, setSpaces] = useState<Space[]>(initialSpaces);
  const [nextPage, setNextPage] = useState<string | null>(initialNextPage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMore = async () => {
    if (!nextPage || loading) return;

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/v0/spaces?page=${nextPage}`);
      if (!response.ok) {
        throw new Error(`Failed to load more spaces: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // If no new spaces were returned, we've reached the end
      if (!data.spaces || data.spaces.length === 0) {
        setNextPage(null);
        return;
      }
      
      setSpaces(prev => [...prev, ...data.spaces]);
      setNextPage(data.next_page || null);
      
    } catch (error) {
      console.error('Error loading more spaces:', error);
      setError(error instanceof Error ? error.message : 'Failed to load more spaces');
    } finally {
      setLoading(false);
    }
  };

  if (spaces.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg text-muted-foreground">
          No spaces found matching the criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {spaces.map(space => (
        <SpaceCard key={space.id} space={space} />
      ))}

      {error && (
        <div className="flex flex-col items-center gap-4 py-4">
          <p className="text-sm text-red-600 text-center">
            {error}
          </p>
          <Button
            onClick={loadMore}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            Try Again
          </Button>
        </div>
      )}

      {nextPage && !error && (
        <div className="flex justify-center py-8">
          <Button
            onClick={loadMore}
            disabled={loading}
            size="lg"
            className="min-w-[200px]"
          >
            {loading ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}
    </div>
  );
}
