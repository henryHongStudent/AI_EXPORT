import React from "react";
import { 
  FileText, 
  BarChart3, 
  Check, 
  AlertTriangle, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight 
} from "lucide-react";

// 예시 데이터
const dashboardData = {
  totalFiles: {
    count: 156,
    change: 12,
    increasedSinceLastWeek: true
  },
  processedToday: {
    count: 8,
    change: 3,
    increasedSinceLastWeek: true
  },
  averageAccuracy: {
    percentage: 94.7,
    change: 1.2,
    increasedSinceLastWeek: true
  },
  pendingFiles: {
    count: 3,
    change: 2,
    increasedSinceLastWeek: false
  },
  processingTime: {
    seconds: 2.4,
    change: 0.3,
    increasedSinceLastWeek: false
  },
  chartData: [65, 72, 86, 81, 56, 78, 94, 78, 62, 88, 92, 95]
};

const DashboardCard = ({ title, value, icon, footer, footerColor, footerIcon }) => {
  return (
    <div className="bg-card rounded-xl shadow-sm border p-6 h-full">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-muted-foreground text-sm">{title}</p>
          <h3 className="text-3xl font-bold mt-2">{value}</h3>
        </div>
        <div className="p-3 rounded-full bg-primary/10 text-primary">
          {icon}
        </div>
      </div>
      <div className={`mt-4 flex items-center text-sm ${footerColor}`}>
        {footerIcon}
        <span className="ml-1">{footer}</span>
      </div>
    </div>
  );
};

const DashboardCards = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* 총 처리 파일 */}
        <DashboardCard 
          title="Total Files Processed"
          value={dashboardData.totalFiles.count}
          icon={<FileText size={20} />}
          footer={`${dashboardData.totalFiles.change}% increase from last week`}
          footerColor="text-green-600"
          footerIcon={<ArrowUpRight size={16} />}
        />

        {/* 오늘 처리된 파일 */}
        <DashboardCard 
          title="Processed Today"
          value={dashboardData.processedToday.count}
          icon={<Check size={20} />}
          footer={`${dashboardData.processedToday.change} more than yesterday`}
          footerColor="text-green-600"
          footerIcon={<ArrowUpRight size={16} />}
        />

        {/* 평균 정확도 */}
        <DashboardCard 
          title="Average OCR Accuracy"
          value={`${dashboardData.averageAccuracy.percentage}%`}
          icon={<BarChart3 size={20} />}
          footer={`${dashboardData.averageAccuracy.change}% higher than last week`}
          footerColor="text-green-600"
          footerIcon={<ArrowUpRight size={16} />}
        />

        {/* 대기 중인 파일 */}
        <DashboardCard 
          title="Pending Files"
          value={dashboardData.pendingFiles.count}
          icon={<AlertTriangle size={20} />}
          footer={`${dashboardData.pendingFiles.change} less than last week`}
          footerColor="text-green-600"
          footerIcon={<ArrowDownRight size={16} />}
        />

        {/* 평균 처리 시간 */}
        <DashboardCard 
          title="Average Processing Time"
          value={`${dashboardData.processingTime.seconds}s`}
          icon={<Clock size={20} />}
          footer={`${dashboardData.processingTime.change}s faster than last week`}
          footerColor="text-green-600"
          footerIcon={<ArrowDownRight size={16} />}
        />
      </div>

      {/* 정확도 트렌드 차트 */}
      <div className="bg-card rounded-xl shadow-sm border p-6 mt-6">
        <h3 className="text-lg font-semibold mb-4">OCR Accuracy Trend</h3>
        <div className="h-64 w-full">
          <div className="flex items-end justify-between h-48 w-full">
            {dashboardData.chartData.map((value, index) => (
              <div key={index} className="flex flex-col items-center mx-1 h-full">
                <div 
                  className="bg-primary rounded-t w-6 md:w-8" 
                  style={{ height: `${value}%` }} 
                />
                <span className="text-xs mt-2 text-muted-foreground">{index + 1}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4">
            <span className="text-sm text-muted-foreground">Last 12 weeks</span>
            <span className="text-sm font-medium text-green-600">+5.2% overall increase</span>
          </div>
        </div>
      </div>

      {/* 최근 처리된 문서 테이블 */}
      <div className="bg-card rounded-xl shadow-sm border p-6 mt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Recently Processed Documents</h3>
          <button className="text-sm text-primary">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-muted-foreground text-sm">
                <th className="text-left py-3 font-medium">Document Name</th>
                <th className="text-left py-3 font-medium">Date</th>
                <th className="text-left py-3 font-medium">OCR Accuracy</th>
                <th className="text-left py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-3">Invoice_A1234.pdf</td>
                <td className="py-3">Today, 10:30 AM</td>
                <td className="py-3">98.2%</td>
                <td className="py-3"><span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Completed</span></td>
              </tr>
              <tr className="border-b">
                <td className="py-3">Contract_B5678.pdf</td>
                <td className="py-3">Today, 9:15 AM</td>
                <td className="py-3">95.7%</td>
                <td className="py-3"><span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Completed</span></td>
              </tr>
              <tr className="border-b">
                <td className="py-3">Report_C9012.pdf</td>
                <td className="py-3">Yesterday, 4:45 PM</td>
                <td className="py-3">91.3%</td>
                <td className="py-3"><span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Completed</span></td>
              </tr>
              <tr className="border-b">
                <td className="py-3">Receipt_D3456.pdf</td>
                <td className="py-3">Yesterday, 2:30 PM</td>
                <td className="py-3">89.9%</td>
                <td className="py-3"><span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Review</span></td>
              </tr>
              <tr>
                <td className="py-3">Form_E7890.pdf</td>
                <td className="py-3">Yesterday, 11:20 AM</td>
                <td className="py-3">93.5%</td>
                <td className="py-3"><span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Completed</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardCards; 