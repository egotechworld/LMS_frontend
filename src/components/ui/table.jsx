import { cn } from '@/lib/utils';

const Table      = ({ className, ...p }) => <div className="w-full overflow-auto"><table className={cn('w-full caption-bottom text-sm', className)} {...p} /></div>;
const TableHeader = ({ className, ...p }) => <thead className={cn('[&_tr]:border-b', className)} {...p} />;
const TableBody   = ({ className, ...p }) => <tbody className={cn('[&_tr:last-child]:border-0', className)} {...p} />;
const TableRow    = ({ className, ...p }) => <tr className={cn('border-b transition-colors hover:bg-muted/50', className)} {...p} />;
const TableHead   = ({ className, ...p }) => <th className={cn('h-10 px-4 text-left align-middle text-xs font-semibold text-muted-foreground uppercase tracking-wide', className)} {...p} />;
const TableCell   = ({ className, ...p }) => <td className={cn('px-4 py-3 align-middle', className)} {...p} />;

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
