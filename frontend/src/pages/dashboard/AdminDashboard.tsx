const AdminDashboard = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <h3 className="text-gray-600 mb-2">Total Users</h3>
          <p className="text-3xl font-bold">0</p>
        </div>
        <div className="card">
          <h3 className="text-gray-600 mb-2">Total Courses</h3>
          <p className="text-3xl font-bold">0</p>
        </div>
        <div className="card">
          <h3 className="text-gray-600 mb-2">Active Enrollments</h3>
          <p className="text-3xl font-bold">0</p>
        </div>
        <div className="card">
          <h3 className="text-gray-600 mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold">$0</p>
        </div>
      </div>
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <p className="text-gray-600">No recent activity</p>
      </div>
    </div>
  );
};

export default AdminDashboard;
