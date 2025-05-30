import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  BarChart3,
  Check,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useDashboardData } from "../hooks/useDashboardData";

const DashboardCard = ({
  title,
  value,
  icon,
  footer,
  footerColor,
  footerIcon,
}) => {
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
  const navigate = useNavigate();
  const userId = localStorage.getItem("userID");
  const { dashboardData, loading, error } = useDashboardData(userId);

  const handleRowClick = (fileId) => {
    navigate(`/document/${fileId}`);
  };

  if (!userId) {
    return (
      <div className="text-red-500 text-center p-4">
        Error: User ID not found. Please log in again.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        Error loading dashboard data: {error}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Total processed files */}
        <DashboardCard
          title="Total Files Processed"
          value={dashboardData.totalFiles.count}
          icon={<FileText size={20} />}
          footer={`${dashboardData.totalFiles.change}% ${
            dashboardData.totalFiles.increasedSinceLastWeek
              ? "increase"
              : "decrease"
          } from last week`}
          footerColor={
            dashboardData.totalFiles.increasedSinceLastWeek
              ? "text-green-600"
              : "text-red-600"
          }
          footerIcon={
            dashboardData.totalFiles.increasedSinceLastWeek ? (
              <ArrowUpRight size={16} />
            ) : (
              <ArrowDownRight size={16} />
            )
          }
        />

        {/* Files processed today */}
        <DashboardCard
          title="Processed Today"
          value={dashboardData.processedToday.count}
          icon={<Check size={20} />}
          footer={`${dashboardData.processedToday.change} more than yesterday`}
          footerColor={
            dashboardData.processedToday.increasedSinceLastWeek
              ? "text-green-600"
              : "text-red-600"
          }
          footerIcon={
            dashboardData.processedToday.increasedSinceLastWeek ? (
              <ArrowUpRight size={16} />
            ) : (
              <ArrowDownRight size={16} />
            )
          }
        />

        {/* Average accuracy */}
        <DashboardCard
          title="Average OCR Accuracy"
          value={`${dashboardData.averageAccuracy.percentage}%`}
          icon={<BarChart3 size={20} />}
          footer={`${dashboardData.averageAccuracy.change}% ${
            dashboardData.averageAccuracy.increasedSinceLastWeek
              ? "higher"
              : "lower"
          } than last week`}
          footerColor={
            dashboardData.averageAccuracy.increasedSinceLastWeek
              ? "text-green-600"
              : "text-red-600"
          }
          footerIcon={
            dashboardData.averageAccuracy.increasedSinceLastWeek ? (
              <ArrowUpRight size={16} />
            ) : (
              <ArrowDownRight size={16} />
            )
          }
        />
      </div>

      {/* Recently processed documents table */}
      <div className="bg-card rounded-xl shadow-sm border p-6 mt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            Recently Processed Documents
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-muted-foreground text-sm">
                <th className="text-left py-3 font-medium">Document Name</th>
                <th className="text-left py-3 font-medium">Date</th>
                <th className="text-left py-3 font-medium">Accuracy</th>
                <th className="text-left py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.recentDocuments.map((doc, index) => (
                <tr
                  key={index}
                  className="border-b  cursor-pointer transition-colors"
                  onClick={() => handleRowClick(doc.fileId)}
                >
                  <td className="py-3">{doc.fileName}</td>
                  <td className="py-3">
                    {new Date(doc.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3">{doc.accuracy}%</td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        doc.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : doc.status === "review"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardCards;
