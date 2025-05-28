import { useState, useEffect } from 'react';

export const useDashboardData = (userId) => {
  const [dashboardData, setDashboardData] = useState({
    totalFiles: { count: 0, change: 0, increasedSinceLastWeek: true },
    processedToday: { count: 0, change: 0, increasedSinceLastWeek: true },
    averageAccuracy: { percentage: 0, change: 0, increasedSinceLastWeek: true },
    recentDocuments: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
   
      
      if (!userId) {
        setError('User ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
      
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found');
        }

 
        const response = await fetch(`http://localhost:3000/api/dashboard/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('=== API Error ===');
          console.error('Status:', response.status);
          console.error('Status Text:', response.statusText);
          console.error('Error Data:', errorData);
          
          if (response.status === 404) {
            throw new Error('Dashboard data not found. Please try again later.');
          } else if (response.status === 401) {
            throw new Error('Authentication failed. Please log in again.');
          } else {
            throw new Error(`Failed to fetch dashboard data: ${response.statusText}`);
          }
        }

        const data = await response.json();
     
        
        setDashboardData(data);
        setError(null);
      } catch (err) {
        console.error('=== Fetch Error ===');
        console.error('Error Type:', err.name);
        console.error('Error Message:', err.message);
        console.error('Error Stack:', err.stack);
        setError(err.message);
    
        setDashboardData({
          totalFiles: { count: 0, change: 0, increasedSinceLastWeek: true },
          processedToday: { count: 0, change: 0, increasedSinceLastWeek: true },
          averageAccuracy: { percentage: 0, change: 0, increasedSinceLastWeek: true },
          recentDocuments: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [userId]);

  return { dashboardData, loading, error };
}; 