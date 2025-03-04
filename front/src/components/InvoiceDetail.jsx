import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

const InvoiceDetail = ({ invoice }) => {
  const [invoiceData, setInvoiceData] = useState(invoice);

  useEffect(() => {
    setInvoiceData(invoice);
  }, [invoice]);

  console.log(invoiceData);
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

  // Render function to iterate through fields and display badges if errors
  const renderNestedFields = (data, parentKey = "") => {
    const hasError = (key, value) => {
      // 해당 필드가 에러가 있는지 확인
      return (
        (invoiceData.totalError && invoiceData.totalError.includes(key)) ||
        value?.error === true
      );
    };

    return Object.entries(data).map(([key, value]) => {
      const isError = hasError(key, value);
      const textColorClass = isError ? "text-red-500" : "text-black";
      const uniqueKey = parentKey ? `${parentKey}-${key}` : key;

      if (key === "error") {
        return null;
      }
      if (key === "items" || key === "totalError") {
        return null; // "items"와 "totalError"는 렌더링하지 않음
      }

      if (
        typeof value === "object" &&
        !Array.isArray(value) &&
        value !== null
      ) {
        // 값이 객체일 경우, 재귀적으로 처리
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
            </div>{" "}
            {/* 재귀 호출 */}
          </div>
        );
      }

      if (Array.isArray(value)) {
        // 값이 배열일 경우, 각 항목을 반복하여 렌더링
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
                  {renderNestedFields(item, `${uniqueKey}-${index}`)}{" "}
                  {/* 배열 항목에 대해 재귀 호출 */}
                </div>
              ))}
            </div>
          </div>
        );
      }

      // 기본적으로 필드가 객체나 배열이 아닌 값일 경우
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
                {headers.map((header, index) => {
                  return <TableCell key={index}>{header}</TableCell>;
                })}
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

  return (
    <>
      <div className="mb-4 flex flex-row justify-between w-[450px] px-3">
        {invoiceData.documentType && (
          <Badge variant="outline" className="text-base px-3 py-1">
            {invoiceData.documentType}
          </Badge>
        )}

        {invoiceData.totalError && invoiceData.totalError.length > 0 && (
          <Badge
            variant="outline"
            className="text-red-500 border border-red-500 px-3 py-1"
          >
            {invoiceData.totalError.length} errors found
          </Badge>
        )}
      </div>
      <ScrollArea className="w-[450px] rounded-md border p-4 h-full">
        <div className="w-[400px] space-y-4">
          {renderNestedFields(invoiceData)}

          {invoiceData.items && (
            <div>
              <h2 className="text-xl font-bold mb-2">Items</h2>
              {renderItemsTable(invoiceData.items)}
            </div>
          )}
        </div>
      </ScrollArea>
    </>
  );
};

export default InvoiceDetail;
