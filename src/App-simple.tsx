export default function App() {
  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#ff6b35' }}>Elevate for Humanity - LMS Platform</h1>
      <p>React is working! The LMS is loading...</p>
      
      <div style={{ marginTop: '40px' }}>
        <h2>Quick Links:</h2>
        <ul>
          <li><a href="/lms">LMS Dashboard</a></li>
          <li><a href="/programs">Programs</a></li>
          <li><a href="/auth/login">Login</a></li>
        </ul>
      </div>
      
      <div style={{ marginTop: '40px', padding: '20px', background: '#f0f0f0', borderRadius: '8px' }}>
        <h3>System Status:</h3>
        <p>✅ React Mounted Successfully</p>
        <p>✅ Vite Build Working</p>
        <p>✅ Deployment Active</p>
      </div>
    </div>
  );
}
