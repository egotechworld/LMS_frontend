import { useState } from 'react';
import { X } from 'lucide-react';
import { quizService } from '@/services/quizService';

const CreateQuizModal = ({ courseId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    passing_score: 80,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await quizService.createQuiz({
        course_id: courseId,
        ...formData
      });
      onSuccess();
    } catch (error) {
      console.error(error);
      alert('Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[hsl(224,44%,14%)] text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl transition-colors duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">New Quiz</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Quiz Title</label>
            <input 
              required
              className="w-full px-3 py-2 border border-slate-300 dark:border-white/10 rounded-lg bg-transparent outline-none focus:border-blue-500"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Description</label>
            <textarea 
              className="w-full px-3 py-2 border border-slate-300 dark:border-white/10 rounded-lg bg-transparent outline-none focus:border-blue-500"
              rows={3}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Passing Score (%)</label>
            <input 
              required
              type="number"
              min="0"
              max="100"
              className="w-full px-3 py-2 border border-slate-300 dark:border-white/10 rounded-lg bg-transparent outline-none focus:border-blue-500"
              value={formData.passing_score}
              onChange={e => setFormData({...formData, passing_score: e.target.value})}
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 font-medium transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors disabled:opacity-50 shadow-md">
              {loading ? 'Saving...' : 'Create Quiz'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateQuizModal;
