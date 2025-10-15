import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLMSStore } from '../stores/lmsStore';

const ProgressContext = createContext();

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within ProgressProvider');
  }
  return context;
};

export const ProgressProvider = ({ children }) => {
  const { progress, setProgress, updateProgress } = useLMSStore();
  const [syncing, setSyncing] = useState(false);

  // Calculate overall progress
  const calculateOverallProgress = () => {
    const progressValues = Object.values(progress);
    if (progressValues.length === 0) return 0;
    const sum = progressValues.reduce((acc, val) => acc + val, 0);
    return Math.round(sum / progressValues.length);
  };

  // Track module completion
  const markModuleComplete = async (courseId, moduleId, token) => {
    try {
      setSyncing(true);
      const currentProgress = progress[courseId] || 0;
      const newProgress = Math.min(currentProgress + 10, 100); // Increment by 10%
      
      await updateProgress(courseId, newProgress, token);
      
      return { success: true, newProgress };
    } catch (error) {
      console.error('Failed to mark module complete:', error);
      return { success: false, error: error.message };
    } finally {
      setSyncing(false);
    }
  };

  // Get course progress
  const getCourseProgress = (courseId) => {
    return progress[courseId] || 0;
  };

  // Sync progress with server
  const syncProgress = async (token) => {
    try {
      setSyncing(true);
      // Fetch latest progress from server
      const response = await fetch('/api/lms/my-courses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const serverProgress = {};
        data.enrollments?.forEach(enrollment => {
          serverProgress[enrollment.course_id] = enrollment.progress;
        });
        
        // Merge with local progress
        Object.keys(serverProgress).forEach(courseId => {
          setProgress(courseId, serverProgress[courseId]);
        });
      }
    } catch (error) {
      console.error('Failed to sync progress:', error);
    } finally {
      setSyncing(false);
    }
  };

  const value = {
    progress,
    overallProgress: calculateOverallProgress(),
    syncing,
    markModuleComplete,
    getCourseProgress,
    syncProgress,
    setProgress
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
};

export default ProgressProvider;
