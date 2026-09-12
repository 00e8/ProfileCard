import { Eye } from 'lucide-react';
import { useViewCounter } from '@/hooks/useViewCounter';

const ViewCounter = () => {
  const count = useViewCounter();

  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground" title="Unique views">
      <Eye className="w-3.5 h-3.5" />
      <span>{count !== null ? count.toLocaleString() : '—'}</span>
    </div>
  );
};

export default ViewCounter;
