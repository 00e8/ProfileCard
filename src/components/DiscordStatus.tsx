import { useEffect, useState } from 'react';
import { AppWindow } from 'lucide-react';

interface LanyardActivity {
  id: string;
  name: string;
  type: number; // 0 = Playing, 2 = Listening, 4 = Custom Status, ...
  state?: string;
  details?: string;
  application_id?: string;
  timestamps?: { start?: number; end?: number };
  assets?: {
    large_image?: string;
    large_text?: string;
    small_image?: string;
    small_text?: string;
  };
}

interface LanyardSpotify {
  song: string;
  artist: string;
  album: string;
  album_art_url: string;
  timestamps: { start: number; end: number };
}

interface LanyardData {
  discord_user: {
    id: string;
    username: string;
    avatar: string;
    global_name: string;
  };
  discord_status: 'online' | 'offline' | 'idle' | 'dnd';
  activities: LanyardActivity[];
  listening_to_spotify: boolean;
  spotify: LanyardSpotify | null;
}

interface DiscordStatusProps {
  userId: string;
}

const statusLabels = {
  online: 'Online',
  offline: 'Offline',
  idle: 'Idle',
  dnd: 'Do Not Disturb',
};

const getActivityAssetUrl = (applicationId?: string, image?: string): string | null => {
  if (!image) return null;
  if (image.startsWith('mp:external/')) {
    return `https://media.discordapp.net/external/${image.replace('mp:external/', '')}`;
  }
  if (image.startsWith('spotify:')) {
    return `https://i.scdn.co/image/${image.replace('spotify:', '')}`;
  }
  if (applicationId) {
    return `https://cdn.discordapp.com/app-assets/${applicationId}/${image}.png`;
  }
  return null;
};

const formatElapsed = (start?: number): string | null => {
  if (!start) return null;
  const totalSeconds = Math.max(0, Math.floor((Date.now() - start) / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const DiscordStatus = ({ userId }: DiscordStatusProps) => {
  const [data, setData] = useState<LanyardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setTick] = useState(0);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(`https://api.lanyard.rest/v1/users/${userId}`);
        const result = await response.json();
        if (result.success) {
          setData(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch Discord status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [userId]);

  // Keep "elapsed" timers ticking smoothly between the 30s refetches.
  useEffect(() => {
    const tick = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(tick);
  }, []);

  if (loading) {
    return (
      <div className="info-panel">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-secondary animate-pulse" />
          <div className="flex flex-col flex-1 gap-1">
            <div className="h-3 w-16 bg-secondary animate-pulse rounded" />
            <div className="h-3 w-12 bg-secondary animate-pulse rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="info-panel">
        <span className="text-xs text-muted-foreground">Unable to load Discord status</span>
      </div>
    );
  }

  const avatarUrl = data.discord_user.avatar
    ? `https://cdn.discordapp.com/avatars/${data.discord_user.id}/${data.discord_user.avatar}.png`
    : `https://cdn.discordapp.com/embed/avatars/0.png`;

  const customStatus = data.activities?.find((a) => a.type === 4);
  const liveActivity = data.activities?.find((a) => a.type !== 4);
  const spotify = data.listening_to_spotify ? data.spotify : null;

  const activityAssetUrl = liveActivity
    ? getActivityAssetUrl(liveActivity.application_id, liveActivity.assets?.large_image)
    : null;
  const elapsed = liveActivity ? formatElapsed(liveActivity.timestamps?.start) : null;

  return (
    <div className="info-panel space-y-2">
      <div className="flex items-center gap-2">
        <div className="relative">
          <img src={avatarUrl} alt="Discord Avatar" className="w-7 h-7 rounded-full" />
          <div
            className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-background status-${data.discord_status}`}
          />
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <a
            href={`https://discord.com/users/${data.discord_user.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-foreground/90 link-underline w-fit"
          >
            {data.discord_user.global_name || data.discord_user.username}
          </a>
          <span className="text-xs text-muted-foreground truncate">
            {customStatus?.state || statusLabels[data.discord_status]}
          </span>
        </div>
      </div>

      {spotify && (
        <div className="flex items-center gap-2 pt-2 border-t border-white/5">
          <img
            src={spotify.album_art_url}
            alt={spotify.album}
            className="w-8 h-8 rounded object-cover flex-shrink-0"
          />
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-xs text-foreground/90 truncate">{spotify.song}</span>
            <span className="text-[11px] text-muted-foreground truncate">by {spotify.artist}</span>
            <span className="text-[11px] text-muted-foreground/70 truncate">on {spotify.album}</span>
          </div>
        </div>
      )}

      {!spotify && liveActivity && (
        <div className="flex items-center gap-2 pt-2 border-t border-white/5">
          {activityAssetUrl ? (
            <img
              src={activityAssetUrl}
              alt={liveActivity.name}
              className="w-8 h-8 rounded object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center flex-shrink-0">
              <AppWindow className="w-4 h-4 text-muted-foreground" />
            </div>
          )}
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-xs text-foreground/90 truncate">{liveActivity.name}</span>
            {liveActivity.details && (
              <span className="text-[11px] text-muted-foreground truncate">{liveActivity.details}</span>
            )}
            {liveActivity.state && (
              <span className="text-[11px] text-muted-foreground truncate">{liveActivity.state}</span>
            )}
            {elapsed && (
              <span className="text-[11px] text-muted-foreground/70">{elapsed} elapsed</span>
            )}
          </div>
        </div>
      )}

      {!spotify && !liveActivity && (
        <div className="text-[11px] text-muted-foreground/70 pt-1 border-t border-white/5">
          Not doing anything right now
        </div>
      )}
    </div>
  );
};

export default DiscordStatus;
