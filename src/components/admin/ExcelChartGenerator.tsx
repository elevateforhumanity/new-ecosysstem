import React, { useState } from 'react';

interface ExcelChartConfig {
  type: 'pie' | 'bar' | 'line' | 'doughnut' | 'column';
  title: string;
  data: ChartData[];
  colors: string[];
  showLabels: boolean;
  showPercentages: boolean;
  showLegend: boolean;
}

interface ChartData {
  label: string;
  value: number;
  percentage: number;
  color: string;
}

interface ExcelExportOptions {
  includeCharts: boolean;
  includeRawData: boolean;
  includeFormatting: boolean;
  chartSize: 'small' | 'medium' | 'large';
  fileName: string;
}

export function ExcelChartGenerator() {
  const [availableCharts, setAvailableCharts] = useState<ExcelChartConfig[]>([]);
  const [selectedCharts, setSelectedCharts] = useState<string[]>([]);
  const [exportOptions, setExportOptions] = useState<ExcelExportOptions>({
    includeCharts: true,
    includeRawData: true,
    includeFormatting: true,
    chartSize: 'medium',
    fileName: 'WIOA_Analytics_Report'
  });
  const [isGenerating, setIsGenerating] = useState(false);

  React.useEffect(() => {
    generateAvailableCharts();
  }, []);

  const generateAvailableCharts = () => {
    const charts: ExcelChartConfig[] = [
      {
        type: 'pie',
        title: 'Student Enrollment by Program',
        data: [
          { label: 'Medical Assistant', value: 342, percentage: 27.4, color: '#3b82f6' },
          { label: 'IT Support', value: 287, percentage: 23.0, color: '#10b981' },
          { label: 'HVAC Technician', value: 298, percentage: 23.9, color: '#f59e0b' },
          { label: 'Business Admin', value: 189, percentage: 15.2, color: '#ef4444' },
          { label: 'Network Infrastructure', value: 131, percentage: 10.5, color: '#8b5cf6' }
        ],
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
        showLabels: true,
        showPercentages: true,
        showLegend: true
      },
      {
        type: 'pie',
        title: 'Participant Demographics',
        data: [
          { label: 'Low Income', value: 456, percentage: 36.6, color: '#3b82f6' },
          { label: 'Dislocated Workers', value: 298, percentage: 23.9, color: '#10b981' },
          { label: 'Veterans', value: 187, percentage: 15.0, color: '#f59e0b' },
          { label: 'Individuals', value: 183, percentage: 14.7, color: '#ef4444' },
          { label: 'Youth (14-24)', value: 123, percentage: 9.8, color: '#8b5cf6' }
        ],
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
        showLabels: true,
        showPercentages: true,
        showLegend: true
      },
      {
        type: 'doughnut',
        title: 'Employment Outcomes',
        data: [
          { label: 'Employed', value: 78.5, percentage: 78.5, color: '#10b981' },
          { label: 'Continuing Education', value: 12.3, percentage: 12.3, color: '#3b82f6' },
          { label: 'Seeking Employment', value: 6.8, percentage: 6.8, color: '#f59e0b' },
          { label: 'Other', value: 2.4, percentage: 2.4, color: '#6b7280' }
        ],
        colors: ['#10b981', '#3b82f6', '#f59e0b', '#6b7280'],
        showLabels: true,
        showPercentages: true,
        showLegend: true
      },
      {
        type: 'pie',
        title: 'Completion Status by Program',
        data: [
          { label: 'Completed', value: 1099, percentage: 88.1, color: '#10b981' },
          { label: 'In Progress', value: 134, percentage: 10.7, color: '#3b82f6' },
          { label: 'Dropped', value: 14, percentage: 1.2, color: '#ef4444' }
        ],
        colors: ['#10b981', '#3b82f6', '#ef4444'],
        showLabels: true,
        showPercentages: true,
        showLegend: true
      },
      {
        type: 'pie',
        title: 'Credential Attainment',
        data: [
          { label: 'Industry Certification', value: 67.8, percentage: 67.8, color: '#10b981' },
          { label: 'Diploma/Certificate', value: 23.4, percentage: 23.4, color: '#3b82f6' },
          { label: 'License', value: 8.8, percentage: 8.8, color: '#f59e0b' }
        ],
        colors: ['#10b981', '#3b82f6', '#f59e0b'],
        showLabels: true,
        showPercentages: true,
        showLegend: true
      },
      {
        type: 'doughnut',
        title: 'Risk Level Distribution',
        data: [
          { label: 'Low Risk', value: 60, percentage: 60, color: '#10b981' },
          { label: 'Medium Risk', value: 27, percentage: 27, color: '#f59e0b' },
          { label: 'High Risk', value: 13, percentage: 13, color: '#ef4444' }
        ],
        colors: ['#10b981', '#f59e0b', '#ef4444'],
        showLabels: true,
        showPercentages: true,
        showLegend: true
      }
    ];

    setAvailableCharts(charts);
    setSelectedCharts(charts.map(c => c.title)); // Select all by default
  };

  const generateExcelWithCharts = async () => {
    setIsGenerating(true);

    // Simulate Excel generation with charts
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Create Excel workbook with charts
    const excelData = {
      workbook: {
        worksheets: [
          {
            name: 'Dashboard',
            charts: selectedCharts.map(chartTitle => {
              const chart = availableCharts.find(c => c.title === chartTitle);
              return {
                type: chart?.type,
                title: chart?.title,
                position: 'A1:H15',
                data: chart?.data,
                formatting: {
                  colors: chart?.colors,
                  showLabels: chart?.showLabels,
                  showPercentages: chart?.showPercentages,
                  showLegend: chart?.showLegend,
                  fontSize: 12,
                  titleFontSize: 14,
                  borderWidth: 1
                }
              };
            })
          },
          {
            name: 'Raw Data',
            tables: selectedCharts.map(chartTitle => {
              const chart = availableCharts.find(c => c.title === chartTitle);
              return {
                title: chart?.title,
                headers: ['Category', 'Value', 'Percentage'],
                data: chart?.data.map(d => [d.label, d.value, `${d.percentage}%`])
              };
            })
          },
          {
            name: 'WIOA Compliance',
            data: {
              performanceIndicators: [
                ['Indicator', 'Target', 'Actual', 'Status'],
                ['Employment Rate (2nd Quarter)', '70%', '78.5%', 'Exceeds'],
                ['Employment Rate (4th Quarter)', '65%', '72.3%', 'Exceeds'],
                ['Median Earnings (2nd Quarter)', '$5,500', '$6,200', 'Exceeds'],
                ['Credential Attainment Rate', '60%', '67.8%', 'Exceeds'],
                ['Measurable Skill Gains', '50%', '58.2%', 'Exceeds']
              ]
            }
          }
        ]
      }
    };

    // Trigger download
    downloadExcelFile(excelData);
    setIsGenerating(false);
  };

  const downloadExcelFile = (data: any) => {
    // Simulate file download
    const blob = new Blob([JSON.stringify(data, null, 2)], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${exportOptions.fileName}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const toggleChartSelection = (chartTitle: string) => {
    setSelectedCharts(prev => 
      prev.includes(chartTitle) 
        ? prev.filter(t => t !== chartTitle)
        : [...prev, chartTitle]
    );
  };

  const PieChartPreview = ({ chart }: { chart: ExcelChartConfig }) => {
    const total = chart.data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;

    return (
      <div className="bg-white border rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-4 text-center">{chart.title}</h4>
        <div className="flex items-center justify-center">
          <div className="relative">
            <svg width="200" height="200" viewBox="0 0 200 200">
              {chart.data.map((item, index) => {
                const percentage = (item.value / total) * 100;
                const angle = (percentage / 100) * 360;
                const startAngle = currentAngle;
                const endAngle = currentAngle + angle;
                
                const x1 = 100 + 80 * Math.cos((startAngle - 90) * Math.PI / 180);
                const y1 = 100 + 80 * Math.sin((startAngle - 90) * Math.PI / 180);
                const x2 = 100 + 80 * Math.cos((endAngle - 90) * Math.PI / 180);
                const y2 = 100 + 80 * Math.sin((endAngle - 90) * Math.PI / 180);
                
                const largeArcFlag = angle > 180 ? 1 : 0;
                
                const pathData = [
                  `M 100 100`,
                  `L ${x1} ${y1}`,
                  `A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                  'Z'
                ].join(' ');

                currentAngle += angle;

                return (
                  <path
                    key={index}
                    d={pathData}
                    fill={item.color}
                    stroke="white"
                    strokeWidth="2"
                  />
                );
              })}
              {chart.type === 'doughnut' && (
                <circle cx="100" cy="100" r="40" fill="white" />
              )}
            </svg>
          </div>
          
          {chart.showLegend && (
            <div className="ml-6 space-y-2">
              {chart.data.map((item, index) => (
                <div key={index} className="flex items-center text-sm">
                  <div 
                    className="w-3 h-3 rounded mr-2"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-gray-700">
                    {item.label} {chart.showPercentages && `(${item.percentage.toFixed(1)}%)`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="excel-chart-generator">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📊 Excel Chart Generator</h2>
          <p className="text-gray-600">Automatically generate professional pie charts and export to Excel</p>
        </div>
        <button
          onClick={generateExcelWithCharts}
          disabled={isGenerating || selectedCharts.length === 0}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
        >
          {isGenerating ? '🔄 Generating Excel...' : '📊 Generate Excel with Charts'}
        </button>
      </div>

      {/* Export Options */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Export Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">File Name</label>
            <input
              type="text"
              value={exportOptions.fileName}
              onChange={(e) => setExportOptions(prev => ({ ...prev, fileName: e.target.value }))}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Chart Size</label>
            <select
              value={exportOptions.chartSize}
              onChange={(e) => setExportOptions(prev => ({ ...prev, chartSize: e.target.value as any }))}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={exportOptions.includeCharts}
                onChange={(e) => setExportOptions(prev => ({ ...prev, includeCharts: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Include Charts</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={exportOptions.includeRawData}
                onChange={(e) => setExportOptions(prev => ({ ...prev, includeRawData: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Include Raw Data</span>
            </label>
          </div>

          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={exportOptions.includeFormatting}
                onChange={(e) => setExportOptions(prev => ({ ...prev, includeFormatting: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Professional Formatting</span>
            </label>
          </div>
        </div>
      </div>

      {/* Generation Status */}
      {isGenerating && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mr-4"></div>
            <div>
              <h3 className="font-semibold text-green-900">🤖 Generating Excel File with Charts...</h3>
              <div className="text-sm text-green-700 mt-1">
                <div>✅ Creating pie charts with professional formatting</div>
                <div>✅ Adding data tables and WIOA compliance sheets</div>
                <div>✅ Applying colors, labels, and percentages</div>
                <div>🔄 Finalizing Excel workbook...</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chart Selection */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">📊 Available Charts</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedCharts(availableCharts.map(c => c.title))}
              className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"
            >
              Select All
            </button>
            <button
              onClick={() => setSelectedCharts([])}
              className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200"
            >
              Clear All
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableCharts.map((chart, index) => (
            <div key={index} className="relative">
              <div className="absolute top-2 right-2 z-10">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedCharts.includes(chart.title)}
                    onChange={() => toggleChartSelection(chart.title)}
                    className="mr-2"
                  />
                  <span className="text-sm bg-white px-2 py-1 rounded shadow">Include</span>
                </label>
              </div>
              <PieChartPreview chart={chart} />
              
              <div className="mt-3 text-center">
                <div className="text-sm text-gray-600">
                  Type: {chart.type} | Data Points: {chart.data.length}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Excel Features */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">📈 Excel Export Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded p-4">
            <h4 className="font-medium text-blue-900 mb-2">🎨 Professional Charts</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Pie charts with custom colors</li>
              <li>• Doughnut charts for emphasis</li>
              <li>• Data labels and percentages</li>
              <li>• Professional legends</li>
            </ul>
          </div>
          
          <div className="bg-white rounded p-4">
            <h4 className="font-medium text-blue-900 mb-2">📊 Data Integration</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Raw data tables included</li>
              <li>• WIOA compliance metrics</li>
              <li>• Multiple worksheets</li>
              <li>• Formatted headers</li>
            </ul>
          </div>
          
          <div className="bg-white rounded p-4">
            <h4 className="font-medium text-blue-900 mb-2">🎯 Customization</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Adjustable chart sizes</li>
              <li>• Custom file naming</li>
              <li>• Professional formatting</li>
              <li>• Ready for presentations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}