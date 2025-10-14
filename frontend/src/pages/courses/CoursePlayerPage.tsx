import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

interface Lesson {
  id: string;
  title: string;
  content: string;
  videoUrl?: string;
  duration?: number;
  order: number;
}

interface Progress {
  lessonId: string;
  completed: boolean;
}

const CoursePlayerPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      const [lessonsRes, progressRes] = await Promise.all([
        api.get(`/courses/${courseId}/lessons`),
        api.get(`/progress?courseId=${courseId}`).catch(() => ({ data: { progress: [] } })),
      ]);

      setLessons(lessonsRes.data.lessons || []);
      setProgress(progressRes.data.progress || []);
    } catch (error) {
      console.error('Failed to fetch course data:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentLesson = lessons[currentLessonIndex];

  const isLessonCompleted = (lessonId: string) => {
    return progress.some(p => p.lessonId === lessonId && p.completed);
  };

  const markLessonComplete = async () => {
    if (!currentLesson) return;

    try {
      await api.post('/progress', {
        lessonId: currentLesson.id,
        completed: true,
        timeSpent: currentLesson.duration || 0,
      });

      setProgress(prev => [
        ...prev.filter(p => p.lessonId !== currentLesson.id),
        { lessonId: currentLesson.id, completed: true },
      ]);
    } catch (error) {
      console.error('Failed to mark lesson complete:', error);
    }
  };

  const goToNextLesson = () => {
    if (currentLessonIndex < lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    }
  };

  const goToPreviousLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-2xl font-bold mb-4">No lessons available</h2>
        <button onClick={() => navigate('/dashboard')} className="btn-primary">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const completedCount = lessons.filter(l => isLessonCompleted(l.id)).length;
  const progressPercentage = (completedCount / lessons.length) * 100;

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} bg-white border-r transition-all duration-300 overflow-hidden`}>
        <div className="p-4 border-b">
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-primary-600 hover:text-primary-700 mb-4 flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
          <h2 className="font-bold text-lg mb-2">Course Content</h2>
          <div className="text-sm text-gray-600">
            {completedCount} of {lessons.length} lessons completed
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
        
        <div className="overflow-y-auto h-[calc(100vh-140px)]">
          {lessons.map((lesson, index) => (
            <button
              key={lesson.id}
              onClick={() => setCurrentLessonIndex(index)}
              className={`w-full text-left p-4 border-b hover:bg-gray-50 transition-colors ${
                index === currentLessonIndex ? 'bg-primary-50 border-l-4 border-l-primary-600' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  isLessonCompleted(lesson.id) 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {isLessonCompleted(lesson.id) ? '✓' : index + 1}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{lesson.title}</div>
                  {lesson.duration && (
                    <div className="text-sm text-gray-500">{lesson.duration} min</div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Toggle Sidebar Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-4 left-4 z-10 bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50"
        >
          {sidebarOpen ? '←' : '→'}
        </button>

        {/* Video/Content Area */}
        <div className="flex-1 bg-black flex items-center justify-center relative">
          {currentLesson?.videoUrl ? (
            <video 
              key={currentLesson.id}
              controls 
              className="w-full h-full"
              src={currentLesson.videoUrl}
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="text-white text-center p-8">
              <h2 className="text-3xl font-bold mb-4">{currentLesson?.title}</h2>
              <div className="max-w-3xl mx-auto text-left bg-gray-900 p-8 rounded-lg">
                <div 
                  className="prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: currentLesson?.content || '' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="bg-white border-t p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">{currentLesson?.title}</h3>
              <p className="text-sm text-gray-600">
                Lesson {currentLessonIndex + 1} of {lessons.length}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={goToPreviousLesson}
                disabled={currentLessonIndex === 0}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              
              {!isLessonCompleted(currentLesson?.id) && (
                <button
                  onClick={markLessonComplete}
                  className="btn-primary"
                >
                  Mark Complete
                </button>
              )}
              
              <button
                onClick={goToNextLesson}
                disabled={currentLessonIndex === lessons.length - 1}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePlayerPage;
