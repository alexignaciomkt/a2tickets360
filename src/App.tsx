
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthProvider';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { Toaster } from '@/components/ui/toaster';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Index from '@/pages/Index';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import RegisterChoicePage from '@/pages/RegisterChoicePage';
import RegisterOrganizerPage from '@/pages/RegisterOrganizerPage';
import LegalPage from '@/pages/LegalPage';
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
import OrganizerOnboarding from '@/pages/dashboard/OrganizerOnboarding';
import OrganizerPostManager from '@/pages/dashboard/OrganizerPostManager';
import OrganizerStaff from '@/pages/dashboard/OrganizerStaff';
import OrganizerSuppliers from '@/pages/dashboard/OrganizerSuppliers';
import OrganizerStands from '@/pages/dashboard/OrganizerStands';
import OrganizerSponsors from '@/pages/dashboard/OrganizerSponsors';
import SupplierDetails from '@/pages/dashboard/SupplierDetails';
import StaffRolesPage from '@/pages/dashboard/StaffRolesPage';
import StaffFinancialPage from '@/pages/dashboard/StaffFinancialPage';
import TalentPoolPage from '@/pages/dashboard/TalentPoolPage';
import CreateEvent from '@/pages/dashboard/CreateEvent';
import EventSuccessPage from '@/pages/dashboard/EventSuccessPage';
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
import OrganizerEventHub from '@/pages/dashboard/OrganizerEventHub';
import MesaRedeemPage from '@/pages/MesaRedeemPage';
import ExhibitorDashboard from '@/pages/dashboard/ExhibitorDashboard';
import ProductCheckoutPage from '@/pages/ProductCheckoutPage';
import CheckInPage from '@/pages/staff/CheckInPage';

import BuyerProfilePage from '@/pages/BuyerProfilePage';
import MasterAdminPanel from '@/pages/dashboard/MasterAdminPanel';
import FaqManagerPage from '@/pages/dashboard/FaqManagerPage';
import OrganizersManagement from '@/pages/dashboard/OrganizersManagement';
import FinancialDashboard from '@/pages/dashboard/FinancialDashboard';
import EventApprovalPage from '@/pages/dashboard/EventApprovalPage';
import ReportsPage from '@/pages/dashboard/ReportsPage';

import PayoutManagement from '@/pages/dashboard/PayoutManagement';
import FinancialTransactions from '@/pages/dashboard/FinancialTransactions';
import CommissionsPage from '@/pages/dashboard/CommissionsPage';
import MasterSettings from '@/pages/dashboard/MasterSettings';
import MasterWebhooks from '@/pages/dashboard/MasterWebhooks';
import MasterGlobalMailing from '@/pages/dashboard/MasterGlobalMailing';
import MasterFinancialBI from '@/pages/dashboard/MasterFinancialBI';
import MasterSiteManagement from '@/pages/dashboard/MasterSiteManagement';

