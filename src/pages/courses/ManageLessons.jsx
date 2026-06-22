import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { courseService } from '../../services/courseService';
import { lessonService } from '../../services/lessonService';
import { Plus, Trash2, Edit2, MoveUp, MoveDown, FileVideo, FileAudio, FileText } from 'lucide-react';
import { getImageUrl } from '../../lib/utils';
import './Courses.css';

const ManageLessons = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    is_published: false,
    video: null,
    audio: null,
    document: null
  });

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [courseRes, lessonsRes] = await Promise.all([
        courseService.getCourseById(courseId),
        lessonService.getCourseLessons(courseId)
      ]);
      setCourse(courseRes.data);
      setLessons(lessonsRes.data || []);
    } catch (error) {
      console.error('Failed to load lessons', error);
      alert('Failed to load lessons');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const openModal = (lesson = null) => {
    if (lesson) {
      setEditingLesson(lesson);
      setFormData({
        title: lesson.title,
        content: lesson.content || '',
        is_published: lesson.is_published,
        video: null,
        audio: null,
        document: null
      });
    } else {
      setEditingLesson(null);
      setFormData({
        title: '',
        content: '',
        is_published: false,
        video: null,
        audio: null,
        document: null
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('content', formData.content);
      data.append('is_published', formData.is_published);
      if (formData.video) data.append('video', formData.video);
      if (formData.audio) data.append('audio', formData.audio);
      if (formData.document) data.append('document', formData.document);

      if (editingLesson) {
        await lessonService.updateLesson(editingLesson.id, data);
      } else {
        // Find highest order index
        const nextOrder = lessons.length > 0 ? Math.max(...lessons.map(l => l.order_index)) + 1 : 0;
        data.append('order_index', nextOrder);
        await lessonService.createLesson(courseId, data);
      }
      
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to save lesson');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this lesson?')) {
      try {
        await lessonService.deleteLesson(id);
        fetchData();
      } catch (error) {
        alert('Failed to delete lesson');
      }
    }
  };

  const handleReorder = async (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === lessons.length - 1) return;

    const newLessons = [...lessons];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap order index
    const tempOrder = newLessons[index].order_index;
    newLessons[index].order_index = newLessons[targetIndex].order_index;
    newLessons[targetIndex].order_index = tempOrder;

    // Swap position in array for instant UI update
    const temp = newLessons[index];
    newLessons[index] = newLessons[targetIndex];
    newLessons[targetIndex] = temp;
    
    setLessons(newLessons);

    // Save to backend
    try {
      await Promise.all([
        lessonService.updateLesson(newLessons[index].id, { order_index: newLessons[index].order_index }),
        lessonService.updateLesson(newLessons[targetIndex].id, { order_index: newLessons[targetIndex].order_index })
      ]);
    } catch (error) {
      console.error('Failed to save order', error);
    }
  };

  if (loading) return <div className="text-white p-8">Loading lessons...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Manage Lessons</h1>
          <p className="text-white/60">Course: {course?.title}</p>
        </div>
        <div className="flex gap-4">
          <Link to="/instructor/courses" className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded transition-colors">
            Back to Courses
          </Link>
          <button onClick={() => openModal()} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded transition-colors flex items-center gap-2">
            <Plus size={18} /> Add Lesson
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {lessons.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-lg p-12 text-center text-white/50">
            No lessons added yet. Click "Add Lesson" to start building your course.
          </div>
        ) : (
          lessons.map((lesson, index) => (
            <div key={lesson.id} className="bg-[hsl(224,44%,14%)] border border-white/10 rounded-lg p-5 flex items-center justify-between group hover:border-blue-500/30 transition-all">
              <div className="flex items-center gap-6">
                <div className="flex flex-col gap-1 text-white/40">
                  <button onClick={() => handleReorder(index, 'up')} disabled={index === 0} className="hover:text-blue-400 disabled:opacity-30"><MoveUp size={16} /></button>
                  <button onClick={() => handleReorder(index, 'down')} disabled={index === lessons.length - 1} className="hover:text-blue-400 disabled:opacity-30"><MoveDown size={16} /></button>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white flex items-center gap-3">
                    {lesson.title}
                    {!lesson.is_published && <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded border border-yellow-500/20">Draft</span>}
                  </h3>
                  <div className="flex gap-4 mt-2 text-sm text-white/50">
                    {lesson.video_url && <span className="flex items-center gap-1 text-blue-400"><FileVideo size={14} /> Video Attached</span>}
                    {lesson.audio_url && <span className="flex items-center gap-1 text-purple-400"><FileAudio size={14} /> Audio Attached</span>}
                    {lesson.document_url && <span className="flex items-center gap-1 text-orange-400"><FileText size={14} /> Document Attached</span>}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openModal(lesson)} className="p-2 bg-white/5 hover:bg-white/10 text-white rounded transition-colors"><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(lesson.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded transition-colors"><Trash2 size={16} /></button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[hsl(224,44%,12%)] border border-white/10 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">{editingLesson ? 'Edit Lesson' : 'Add New Lesson'}</h2>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col">
                <label className="text-sm mb-1 text-white/70">Lesson Title *</label>
                <input 
                  type="text" name="title" value={formData.title} onChange={handleInputChange} required 
                  className="bg-black/20 border border-white/10 rounded p-3 text-white outline-none focus:border-blue-500" 
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm mb-1 text-white/70">Lesson Content (Text)</label>
                <textarea 
                  name="content" value={formData.content} onChange={handleInputChange} rows={6}
                  className="bg-black/20 border border-white/10 rounded p-3 text-white outline-none focus:border-blue-500" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-white/10 pt-4 mt-2">
                <div className="flex flex-col">
                  <label className="text-sm mb-1 text-white/70 flex items-center gap-1"><FileVideo size={14}/> Video (MP4)</label>
                  <input type="file" name="video" accept="video/mp4" onChange={handleInputChange} className="text-xs text-white/50" />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm mb-1 text-white/70 flex items-center gap-1"><FileAudio size={14}/> Audio (MP3)</label>
                  <input type="file" name="audio" accept="audio/mp3" onChange={handleInputChange} className="text-xs text-white/50" />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm mb-1 text-white/70 flex items-center gap-1"><FileText size={14}/> Document (PDF)</label>
                  <input type="file" name="document" accept=".pdf,.doc,.docx" onChange={handleInputChange} className="text-xs text-white/50" />
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2 pt-4 border-t border-white/10">
                <input type="checkbox" id="is_published" name="is_published" checked={formData.is_published} onChange={handleInputChange} className="w-4 h-4" />
                <label htmlFor="is_published" className="text-white">Publish this lesson immediately</label>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded bg-white/5 hover:bg-white/10 text-white transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="px-5 py-2.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Lesson'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageLessons;
