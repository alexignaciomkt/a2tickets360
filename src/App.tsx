
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import Index from '@/pages/Index';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import RegisterOrganizerPage from '@/pages/RegisterOrganizerPage';
import CustomerDashboard from '@/pages/dashboard/CustomerDashboard';
import CustomerTickets from '@/pages/dashboard/CustomerTickets';
import CheckoutPage from '@/pages/CheckoutPage';
import VerifyEmailPage from '@/pages/auth/VerifyEmailPage';
import Settings from '@/pages/dashboard/Settings';
import OrganizerDashboard from '@/pages/dashboard/OrganizerDashboard';
import OrganizerEvents from '@/pages/dashboard/OrganizerEvents';
import OrganizerStore from '@/pages/dashboard/OrganizerStore';
import OrganizerAttendees from '@/pages/dashboard/OrganizerAttendees';
import OrganizerFinancial from '@/pages/dashboard/OrganizerFinancial';
import OrganizerReports from '@/pages/dashboard/OrganizerReports';
import OrganizerSettings from '@/pages/dashboard/OrganizerSettings';
import OrganizerStaff from '@/pages/dashboard/OrganizerStaff';
import OrganizerSuppliers from '@/pages/dashboard/OrganizerSuppliers';
import OrganizerStands from '@/pages/dashboard/OrganizerStands';
import OrganizerSponsors from '@/pages/dashboard/OrganizerSponsors';
import SupplierDetails from '@/pages/dashboard/SupplierDetails';
import StaffRolesPage from '@/pages/dashboard/StaffRolesPage';
import StaffFinancialPage from '@/pages/dashboard/StaffFinancialPage';
import TalentPoolPage from '@/pages/dashboard/TalentPoolPage';
import CreateEvent from '@/pages/dashboard/CreateEvent';
import TicketValidation from '@/pages/dashboard/TicketValidation';
import TicketDesigner from '@/pages/dashboard/TicketDesigner';
import SalesPoints from '@/pages/dashboard/SalesPoints';
import CheckinPage from '@/pages/dashboard/CheckinPage';
import ProducerFanPage from '@/pages/ProducerFanPage';
import ProducerCareersPage from '@/pages/ProducerCareersPage';
import EventsPage from '@/pages/EventsPage';
import EventDetailPage from '@/pages/EventDetailPage';
import ParaProdutores from '@/pages/ParaProdutores';
import WorkWithUs from '@/pages/WorkWithUs';
import StaffReaderPage from '@/pages/staff/StaffReaderPage';
import StaffPortalDashboard from '@/pages/staff/StaffPortalDashboard';
import WorkerProfilePage from '@/pages/staff/WorkerProfilePage';
import ProposalsPage from '@/pages/staff/ProposalsPage';
import AgendaPage from '@/pages/staff/AgendaPage';
import VisitorRegistrationPage from '@/pages/VisitorRegistrationPage';
import OrganizerVisitors from '@/pages/dashboard/OrganizerVisitors';