import { AnimatePresence } from 'framer-motion';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <AppRoutes />
            <Toaster />
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* ═══ PUBLIC ROUTES ═══ */}
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterChoicePage />} />
        <Route path="/register/staff" element={<RegisterPage />} />
        <Route path="/register-organizer" element={<RegisterOrganizerPage />} />
        <Route path="/terms" element={<LegalPage slug="terms" />} />
        <Route path="/privacy" element={<LegalPage slug="privacy" />} />
        <Route path="/para-produtores" element={<ParaProdutores />} />
        <Route path="/work-with-us" element={<WorkWithUs />} />
        <Route path="/validador" element={<CheckInPage />} />
        <Route path="/staff/check-in/:eventId" element={<CheckInPage />} />
        <Route path="/auth/verify" element={<VerifyEmailPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />
        <Route path="/p/:slug" element={<ProducerFanPage />} />
        <Route path="/producer-fan/:slug" element={<ProducerFanPage />} />
        <Route path="/producer-page/:slug" element={<ProducerFanPage />} />
        <Route path="/producer/:slug" element={<ProducerFanPage />} />
        <Route path="/producer/:slug/careers" element={<ProducerCareersPage />} />
        <Route path="/events/:eventId/register" element={<VisitorRegistrationPage />} />

        {/* ═══ CUSTOMER ROUTES ═══ */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['customer', 'organizer', 'master']}>
            <CustomerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/tickets" element={
          <ProtectedRoute allowedRoles={['customer']}>
            <CustomerTickets />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/tickets/:ticketId" element={
          <ProtectedRoute allowedRoles={['customer']}>
            <CustomerTickets />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/settings" element={
          <ProtectedRoute allowedRoles={['customer', 'organizer', 'master']}>
            <Settings />
          </ProtectedRoute>
        } />
        <Route path="/checkout/:eventId/:ticketId" element={<CheckoutPage />} />
        <Route path="/checkout/product/:productId" element={<ProductCheckoutPage />} />
        <Route path="/profile" element={<BuyerProfilePage />} />

        {/* ═══ ORGANIZER ROUTES (requires approved status) ═══ */}
        <Route path="/organizer" element={<Navigate to="/organizer/dashboard" replace />} />
        <Route path="/organizer/dashboard" element={
          <ProtectedRoute allowedRoles={['organizer']}>
            <OrganizerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/organizer/events" element={
          <ProtectedRoute allowedRoles={['organizer']}>
            <OrganizerEvents />
          </ProtectedRoute>
        } />
        <Route path="/organizer/events/create" element={
          <ProtectedRoute allowedRoles={['organizer']}>
            <CreateEvent />
          </ProtectedRoute>
        } />
        <Route path="/organizer/events/edit/:eventId" element={
          <ProtectedRoute allowedRoles={['organizer']}>
            <CreateEvent />
          </ProtectedRoute>
        } />
        <Route path="/organizer/events/success/:id" element={
          <ProtectedRoute allowedRoles={['organizer']}>
            <EventSuccessPage />
          </ProtectedRoute>
        } />
        <Route path="/organizer/attendees" element={
          <ProtectedRoute allowedRoles={['organizer']}>
            <OrganizerAttendees />
          </ProtectedRoute>
        } />
        <Route path="/organizer/events/:eventId/attendees" element={
          <ProtectedRoute allowedRoles={['organizer']}>
            <OrganizerAttendees />
          </ProtectedRoute>
        } />
        <Route path="/organizer/event/:eventId/manage" element={
          <ProtectedRoute allowedRoles={['organizer']}>
            <OrganizerEventHub />
          </ProtectedRoute>
        } />
        <Route path="/organizer/staff" element={
          <ProtectedRoute allowedRoles={['organizer']}>
            <OrganizerStaff />
          </ProtectedRoute>
        } />
        <Route path="/organizer/suppliers" element={
          <ProtectedRoute allowedRoles={['organizer']}>
            <OrganizerSuppliers />
          </ProtectedRoute>
        } />
        <Route path="/organizer/suppliers/:id" element={
          <ProtectedRoute allowedRoles={['organizer']}>
            <SupplierDetails />
          </ProtectedRoute>
        } />
        <Route path="/organizer/staff/roles" element={
          <ProtectedRoute allowedRoles={['organizer']}>
            <StaffRolesPage />
          </ProtectedRoute>
        } />
        <Route path="/organizer/staff/financial" element={
          <ProtectedRoute allowedRoles={['organizer']}>
            <StaffFinancialPage />
          </ProtectedRoute>
        } />
        <Route path="/organizer/staff/talent-pool" element={
          <ProtectedRoute allowedRoles={['organizer']}>
            <TalentPoolPage />
          </ProtectedRoute>
        } />
        <Route path="/organizer/store" element={
          <ProtectedRoute allowedRoles={['organizer']}>
            <OrganizerStore />
          </ProtectedRoute>
        } />
        <Route path="/organizer/financial" element={
          <ProtectedRoute allowedRoles={['organizer']}>
            <OrganizerFinancial />
          </ProtectedRoute>
        } />
        <Route path="/organizer/reports" element={
          <ProtectedRoute allowedRoles={['organizer']}>
            <OrganizerReports />
          </ProtectedRoute>
        } />
        <Route path="/organizer/settings" element={
          <ProtectedRoute allowedRoles={['organizer']}>
            <OrganizerSettings />
          </ProtectedRoute>
        } />
        <Route path="/organizer/onboarding" element={
          <ProtectedRoute allowedRoles={['organizer']} requireApproved={false}>
            <OrganizerOnboarding />
          </ProtectedRoute>
        } />
        <Route path="/organizer/ticket-validation" element={
          <ProtectedRoute allowedRoles={['organizer']}>
            <TicketValidation />
          </ProtectedRoute>
        } />
        <Route path="/organizer/ticket-designer" element={
          <ProtectedRoute allowedRoles={['organizer']}>
            <TicketDesigner />
          </ProtectedRoute>
        } />
        <Route path="/organizer/sales-points" element={
          <ProtectedRoute allowedRoles={['organizer']}>
            <SalesPoints />
          </ProtectedRoute>
        } />
        <Route path="/organizer/stands" element={
          <ProtectedRoute allowedRoles={['organizer']}>
            <OrganizerStands />
          </ProtectedRoute>
        } />
        <Route path="/organizer/events/:eventId/stands" element={
          <ProtectedRoute allowedRoles={['organizer']}>
            <OrganizerStands />
          </ProtectedRoute>
        } />
        <Route path="/organizer/sponsors" element={
          <ProtectedRoute allowedRoles={['organizer']}>
            <OrganizerSponsors />
          </ProtectedRoute>
        } />
        <Route path="/organizer/events/:eventId/sponsors" element={
          <ProtectedRoute allowedRoles={['organizer']}>
            <OrganizerSponsors />
          </ProtectedRoute>
        } />
        <Route path="/organizer/visitors" element={
          <ProtectedRoute allowedRoles={['organizer']}>
            <OrganizerVisitors />
          </ProtectedRoute>
        } />
        <Route path="/organizer/events/:eventId/visitors" element={
          <ProtectedRoute allowedRoles={['organizer']}>
            <OrganizerVisitors />
          </ProtectedRoute>
        } />
        <Route path="/organizer/exhibitor" element={
          <ProtectedRoute allowedRoles={['organizer', 'exhibitor']}>
            <ExhibitorDashboard />
          </ProtectedRoute>
        } />

        {/* ═══ MASTER ADMIN ROUTES ═══ */}
        <Route path="/master" element={
          <ProtectedRoute allowedRoles={['master']}>
            <MasterAdminPanel />
          </ProtectedRoute>
        } />
        <Route path="/master/organizers" element={
          <ProtectedRoute allowedRoles={['master']}>
            <OrganizersManagement />
          </ProtectedRoute>
        } />
        <Route path="/master/financial" element={
          <ProtectedRoute allowedRoles={['master']}>
            <MasterFinancialBI />
          </ProtectedRoute>
        } />
        <Route path="/master/mailing" element={
          <ProtectedRoute allowedRoles={['master']}>
            <MasterGlobalMailing />
          </ProtectedRoute>
        } />
        <Route path="/master/approve" element={
          <ProtectedRoute allowedRoles={['master']}>
            <EventApprovalPage />
          </ProtectedRoute>
        } />
        <Route path="/master/webhooks" element={
          <ProtectedRoute allowedRoles={['master']}>
            <MasterWebhooks />
          </ProtectedRoute>
        } />
        <Route path="/master/faq" element={
          <ProtectedRoute allowedRoles={['master']}>
            <FaqManagerPage />
          </ProtectedRoute>
        } />
        <Route path="/master/reports" element={
          <ProtectedRoute allowedRoles={['master']}>
            <ReportsPage />
          </ProtectedRoute>
        } />
        <Route path="/master/payouts" element={
          <ProtectedRoute allowedRoles={['master']}>
            <PayoutManagement />
          </ProtectedRoute>
        } />
        <Route path="/master/transactions" element={
          <ProtectedRoute allowedRoles={['master']}>
            <FinancialTransactions />
          </ProtectedRoute>
        } />
        <Route path="/master/commissions" element={
          <ProtectedRoute allowedRoles={['master']}>
            <CommissionsPage />
          </ProtectedRoute>
        } />
        <Route path="/master/settings" element={
          <ProtectedRoute allowedRoles={['master']}>
            <MasterSettings />
          </ProtectedRoute>
        } />
        <Route path="/master/site-management" element={
          <ProtectedRoute allowedRoles={['master']}>
            <MasterSiteManagement />
          </ProtectedRoute>
        } />

        {/* ═══ STAFF PORTAL ROUTES ═══ */}
        <Route path="/staff/portal" element={
          <ProtectedRoute allowedRoles={['staff']}>
            <StaffPortalDashboard />
          </ProtectedRoute>
        } />
        <Route path="/staff/portal/proposals" element={
          <ProtectedRoute allowedRoles={['staff']}>
            <ProposalsPage />
          </ProtectedRoute>
        } />
        <Route path="/staff/portal/agenda" element={
          <ProtectedRoute allowedRoles={['staff']}>
            <AgendaPage />
          </ProtectedRoute>
        } />
        <Route path="/staff/portal/financial" element={
          <ProtectedRoute allowedRoles={['staff']}>
            <StaffPortalDashboard />
          </ProtectedRoute>
        } />
        <Route path="/staff/portal/profile" element={
          <ProtectedRoute allowedRoles={['staff']}>
            <WorkerProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/organizer/feed" element={
          <ProtectedRoute allowedRoles={['organizer']}>
            <OrganizerPostManager />
          </ProtectedRoute>
        } />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
