import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const StatCard = ({ count, label, accent = '#1a1a2e', active = false }) => (
  <Card
    className={cn(
      'flex-1 min-w-0 p-5 cursor-default transition-shadow',
      active ? 'ring-2 ring-primary shadow-md' : 'hover:shadow-md'
    )}
    style={active ? { background: accent, borderColor: accent } : {}}
  >
    <p
      className="text-3xl font-bold leading-none mb-1"
      style={{ color: active ? '#fff' : accent }}
    >
      {count}
    </p>
    <p
      className="text-xs capitalize"
      style={{ color: active ? 'rgba(255,255,255,0.8)' : '#666' }}
    >
      {label}
    </p>
  </Card>
);

export default StatCard;
