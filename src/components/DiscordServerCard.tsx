import { useEffect, useState } from 'react';
import { ArrowRight, Users } from 'lucide-react';

interface DiscordInviteData {
  guild: {
    id: string;
    name: string;
    icon: string | null;
  };
  approximate_member_count?: number;
  approximate_presence_count?: number;
}

interface DiscordServerCardProps {
  inviteCode: string;
}

const DiscordServerCard = ({ inviteCode }: DiscordServerCardProps) => {
  const [data, setData] = useState<DiscordInviteData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchInvite = async () => {
      try {
        const res = await fetch(
          `https://discord.com/api/v10/invites/${inviteCode}?with_counts=true`
        );
        const json = await res.json();
        if (!cancelled && res.ok) {
          setData(json);
        } else if (!cancelled) {
          console.error('Discord server card: invite lookup failed', json);
        }
      } catch (error) {
        console.error('Discord server card: request failed', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchInvite();
    return () => {
      cancelled = true;
    };
  }, [inviteCode]);

  const inviteUrl = `https://discord.gg/${inviteCode}`;

  if (loading) {
    return (
      <div className="info-panel flex items-center gap-2">
        <div className="w-9 h-9 rounded-full bg-secondary animate-pulse flex-shrink-0" />
        <div className="flex flex-col flex-1 gap-1">
          <div className="h-3 w-20 bg-secondary animate-pulse rounded" />
          <div className="h-3 w-28 bg-secondary animate-pulse rounded" />
        </div>
      </div>
    );
  }

  const iconUrl = data?.guild?.icon
    ? `https://cdn.discordapp.com/icons/${data.guild.id}/${data.guild.icon}.png`
    : null;

  return (
    <div className="info-panel flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        {iconUrl ? (
          <img
            src={iconUrl}
            alt={data?.guild?.name || 'Discord server'}
            className="w-9 h-9 rounded-full flex-shrink-0 object-cover"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
            <Users className="w-4 h-4 text-muted-foreground" />
          </div>
        )}
        <div className="flex flex-col min-w-0">
          <span className="text-xs text-foreground/90 truncate">
            {data?.guild?.name || 'Discord Server'}
          </span>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            {typeof data?.approximate_presence_count === 'number' && (
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full status-online" />
                {data.approximate_presence_count.toLocaleString()} Online
              </span>
            )}
            {typeof data?.approximate_member_count === 'number' && (
              <span>{data.approximate_member_count.toLocaleString()} Members</span>
            )}
          </div>
        </div>
      </div>
      <a
        href={inviteUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs whitespace-nowrap border border-white/10 rounded px-2.5 py-1.5 hover:bg-white/5 transition-colors flex items-center gap-1 flex-shrink-0"
      >
        Join Server <ArrowRight className="w-3 h-3" />
      </a>
    </div>
  );
};

export default DiscordServerCard;
