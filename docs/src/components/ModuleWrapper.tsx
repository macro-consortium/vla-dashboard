import { useState, useRef, useEffect } from "react";
import type { ReactNode } from "react";
import { useTheme } from "../context/ThemeContext";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import GridViewIcon from "@mui/icons-material/GridView";

interface ModuleWrapperProps {
  children: ReactNode;
  title: string;
  popOutUrl?: string;
  index: number;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (index: number) => void;
  isDragging: boolean;
  dragOverIndex: number | null;
  colSpan: number;
  rowSpan: number;
  maxColumns: number;
  onSpanChange: (col: number, row: number) => void;
}

interface SizePickerProps {
  currentCol: number;
  currentRow: number;
  maxColumns: number;
  maxRows: number;
  onSelect: (col: number, row: number) => void;
  onClose: () => void;
  isDark: boolean;
}

function SizePicker({ currentCol, currentRow, maxColumns, maxRows, onSelect, onClose, isDark }: SizePickerProps) {
  const [hoverCol, setHoverCol] = useState(currentCol);
  const [hoverRow, setHoverRow] = useState(currentRow);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={pickerRef}
      className={`absolute top-full right-0 mt-1 p-3 rounded-lg shadow-lg z-50 ${
        isDark ? "bg-gray-700 border border-gray-600" : "bg-white border border-gray-200"
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className={`text-xs mb-2 text-center ${isDark ? "text-gray-300" : "text-gray-600"}`}>
        Select size: {hoverCol} × {hoverRow}
      </div>
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${maxColumns}, 1fr)` }}>
        {Array.from({ length: maxRows }).map((_, rowIdx) =>
          Array.from({ length: maxColumns }).map((_, colIdx) => {
            const col = colIdx + 1;
            const row = rowIdx + 1;
            const isInSelection = col <= hoverCol && row <= hoverRow;
            const isCurrent = col === currentCol && row === currentRow;
            return (
              <button
                key={`${col}-${row}`}
                className={`w-6 h-6 rounded transition-all duration-100 border-2 ${
                  isInSelection
                    ? isDark
                      ? "bg-blue-500 border-blue-400"
                      : "bg-blue-500 border-blue-400"
                    : isDark
                    ? "bg-gray-600 border-gray-500 hover:border-gray-400"
                    : "bg-gray-100 border-gray-200 hover:border-gray-300"
                } ${isCurrent ? "ring-2 ring-offset-1 ring-blue-300" : ""}`}
                onMouseEnter={() => {
                  setHoverCol(col);
                  setHoverRow(row);
                }}
                onClick={() => {
                  onSelect(col, row);
                  onClose();
                }}
                title={`${col} wide × ${row} tall`}
              />
            );
          })
        )}
      </div>
      <div className={`text-xs mt-2 text-center ${isDark ? "text-gray-400" : "text-gray-500"}`}>
        Click to apply
      </div>
    </div>
  );
}

export default function ModuleWrapper({
  children,
  title,
  popOutUrl,
  index,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging,
  dragOverIndex,
  colSpan,
  rowSpan,
  maxColumns,
  onSpanChange,
}: ModuleWrapperProps) {
  const { isDark } = useTheme();
  const [showSizePicker, setShowSizePicker] = useState(false);
  const [isDragHandleHovered, setIsDragHandleHovered] = useState(false);

  const handlePopOut = () => {
    if (popOutUrl) {
      window.open(popOutUrl, "_blank", "noopener,noreferrer");
    }
  };

  const isDropTarget = dragOverIndex === index;

  const getColSpanClass = () => {
    if (maxColumns <= 2) return "";
    const spanClasses: Record<number, string> = {
      2: "col-span-2",
      3: "col-span-3",
      4: "col-span-4",
      5: "col-span-5",
      6: "col-span-6",
      7: "col-span-7",
      8: "col-span-8",
    };
    return spanClasses[colSpan] || "";
  };

  const getRowSpanClass = () => {
    const spanClasses: Record<number, string> = {
      2: "row-span-2",
      3: "row-span-3",
      4: "row-span-4",
      5: "row-span-5",
      6: "row-span-6",
    };
    return spanClasses[rowSpan] || "";
  };

  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={() => onDrop(index)}
      className={`
        relative w-full rounded-lg shadow-md transition-all duration-200 flex flex-col
        ${rowSpan > 1 ? "h-full" : "h-fit"}
        ${isDark ? "bg-gray-800" : "bg-white"}
        ${isDragging ? "opacity-50 scale-[0.98]" : "opacity-100"}
        ${isDropTarget ? "ring-2 ring-blue-500 ring-offset-2 scale-[1.02]" : ""}
        ${getColSpanClass()}
        ${getRowSpanClass()}
      `}
    >
      {/* Header bar */}
      <div
        className={`
          flex items-center justify-between px-3 py-2 border-b rounded-t-lg
          ${isDark ? "border-gray-700 bg-gray-700" : "border-gray-200 bg-gray-50"}
        `}
      >
        {/* Left side: drag handle + title */}
        <div
          className={`flex items-center gap-2 cursor-grab active:cursor-grabbing flex-1 min-w-0 ${
            isDragHandleHovered ? "opacity-70" : ""
          }`}
          onMouseEnter={() => setIsDragHandleHovered(true)}
          onMouseLeave={() => setIsDragHandleHovered(false)}
          title="Drag to reorder"
        >
          <div
            className={`p-1 rounded transition-colors ${
              isDragHandleHovered
                ? isDark
                  ? "bg-gray-600"
                  : "bg-gray-200"
                : ""
            }`}
          >
            <DragIndicatorIcon
              className={`${isDark ? "text-gray-400" : "text-gray-500"}`}
              fontSize="small"
            />
          </div>
          <span className={`font-semibold truncate ${isDark ? "text-gray-200" : "text-gray-700"}`}>
            {title}
          </span>
        </div>

        {/* Right side: controls */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Size picker button - only show when more than 1 column available */}
          {maxColumns > 1 && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSizePicker(!showSizePicker);
                }}
                className={`
                  p-1.5 rounded transition-colors flex items-center gap-1 text-xs
                  ${showSizePicker
                    ? isDark
                      ? "bg-blue-600 text-white"
                      : "bg-blue-500 text-white"
                    : isDark
                    ? "text-gray-300 hover:bg-gray-600"
                    : "text-gray-600 hover:bg-gray-200"
                  }
                `}
                title="Change size"
              >
                <GridViewIcon fontSize="small" />
                <span className="hidden sm:inline font-medium">
                  {colSpan}×{rowSpan}
                </span>
              </button>
              {showSizePicker && (
                <SizePicker
                  currentCol={colSpan}
                  currentRow={rowSpan}
                  maxColumns={maxColumns}
                  maxRows={6}
                  onSelect={onSpanChange}
                  onClose={() => setShowSizePicker(false)}
                  isDark={isDark}
                />
              )}
            </div>
          )}

          {popOutUrl && (
            <button
              onClick={handlePopOut}
              className={`
                p-1.5 rounded transition-colors flex items-center gap-1 text-sm
                ${isDark ? "text-blue-400 hover:bg-gray-600" : "text-blue-600 hover:bg-gray-200"}
              `}
              title="Open in new window"
            >
              <OpenInNewIcon fontSize="small" />
              <span className="hidden sm:inline">Pop Out</span>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={`p-4 ${rowSpan > 1 ? "flex-1 flex flex-col min-h-0" : ""}`}>{children}</div>

      {/* Visual drop indicator */}
      {isDropTarget && (
        <div className="absolute inset-0 pointer-events-none rounded-lg border-2 border-dashed border-blue-400 bg-blue-500/10" />
      )}
    </div>
  );
}
