import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import api from '../services/api';
import { cn } from '../utils/cn';

const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMonthLogs = async () => {
      try {
        setLoading(true);
        const start = startOfMonth(currentDate);
        const end = endOfMonth(currentDate);
        const res = await api.get(`/logs?startDate=${start.toISOString()}&endDate=${end.toISOString()}`);
        setLogs(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMonthLogs();
  }, [currentDate]);

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // Get intensity color based on completed logs for a day
  const getDayColor = (day) => {
    const dayLogs = logs.filter(log => isSameDay(new Date(log.date), day) && log.completed);
    if (dayLogs.length === 0) return 'bg-slate-100 dark:bg-slate-800/50';
    if (dayLogs.length === 1) return 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300';
    if (dayLogs.length === 2) return 'bg-emerald-300 dark:bg-emerald-700/60 text-emerald-800 dark:text-emerald-200';
    return 'bg-emerald-500 dark:bg-emerald-500 text-white font-medium';
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Calendar</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Visualize your consistency</p>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
            <CalendarIcon size={20} className="mr-2 text-slate-500" />
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <ChevronLeft size={18} />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setCurrentDate(new Date())}>
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight size={18} />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 sm:gap-4 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-slate-500 dark:text-slate-400 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2 sm:gap-4">
          {/* Pad empty days at start of month */}
          {Array.from({ length: daysInMonth[0].getDay() }).map((_, i) => (
            <div key={`empty-${i}`} className="h-16 sm:h-24 rounded-xl border border-transparent"></div>
          ))}
          
          {daysInMonth.map((day) => {
            const isCurrentMonth = isSameMonth(day, currentDate);
            
            return (
              <div 
                key={day.toString()} 
                className={cn(
                  "h-16 sm:h-24 rounded-xl border transition-all flex flex-col items-center justify-center relative group cursor-pointer",
                  isCurrentMonth ? "border-slate-200 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-600" : "opacity-30",
                  getDayColor(day),
                  isToday(day) && "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900"
                )}
              >
                <span className="text-sm sm:text-lg">{format(day, 'd')}</span>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 flex items-center justify-end text-sm text-slate-500 dark:text-slate-400">
          <span className="mr-3">Less</span>
          <div className="flex gap-1.5">
            <div className="w-4 h-4 rounded-sm bg-slate-100 dark:bg-slate-800/50"></div>
            <div className="w-4 h-4 rounded-sm bg-emerald-100 dark:bg-emerald-900/40"></div>
            <div className="w-4 h-4 rounded-sm bg-emerald-300 dark:bg-emerald-700/60"></div>
            <div className="w-4 h-4 rounded-sm bg-emerald-500 dark:bg-emerald-500"></div>
          </div>
          <span className="ml-3">More</span>
        </div>
      </Card>
    </div>
  );
};

export default CalendarView;
