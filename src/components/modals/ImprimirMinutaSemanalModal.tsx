import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
  Printer,
  X,
  Copy,
  Check,
  Calendar,
  UtensilsCrossed,
  Building2,
  FileSpreadsheet,
  Coffee,
  Sun,
  Apple,
  Moon
} from 'lucide-react';
import { MinutaSemanal, MinutaItem } from '../../types';

interface ImprimirMinutaSemanalModalProps {
  isOpen: boolean;
  onClose: () => void;
  minuta: MinutaSemanal;
}

export const ImprimirMinutaSemanalModal: React.FC<ImprimirMinutaSemanalModalProps> = ({
  isOpen,
  onClose,
  minuta
}) => {
  const { activeSede, showToast } = useAdmin();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const comidas = [
    { id: 1, nombre: 'Desayuno', icon: <Coffee className="w-3.5 h-3.5 text-amber-600" /> },
    { id: 2, nombre: 'Almuerzo', icon: <Sun className="w-3.5 h-3.5 text-amber-500" /> },
    { id: 3, nombre: 'Merienda / Once', icon: <Apple className="w-3.5 h-3.5 text-emerald-600" /> },
    { id: 4, nombre: 'Cena', icon: <Moon className="w-3.5 h-3.5 text-indigo-500" /> }
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    let texto = `=======================================================\n`;
    texto += `SAMANYA WELLNESS - MINUTA SEMANAL GERIÁTRICA\n`;
    texto += `SEDE: ${activeSede.nombre} (${activeSede.ciudad})\n`;
    texto += `MINUTA: ${minuta.nombre}\n`;
    texto += `VIGENCIA: Del ${minuta.fechaInicio} al ${minuta.fechaFin}\n`;
    texto += `=======================================================\n\n`;

    dias.forEach((dia, idx) => {
      const diaNum = idx + 1;
      const itemsDia = (minuta.items || []).filter(i => i.diaSemana === diaNum);
      texto += `--- ${dia.toUpperCase()} ---\n`;
      if (itemsDia.length === 0) {
        texto += `Sin preparaciones específicas programadas.\n\n`;
      } else {
        itemsDia.forEach(item => {
          texto += `• [${item.tiempoComidaNombre}]: ${item.platoPrincipal}`;
          if (item.acompanamiento) texto += ` | Acomp: ${item.acompanamiento}`;
          if (item.bebida) texto += ` | Bebida: ${item.bebida}`;
          if (item.postre) texto += ` | Postre: ${item.postre}`;
          if (item.caloriasEstimadas) texto += ` (~${item.caloriasEstimadas} kcal)`;
          if (item.observacionesDietas) texto += ` [DIETAS: ${item.observacionesDietas}]`;
          texto += `\n`;
        });
        texto += `\n`;
      }
    });

    navigator.clipboard.writeText(texto);
    setCopied(true);
    showToast('Menú semanal copiado al portapapeles', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-5xl w-full border border-[#DEDBD1] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Modal - No impreso */}
        <div className="p-5 bg-[#182F28] text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#B3803F]/30 flex items-center justify-center text-[#DCB87F]">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-white">
                Ficha Semanal de Minuta Alimentaria
              </h3>
              <p className="text-xs text-[#DCB87F]">
                Vista optimizada para cocina, comedor y cartelera institucional
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado' : 'Copiar Texto'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#B3803F] hover:bg-[#9a6c32] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#CFC9B8] hover:text-white flex items-center justify-center transition-colors cursor-pointer ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Contenido Imprimible */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 print:p-0 print:m-0 print:overflow-visible">
          {/* Encabezado Institucional */}
          <div className="border-b-2 border-[#182F28] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#182F28] flex items-center justify-center text-[#DCB87F]">
                <UtensilsCrossed className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-serif text-xl font-bold text-[#182F28] tracking-tight">
                  SAMANYA WELLNESS RESIDENCIAL
                </h1>
                <p className="text-xs font-semibold text-[#7A745F]">
                  Protocolo Institucional de Nutrición y Alimentación Geriátrica
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <div className="text-xs font-bold text-[#182F28] flex items-center sm:justify-end gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#B3803F]" />
                <span>{activeSede.nombre}</span>
              </div>
              <div className="text-[11px] text-[#7A745F] font-mono">
                {activeSede.direccion} • {activeSede.ciudad}
              </div>
              <div className="text-[11px] font-bold text-[#9A5B12] mt-0.5">
                Vigencia: {minuta.fechaInicio} al {minuta.fechaFin}
              </div>
            </div>
          </div>

          {/* Título de la Minuta */}
          <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#DEDBD1]">
            <h2 className="font-serif text-base font-bold text-[#182F28]">
              {minuta.nombre}
            </h2>
            {minuta.descripcion && (
              <p className="text-xs text-[#7A745F] mt-1">
                {minuta.descripcion}
              </p>
            )}
          </div>

          {/* Matriz Semanal por Días */}
          <div className="space-y-4">
            {dias.map((dia, idx) => {
              const diaNum = idx + 1;
              const itemsDia = (minuta.items || []).filter(i => i.diaSemana === diaNum);

              return (
                <div key={dia} className="border border-[#DEDBD1] rounded-2xl overflow-hidden break-inside-avoid">
                  <div className="bg-[#182F28] text-white px-4 py-2 flex items-center justify-between">
                    <span className="font-serif font-bold text-sm text-[#DCB87F]">{dia}</span>
                    <span className="text-[11px] text-white/80 font-mono">
                      {itemsDia.length} preparaciones programadas
                    </span>
                  </div>

                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-[#FAF9F5]/40">
                    {comidas.map(tc => {
                      const item = itemsDia.find(i => i.idTiempoComida === tc.id);

                      return (
                        <div
                          key={tc.id}
                          className="bg-white p-3 rounded-xl border border-[#DEDBD1] space-y-1.5 flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between border-b border-[#DEDBD1]/60 pb-1 mb-1.5">
                              <span className="text-[10px] font-bold text-[#182F28] uppercase tracking-wider flex items-center gap-1 font-mono">
                                {tc.icon}
                                <span>{tc.nombre}</span>
                              </span>
                              {item?.caloriasEstimadas && (
                                <span className="text-[10px] text-[#7A745F] font-mono">
                                  ~{item.caloriasEstimadas} kcal
                                </span>
                              )}
                            </div>

                            {item ? (
                              <div className="space-y-1">
                                <div className="text-xs font-bold text-[#182F28]">
                                  {item.platoPrincipal}
                                </div>
                                {item.acompanamiento && (
                                  <div className="text-[10px] text-[#7A745F]">
                                    <strong>Acomp:</strong> {item.acompanamiento}
                                  </div>
                                )}
                                {item.bebida && (
                                  <div className="text-[10px] text-[#7A745F]">
                                    <strong>Bebida:</strong> {item.bebida}
                                  </div>
                                )}
                                {item.postre && (
                                  <div className="text-[10px] text-[#7A745F]">
                                    <strong>Postre:</strong> {item.postre}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-[10px] text-gray-400 italic py-2">
                                Menú estándar de ciclo
                              </div>
                            )}
                          </div>

                          {item?.observacionesDietas && (
                            <div className="mt-2 pt-1 border-t border-amber-200 text-[10px] text-amber-900 bg-amber-50 px-2 py-1 rounded-md font-medium">
                              {item.observacionesDietas}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Nota al pie y firmas */}
          <div className="pt-4 border-t border-[#DEDBD1] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#7A745F]">
            <div>
              <p className="font-semibold text-[#182F28]">Indicaciones Importantes para el Personal de Servicio:</p>
              <p className="text-[11px]">
                Adaptar texturas (puré, papilla, líquido espesado) según la tarjeta de dieta visible en cada bandeja.
              </p>
            </div>
            <div className="flex items-center gap-8 text-center pt-4 sm:pt-0">
              <div className="border-t border-gray-400 w-36 pt-1 text-[10px]">
                Nutricionista Dietista
              </div>
              <div className="border-t border-gray-400 w-36 pt-1 text-[10px]">
                Jefe de Cocina
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
