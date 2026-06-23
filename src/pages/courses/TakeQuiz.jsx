import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { quizService } from '../../services/quizService';
import { CheckCircle2, ArrowLeft, ArrowRight, PlayCircle } from 'lucide-react';
import './Courses.css';

const TakeQuiz = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const [quizData, setQuizData] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // attempt result
  const [result, setResult] = useState(null);

  // current answers form
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    fetchQuiz();
  }, [lessonId]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const res = await quizService.getQuizForStudent(lessonId);
      setQuizData(res.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('No quiz is available for this lesson.');
      } else {
        setError('Failed to load quiz. Make sure you completed the lesson first.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStartAttempt = async () => {
    try {
      const res = await quizService.startAttempt(quizData.quiz.id);
      setAttempt(res.data);
      setAnswers({});
    } catch (err) {
      alert('Could not start quiz: ' + (err.response?.data?.error?.message || err.message));
    }
  };

  const handleOptionSelect = (questionId, optionKey) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionKey
    }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < attempt.questions.length) {
      if (!window.confirm('You have unanswered questions. Submit anyway?')) return;
    }
    
    try {
      // transform answers object to array of { questionId, selectedOption }
      const answersArray = Object.entries(answers).map(([qId, opt]) => ({
        questionId: parseInt(qId),
        selectedOption: opt
      }));
      
      const res = await quizService.submitAttempt(attempt.attempt.id, { answers: answersArray });
      setResult(res.data);
    } catch (err) {
      alert('Failed to submit: ' + (err.response?.data?.error?.message || err.message));
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen bg-slate-50 dark:bg-[#0b1120] text-slate-500">Loading quiz...</div>;

  if (error) return (
    <div className="flex flex-col justify-center items-center h-screen bg-slate-50 dark:bg-[#0b1120] text-slate-900 dark:text-white">
      <h2 className="text-2xl font-bold mb-4">{error}</h2>
      <Link to={`/student/courses/${courseId}/play`} className="text-blue-600 hover:text-blue-500 flex items-center gap-2"><ArrowLeft size={16}/> Back to Course</Link>
    </div>
  );

  if (result) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0b1120] text-slate-900 dark:text-white p-8">
        <div className="max-w-3xl mx-auto bg-white dark:bg-[hsl(224,44%,14%)] rounded-2xl p-8 border border-slate-200 dark:border-white/10 shadow-xl text-center">
          <CheckCircle2 size={64} className="text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-extrabold mb-2">Quiz Completed!</h1>
          <p className="text-slate-500 dark:text-white/50 mb-8">You have successfully submitted the quiz.</p>
          
          <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-8 drop-shadow-sm">
            {result.score} / {result.totalMarks}
          </div>
          
          <Link to={`/student/courses/${courseId}/play`} className="inline-flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-lg font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors shadow-sm">
            <ArrowLeft size={18} /> Return to Course
          </Link>
        </div>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0b1120] text-slate-900 dark:text-white p-8">
        <div className="max-w-2xl mx-auto bg-white dark:bg-[hsl(224,44%,14%)] rounded-2xl p-8 border border-slate-200 dark:border-white/10 shadow-xl text-center">
          <h1 className="text-3xl font-bold mb-4">{quizData.quiz.title}</h1>
          <p className="text-slate-600 dark:text-white/60 mb-8">
            This quiz has {quizData.quiz.total_marks} total marks.
            {quizData.quiz.time_limit_minutes > 0 ? ` You will have ${quizData.quiz.time_limit_minutes} minutes.` : ' There is no time limit.'}
          </p>
          
          <div className="flex flex-col gap-4 items-center">
            <button onClick={handleStartAttempt} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-md text-lg">
              <PlayCircle size={20} /> Start Quiz
            </button>
            <Link to={`/student/courses/${courseId}/play`} className="text-slate-500 hover:text-slate-700 dark:text-white/50 dark:hover:text-white/80 font-medium">
              Cancel
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1120] text-slate-900 dark:text-white p-4 md:p-8 transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">{quizData.quiz.title}</h1>
          <div className="text-sm font-medium bg-white dark:bg-white/5 px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10 shadow-sm">
            Question {Object.keys(answers).length} of {attempt.questions.length} answered
          </div>
        </div>

        <div className="flex flex-col gap-8">
          {attempt.questions.map((q, idx) => (
            <div key={q.id} className="bg-white dark:bg-[hsl(224,44%,14%)] rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-white/10 shadow-sm transition-all hover:border-blue-300 dark:hover:border-blue-500/30">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-lg md:text-xl font-semibold leading-snug">
                  <span className="text-slate-400 mr-2">{idx + 1}.</span> {q.question_text}
                </h3>
                <span className="shrink-0 ml-4 text-xs font-bold bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-1 rounded">
                  {q.marks} Mark{q.marks > 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="flex flex-col gap-3">
                {['a', 'b', 'c', 'd'].map(opt => (
                  <button
                    key={opt}
                    onClick={() => handleOptionSelect(q.id, opt)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                      answers[q.id] === opt 
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-600/10 dark:border-blue-500' 
                        : 'border-slate-200 dark:border-white/10 hover:border-blue-300 hover:bg-slate-50 dark:hover:border-blue-500/30 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      answers[q.id] === opt 
                        ? 'border-blue-600 bg-blue-600' 
                        : 'border-slate-300 dark:border-white/20'
                    }`}>
                      {answers[q.id] === opt && <div className="w-2.5 h-2.5 rounded-full bg-white"></div>}
                    </div>
                    <span className={`font-medium ${answers[q.id] === opt ? 'text-blue-900 dark:text-blue-100' : 'text-slate-700 dark:text-white/80'}`}>
                      {q[`option_${opt}`]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <button 
            onClick={handleSubmit}
            className="bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold px-8 py-3.5 rounded-xl flex items-center gap-2 shadow-lg transition-all"
          >
            Submit Quiz <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TakeQuiz;
