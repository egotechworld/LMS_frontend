import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { quizService } from '../../services/quizService';
import { lessonService } from '../../services/lessonService';
import { Plus, Trash2, ArrowLeft, Save, HelpCircle, CheckCircle2 } from 'lucide-react';
import './Courses.css';

const ManageQuiz = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [quizForm, setQuizForm] = useState({
    title: '',
    time_limit_minutes: 0,
    allow_retake: true
  });

  const [questionForm, setQuestionForm] = useState({
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctOption: 'a',
    marks: 1
  });

  const [showQuestionModal, setShowQuestionModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, [lessonId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch lesson details to show what we are attaching to
      const allLessons = await lessonService.getCourseLessons(courseId);
      const currentLesson = allLessons.data.find(l => l.id === parseInt(lessonId));
      setLesson(currentLesson);

      // Check if quiz exists for this lesson
      try {
        const quizRes = await quizService.getQuizByLesson(lessonId);
        if (quizRes.data) {
          setQuiz(quizRes.data);
          setQuizForm({
            title: quizRes.data.title,
            time_limit_minutes: quizRes.data.time_limit_minutes || 0,
            allow_retake: quizRes.data.allow_retake
          });
          
          // Fetch questions
          const questionsRes = await quizService.getQuestionsForInstructor(quizRes.data.id);
          setQuestions(questionsRes.data || []);
        }
      } catch (err) {
        // 404 means no quiz yet, which is fine
        if (err.response?.status !== 404) {
          throw err;
        }
      }
    } catch (error) {
      console.error('Failed to load quiz data', error);
      alert('Failed to load quiz: ' + (error.response?.data?.error?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleQuizSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (quiz) {
        await quizService.updateQuiz(quiz.id, quizForm);
        alert('Quiz settings updated successfully!');
      } else {
        const res = await quizService.createQuiz({
          ...quizForm,
          courseId: parseInt(courseId),
          lessonId: parseInt(lessonId)
        });
        setQuiz(res.data);
        alert('Quiz created! Now you can add questions.');
      }
    } catch (error) {
      alert('Error saving quiz: ' + (error.response?.data?.error?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    if (!quiz) return alert('Please save the quiz settings first!');
    
    setSaving(true);
    try {
      await quizService.addQuestion(quiz.id, questionForm);
      setQuestionForm({
        questionText: '',
        optionA: '', optionB: '', optionC: '', optionD: '',
        correctOption: 'a', marks: 1
      });
      setShowQuestionModal(false);
      // Refresh questions
      const questionsRes = await quizService.getQuestionsForInstructor(quiz.id);
      setQuestions(questionsRes.data || []);
    } catch (error) {
      alert('Error adding question: ' + (error.response?.data?.error?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await quizService.deleteQuestion(questionId);
        const questionsRes = await quizService.getQuestionsForInstructor(quiz.id);
        setQuestions(questionsRes.data || []);
      } catch (error) {
        alert('Failed to delete question');
      }
    }
  };

  if (loading) return <div className="p-8 text-slate-500">Loading quiz settings...</div>;

  return (
    <div className="p-8 text-slate-900 dark:text-white transition-colors duration-300">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Manage Quiz</h1>
          <p className="text-slate-600 dark:text-white/60 font-medium">Lesson: {lesson?.title}</p>
        </div>
        <div className="flex gap-4">
          <Link to={`/instructor/courses/${courseId}/lessons`} className="bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-800 dark:text-white px-4 py-2 rounded transition-colors font-medium flex items-center gap-2">
            <ArrowLeft size={16} /> Back to Lessons
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quiz Settings Form */}
        <div className="lg:col-span-1 bg-white dark:bg-[hsl(224,44%,14%)] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm h-fit">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><HelpCircle className="text-blue-500" /> Quiz Settings</h2>
          <form onSubmit={handleQuizSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Quiz Title *</label>
              <input 
                type="text" required 
                value={quizForm.title} onChange={e => setQuizForm({...quizForm, title: e.target.value})}
                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="e.g. End of Chapter Quiz"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-1">Time Limit (minutes)</label>
              <input 
                type="number" min="0" 
                value={quizForm.time_limit_minutes} onChange={e => setQuizForm({...quizForm, time_limit_minutes: parseInt(e.target.value)})}
                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <p className="text-xs text-slate-500 mt-1">Set 0 for no time limit.</p>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <input 
                type="checkbox" id="allow_retake" 
                checked={quizForm.allow_retake} onChange={e => setQuizForm({...quizForm, allow_retake: e.target.checked})}
                className="w-4 h-4 accent-blue-600"
              />
              <label htmlFor="allow_retake" className="text-sm font-semibold cursor-pointer">Allow Students to Retake</label>
            </div>

            <button type="submit" disabled={saving} className="mt-4 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-md">
              <Save size={18} /> {quiz ? 'Update Quiz Settings' : 'Create Quiz'}
            </button>
          </form>
        </div>

        {/* Questions List */}
        <div className="lg:col-span-2">
          {!quiz ? (
            <div className="bg-slate-100 dark:bg-white/5 rounded-2xl p-12 text-center border border-slate-200 dark:border-white/10 flex flex-col items-center justify-center">
              <HelpCircle size={48} className="text-slate-300 dark:text-white/20 mb-4" />
              <h3 className="text-xl font-bold text-slate-700 dark:text-white/70 mb-2">No Quiz Created Yet</h3>
              <p className="text-slate-500 dark:text-white/50">Save the quiz settings on the left to start adding questions.</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-[hsl(224,44%,14%)] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Questions ({questions.length})</h2>
                <button onClick={() => setShowQuestionModal(true)} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors shadow-sm">
                  <Plus size={16} /> Add Question
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {questions.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">No questions added yet.</p>
                ) : (
                  questions.map((q, idx) => (
                    <div key={q.id} className="border border-slate-200 dark:border-white/10 rounded-xl p-5 bg-slate-50 dark:bg-white/5">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-bold text-lg"><span className="text-slate-400 mr-2">Q{idx + 1}.</span> {q.question_text}</h4>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 px-2 py-1 rounded">{q.marks} Mark(s)</span>
                          <button onClick={() => handleDeleteQuestion(q.id)} className="text-red-500 hover:text-red-600 p-1 bg-red-50 dark:bg-red-500/10 rounded"><Trash2 size={16} /></button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {['a', 'b', 'c', 'd'].map(opt => (
                          <div key={opt} className={`p-3 rounded-lg border text-sm flex items-center gap-3 ${q.correct_option === opt ? 'border-green-500 bg-green-50 dark:bg-green-500/10 text-green-800 dark:text-green-400 font-medium' : 'border-slate-200 dark:border-white/10'}`}>
                            <span className="uppercase font-bold w-6 h-6 flex items-center justify-center rounded-full bg-white dark:bg-black/20 text-xs shadow-sm">{opt}</span>
                            {q[`option_${opt}`]}
                            {q.correct_option === opt && <CheckCircle2 size={16} className="ml-auto" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Question Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[hsl(224,44%,12%)] border border-slate-200 dark:border-white/10 rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl transition-colors duration-300">
            <h2 className="text-2xl font-bold mb-6">Add Multiple Choice Question</h2>
            
            <form onSubmit={handleQuestionSubmit} className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-semibold mb-1">Question Text *</label>
                <textarea 
                  required rows={3}
                  value={questionForm.questionText} onChange={e => setQuestionForm({...questionForm, questionText: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['A', 'B', 'C', 'D'].map(opt => (
                  <div key={opt}>
                    <label className="block text-sm font-semibold mb-1">Option {opt} *</label>
                    <input 
                      type="text" required 
                      value={questionForm[`option${opt}`]} onChange={e => setQuestionForm({...questionForm, [`option${opt}`]: e.target.value})}
                      className={`w-full bg-slate-50 dark:bg-black/20 border rounded-lg p-2.5 outline-none focus:ring-1 ${questionForm.correctOption === opt.toLowerCase() ? 'border-green-500 focus:ring-green-500 focus:border-green-500' : 'border-slate-200 dark:border-white/10 focus:border-blue-500 focus:ring-blue-500'}`}
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-6 mt-2 pt-6 border-t border-slate-200 dark:border-white/10">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-green-600 dark:text-green-400">Correct Option *</label>
                  <select 
                    value={questionForm.correctOption} onChange={e => setQuestionForm({...questionForm, correctOption: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-black/20 border border-green-500 rounded-lg p-2.5 outline-none font-bold text-green-700 dark:text-green-400"
                  >
                    <option value="a">Option A</option>
                    <option value="b">Option B</option>
                    <option value="c">Option C</option>
                    <option value="d">Option D</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Marks for this question</label>
                  <input 
                    type="number" min="1" required 
                    value={questionForm.marks} onChange={e => setQuestionForm({...questionForm, marks: parseInt(e.target.value)})}
                    className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-6 border-t border-slate-200 dark:border-white/10">
                <button type="button" onClick={() => setShowQuestionModal(false)} className="px-6 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 font-medium transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-lg bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold transition-colors disabled:opacity-50 shadow-md">
                  {saving ? 'Adding...' : 'Add Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageQuiz;
