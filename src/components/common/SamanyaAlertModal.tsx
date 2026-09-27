import React, { useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { AlertCircle, AlertTriangle, CheckCircle2, HelpCircle, Info, Trash2, X } from 'lucide-react';

export const SamanyaAlertModal: React.FC = () => {
  const { alertModal, closeAlert } = useAdmin();

  const handleConfirm = () => {
    if (alertModal?.onConfirm) {
      alertModal.onConfirm();
    }
    closeAlert(true);
  };

  const handleCancel = () => {
    if (alertModal?.onCancel) {
      alertModal.onCancel();
    }
    closeAlert(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!alertModal?.isOpen) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        if (alertModal.isConfirm) {
          handleCancel();
        } else {
          handleConfirm();
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleConfirm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [alertModal]);

  if (!alertModal?.isOpen) return null;

  const type = alertModal.type || (alertModal.isConfirm ? 'info' : 'alert');

  const typeConfig: Record<string, {
    icon: React.ReactNode;
    iconBg: string;
    titleDefault: string;
    badge: string;
    badgeColor: string;
    accentColor: string;
    confirmBtnClass: string;
  }> = {
    danger: {
      icon: <Trash2 className="w-6 h-6 text-[#A4453A]" />,
      iconBg: 'bg-[#FBE8E6] border border-[#A4453A]/25 text-[#A4453A]',
      titleDefault: '¿Está seguro de continuar?',
      badge: 'Acción Crítica',
      badgeColor: 'bg-[#FBE8E6] text-[#A4453A] border-[#A4453A]/30',
      accentColor: 'border-l-4 border-l-[#A4453A]',
      confirmBtnClass: 'bg-[#A4453A] hover:bg-[#8B342A] text-white border border-[#A4453A]/50 shadow-md shadow-[#A4453A]/20'
    },
    alert: {
      icon: <AlertCircle className="w-6 h-6 text-[#A4453A]" />,
      iconBg: 'bg-[#FBE8E6] border border-[#A4453A]/25 text-[#A4453A]',
      titleDefault: 'Atención requerida',
      badge: 'Alerta',
      badgeColor: 'bg-[#FBE8E6] text-[#A4453A] border-[#A4453A]/30',
      accentColor: 'border-l-4 border-l-[#A4453A]',
      confirmBtnClass: 'bg-[#182F28] hover:bg-[#274A3F] text-[#DCB87F] border border-[#DCB87F]/30 shadow-md shadow-[#182F28]/20'
    },
    warning: {
      icon: <AlertTriangle className="w-6 h-6 text-[#B3803F]" />,
      iconBg: 'bg-[#FDF6E8] border border-[#B3803F]/25 text-[#B3803F]',
      titleDefault: 'Advertencia',
      badge: 'Aviso',
      badgeColor: 'bg-[#FDF6E8] text-[#B3803F] border-[#B3803F]/30',
      accentColor: 'border-l-4 border-l-[#B3803F]',
      confirmBtnClass: 'bg-[#182F28] hover:bg-[#274A3F] text-[#DCB87F] border border-[#DCB87F]/30 shadow-md shadow-[#182F28]/20'
    },
    info: {
      icon: alertModal.isConfirm ? <HelpCircle className="w-6 h-6 text-[#068591]" /> : <Info className="w-6 h-6 text-[#068591]" />,
      iconBg: 'bg-[#E3F4F6] border border-[#068591]/25 text-[#068591]',
      titleDefault: alertModal.isConfirm ? 'Confirmación requerida' : 'Información del sistema',
      badge: alertModal.isConfirm ? 'Confirmación' : 'Información',
      badgeColor: 'bg-[#E3F4F6] text-[#068591] border-[#068591]/30',
      accentColor: 'border-l-4 border-l-[#068591]',
      confirmBtnClass: 'bg-[#182F28] hover:bg-[#274A3F] text-[#DCB87F] border border-[#DCB87F]/30 shadow-md shadow-[#182F28]/20'
    },
    success: {
      icon: <CheckCircle2 className="w-6 h-6 text-[#1E7A4C]" />,
      iconBg: 'bg-[#DFF3E7] border border-[#1E7A4C]/25 text-[#1E7A4C]',
      titleDefault: 'Operación exitosa',
      badge: 'Completado',
      badgeColor: 'bg-[#DFF3E7] text-[#1E7A4C] border-[#1E7A4C]/30',
      accentColor: 'border-l-4 border-l-[#1E7A4C]',
      confirmBtnClass: 'bg-[#182F28] hover:bg-[#274A3F] text-[#DCB87F] border border-[#DCB87F]/30 shadow-md shadow-[#182F28]/20'
    }
  };

  const config = typeConfig[type] || typeConfig.info;

  const handleBackdropClick = () => {
    if (alertModal.isConfirm) {
      handleCancel();
    } else {
      handleConfirm();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-[#182F28]/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-white rounded-3xl max-w-md w-full border border-[#DEDBD1] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 ${config.accentColor}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con gradiente institucional y distinción estética */}
        <div className="px-6 py-4 bg-[#182F28] text-white flex items-center justify-between border-b border-[#274A3F]">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#DCB87F] animate-pulse"></span>
            <span className="text-xs font-serif font-bold tracking-wider text-[#DCB87F] uppercase">
              Samanya OS • Diálogo del Sistema
            </span>
          </div>
          <button
            type="button"
            onClick={handleBackdropClick}
            aria-label="Cerrar ventana"
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-[#CFC9B8] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contenido principal */}
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${config.iconBg}`}>
              {config.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${config.badgeColor}`}>
                  {config.badge}
                </span>
              </div>
              <h3 className="font-serif text-lg font-bold text-[#182F28] leading-tight">
                {alertModal.title || config.titleDefault}
              </h3>
            </div>
          </div>

          <div className="bg-[#FAF9F5] p-4.5 rounded-2xl border border-[#EBE7DF] shadow-xs">
            <p className="text-sm text-[#3E453C] leading-relaxed whitespace-pre-line font-medium">
              {alertModal.message}
            </p>
          </div>
        </div>

        {/* Footer con botones de confirmación o alerta estilizados */}
        <div className="px-6 py-4 bg-[#FAF9F5] border-t border-[#DEDBD1] flex flex-col-reverse sm:flex-row justify-end items-stretch sm:items-center gap-2.5">
          {alertModal.isConfirm && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-5 py-2.5 bg-white hover:bg-[#EBE7DF] text-[#4F574A] font-semibold rounded-xl border border-[#DEDBD1] hover:border-[#CDC8BA] transition-all flex items-center justify-center cursor-pointer text-sm shadow-xs active:scale-[0.98]"
            >
              <span>{alertModal.cancelText || 'Cancelar'}</span>
            </button>
          )}
          <button
            type="button"
            autoFocus
            onClick={handleConfirm}
            className={`px-6 py-2.5 font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-sm active:scale-[0.98] ${config.confirmBtnClass}`}
          >
            <span>{alertModal.confirmText || (alertModal.isConfirm ? 'Confirmar' : 'Aceptar')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
