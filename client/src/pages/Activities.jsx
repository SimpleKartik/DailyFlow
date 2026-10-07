import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, MoreVertical, ListTodo } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import api from '../services/api';

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'boolean',
    target: 1,
    unit: '',
    color: '#3B82F6'
  });
  const [error, setError] = useState(null);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const res = await api.get('/activities');
      setActivities(res.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Unable to load activities. Please start the backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/activities', formData);
      setIsModalOpen(false);
      setFormData({ name: '', type: 'boolean', target: 1, unit: '', color: '#3B82F6' });
      fetchActivities();
    } catch (err) {
      console.error(err);
      alert('Failed to save activity');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      try {
        await api.delete(`/activities/${id}`);
        fetchActivities();
      } catch (err) {
        console.error(err);
        alert('Failed to delete activity');
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Activities</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your habits and daily tasks</p>
        </div>
        <Button icon={<Plus size={18} />} onClick={() => setIsModalOpen(true)}>
          New Activity
        </Button>
      </div>

      {error && (
        <div className="p-4 mb-6 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 text-sm font-medium flex items-center border border-amber-200 dark:border-amber-800/30">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : activities.length === 0 ? (
        <Card className="p-16 text-center border-dashed border-2 bg-transparent flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
            <ListTodo size={32} />
          </div>
          <h3 className="text-xl font-medium text-slate-900 dark:text-white mb-2">No activities yet</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm">
            You haven't set up any activities to track. Create your first one now.
          </p>
          <Button onClick={() => setIsModalOpen(true)}>Create your first activity</Button>
        </Card>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Target</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {activities.map((activity) => (
                  <tr key={activity._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-3"
                          style={{ backgroundColor: activity.color || '#3B82F6' }}
                        />
                        <span className="font-medium text-slate-900 dark:text-white">{activity.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300">
                        {activity.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {activity.type === 'boolean' ? 'Completion' : `${activity.target} ${activity.unit}`}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button 
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(activity._id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Create New Activity"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Activity Name" 
            placeholder="e.g. Morning Run" 
            required 
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Tracking Type
            </label>
            <select 
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              value={formData.type}
              onChange={e => setFormData({...formData, type: e.target.value})}
            >
              <option value="boolean">Done / Not Done</option>
              <option value="time">Time (Hours/Minutes)</option>
              <option value="quantity">Quantity (Numeric)</option>
            </select>
          </div>

          {formData.type !== 'boolean' && (
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Target Amount" 
                type="number" 
                min="1" 
                required 
                value={formData.target}
                onChange={e => setFormData({...formData, target: Number(e.target.value)})}
              />
              <Input 
                label="Unit (e.g. km, hours)" 
                required 
                value={formData.unit}
                onChange={e => setFormData({...formData, unit: e.target.value})}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Color Label
            </label>
            <div className="flex gap-2">
              {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#64748B'].map(color => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full focus:outline-none transition-transform ${formData.color === color ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData({...formData, color})}
                />
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Save Activity
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Activities;
