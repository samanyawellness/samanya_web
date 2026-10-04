import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginadorTablaProps {
  paginaActual: number;
  totalPaginas: number;
  totalItems: number;
  itemsPorPagina: number;
  itemLabel: string;
  onCambiarPagina: (pagina: number) => void;
  className?: string;
}

export const PaginadorTabla: React.FC<PaginadorTablaProps> = ({
  paginaActual,
  totalPaginas,
  totalItems,
  itemsPorPagina,
  itemLabel,
  onCambiarPagina,
  className = ''
}) => {
  if (totalItems <= itemsPorPagina && totalPaginas <= 1) return null;

  const inicio = (paginaActual - 1) * itemsPorPagina + 1;
  const fin = Math.min(totalItems, paginaActual * itemsPorPagina);

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 bg-[#F7F6F2] border-t border-[#DEDBD1] text-xs ${className}`}
    >
      <div className="text-[#5C6058] font-mono">
        Mostrando <span className="font-bold text-[#182F28]">{inicio}</span> a{' '}
        <span className="font-bold text-[#182F28]">{fin}</span> de{' '}
        <span className="font-bold text-[#182F28]">{totalItems}</span> {itemLabel}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={paginaActual <= 1}
          onClick={() => onCambiarPagina(Math.max(1, paginaActual - 1))}
          className="px-3 py-1.5 rounded-xl border border-[#DEDBD1] bg-white text-[#182F28] hover:bg-[#EAE7DC] disabled:opacity-40 disabled:cursor-not-allowed transition-all font-semibold inline-flex items-center gap-1 shadow-2xs cursor-pointer"
          title="Página anterior"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Anterior</span>
        </button>

        <div className="flex items-center gap-1 px-2">
          <span className="font-mono font-bold text-[#182F28]">{paginaActual}</span>
          <span className="text-[#7A745F]">/</span>
          <span className="font-mono text-[#7A745F]">{totalPaginas || 1}</span>
        </div>

        <button
          type="button"
          disabled={paginaActual >= totalPaginas}
          onClick={() => onCambiarPagina(Math.min(totalPaginas, paginaActual + 1))}
          className="px-3 py-1.5 rounded-xl border border-[#DEDBD1] bg-white text-[#182F28] hover:bg-[#EAE7DC] disabled:opacity-40 disabled:cursor-not-allowed transition-all font-semibold inline-flex items-center gap-1 shadow-2xs cursor-pointer"
          title="Página siguiente"
        >
          <span>Siguiente</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
