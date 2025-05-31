import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDocumentDetail } from '../hooks/useDocumentDetail';
import { ArrowLeft } from 'lucide-react';
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ScrollArea } from "./ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "./ui/table";
import InvoiceDetail from "./InvoiceDetail";

const DocumentDetail = () => {
  const { fileId } = useParams();
  const navigate = useNavigate();
  const userId = localStorage.getItem("userID");
  const { documentData, loading, error } = useDocumentDetail(userId, fileId);

  const handleChange = (e, index, field) => {
    const { value } = e.target;
    if (index !== undefined) {
      const updatedItems = [...documentData.extractedData.items];
      updatedItems[index][field].value = value;
      setDocumentData((prevData) => ({
        ...prevData,
        extractedData: {
          ...prevData.extractedData,
          items: updatedItems
        }
      }));
    } else {
      setDocumentData((prevData) => ({
        ...prevData,
        extractedData: {
          ...prevData.extractedData,
          [field]: value
        }
      }));
    }
  };

  // Render function to iterate through fields and display badges if errors
  const renderNestedFields = (data, parentKey = "") => {
    const hasError = (key, value) => {
      return (
        (data.totalError && data.totalError.includes(key)) ||
        value?.error === true
      );
    };

    return Object.entries(data).map(([key, value]) => {
      const isError = hasError(key, value);
      const textColorClass = isError ? "text-red-500" : "text-black";
      const uniqueKey = parentKey ? `${parentKey}-${key}` : key;

      if (key === "error" || key === "totalError") {
        return null;
      }

      if (typeof value === "object" && !Array.isArray(value) && value !== null) {
        return (
          <div key={uniqueKey} className="space-y-1 p-2">
            <div className="flex flex-row justify-between items-center">
              <Label
                htmlFor={key}
                className={`text-sm font-medium ${textColorClass}`}
              >
                {key.replace(/_/g, " ").toUpperCase()}
              </Label>
              {isError && (
                <Badge variant="outline" className="text-red-500 px-3 py-1">
                  Error
                </Badge>
              )}
            </div>
            <div className="space-y-2">
              {renderNestedFields(value, uniqueKey)}
            </div>
          </div>
        );
      }

      if (Array.isArray(value)) {
        return (
          <div key={uniqueKey} className="space-y-1 p-2">
            <div className="flex flex-row justify-between items-center">
              <Label
                htmlFor={key}
                className={`text-sm font-medium ${textColorClass}`}
              >
                {key.replace(/_/g, " ").toUpperCase()}
              </Label>
              {isError && (
                <Badge variant="outline" className="text-red-500 px-3 py-1">
                  Error
                </Badge>
              )}
            </div>
            <div className="space-y-2">
              {value.map((item, index) => (
                <div key={`${uniqueKey}-item-${index}`} className="space-y-1">
                  {renderNestedFields(item, `${uniqueKey}-${index}`)}
                </div>
              ))}
            </div>
          </div>
        );
      }

      return (
        <div key={uniqueKey} className="space-y-1 p-2">
          <div className="flex flex-row justify-between items-center">
            <Label
              htmlFor={key}
              className={`text-sm font-medium ${textColorClass}`}
            >
              {key === "value" ? null : key.replace(/_/g, " ").toUpperCase()}
            </Label>
            {isError && (
              <Badge variant="outline" className="text-red-500 px-3 py-1">
                Error
              </Badge>
            )}
          </div>
          <Input
            id={key}
            name={key}
            value={value?.value || value || ""}
            onChange={(e) => handleChange(e, null, key)}
            className={`mt-1 ${isError ? "text-red-500" : ""}`}
          />
        </div>
      );
    });
  };

  // Render the items table
  const renderItemsTable = (items) => {
    if (!Array.isArray(items) || items.length === 0) {
      return null;
    }

    const headers = Object.keys(items[0]).filter(
      (key) => key !== "confidenceLevel" && key !== "error"
    );

    return (
      <div className="mt-4 overflow-x-auto">
        <div className="min-w-max">
          <Table>
            <TableHeader>
              <TableRow>
                {headers.map((header, index) => (
                  <TableCell key={index}>{header}</TableCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, rowIndex) => (
                <TableRow key={rowIndex}>
                  {headers.map((header, cellIndex) => (
                    <TableCell key={`${rowIndex}-${cellIndex}`}>
                      <Input
                        value={item[header]?.value || item[header] || ""}
                        onChange={(e) => handleChange(e, rowIndex, header)}
                        className="w-full"
                      />
                      {item[header]?.error && (
                        <Badge
                          variant="outline"
                          className="text-red-500 px-3 py-1"
                        >
                          Error
                        </Badge>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        Error loading document: {error}
      </div>
    );
  }

  const { fileUrl, extractedData, metadata } = documentData;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full p-6 bg-gray-50">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-primary mb-6 hover:underline self-start"
      >
        <ArrowLeft size={20} className="mr-2" />
        Back to Dashboard
      </button>

      <div className="w-full flex flex-row gap-6 h-[calc(100vh-8rem)]">
        {/* Left: File Preview */}
        <div className="w-2/3 flex flex-col">
          <div className="flex-grow bg-white rounded-2xl shadow-xl border border-gray-200 p-6 overflow-hidden">
            <h2 className="text-xl font-bold mb-4">Document Preview</h2>
            <div className="w-fullbg-gray-100 rounded-lg overflow-auto h-full flex items-center justify-center">
              {metadata?.fileType?.includes('pdf') ? (
                <iframe 
                  src={fileUrl} 
                  className="block mx-auto max-h-full max-w-full"
                  style={{ minHeight: 0 }}
                  title="PDF Preview"
                />
              ) : (
                <img 
                  src={fileUrl} 
                  alt={metadata?.fileName}
                  className="block mx-auto max-h-full max-w-full object-contain"
                  style={{ minHeight: 0 }}
                />
              )}
            </div>
            <div className="mt-4">
              <h3 className="font-semibold">{metadata?.fileName}</h3>
              <p className="text-sm text-muted-foreground">
                Uploaded on {new Date(metadata?.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Extracted Data */}
        <div className="w-1/3 flex flex-col">
          <div className="flex-grow bg-white rounded-2xl shadow-xl border border-gray-200 p-6 overflow-auto w-full">
            <InvoiceDetail invoice={extractedData} fullWidth />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentDetail;