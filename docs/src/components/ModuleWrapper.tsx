import type { ReactNode } from "react";
import { useTheme } from "../context/ThemeContext";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import HeightIcon from "@mui/icons-material/Height";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";

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

  const handlePopOut = () => {
    if (popOutUrl) {
      window.open(popOutUrl, "_blank", "noopener,noreferrer");
    }
  };

  const isDropTarget = dragOverIndex === index;

  const getColSpanClass = () => {
    if (maxColumns === 1) return "";
    switch (colSpan) {
      case 2:
        return "lg:col-span-2";
      case 3:
        return "xl:col-span-3";
      default:
        return "";
    }
  };

  const getRowSpanClass = () => {
    switch (rowSpan) {
      case 2:
        return "row-span-2";
      case 3:
        return "row-span-3";
      case 4:
        return "row-span-4";
      default:
        return "";
    }
  };

  const canIncreaseCol = colSpan < maxColumns;
  const canDecreaseCol = colSpan > 1;
  const canIncreaseRow = rowSpan < 4;
  const canDecreaseRow = rowSpan > 1;

  const SpanButton = ({
    onClick,
    disabled,
    title: btnTitle,
    children: btnChildren,
  }: {
    onClick: () => void;
    disabled: boolean;
    title: string;
    children: ReactNode;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        p-0.5 rounded transition-colors
        ${!disabled
          ? isDark
            ? "text-gray-300 hover:bg-gray-600"
            : "text-gray-600 hover:bg-gray-200"
          : isDark
            ? "text-gray-600 cursor-not-allowed"
            : "text-gray-300 cursor-not-allowed"
        }
      `}
      title={btnTitle}
    >
      {btnChildren}
    </button>
  );

  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={() => onDrop(index)}
      className={`
        relative w-full rounded-lg shadow-md transition-all duration-200 h-fit
        ${isDark ? "bg-gray-800" : "bg-white"}
        ${isDragging ? "opacity-50" : "opacity-100"}
        ${isDropTarget ? "ring-2 ring-blue-500 ring-offset-2" : ""}
        ${getColSpanClass()}
        ${getRowSpanClass()}
      `}
    >
      <div
        className={`
          flex items-center justify-between px-4 py-2 border-b rounded-t-lg cursor-grab active:cursor-grabbing
          ${isDark ? "border-gray-700 bg-gray-700" : "border-gray-200 bg-gray-50"}
        `}
      >
        <div className="flex items-center gap-2">
          <DragIndicatorIcon
            className={`${isDark ? "text-gray-400" : "text-gray-500"}`}
            fontSize="small"
          />
          <span className={`font-semibold ${isDark ? "text-gray-200" : "text-gray-700"}`}>
            {title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Span controls - only show when more than 1 column */}
          {maxColumns > 1 && (
            <div className="flex items-center gap-1">
              {/* Column span controls */}
              <SwapHorizIcon
                fontSize="small"
                className={`${isDark ? "text-gray-500" : "text-gray-400"}`}
              />
              <SpanButton
                onClick={() => canDecreaseCol && onSpanChange(colSpan - 1, rowSpan)}
                disabled={!canDecreaseCol}
                title="Decrease width"
              >
                <RemoveIcon fontSize="small" />
              </SpanButton>
              <span className={`text-xs min-w-[2ch] text-center ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                {colSpan}
              </span>
              <SpanButton
                onClick={() => canIncreaseCol && onSpanChange(colSpan + 1, rowSpan)}
                disabled={!canIncreaseCol}
                title="Increase width"
              >
                <AddIcon fontSize="small" />
              </SpanButton>

              <span className={`mx-1 ${isDark ? "text-gray-600" : "text-gray-300"}`}>|</span>

              {/* Row span controls */}
              <HeightIcon
                fontSize="small"
                className={`${isDark ? "text-gray-500" : "text-gray-400"}`}
              />
              <SpanButton
                onClick={() => canDecreaseRow && onSpanChange(colSpan, rowSpan - 1)}
                disabled={!canDecreaseRow}
                title="Decrease height"
              >
                <RemoveIcon fontSize="small" />
              </SpanButton>
              <span className={`text-xs min-w-[2ch] text-center ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                {rowSpan}
              </span>
              <SpanButton
                onClick={() => canIncreaseRow && onSpanChange(colSpan, rowSpan + 1)}
                disabled={!canIncreaseRow}
                title="Increase height"
              >
                <AddIcon fontSize="small" />
              </SpanButton>
            </div>
          )}
          {popOutUrl && (
            <button
              onClick={handlePopOut}
              className={`
                p-1 rounded hover:bg-opacity-20 transition-colors flex items-center gap-1 text-sm
                ${isDark ? "text-blue-400 hover:bg-blue-400" : "text-blue-600 hover:bg-blue-100"}
              `}
              title="Open in new window"
            >
              <OpenInNewIcon fontSize="small" />
              <span className="hidden sm:inline">Pop Out</span>
            </button>
          )}
        </div>
      </div>
      <div className="p-4 h-full">{children}</div>
    </div>
  );
}
