import React from 'react';

export const StatCard = ({ title, value, icon, trend }) => {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <h3>{title}</h3>
        <p className="stat-value">{value}</p>
        {trend && <span className="stat-trend">{trend}</span>}
      </div>
    </div>
  );
};

export const LineChart = ({ data, title }) => {
  return (
    <div className="chart-container">
      <h3>{title}</h3>
      <div className="chart-placeholder">Line chart visualization</div>
    </div>
  );
};

export const BarChart = ({ data, title }) => {
  return (
    <div className="chart-container">
      <h3>{title}</h3>
      <div className="chart-placeholder">Bar chart visualization</div>
    </div>
  );
};

export const PieChart = ({ data, title }) => {
  return (
    <div className="chart-container">
      <h3>{title}</h3>
      <div className="chart-placeholder">Pie chart visualization</div>
    </div>
  );
};

const Chart = ({ data, type = 'line', title }) => {
  return (
    <div className="chart-container">
      <h3>{title}</h3>
      <div className="chart-placeholder">
        Chart visualization will be implemented here
      </div>
    </div>
  );
};

export default Chart;
