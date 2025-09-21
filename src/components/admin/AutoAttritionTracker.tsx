import React, { useState, useEffect } from 'react';

interface AttritionMetrics {
  overall: {
    totalStudents: number;
    activeStudents: number;
    droppedStudents: number;
    attritionRate: number;
    retentionRate: number;
    trend: 'improving' | 'declining' | 'stable';
  };
  byProgram: ProgramMetrics[];
  byTimeframe: TimeframeMetrics[];
  riskFactors: RiskFactor[];
  interventions: InterventionResult[];
}

interface ProgramMetrics {
  program: string;
  enrolled: number;
  active: number;
  completed: number;
  dropped: number;
  attritionRate: number;
  retentionRate: number;
  completionRate: number;
  riskLevel: 'low' | 'medium' | 'high';
}

interface TimeframeMetrics {
  period: string;
  enrolled: number;
  retained: number;
  dropped: number;
  rate: number;
  trend: number;
}

interface RiskFactor {
  factor: string;
  impact: number;
  affectedStudents: number;
  description: string;
  autoIntervention: string;
}

interface InterventionResult {
  type: string;
  deployed: string;
  studentsTargeted: number;
  successRate: number;
  costSavings: number;
  description: string;
}

interface AtRiskStudent {
  id: string;
  name: string;
  program: string;
  riskScore: number;
  riskFactors: string[];
  lastActivity: string;
  interventionStatus: 'none' | 'scheduled' | 'in_progress' | 'completed';
  autoActions: string[];
}

