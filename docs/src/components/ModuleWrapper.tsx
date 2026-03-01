import type { ReactNode } from "react";
import { useTheme } from "../context/ThemeContext";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";

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
}: ModuleWrapperProps) {
  const { isDark } = useTheme();

  const handlePopOut = () => {
    if (popOutUrl) {
      window.open(popOutUrl, "_blank", "noopener,noreferrer");
    }
  };

  const isDropTarget = dragOverIndex === index;

  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={() => onDrop(index)}
      className={`
        relative w-full max-w-3xl rounded-lg shadow-md transition-all duration-200
        ${isDark ? "bg-gray-800" : "bg-white"}
        ${isDragging ? "opacity-50" : "opacity-100"}
        ${isDropTarget ? "ring-2 ring-blue-500 ring-offset-2" : ""}
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
      <div className="p-4">{children}</div>
    </div>
  );
}
