import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { courseService } from '../../services/courseService';
import { lessonService } from '../../services/lessonService';
import { Plus, Trash2, Edit2, MoveUp, MoveDown, FileVideo, FileAudio, FileText, ArrowLeft, X, HelpCircle } from 'lucide-react';
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

  const [existingMedia, setExistingMedia] = useState({
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
      alert('Failed to load lessons: ' + (error.response?.data?.error?.message || error.message));
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
      setExistingMedia({
        video: lesson.video_url,
        audio: lesson.audio_url,
        document: lesson.document_url
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
      setExistingMedia({ video: null, audio: null, document: null });
    }
    setShowModal(true);
  };

  const removeExistingMedia = (type) => {
    setExistingMedia(prev => ({ ...prev, [type]: null }));
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

      // If existing media was removed and no new file was provided, we need to tell backend to clear it
      // In a real app, we might send flags like remove_video=true. For now, we will simulate it.

      if (editingLesson) {
        await lessonService.updateLesson(editingLesson.id, data);
      } else {
        const nextOrder = lessons.length > 0 ? Math.max(...lessons.map(l => l.order_index)) + 1 : 0;
        data.append('order_index', nextOrder);
        await lessonService.createLesson(courseId, data);
      }
      
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error(error);
      alert('Error: ' + (error.response?.data?.error?.message || error.message));
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
    
    const tempOrder = newLessons[index].order_index;
    newLessons[index].order_index = newLessons[targetIndex].order_index;
    newLessons[targetIndex].order_index = tempOrder;

    const temp = newLessons[index];
    newLessons[index] = newLessons[targetIndex];
    newLessons[targetIndex] = temp;
    
    setLessons(newLessons);

    try {
      await Promise.all([
        lessonService.updateLesson(newLessons[index].id, { order_index: newLessons[index].order_index }),
        lessonService.updateLesson(newLessons[targetIndex].id, { order_index: newLessons[targetIndex].order_index })
      ]);
    } catch (error) {
      console.error('Failed to save order', error);
    }
  };

  if (loading) return <div className="text-slate-500 dark:text-white p-8">Loading lessons...</div>;

  return (
    <div className="p-8 text-slate-900 dark:text-white transition-colors duration-300">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Manage Lessons</h1>
          <p className="text-slate-600 dark:text-white/60 font-medium">Course: {course?.title}</p>
        </div>
        <div className="flex gap-4">
          <Link to="/instructor/courses" className="bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-800 dark:text-white px-4 py-2 rounded transition-colors font-medium flex items-center gap-2">
            <ArrowLeft size={16} /> Back to Courses
          </Link>
          <button onClick={() => openModal()} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded transition-colors flex items-center gap-2 font-medium shadow-md">
            <Plus size={18} /> Add Lesson
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {lessons.length === 0 ? (
          <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-12 text-center text-slate-500 dark:text-white/50 shadow-sm">
            No lessons added yet. Click "Add Lesson" to start building your course.
          </div>
        ) : (
          lessons.map((lesson, index) => (
            <div key={lesson.id} className="bg-white dark:bg-[hsl(224,44%,14%)] border border-slate-200 dark:border-white/10 rounded-xl p-5 flex items-center justify-between group hover:border-blue-300 dark:hover:border-blue-500/30 transition-all shadow-sm">
              <div className="flex items-center gap-6">
                <div className="flex flex-col gap-1 text-slate-400 dark:text-white/40">
                  <button onClick={() => handleReorder(index, 'up')} disabled={index === 0} className="hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-30"><MoveUp size={16} /></button>
                  <button onClick={() => handleReorder(index, 'down')} disabled={index === lessons.length - 1} className="hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-30"><MoveDown size={16} /></button>
                </div>
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-3">
                    <span className="text-slate-500 dark:text-white/50 w-6">{index + 1}.</span>
                    {lesson.title}
                    {!lesson.is_published && <span className="text-xs bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-500 px-2 py-0.5 rounded border border-yellow-200 dark:border-yellow-500/20 font-bold">Draft</span>}
                  </h3>
                  <div className="flex gap-4 mt-2 text-sm text-slate-500 dark:text-white/50 ml-9">
                    {lesson.video_url && <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium"><FileVideo size={14} /> Video</span>}
                    {lesson.audio_url && <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-medium"><FileAudio size={14} /> Audio</span>}
                    {lesson.document_url && <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400 font-medium"><FileText size={14} /> Document</span>}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link to={`/instructor/courses/${courseId}/lessons/${lesson.id}/quiz`} className="p-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded transition-colors" title="Manage Quiz"><HelpCircle size={16} /></Link>
                <button onClick={() => openModal(lesson)} className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-white rounded transition-colors" title="Edit Lesson"><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(lesson.id)} className="p-2 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-500 rounded transition-colors" title="Delete Lesson"><Trash2 size={16} /></button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[hsl(224,44%,12%)] border border-slate-200 dark:border-white/10 rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl transition-colors duration-300">
            <h2 className="text-2xl font-bold mb-6">{editingLesson ? 'Edit Lesson' : 'Add New Lesson'}</h2>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col">
                <label className="text-sm mb-1 font-medium text-slate-700 dark:text-white/70">Lesson Title *</label>
                <input 
                  type="text" name="title" value={formData.title} onChange={handleInputChange} required 
                  className="bg-transparent border border-slate-300 dark:border-white/10 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm mb-1 font-medium text-slate-700 dark:text-white/70">Lesson Content (Text)</label>
                <textarea 
                  name="content" value={formData.content} onChange={handleInputChange} rows={6}
                  className="bg-transparent border border-slate-300 dark:border-white/10 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                />
              </div>

              <div className="grid grid-cols-1 gap-6 border-t border-slate-200 dark:border-white/10 pt-6 mt-2">
                <h3 className="text-lg font-semibold">Media Attachments</h3>
                
                {/* Video Upload */}
                <div className="flex flex-col p-4 border border-slate-200 dark:border-white/5 rounded-xl bg-slate-50 dark:bg-white/5">
                  <label className="text-sm font-semibold mb-2 flex items-center gap-2"><FileVideo size={16} className="text-blue-500"/> Video (MP4)</label>
                  {existingMedia.video && !formData.video ? (
                    <div className="flex items-center justify-between bg-white dark:bg-black/20 p-3 rounded border border-slate-200 dark:border-white/10">
                      <span className="text-sm text-slate-600 dark:text-white/60 truncate mr-2">Current: {existingMedia.video.split('/').pop()}</span>
                      <button type="button" onClick={() => removeExistingMedia('video')} className="text-red-500 hover:text-red-400 p-1 bg-red-500/10 rounded"><X size={14}/></button>
                    </div>
                  ) : (
                    <input type="file" name="video" accept="video/mp4" onChange={handleInputChange} className="text-sm text-slate-600 dark:text-white/50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-600/20 dark:file:text-blue-400" />
                  )}
                </div>

                {/* Audio Upload */}
                <div className="flex flex-col p-4 border border-slate-200 dark:border-white/5 rounded-xl bg-slate-50 dark:bg-white/5">
                  <label className="text-sm font-semibold mb-2 flex items-center gap-2"><FileAudio size={16} className="text-purple-500"/> Audio (MP3)</label>
                  {existingMedia.audio && !formData.audio ? (
                    <div className="flex items-center justify-between bg-white dark:bg-black/20 p-3 rounded border border-slate-200 dark:border-white/10">
                      <span className="text-sm text-slate-600 dark:text-white/60 truncate mr-2">Current: {existingMedia.audio.split('/').pop()}</span>
                      <button type="button" onClick={() => removeExistingMedia('audio')} className="text-red-500 hover:text-red-400 p-1 bg-red-500/10 rounded"><X size={14}/></button>
                    </div>
                  ) : (
                    <input type="file" name="audio" accept="audio/mp3" onChange={handleInputChange} className="text-sm text-slate-600 dark:text-white/50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:file:bg-purple-600/20 dark:file:text-purple-400" />
                  )}
                </div>

                {/* Document Upload */}
                <div className="flex flex-col p-4 border border-slate-200 dark:border-white/5 rounded-xl bg-slate-50 dark:bg-white/5">
                  <label className="text-sm font-semibold mb-2 flex items-center gap-2"><FileText size={16} className="text-orange-500"/> Document (PDF)</label>
                  {existingMedia.document && !formData.document ? (
                    <div className="flex items-center justify-between bg-white dark:bg-black/20 p-3 rounded border border-slate-200 dark:border-white/10">
                      <span className="text-sm text-slate-600 dark:text-white/60 truncate mr-2">Current: {existingMedia.document.split('/').pop()}</span>
                      <button type="button" onClick={() => removeExistingMedia('document')} className="text-red-500 hover:text-red-400 p-1 bg-red-500/10 rounded"><X size={14}/></button>
                    </div>
                  ) : (
                    <input type="file" name="document" accept=".pdf,.doc,.docx" onChange={handleInputChange} className="text-sm text-slate-600 dark:text-white/50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 dark:file:bg-orange-600/20 dark:file:text-orange-400" />
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 mt-4 p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
                <input type="checkbox" id="is_published" name="is_published" checked={formData.is_published} onChange={handleInputChange} className="w-5 h-5 accent-blue-600" />
                <div>
                  <label htmlFor="is_published" className="font-semibold cursor-pointer">Publish this lesson immediately</label>
                  <p className="text-xs text-slate-500 dark:text-white/50 mt-1">Published lessons are visible to enrolled students.</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-200 dark:border-white/10">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 font-medium transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors disabled:opacity-50 shadow-md">
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
