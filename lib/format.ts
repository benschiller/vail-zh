import { Space } from './types';

// Format date to human-readable format
// Handles both timestamp (new API) and ISO string (backwards compatibility)
export function formatDate(dateInput: string | number): string {
  let date: Date;
  
  if (typeof dateInput === 'number') {
    // Unix timestamp from new API
    date = new Date(dateInput);
  } else {
    // ISO string from old API
    date = new Date(dateInput);
  }
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Get duration string
// Handles both pre-formatted string (new API) and calculated duration (backwards compatibility)
export function formatDuration(space: Space): string;
export function formatDuration(startedAt: string, endedAt: string | null): string;
export function formatDuration(spaceOrStartedAt: Space | string, endedAt?: string | null): string {
  // If first argument is a Space object with length field
  if (typeof spaceOrStartedAt === 'object' && 'length' in spaceOrStartedAt) {
    return spaceOrStartedAt.length || 'Unknown';
  }
  
  // Backwards compatibility: calculate duration from timestamps
  if (typeof spaceOrStartedAt === 'string') {
    if (!endedAt) return 'Unknown';
    
    const start = new Date(spaceOrStartedAt);
    const end = new Date(endedAt);
    const durationMs = end.getTime() - start.getTime();
    
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }
  
  return 'Unknown';
}

// Calculate total listeners
// Handles both single listeners field (new API) and separate fields (backwards compatibility)
export function getTotalListeners(space: Space): number {
  // New API structure
  if (space.listeners !== undefined) {
    return space.listeners;
  }
  
  // Backwards compatibility
  return (space.total_live_listeners || 0) + (space.total_replay_watched || 0);
}

// Get speaker count
export function getSpeakerCount(space: Space): number {
  return space.participants?.speakers?.length || 0;
}

// Get first admin/host display name
export function getHost(space: Space): string | null {
  const admin = space.participants?.admins?.[0];
  if (!admin) return null;
  return admin.display_name || admin.twitter_screen_name || null;
}

// Get all admins for host display
export function getAllHosts(space: Space): string[] {
  const admins = space.participants?.admins || [];
  return admins.map(admin => admin.display_name || admin.twitter_screen_name || 'Unknown');
}

// Format all hosts as a comma-separated string
export function formatHosts(space: Space): string | null {
  const hosts = getAllHosts(space);
  if (hosts.length === 0) return null;
  return hosts.join(', ');
}

// Get admin details for avatar display
export function getAdminDetails(space: Space) {
  return space.participants?.admins || [];
}

// Get speaker details for avatar display
export function getSpeakerDetails(space: Space) {
  return space.participants?.speakers || [];
}

// Format speakers list for display
export function formatSpeakers(space: Space, maxDisplay: number = 3): string {
  const speakers = space.participants?.speakers || [];
  if (speakers.length === 0) return 'No speakers';
  
  const speakerNames = speakers.map(s => s.display_name || s.twitter_screen_name || 'Unknown');
  
  if (speakerNames.length <= maxDisplay) {
    return speakerNames.join(', ');
  }
  
  const displayed = speakerNames.slice(0, maxDisplay);
  const remaining = speakerNames.length - maxDisplay;
  return `${displayed.join(', ')}, +${remaining} more`;
}

// Format milliseconds to timestamp (HH:MM:SS or MM:SS)
export function formatTimestamp(ms?: number): string {
  if (!ms && ms !== 0) return '';
  
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Format timeline entry time range
export function formatTimeRange(startMs?: number, endMs?: number): string {
  const start = formatTimestamp(startMs);
  const end = formatTimestamp(endMs);
  
  if (start && end) {
    return `${start} - ${end}`;
  }
  if (start) {
    return start;
  }
  return '';
}
