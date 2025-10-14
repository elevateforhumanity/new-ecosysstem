import { useState, useEffect } from 'react';

interface FlowChartData {
  type: 'enrollment' | 'retention' | 'completion' | 'attrition';
  title: string;
  data: any[];
  chartConfig: any;
}

export function AutoFlowCharts() {
  const [flowCharts, setFlowCharts] = useState<FlowChartData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    generateAutoFlowCharts();
  }, []);

  const generateAutoFlowCharts = async () => {
    setIsGenerating(true);
    
    // Simulate data processing and chart generation
    await new Promise(resolve => setTimeout(resolve, 2000));

    const charts: FlowChartData[] = [
      {
        type: 'enrollment',
        title: '📈 Student Enrollment Flow',
        data: [
          { stage: 'Inquiries', count: 150, percentage: 100 },
          { stage: 'Applications', count: 120, percentage: 80 },
          { stage: 'Enrolled', count: 95, percentage: 63 },
          { stage: 'Started Classes', count: 88, percentage: 59 }
        ],
        chartConfig: { color: '#3b82f6' }
      },
      {
        type: 'retention',
        title: '🎯 Retention by Program',
        data: [
          { program: 'Medical Assistant', enrolled: 35, retained: 32, rate: 91 },
          { program: 'IT Support', enrolled: 28, retained: 24, rate: 86 },
          { program: 'HVAC Tech', enrolled: 25, retained: 23, rate: 92 }
        ],
        chartConfig: { color: '#059669' }
      },
      {
        type: 'completion',
        title: '🏆 Completion Rates by Month',
        data: [
          { month: 'Jan', completed: 12, total: 15, rate: 80 },
          { month: 'Feb', completed: 18, total: 20, rate: 90 },
          { month: 'Mar', completed: 22, total: 25, rate: 88 },
          { month: 'Apr', completed: 16, total: 18, rate: 89 }
        ],
        chartConfig: { color: '#dc2626' }
      },
      {
        type: 'attrition',
        title: '⚠️ Attrition Risk Analysis',
        data: [
          { risk: 'Low Risk', count: 45, percentage: 60 },
          { risk: 'Medium Risk', count: 20, percentage: 27 },
          { risk: 'High Risk', count: 10, percentage: 13 }
        ],
        chartConfig: { color: '#f59e0b' }
      }
    ];

    setFlowCharts(charts);
    setIsGenerating(false);
  };

  const EnrollmentFlowChart = ({ data }: { data: any[] }) => (
    <div className="flow-chart bg-white p-6 rounded-lg border">
      <div className="flow-steps space-y-4">
        {data.map((step, index) => (
          <div key={index} className="flex items-center">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">{step.stage}</span>
                <span className="text-sm text-gray-600">{step.count} students</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${step.percentage}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">{step.percentage}% conversion</div>
            </div>
            {index < data.length - 1 && (
              <div className="ml-4 text-gray-400">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const RetentionChart = ({ data }: { data: any[] }) => (
    <div className="retention-chart bg-white p-6 rounded-lg border">
      <div className="space-y-4">
        {data.map((program, index) => (
          <div key={index} className="program-retention">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-900">{program.program}</span>
              <span className="text-lg font-bold text-green-600">{program.rate}%</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-green-500 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${program.rate}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                {program.retained}/{program.enrolled} students
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const CompletionChart = ({ data }: { data: any[] }) => (
    <div className="completion-chart bg-white p-6 rounded-lg border">
      <div className="grid grid-cols-4 gap-4">
        {data.map((month, index) => (
          <div key={index} className="text-center">
            <div className="mb-2">
              <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-red-600">{month.rate}%</span>
              </div>
            </div>
            <div className="text-sm font-medium text-gray-900">{month.month}</div>
            <div className="text-xs text-gray-600">{month.completed}/{month.total}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const AttritionRiskChart = ({ data }: { data: any[] }) => (
    <div className="attrition-chart bg-white p-6 rounded-lg border">
      <div className="space-y-4">
        {data.map((risk, index) => (
          <div key={index} className="risk-level">
            <div className="flex justify-between items-center mb-2">
              <span className={`font-medium ${
                risk.risk === 'Low Risk' ? 'text-green-600' :
                risk.risk === 'Medium Risk' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {risk.risk}
              </span>
              <span className="text-sm text-gray-600">{risk.count} students</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ${
                  risk.risk === 'Low Risk' ? 'bg-green-500' :
                  risk.risk === 'Medium Risk' ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${risk.percentage}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">{risk.percentage}% of total</div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="auto-flowcharts">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📊 Auto-Generated Flow Charts</h2>
          <p className="text-gray-600">Real-time visual analytics updated automatically</p>
        </div>
        <button
          onClick={generateAutoFlowCharts}
          disabled={isGenerating}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isGenerating ? '🔄 Generating...' : '🔄 Refresh Charts'}
        </button>
      </div>

      {isGenerating ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">🤖 Copilot is generating your flow charts...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {flowCharts.map((chart, index) => (
            <div key={index} className="chart-container">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">{chart.title}</h3>
              
              {chart.type === 'enrollment' && <EnrollmentFlowChart data={chart.data} />}
              {chart.type === 'retention' && <RetentionChart data={chart.data} />}
              {chart.type === 'completion' && <CompletionChart data={chart.data} />}
              {chart.type === 'attrition' && <AttritionRiskChart data={chart.data} />}
              
              <div className="mt-4 flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  Last updated: {new Date().toLocaleString()}
                </span>
                <div className="flex space-x-2">
                  <button className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded hover:bg-gray-200">
                    📊 Export
                  </button>
                  <button className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded hover:bg-gray-200">
                    📧 Email
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Auto-Generated Insights */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">🤖 Copilot Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="insight-card bg-white p-4 rounded border">
            <div className="text-sm font-medium text-gray-900">📈 Trending Up</div>
            <div className="text-xs text-gray-600 mt-1">
              Medical Assistant program showing 91% retention - highest this quarter
            </div>
          </div>
          <div className="insight-card bg-white p-4 rounded border">
            <div className="text-sm font-medium text-gray-900">⚠️ Attention Needed</div>
            <div className="text-xs text-gray-600 mt-1">
              10 students at high attrition risk - intervention recommended
            </div>
          </div>
          <div className="insight-card bg-white p-4 rounded border">
            <div className="text-sm font-medium text-gray-900">🎯 WIOA Compliance</div>
            <div className="text-xs text-gray-600 mt-1">
              All programs meeting federal performance standards
            </div>
          </div>
          <div className="insight-card bg-white p-4 rounded border">
            <div className="text-sm font-medium text-gray-900">📊 Next Report Due</div>
            <div className="text-xs text-gray-600 mt-1">
              Quarterly WIOA report auto-generates in 5 days
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}