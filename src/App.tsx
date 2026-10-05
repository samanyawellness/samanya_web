import React from 'react';
import { AdminProvider, useAdmin } from './context/AdminContext';
import { AdminSidebar } from './components/layout/AdminSidebar';
import { AdminHeader } from './components/layout/AdminHeader';
import { ToastNotification } from './components/common/ToastNotification';
import { SamanyaAlertModal } from './components/common/SamanyaAlertModal';

// Views
import { DashboardView } from './components/views/DashboardView';
import { ResidentsView } from './components/views/ResidentsView';
import { FamilyMembersView } from './components/views/FamilyMembersView';
import { WorkersView } from './components/views/WorkersView';
import { ShiftsView } from './components/views/ShiftsView';
import { LeavesView } from './components/views/LeavesView';
import { ClinicalSupervisionView } from './components/views/ClinicalSupervisionView';
import { InventoryView } from './components/views/InventoryView';
import { AlimentacionView } from './components/views/AlimentacionView';

// Modals
import { RegisterResidentModal } from './components/modals/RegisterResidentModal';
import { RegisterFamilyModal } from './components/modals/RegisterFamilyModal';
import { RegisterWorkerModal } from './components/modals/RegisterWorkerModal';
import { RegisterLeaveModal } from './components/modals/RegisterLeaveModal';
import { RegisterIncidentModal } from './components/modals/RegisterIncidentModal';
import { ResidentDetailModal } from './components/modals/ResidentDetailModal';
import { EditResidentModal } from './components/modals/EditResidentModal';
import { EditWorkerModal } from './components/modals/EditWorkerModal';
import { EditFamilyModal } from './components/modals/EditFamilyModal';
import { EditSedeModal } from './components/modals/EditSedeModal';
import { GestionDotacionModal } from './components/modals/GestionDotacionModal';
import { SolicitarDotacionModal } from './components/modals/SolicitarDotacionModal';
import { ProgramarTurnosModal } from './components/modals/ProgramarTurnosModal';
import { UserProfileModal } from './components/modals/UserProfileModal';
import { FichaTecnicaIngresoModal } from './components/modals/FichaTecnicaIngresoModal';
// import { SamanyaAiChat } from './components/chat/SamanyaAiChat';
import { LoginView } from './components/views/LoginView';

const AdminLayout: React.FC = () => {
  const { activeTab } = useAdmin();

  return (
    <div className="flex min-h-screen bg-[#F7F6F2] text-[#26241F]">
      {/* Barra lateral de navegación */}
      <AdminSidebar />

      {/* Área de contenido principal */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />

        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'residentes' && <ResidentsView />}
          {activeTab === 'familiares' && <FamilyMembersView />}
          {activeTab === 'trabajadores' && <WorkersView />}
          {activeTab === 'turnos' && <ShiftsView />}
          {activeTab === 'permisos' && <LeavesView />}
          {activeTab === 'clinico' && <ClinicalSupervisionView />}
          {activeTab === 'inventario' && <InventoryView />}
          {activeTab === 'alimentacion' && <AlimentacionView />}
        </main>
      </div>

      {/* Modales de Registro y Detalle */}
      <RegisterResidentModal />
      <RegisterFamilyModal />
      <RegisterWorkerModal />
      <RegisterLeaveModal />
      <RegisterIncidentModal />
      <ResidentDetailModal />
      <FichaTecnicaIngresoModal />
      <GestionDotacionModal />
      <SolicitarDotacionModal />
      <ProgramarTurnosModal />

      {/* Modales de Edición */}
      <EditResidentModal />
      <EditWorkerModal />
      <EditFamilyModal />
      <EditSedeModal />
      <UserProfileModal />

      {/* Notificaciones Flotantes y Diálogos con Estilo Samanya */}
      <ToastNotification />
      <SamanyaAlertModal />

      {/* Asistente Virtual Inteligente con OpenRouter (Oculto) */}
      {/* <SamanyaAiChat /> */}
    </div>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAdmin();

  if (!isAuthenticated) {
    return (
      <>
        <LoginView />
        <ToastNotification />
        <SamanyaAlertModal />
      </>
    );
  }

  return <AdminLayout />;
};

export const App: React.FC = () => {
  return (
    <AdminProvider>
      <AppContent />
    </AdminProvider>
  );
};

export default App;