import BuyerProfilePage from '@/pages/BuyerProfilePage';
import MasterAdminPanel from '@/pages/dashboard/MasterAdminPanel';
import OrganizersManagement from '@/pages/dashboard/OrganizersManagement';
import FinancialDashboard from '@/pages/dashboard/FinancialDashboard';
import EventApprovalPage from '@/pages/dashboard/EventApprovalPage';
import ReportsPage from '@/pages/dashboard/ReportsPage';
import AlertsPage from '@/pages/dashboard/AlertsPage';
import PayoutManagement from '@/pages/dashboard/PayoutManagement';
import FinancialTransactions from '@/pages/dashboard/FinancialTransactions';
import CommissionsPage from '@/pages/dashboard/CommissionsPage';
import MasterSettings from '@/pages/dashboard/MasterSettings';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/register-organizer" element={<RegisterOrganizerPage />} />
              <Route path="/para-produtores" element={<ParaProdutores />} />
              <Route path="/work-with-us" element={<WorkWithUs />} />
              <Route path="/validador" element={<StaffReaderPage />} />
              <Route path="/auth/verify" element={<VerifyEmailPage />} />

              {/* User Dashboard */}
              <Route path="/dashboard" element={<CustomerDashboard />} />
              <Route path="/dashboard/tickets" element={<CustomerTickets />} />
              <Route path="/dashboard/tickets/:ticketId" element={<CustomerTickets />} />
              <Route path="/dashboard/settings" element={<Settings />} />

              {/* Checkout */}
              <Route path="/checkout/:eventId/:ticketId" element={<CheckoutPage />} />

              {/* Organizer Routes */}
              <Route path="/organizer" element={<Navigate to="/organizer/dashboard" replace />} />
              <Route path="/organizer/dashboard" element={<OrganizerDashboard />} />
              <Route path="/organizer/events" element={<OrganizerEvents />} />
              <Route path="/organizer/events/create" element={<CreateEvent />} />
              <Route path="/organizer/attendees" element={<OrganizerAttendees />} />
              <Route path="/organizer/events/:eventId/attendees" element={<OrganizerAttendees />} />
              <Route path="/organizer/staff" element={<OrganizerStaff />} />
              <Route path="/organizer/suppliers" element={<OrganizerSuppliers />} />
              <Route path="/organizer/suppliers/:id" element={<SupplierDetails />} />
              <Route path="/organizer/staff/roles" element={<StaffRolesPage />} />
              <Route path="/organizer/staff/financial" element={<StaffFinancialPage />} />
              <Route path="/organizer/staff/talent-pool" element={<TalentPoolPage />} />
              <Route path="/organizer/store" element={<OrganizerStore />} />
              <Route path="/organizer/financial" element={<OrganizerFinancial />} />
              <Route path="/organizer/reports" element={<OrganizerReports />} />
              <Route path="/organizer/settings" element={<OrganizerSettings />} />
              <Route path="/organizer/ticket-validation" element={<TicketValidation />} />
              <Route path="/organizer/ticket-designer" element={<TicketDesigner />} />
              <Route path="/organizer/sales-points" element={<SalesPoints />} />
              <Route path="/organizer/stands" element={<OrganizerStands />} />
              <Route path="/organizer/events/:eventId/stands" element={<OrganizerStands />} />
              <Route path="/organizer/sponsors" element={<OrganizerSponsors />} />
              <Route path="/organizer/events/:eventId/sponsors" element={<OrganizerSponsors />} />

              {/* Producer Fan Page (Facebook Replica) */}
              <Route path="/producer-fan/:slug" element={<ProducerFanPage />} />
              <Route path="/producer-page/:slug" element={<ProducerFanPage />} />

              {/* Profile area with History */}
              <Route path="/profile" element={<BuyerProfilePage />} />

              {/* Events */}
              <Route path="/events" element={<EventsPage />} />
              <Route path="/events/:id" element={<EventDetailPage />} />

              {/* Producer Individual Page */}
              <Route path="/producer/:slug" element={<ProducerFanPage />} />
              <Route path="/producer/:slug/careers" element={<ProducerCareersPage />} />

              {/* Master Admin Routes */}
              <Route path="/master" element={<MasterAdminPanel />} />
              <Route path="/master/organizers" element={<OrganizersManagement />} />
              <Route path="/master/financial" element={<FinancialDashboard />} />
              <Route path="/master/approve" element={<EventApprovalPage />} />
              <Route path="/master/reports" element={<ReportsPage />} />
              <Route path="/master/alerts" element={<AlertsPage />} />
              <Route path="/master/payouts" element={<PayoutManagement />} />
              <Route path="/master/transactions" element={<FinancialTransactions />} />
              <Route path="/master/commissions" element={<CommissionsPage />} />
              <Route path="/master/settings" element={<MasterSettings />} />
              <Route path="/organizer/events/edit/:eventId" element={<CreateEvent />} />
              <Route path="/organizer/events/:eventId" element={<Navigate to="/organizer/events/edit/:eventId" replace />} />

              {/* Visitor & Credentialing */}
              <Route path="/events/:eventId/register" element={<VisitorRegistrationPage />} />
              <Route path="/organizer/visitors" element={<OrganizerVisitors />} />
              <Route path="/organizer/events/:eventId/visitors" element={<OrganizerVisitors />} />

              {/* Staff Experience Portal (Phase 6) */}
              <Route path="/staff/portal" element={<StaffPortalDashboard />} />
              <Route path="/staff/portal/proposals" element={<ProposalsPage />} />
              <Route path="/staff/portal/agenda" element={<AgendaPage />} />
              <Route path="/staff/portal/financial" element={<StaffPortalDashboard />} />
              <Route path="/staff/portal/profile" element={<WorkerProfilePage />} />
            </Routes>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
