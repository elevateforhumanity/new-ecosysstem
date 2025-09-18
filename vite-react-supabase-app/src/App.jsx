import React from 'react';
import ExampleComponent from './components/ExampleComponent';

const App = () => {
  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif', 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '20px' 
    }}>
      <header style={{ 
        textAlign: 'center', 
        marginBottom: '40px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px'
      }}>
        <h1 style={{ 
          color: '#333', 
          margin: '0 0 10px 0',
          fontSize: '2.5rem'
        }}>
          🚀 Elevate for Humanity
        </h1>
        <p style={{ 
          color: '#666', 
          margin: '0',
          fontSize: '1.2rem'
        }}>
          Vite React + Supabase Integration
        </p>
      </header>
      
      <main>
        <ExampleComponent />
      </main>
      
      <footer style={{ 
        marginTop: '40px', 
        padding: '20px', 
        textAlign: 'center',
        borderTop: '1px solid #eee',
        color: '#666'
      }}>
        <p>Powered by Vite, React, and Supabase</p>
      </footer>
    </div>
  );
};

export default App;