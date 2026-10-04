import React from 'react';
import { LayoutGrid, List, Table } from 'lucide-react';

export type ViewMode = 'grid' | 'list' | 'table';

interface ViewModeSelectorProps {
  viewMode: ViewMode;
  onChange: (mode: ViewMode) => void;
  className?: string;
}

export const ViewModeSelector: React.FC<ViewModeSelectorProps> = ({
  viewMode,
  onChange,
  className = ''
}) => {
  return (
    <div className={`flex items-center p-1 bg-[#F7F6F2] rounded-xl border border-[#DEDBD1] ${className}`}>
      <button
        type="button"
        title="Vista en Tarjetas"
        onClick={() => onChange('grid')}
        className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
          viewMode === 'grid'
            ? 'bg-white text-[#182F28] shadow-xs'
            : 'text-[#7A745F] hover:text-[#182F28]'
        }`}
      >
        <LayoutGrid className="w-4 h-4" />
        <span className="hidden sm:inline">Tarjetas</span>
      </button>

      <button
        type="button"
        title="Vista en Lista"
        onClick={() => onChange('list')}
        className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
          viewMode === 'list'
            ? 'bg-white text-[#182F28] shadow-xs'
            : 'text-[#7A745F] hover:text-[#182F28]'
        }`}
      >
        <List className="w-4 h-4" />
        <span className="hidden sm:inline">Lista</span>
      </button>

      <button
        type="button"
        title="Vista en Tabla"
        onClick={() => onChange('table')}
        className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
          viewMode === 'table'
            ? 'bg-white text-[#182F28] shadow-xs'
            : 'text-[#7A745F] hover:text-[#182F28]'
        }`}
      >
        <Table className="w-4 h-4" />
        <span className="hidden sm:inline">Tabla</span>
      </button>
    </div>
  );
};
