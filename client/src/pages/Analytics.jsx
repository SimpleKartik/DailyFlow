import { useState, useEffect } from 'react';
import { subDays, eachDayOfInterval, format, isSameDay, startOfWeek, isAfter, isBefore } from 'date-fns';
import { Award, CalendarDays, Activity, Flame, X } from 'lucide-react';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import Modal from '../components/ui/Modal';
import api from '../services/api';
import { cn } from '../utils/cn';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activities, setActivities] = useState([]);
  const [logs, setLogs] = useState([]);
  
  // Heatmap interaction state
  const [selectedDay, setSelectedDay] = useState(null);
  const [tooltipInfo, setTooltipInfo] = useState(null);

  const today = new Date();
  const startDate = subDays(today, 364);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch all activities to know the total count per day (assuming current count applies historically)
        const [activitiesRes, logsRes] = await Promise.all([
          api.get('/activities'),
          api.get(`/logs?startDate=${startDate.toISOString()}&endDate=${today.toISOString()}`)
        ]);
        
        setActivities(activitiesRes.data);
        setLogs(logsRes.data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Unable to connect to the backend to fetch analytics data. Please ensure the database is running.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Process data for the heatmap
  const totalActivitiesCount = activities.length;
  
  const days = eachDayOfInterval({ start: startDate, end: today });
  
  // Map day string (yyyy-MM-dd) to stats
  const dayStatsMap = {};
  days.forEach(day => {
    const dateStr = format(day, 'yyyy-MM-dd');
    dayStatsMap[dateStr] = {
      date: day,
      completedCount: 0,
      totalCount: totalActivitiesCount,
      percentage: 0,
      logs: []
    };
  });

  logs.forEach(log => {
    const dateStr = format(new Date(log.date), 'yyyy-MM-dd');
    if (dayStatsMap[dateStr] && log.completed) {
      dayStatsMap[dateStr].completedCount += 1;
      dayStatsMap[dateStr].logs.push(log);
    }
  });

  // Calculate percentages
  Object.values(dayStatsMap).forEach(stat => {
    stat.percentage = stat.totalCount === 0 ? 0 : Math.round((stat.completedCount / stat.totalCount) * 100);
  });

  // Calculate summary stats
  let totalActiveDays = 0;
  let currentStreak = 0;
  let longestStreak = 0;
  let currentTempStreak = 0;
  let totalPercentageSum = 0;
  
  // Loop from oldest to newest to calculate streaks and totals
  days.forEach(day => {
    const stat = dayStatsMap[format(day, 'yyyy-MM-dd')];
    totalPercentageSum += stat.percentage;
    
    if (stat.completedCount > 0) {
      totalActiveDays++;
      currentTempStreak++;
      if (currentTempStreak > longestStreak) {
        longestStreak = currentTempStreak;
      }
    } else {
      currentTempStreak = 0;
    }
  });
  
  // Current streak is just currentTempStreak since we iterated up to today
  // If today is 0 but yesterday was >0, usually current streak is still kept alive until end of today.
  // For strictness, let's just use currentTempStreak.
  currentStreak = currentTempStreak;

  const averageCompletion = days.length === 0 ? 0 : Math.round(totalPercentageSum / days.length);

  // Heatmap rendering logic
  // Pad the beginning so the first day aligns with its day of the week (0 = Sunday, 6 = Saturday)
  const paddingDays = startDate.getDay();
  const paddedCells = Array.from({ length: paddingDays }).fill(null);
  
  const getIntensityClass = (percentage) => {
    if (percentage === 0) return 'bg-slate-100 dark:bg-slate-800';
    if (percentage < 33) return 'bg-emerald-200 dark:bg-emerald-900/60';
    if (percentage < 66) return 'bg-emerald-400 dark:bg-emerald-700';
    if (percentage < 100) return 'bg-emerald-500 dark:bg-emerald-500';
    return 'bg-emerald-600 dark:bg-emerald-400'; // 100%
  };

  const handleMouseEnter = (e, stat) => {
    const rect = e.target.getBoundingClientRect();
    setTooltipInfo({
      stat,
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Your 365-day activity history and performance</p>
      </div>

      {error ? (
        <Card className="p-8 text-center bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30">
          <Activity className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-800 dark:text-red-400 mb-2">Connection Error</h3>
          <p className="text-red-600 dark:text-red-300">{error}</p>
        </Card>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard 
              title="Active Days" 
              value={totalActiveDays} 
              subtitle="Out of 365 days"
              icon={<CalendarDays size={20} />}
            />
            <StatCard 
              title="Current Streak" 
              value={`${currentStreak} Days`} 
              icon={<Flame size={20} />}
              iconClassName="bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400"
            />
            <StatCard 
              title="Longest Streak" 
              value={`${longestStreak} Days`} 
              icon={<Award size={20} />}
              iconClassName="bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
            />
            <StatCard 
              title="Avg. Completion" 
              value={`${averageCompletion}%`} 
              subtitle="Daily average"
              icon={<Activity size={20} />}
              iconClassName="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
            />
          </div>

          {/* GitHub-style Heatmap */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Activity Heatmap</h3>
            
            <div className="overflow-x-auto pb-4">
              <div className="min-w-[800px]">
                <div className="flex gap-2">
                  {/* Y-axis Labels (Days of week) */}
                  <div className="grid grid-rows-7 gap-[4px] text-xs text-slate-400 mr-2 text-right pr-1" style={{ width: '30px' }}>
                    <div className="flex items-center justify-end"></div>
                    <div className="flex items-center justify-end">Mon</div>
                    <div className="flex items-center justify-end"></div>
                    <div className="flex items-center justify-end">Wed</div>
                    <div className="flex items-center justify-end"></div>
                    <div className="flex items-center justify-end">Fri</div>
                    <div className="flex items-center justify-end"></div>
                  </div>

                  {/* Grid */}
                  <div 
                    className="grid grid-rows-7 gap-[4px] flex-1" 
                    style={{ gridAutoFlow: 'column' }}
                    onMouseLeave={() => setTooltipInfo(null)}
                  >
                    {paddedCells.map((_, i) => (
                      <div key={`pad-${i}`} className="w-[12px] h-[12px] rounded-sm bg-transparent" />
                    ))}
                    
                    {days.map(day => {
                      const dateStr = format(day, 'yyyy-MM-dd');
                      const stat = dayStatsMap[dateStr];
                      
                      return (
                        <div 
                          key={dateStr}
                          className={cn(
                            "w-[12px] h-[12px] rounded-sm cursor-pointer transition-transform hover:scale-125 hover:ring-1 hover:ring-slate-400 hover:z-10",
                            getIntensityClass(stat.percentage)
                          )}
                          onMouseEnter={(e) => handleMouseEnter(e, stat)}
                          onClick={() => setSelectedDay(stat)}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center justify-end text-xs text-slate-500 dark:text-slate-400">
              <span className="mr-2">Less</span>
              <div className="flex gap-[4px]">
                <div className="w-[12px] h-[12px] rounded-sm bg-slate-100 dark:bg-slate-800"></div>
                <div className="w-[12px] h-[12px] rounded-sm bg-emerald-200 dark:bg-emerald-900/60"></div>
                <div className="w-[12px] h-[12px] rounded-sm bg-emerald-400 dark:bg-emerald-700"></div>
                <div className="w-[12px] h-[12px] rounded-sm bg-emerald-500 dark:bg-emerald-500"></div>
                <div className="w-[12px] h-[12px] rounded-sm bg-emerald-600 dark:bg-emerald-400"></div>
              </div>
              <span className="ml-2">More</span>
            </div>
          </Card>

          {/* Custom Tooltip */}
          {tooltipInfo && (
            <div 
              className="fixed z-[100] pointer-events-none transform -translate-x-1/2 -translate-y-full bg-slate-900 text-white text-xs rounded py-1.5 px-3 shadow-lg whitespace-nowrap"
              style={{ top: tooltipInfo.y, left: tooltipInfo.x }}
            >
              <p className="font-semibold mb-0.5">{format(tooltipInfo.stat.date, 'MMM do, yyyy')}</p>
              <p className="text-slate-300">
                {tooltipInfo.stat.completedCount} of {tooltipInfo.stat.totalCount} completed ({tooltipInfo.stat.percentage}%)
              </p>
              {/* Tooltip Arrow */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-[1px] border-4 border-transparent border-t-slate-900" />
            </div>
          )}
        </>
      )}

      {/* Day Details Modal */}
      <Modal 
        isOpen={!!selectedDay} 
        onClose={() => setSelectedDay(null)}
        title={selectedDay ? format(selectedDay.date, 'EEEE, MMMM do, yyyy') : ''}
      >
        {selectedDay && (
          <div>
            <div className="flex justify-between items-center mb-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Completion</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{selectedDay.percentage}%</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500 dark:text-slate-400">Activities</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {selectedDay.completedCount} <span className="text-lg text-slate-400 font-medium">/ {selectedDay.totalCount}</span>
                </p>
              </div>
            </div>

            <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Completed Activities</h4>
            
            {selectedDay.completedCount === 0 ? (
              <p className="text-slate-500 italic">No activities completed on this day.</p>
            ) : (
              <ul className="space-y-3">
                {selectedDay.logs.map((log) => {
                  const activity = activities.find(a => a._id === log.activityId);
                  return (
                    <li key={log._id || log.activityId} className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-700 rounded-lg">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-3"
                          style={{ backgroundColor: activity?.color || '#10B981' }}
                        />
                        <span className="font-medium text-slate-900 dark:text-white">
                          {activity ? activity.name : 'Unknown Activity'}
                        </span>
                      </div>
                      <span className="text-sm text-slate-500">
                        {log.value} {activity?.unit}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Analytics;
