import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CheckCircle2, Circle, Flame, Target, Plus, Minus, FileText, Check } from 'lucide-react';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import ProgressBar from '../components/ui/ProgressBar';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import api from '../services/api';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [activities, setActivities] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for tracking local inputs before they are saved
  const [localValues, setLocalValues] = useState({});
  const [localNotes, setLocalNotes] = useState({});

  const today = new Date();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [activitiesRes, logsRes] = await Promise.all([
          api.get('/activities'),
          api.get(`/logs?startDate=${today.toISOString()}&endDate=${today.toISOString()}`)
        ]);
        setActivities(activitiesRes.data);
        
        const fetchedLogs = logsRes.data;
        setLogs(fetchedLogs);
        
        // Initialize local states
        const vals = {};
        const nts = {};
        fetchedLogs.forEach(log => {
          vals[log.activityId] = log.value;
          nts[log.activityId] = log.note || '';
        });
        setLocalValues(vals);
        setLocalNotes(nts);
        
        setError(null);
      } catch (err) {
        console.warn(err);
        setError('Unable to load real data. Displaying UI preview.');
        // For preview purposes, we'll use dummy data if backend is down
        const dummyActivities = [
          { _id: '1', name: 'GATE Study', type: 'time', target: 6, unit: 'hours', color: '#3B82F6' },
          { _id: '2', name: 'Gym', type: 'boolean', target: 1, unit: '', color: '#10B981' },
          { _id: '3', name: 'Water', type: 'quantity', target: 3, unit: 'liters', color: '#0EA5E9' }
        ];
        setActivities(dummyActivities);
        setLogs([
          { activityId: '1', value: 4.5, completed: false, note: 'Finished chapter 3' },
          { activityId: '2', value: 1, completed: true, note: '' }
        ]);
        setLocalValues({ '1': 4.5, '2': 1 });
        setLocalNotes({ '1': 'Finished chapter 3', '2': '' });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const totalActivities = activities.length;
  const completedActivities = logs.filter(log => log.completed).length;
  const completionPercentage = totalActivities === 0 ? 0 : Math.round((completedActivities / totalActivities) * 100);
  const pendingActivities = totalActivities - completedActivities;
  
  const currentStreak = 3; 
  
  const getMotivationalMessage = () => {
    if (totalActivities === 0) return "Add some activities to get started!";
    if (completionPercentage === 0) return "Ready to conquer the day?";
    if (completionPercentage < 50) return "Great start! Keep the momentum going.";
    if (completionPercentage < 100) return "You're doing amazing, almost there!";
    return "Outstanding! You crushed all your goals today!";
  };

  const saveLog = async (activityId, updates) => {
    // Optimistic UI update
    const updatedLogs = [...logs];
    const logIndex = updatedLogs.findIndex(l => l.activityId === activityId);
    
    if (logIndex >= 0) {
      updatedLogs[logIndex] = { ...updatedLogs[logIndex], ...updates };
    } else {
      updatedLogs.push({ activityId, date: today, ...updates });
    }
    setLogs(updatedLogs);

    try {
      await api.post('/logs', {
        activityId,
        date: today,
        ...updates
      });
    } catch (err) {
      console.warn('Failed to save to backend (running in preview mode)');
    }
  };

  const toggleBoolean = (activityId, currentCompleted) => {
    const newCompleted = !currentCompleted;
    saveLog(activityId, { completed: newCompleted, value: newCompleted ? 1 : 0 });
  };

  const handleValueChange = (activityId, newValue, target) => {
    const parsed = parseFloat(newValue) || 0;
    const isCompleted = parsed >= target;
    setLocalValues(prev => ({ ...prev, [activityId]: parsed }));
    saveLog(activityId, { value: parsed, completed: isCompleted });
  };

  const handleNoteBlur = (activityId) => {
    const note = localNotes[activityId] || '';
    saveLog(activityId, { note });
  };

  if (loading) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {error && (
        <div className="p-3 rounded-lg bg-amber-50 text-amber-800 text-sm border border-amber-200">
          {error}
        </div>
      )}

      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <p className="text-blue-600 dark:text-blue-400 font-semibold mb-1 uppercase tracking-wider text-sm">
            {format(today, 'EEEE, MMMM do')}
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
            Command Center
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            {getMotivationalMessage()}
          </p>
        </div>
        
        {/* Large Circular Progress */}
        <div className="relative flex items-center justify-center w-32 h-32 flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" className="text-slate-100 dark:text-slate-800" strokeWidth="8" stroke="currentColor" fill="none" />
            <circle 
              cx="50" cy="50" r="40" 
              className="text-blue-600 dark:text-blue-500 transition-all duration-1000 ease-out" 
              strokeWidth="8" 
              strokeDasharray="251.2" 
              strokeDashoffset={251.2 - (251.2 * completionPercentage) / 100} 
              strokeLinecap="round" 
              stroke="currentColor" 
              fill="none" 
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{completionPercentage}%</span>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Done</span>
          </div>
        </div>
      </section>

      {/* Mini Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Completed</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{completedActivities}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Remaining</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{pendingActivities}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Current Streak</p>
          <div className="flex items-center mt-1">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{currentStreak}</p>
            <Flame size={20} className="text-orange-500 ml-2" />
          </div>
        </div>
        <Link to="/activities" className="bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 p-4 rounded-xl border border-blue-100 dark:border-blue-800 flex items-center justify-center transition-colors group cursor-pointer">
          <span className="font-medium text-blue-600 dark:text-blue-400 flex items-center">
            <Plus size={18} className="mr-2 group-hover:scale-110 transition-transform" />
            Add Task
          </span>
        </Link>
      </div>

      {/* Today's Tasks */}
      <section>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Today's Activities</h2>
        
        <div className="space-y-4">
          {activities.length === 0 ? (
            <Card className="p-8 text-center text-slate-500">
              No activities found. Add some to get started!
            </Card>
          ) : (
            activities.map(activity => {
              const currentLog = logs.find(l => l.activityId === activity._id) || {};
              const isCompleted = currentLog.completed || false;
              const currentValue = localValues[activity._id] || 0;
              const currentNote = localNotes[activity._id] || '';

              return (
                <Card 
                  key={activity._id} 
                  className={`overflow-visible transition-all duration-300 ${isCompleted ? 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-900/10' : ''}`}
                >
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      {/* Left: Completion Toggle */}
                      <button 
                        onClick={() => toggleBoolean(activity._id, isCompleted)}
                        className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                          isCompleted 
                            ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-200 dark:shadow-none' 
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}
                      >
                        {isCompleted ? <Check size={20} strokeWidth={3} /> : null}
                      </button>

                      {/* Right: Activity Details & Inputs */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className={`text-lg font-semibold ${isCompleted ? 'text-slate-700 dark:text-slate-300 line-through decoration-slate-300 dark:decoration-slate-600' : 'text-slate-900 dark:text-white'}`}>
                              {activity.name}
                            </h3>
                            {activity.type !== 'boolean' && (
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                Target: {activity.target} {activity.unit}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Numeric/Time Inputs */}
                        {activity.type !== 'boolean' && (
                          <div className="mb-4">
                            <div className="flex items-center max-w-[200px] mb-2">
                              <button 
                                onClick={() => handleValueChange(activity._id, Math.max(0, currentValue - 0.5), activity.target)}
                                className="p-2 border border-slate-200 dark:border-slate-600 rounded-l-lg bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors"
                              >
                                <Minus size={16} />
                              </button>
                              <input 
                                type="number" 
                                value={currentValue}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setLocalValues(prev => ({ ...prev, [activity._id]: val }));
                                }}
                                onBlur={(e) => handleValueChange(activity._id, e.target.value, activity.target)}
                                className="w-full text-center border-y border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white py-1.5 focus:outline-none"
                                step="0.5"
                              />
                              <button 
                                onClick={() => handleValueChange(activity._id, currentValue + 0.5, activity.target)}
                                className="p-2 border border-slate-200 dark:border-slate-600 rounded-r-lg bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors"
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                            
                            <ProgressBar 
                              progress={(currentValue / activity.target) * 100} 
                              showLabel={false}
                              barClassName={isCompleted ? "bg-emerald-500" : "bg-blue-500"}
                            />
                          </div>
                        )}

                        {/* Notes Input */}
                        <div className="relative mt-3">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FileText size={16} className="text-slate-400" />
                          </div>
                          <input
                            type="text"
                            placeholder="Add a note for today..."
                            value={currentNote}
                            onChange={(e) => setLocalNotes(prev => ({ ...prev, [activity._id]: e.target.value }))}
                            onBlur={() => handleNoteBlur(activity._id)}
                            className="block w-full pl-10 pr-3 py-2 border-none bg-slate-50 dark:bg-slate-900/50 rounded-lg text-sm placeholder-slate-400 focus:ring-1 focus:ring-slate-200 dark:focus:ring-slate-700 dark:text-slate-200 transition-shadow"
                          />
                        </div>

                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