export function AutoAttritionTracker() {
  const [metrics, setMetrics] = useState<AttritionMetrics | null>(null);
  const [atRiskStudents, setAtRiskStudents] = useState<AtRiskStudent[]>([]);
  const [isTracking, setIsTracking] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadAttritionData();
    
    // Real-time tracking every 2 minutes
    const interval = setInterval(() => {
      if (isTracking) {
        loadAttritionData();
      }
    }, 120000);

    return () => clearInterval(interval);
  }, [isTracking]);

  const loadAttritionData = async () => {
    // Simulate real-time data loading
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockMetrics: AttritionMetrics = {
      overall: {
        totalStudents: 156,
        activeStudents: 142,
        droppedStudents: 14,
        attritionRate: 8.97,
        retentionRate: 91.03,
        trend: 'improving'
      },
      byProgram: [
        {
          program: 'Medical Assistant',
          enrolled: 45,
          active: 42,
          completed: 38,
          dropped: 3,
          attritionRate: 6.67,
          retentionRate: 93.33,
          completionRate: 84.44,
          riskLevel: 'low'
        },
        {
          program: 'IT Support',
          enrolled: 38,
          active: 33,
          completed: 28,
          dropped: 5,
          attritionRate: 13.16,
          retentionRate: 86.84,
          completionRate: 73.68,
          riskLevel: 'medium'
        },
        {
          program: 'HVAC Technician',
          enrolled: 42,
          active: 38,
          completed: 35,
          dropped: 4,
          attritionRate: 9.52,
          retentionRate: 90.48,
          completionRate: 83.33,
          riskLevel: 'low'
        },
        {
          program: 'Business Administration',
          enrolled: 31,
          active: 29,
          completed: 22,
          dropped: 2,
          attritionRate: 6.45,
          retentionRate: 93.55,
          completionRate: 70.97,
          riskLevel: 'medium'
        }
      ],
      byTimeframe: [
        { period: 'Week 1-2', enrolled: 156, retained: 154, dropped: 2, rate: 98.72, trend: 0 },
        { period: 'Week 3-4', enrolled: 154, retained: 151, dropped: 3, rate: 98.05, trend: -0.67 },
        { period: 'Week 5-8', enrolled: 151, retained: 147, dropped: 4, rate: 97.35, trend: -0.70 },
        { period: 'Week 9-12', enrolled: 147, retained: 142, dropped: 5, rate: 96.60, trend: -0.75 }
      ],
      riskFactors: [
        {
          factor: 'Low Attendance',
          impact: 85,
          affectedStudents: 12,
          description: 'Students with <80% attendance have 85% higher dropout risk',
          autoIntervention: 'Automated check-in calls and flexible scheduling options'
        },
        {
          factor: 'Poor Academic Performance',
          impact: 72,
          affectedStudents: 8,
          description: 'Students with GPA <2.5 show increased attrition risk',
          autoIntervention: 'Personalized tutoring and remedial coursework'
        },
        {
          factor: 'Financial Stress',
          impact: 68,
          affectedStudents: 15,
          description: 'Students reporting financial difficulties',
          autoIntervention: 'Emergency financial aid and payment plan options'
        },
        {
          factor: 'Lack of Engagement',
          impact: 61,
          affectedStudents: 10,
          description: 'Low participation in class discussions and activities',
          autoIntervention: 'Peer mentoring and engagement activities'
        }
      ],
      interventions: [
        {
          type: 'Early Warning System',
          deployed: '2 weeks ago',
          studentsTargeted: 25,
          successRate: 88,
          costSavings: 15000,
          description: 'Automated alerts for at-risk students with immediate support'
        },
        {
          type: 'Peer Mentoring Program',
          deployed: '1 month ago',
          studentsTargeted: 18,
          successRate: 94,
          costSavings: 12000,
          description: 'Pairing struggling students with successful peers'
        },
        {
          type: 'Flexible Learning Paths',
          deployed: '3 weeks ago',
          studentsTargeted: 22,
          successRate: 82,
          costSavings: 18000,
          description: 'Adaptive scheduling and personalized pacing'
        }
      ]
    };

    const mockAtRiskStudents: AtRiskStudent[] = [
      {
        id: 'STU001',
        name: 'Jennifer Martinez',
        program: 'IT Support',
        riskScore: 87,
        riskFactors: ['Low Attendance', 'Poor Performance'],
        lastActivity: '3 days ago',
        interventionStatus: 'scheduled',
        autoActions: ['Attendance counselor assigned', 'Tutoring session scheduled', 'Financial aid review']
      },
      {
        id: 'STU002',
        name: 'Michael Thompson',
        program: 'HVAC Technician',
        riskScore: 73,
        riskFactors: ['Financial Stress', 'Lack of Engagement'],
        lastActivity: '1 day ago',
        interventionStatus: 'in_progress',
        autoActions: ['Emergency aid application', 'Peer mentor assigned', 'Career counseling']
      },
      {
        id: 'STU003',
        name: 'Ashley Davis',
        program: 'Medical Assistant',
        riskScore: 65,
        riskFactors: ['Poor Performance'],
        lastActivity: '2 hours ago',
        interventionStatus: 'none',
        autoActions: ['Academic support recommended', 'Study group invitation', 'Progress monitoring']
      }
    ];

    setMetrics(mockMetrics);
    setAtRiskStudents(mockAtRiskStudents);
    setLastUpdate(new Date());
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      case 'stable': return '➡️';
      default: return '📊';
    }
  };

  const getInterventionStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'scheduled': return 'text-yellow-600 bg-yellow-100';
      case 'none': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (!metrics) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading attrition tracking data...</p>
      </div>
    );
  }

  return (
    <div className="auto-attrition-tracker">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📊 Automated Attrition & Retention Tracker</h2>
          <p className="text-gray-600">Real-time monitoring with predictive analytics and auto-interventions</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isTracking}
              onChange={(e) => setIsTracking(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Real-time Tracking</span>
          </label>
        </div>
      </div>

      {/* Overall Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.overall.totalStudents}</p>
            </div>
            <div className="text-2xl">👥</div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Retention Rate</p>
              <p className="text-3xl font-bold text-green-600">{metrics.overall.retentionRate.toFixed(1)}%</p>
            </div>
            <div className="text-2xl">{getTrendIcon(metrics.overall.trend)}</div>
          </div>
          <div className="mt-2">
            <span className={`text-xs px-2 py-1 rounded-full ${
              metrics.overall.trend === 'improving' ? 'bg-green-100 text-green-800' :
              metrics.overall.trend === 'declining' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {metrics.overall.trend}
            </span>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Attrition Rate</p>
              <p className="text-3xl font-bold text-red-600">{metrics.overall.attritionRate.toFixed(1)}%</p>
            </div>
            <div className="text-2xl">⚠️</div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {metrics.overall.droppedStudents} students dropped
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">At-Risk Students</p>
              <p className="text-3xl font-bold text-orange-600">{atRiskStudents.length}</p>
            </div>
            <div className="text-2xl">🚨</div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Requiring intervention
          </div>
        </div>
      </div>

      {/* Program-Specific Metrics */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📚 Program Performance</h3>
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Program</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enrolled</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Retention</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completion</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {metrics.byProgram.map((program, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 font-medium text-gray-900">{program.program}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{program.enrolled}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${program.retentionRate}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{program.retentionRate.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium">{program.completionRate.toFixed(1)}%</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskColor(program.riskLevel)}`}>
                      {program.riskLevel.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">
                      📊 View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* At-Risk Students */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🚨 Students Requiring Immediate Attention</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {atRiskStudents.map((student) => (
            <div key={student.id} className="bg-white border rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-gray-900">{student.name}</h4>
                  <p className="text-sm text-gray-600">{student.program}</p>
                  <p className="text-xs text-gray-500">Last activity: {student.lastActivity}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-red-600">{student.riskScore}%</div>
                  <div className="text-xs text-gray-500">Risk Score</div>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-sm font-medium text-gray-700 mb-2">Risk Factors:</div>
                <div className="flex flex-wrap gap-1">
                  {student.riskFactors.map((factor, index) => (
                    <span key={index} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                      {factor}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Intervention Status:</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getInterventionStatusColor(student.interventionStatus)}`}>
                    {student.interventionStatus.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-sm font-medium text-gray-700 mb-2">🤖 Auto Actions Taken:</div>
                <div className="space-y-1">
                  {student.autoActions.map((action, index) => (
                    <div key={index} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                      ✅ {action}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2">
                <button className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">
                  📞 Contact Student
                </button>
                <button className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200">
                  📝 Add Note
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Factors Analysis */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🔍 Risk Factor Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {metrics.riskFactors.map((factor, index) => (
            <div key={index} className="bg-white border rounded-lg p-6">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-semibold text-gray-900">{factor.factor}</h4>
                <span className="text-lg font-bold text-red-600">{factor.impact}%</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{factor.description}</p>
              <div className="text-sm text-gray-700 mb-3">
                <strong>Affected Students:</strong> {factor.affectedStudents}
              </div>
              <div className="bg-green-50 border border-green-200 rounded p-3">
                <div className="text-sm font-medium text-green-800 mb-1">🤖 Auto-Intervention:</div>
                <div className="text-sm text-green-700">{factor.autoIntervention}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Intervention Results */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Intervention Effectiveness</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {metrics.interventions.map((intervention, index) => (
            <div key={index} className="bg-white border rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-2">{intervention.type}</h4>
              <p className="text-sm text-gray-600 mb-4">{intervention.description}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Success Rate:</span>
                  <span className="font-bold text-green-600">{intervention.successRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Students Helped:</span>
                  <span className="font-medium">{intervention.studentsTargeted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cost Savings:</span>
                  <span className="font-bold text-blue-600">${intervention.costSavings.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Deployed:</span>
                  <span className="text-gray-500">{intervention.deployed}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}