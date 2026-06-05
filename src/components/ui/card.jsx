import { cn } from '@/lib/utils';

const Card        = ({ className, ...p }) => <div className={cn('rounded-xl border bg-card text-card-foreground shadow-sm', className)} {...p} />;
const CardHeader  = ({ className, ...p }) => <div className={cn('flex flex-col space-y-1.5 p-6', className)} {...p} />;
const CardTitle   = ({ className, ...p }) => <h3 className={cn('text-base font-semibold leading-none tracking-tight', className)} {...p} />;
const CardContent = ({ className, ...p }) => <div className={cn('p-6 pt-0', className)} {...p} />;
const CardFooter  = ({ className, ...p }) => <div className={cn('flex items-center p-6 pt-0', className)} {...p} />;

export { Card, CardHeader, CardTitle, CardContent, CardFooter };
