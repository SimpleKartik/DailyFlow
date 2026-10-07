import { cn } from '../../utils/cn';

const ProgressBar = ({ progress, className, barClassName, showLabel = true }) => {
  const safeProgress = Math.min(100, Math.max(0, progress || 0));
  
  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Progress</span>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{Math.round(safeProgress)}%</span>
        </div>
      )}
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
        <div 
          className={cn("bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out", barClassName)}
          style={{ width: `${safeProgress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
