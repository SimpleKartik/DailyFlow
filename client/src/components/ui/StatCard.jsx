import Card from './Card';
import { cn } from '../../utils/cn';

const StatCard = ({ title, value, subtitle, icon, iconClassName, className }) => {
  return (
    <Card className={cn("p-6", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{value}</h3>
          {subtitle && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className={cn("p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400", iconClassName)}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatCard;
