import { Badge } from '@/components/ui/badge';

const STATUS_VARIANT = {
  graded:        'success',
  submitted:     'info',
  not_submitted: 'warning',
  late:          'late',
  pending:       'warning',
  active:        'success',
  draft:         'secondary',
};

const STATUS_LABEL = {
  graded:        'Graded',
  submitted:     'Submitted',
  not_submitted: 'Not Submitted',
  late:          'Late',
  pending:       'Pending',
  active:        'Active',
  draft:         'Draft',
};

const StatusBadge = ({ status, label }) => {
  const key     = (status || '').toLowerCase().replace(' ', '_');
  const variant = STATUS_VARIANT[key] || 'secondary';
  const text    = label || STATUS_LABEL[key] || status;

  return <Badge variant={variant}>{text}</Badge>;
};

export default StatusBadge;
