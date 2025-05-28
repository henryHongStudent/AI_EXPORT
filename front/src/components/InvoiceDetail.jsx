import React, { useState, useEffect } from "react";
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
import { AlertCircle, FileText } from "lucide-react";

const InvoiceDetail = ({ invoice }) => {
  const [invoiceData, setInvoiceData] = useState(invoice);

  useEffect(() => {
    setInvoiceData(invoice);
  }, [invoice]);


  const handleChange = (e, index, field) => {
    const { value } = e.target;
    if (index !== undefined) {
      const updatedItems = [...invoiceData.items];
      updatedItems[index][field].value = value;
      setInvoiceData((prevData) => ({
        ...prevData,
        items: updatedItems,
      }));
    } else {
      setInvoiceData((prevData) => ({
        ...prevData,
        [field]: value,
      }));
    }
  };

  // confidenceLevel
  const confidence = invoiceData?.total?.confidenceLevel ?? invoiceData?.confidenceLevel;

  // Render function to iterate through fields and display badges if errors
  const renderNestedFields = (data, parentKey = "") => {
    const hasError = (key, value) => {
      // Check if the field has an error
      return (
        (invoiceData.totalError && invoiceData.totalError.includes(key)) ||
        value?.error === true
      );
    };

    return Object.entries(data).map(([key, value]) => {
      const isError = hasError(key, value);
      const textColorClass = isError ? "text-red-500" : "text-gray-700";
      const uniqueKey = parentKey ? `${parentKey}-${key}` : key;

      if (key === "error" || key === "items" || key === "totalError" || key === "accuracy") {
        return null;
      }

      if (
        typeof value === "object" &&
        !Array.isArray(value) &&
        value !== null
      ) {
        // If value is an object, process recursively
        return (
          <div key={uniqueKey} className="space-y-2 p-3 bg-gray-50 rounded-lg">
            <div className="flex flex-row justify-between items-center">
              <Label
                htmlFor={key}
                className={`text-sm font-semibold ${textColorClass}`}
              >
                {key.replace(/_/g, " ").toUpperCase()}
              </Label>
              {isError && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Error
                </Badge>
              )}
            </div>
            <div className="space-y-3 pl-2 border-l-2 border-gray-200">
              {renderNestedFields(value, uniqueKey)}
            </div>{" "}
            {/* Recursive call */}
          </div>
        );
      }

      if (Array.isArray(value)) {
        // If value is an array, render each item
        return (
          <div key={uniqueKey} className="space-y-2 p-3 bg-gray-50 rounded-lg">
            <div className="flex flex-row justify-between items-center">
              <Label
                htmlFor={key}
                className={`text-sm font-semibold ${textColorClass}`}
              >
                {key.replace(/_/g, " ").toUpperCase()}
              </Label>
              {isError && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Error
                </Badge>
              )}
            </div>
            <div className="space-y-3 pl-2 border-l-2 border-gray-200">
              {value.map((item, index) => (
                <div key={`${uniqueKey}-item-${index}`} className="space-y-2">
                  {renderNestedFields(item, `${uniqueKey}-${index}`)}{" "}
                  {/* Recursive call for array items */}
                </div>
              ))}
            </div>
          </div>
        );
      }

      // Default case for non-object, non-array values
      return (
        <div key={uniqueKey} className="space-y-2">
          <div className="flex flex-row justify-between items-center">
            <Label
              htmlFor={key}
              className={`text-sm font-medium ${textColorClass}`}
            >
              {key === "value" ? null : key.replace(/_/g, " ").toUpperCase()}
            </Label>
            {isError && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Error
              </Badge>
            )}
          </div>
          <Input
            id={key}
            name={key}
            value={value?.value || value || ""}
            onChange={(e) => handleChange(e, null, key)}
            className={`${isError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
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
      <div className="mt-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-800">Items</h2>
        </div>
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                {headers.map((header, index) => (
                  <TableCell key={index} className="font-semibold text-gray-700">
                    {header.toUpperCase()}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, rowIndex) => (
                <TableRow key={rowIndex} className="hover:bg-gray-50">
                  {headers.map((header, cellIndex) => (
                    <TableCell key={`${rowIndex}-${cellIndex}`}>
                      <div className="space-y-1">
                        <Input
                          value={item[header]?.value || item[header] || ""}
                          onChange={(e) => handleChange(e, rowIndex, header)}
                          className={`w-full ${
                            item[header]?.error
                              ? "border-red-500 focus-visible:ring-red-500"
                              : ""
                          }`}
                        />
                        {item[header]?.error && (
                          <Badge
                            variant="destructive"
                            className="flex items-center gap-1 text-xs"
                          >
                            <AlertCircle className="w-3 h-3" />
                            Error
                          </Badge>
                        )}
                      </div>
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

  return (
    <div className="w-[450px] space-y-6">
      <div className="flex flex-row justify-between items-center px-4 gap-2">
        <div className="flex gap-2 items-center">
          {invoiceData.documentType && (
            <Badge variant="secondary" className="text-sm px-3 py-1">
              {invoiceData.documentType}
            </Badge>
          )}
          {invoiceData.accuracy && (
            <Badge variant="outline" className="text-sm px-3 py-1 border-primary text-primary">
              Accuracy: {invoiceData.accuracy}%
            </Badge>
          )}
        </div>
        {invoiceData.totalError && invoiceData.totalError.length > 0 && (
          <Badge
            variant="destructive"
            className="flex items-center gap-1 px-3 py-1"
          >
            <AlertCircle className="w-4 h-4" />
            {invoiceData.totalError.length} errors found
          </Badge>
        )}
      </div>

      <ScrollArea className="h-[calc(100vh-16rem)]">
        <div className="px-4 space-y-6">
          {renderNestedFields(invoiceData)}
          {invoiceData.items && renderItemsTable(invoiceData.items)}
        </div>
      </ScrollArea>
    </div>
  );
};

export default InvoiceDetail;
