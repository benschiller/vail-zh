import type { Space } from '@/lib/types';
import { SpaceCard } from './space-card';

interface SpacesListProps {
  spaces: Space[];
}

export function SpacesList({ spaces }: SpacesListProps) {
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
    </div>
  );
}
