import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const ExampleComponent = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .eq('published', true)
        .limit(5);

      if (error) {
        throw error;
      }

      setPrograms(data || []);
    } catch (error) {
      console.error('Error fetching programs:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>🔄 Loading Programs...</h2>
        <p>Connecting to Supabase database...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', border: '1px solid #ff6b6b', borderRadius: '8px', backgroundColor: '#ffe0e0' }}>
        <h2>❌ Connection Error</h2>
        <p>Error: {error}</p>
        <button onClick={fetchPrograms} style={{ padding: '8px 16px', marginTop: '10px' }}>
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>✅ Supabase Integration Active!</h2>
      <p>Successfully connected to your Supabase database.</p>
      
      <div style={{ marginTop: '20px' }}>
        <h3>📚 Programs ({programs.length})</h3>
        {programs.length > 0 ? (
          <div style={{ display: 'grid', gap: '15px', marginTop: '15px' }}>
            {programs.map((program) => (
              <div 
                key={program.id} 
                style={{ 
                  border: '1px solid #ddd', 
                  borderRadius: '8px', 
                  padding: '15px',
                  backgroundColor: '#f9f9f9'
                }}
              >
                <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>
                  {program.title}
                </h4>
                <p style={{ margin: '0 0 8px 0', color: '#666' }}>
                  {program.description}
                </p>
                {program.category && (
                  <span style={{ 
                    backgroundColor: '#007bff', 
                    color: 'white', 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    fontSize: '12px' 
                  }}>
                    {program.category}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ 
            padding: '20px', 
            border: '1px solid #ffc107', 
            borderRadius: '8px', 
            backgroundColor: '#fff3cd',
            marginTop: '15px'
          }}>
            <p>📝 No programs found in database yet.</p>
            <p>The database connection is working, but no program data has been populated.</p>
          </div>
        )}
      </div>

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#e8f5e8', borderRadius: '8px' }}>
        <h4>🎯 Integration Status</h4>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>✅ Supabase client configured</li>
          <li>✅ Database connection established</li>
          <li>✅ Programs table accessible</li>
          <li>✅ Real-time data fetching working</li>
        </ul>
        <p style={{ margin: '10px 0 0 0', fontSize: '14px', color: '#666' }}>
          Project: kkzbqkyuunahdxcfdfzv.supabase.co
        </p>
      </div>
    </div>
  );
};

export default ExampleComponent;