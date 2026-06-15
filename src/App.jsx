import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider, App as AntApp } from 'antd'
import MainLayout from './components/layout/MainLayout'
import ProtectedRoute from './components/layout/ProtectedRoute'

// Auth
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'

// Dashboard
import DashboardPage from './pages/dashboard/DashboardPage'

// Masters
import ClientListPage from './pages/masters/client/ClientListPage'
import ClientFormPage from './pages/masters/client/ClientFormPage'
import ClientDetailPage from './pages/masters/client/ClientDetailPage'
import VendorListPage from './pages/masters/vendor/VendorListPage'
import VendorFormPage from './pages/masters/vendor/VendorFormPage'
import VendorDetailPage from './pages/masters/vendor/VendorDetailPage'
import BankListPage from './pages/masters/bank/BankListPage'
import BankFormPage from './pages/masters/bank/BankFormPage'
import CampaignListPage from './pages/masters/campaign/CampaignListPage'
import CampaignFormPage from './pages/masters/campaign/CampaignFormPage'

// Estimates
import EstimateListPage from './pages/estimates/EstimateListPage'
import EstimateFormPage from './pages/estimates/EstimateFormPage'
import EstimateDetailPage from './pages/estimates/EstimateDetailPage'

// Invoices
import CreditNoteFormPage from './pages/invoices/CreditNoteFormPage'
import InvoiceListPage from './pages/invoices/InvoiceListPage'
import InvoiceFormPage from './pages/invoices/InvoiceFormPage'
import InvoiceDetailPage from './pages/invoices/InvoiceDetailPage'

// Vendor Bills
import VendorBillListPage from './pages/vendor-bills/VendorBillListPage'
import VendorBillFormPage from './pages/vendor-bills/VendorBillFormPage'

// Bank Entries
import BankEntryListPage from './pages/bank-entries/BankEntryListPage'
import ReceiptFormPage from './pages/bank-entries/ReceiptFormPage'
import PaymentFormPage from './pages/bank-entries/PaymentFormPage'
import ContraFormPage from './pages/bank-entries/ContraFormPage'

// Reports
import ReportsIndexPage from './pages/reports/ReportsIndexPage'
import ClientMasterReport from './pages/reports/ClientMasterReport'
import VendorMasterReport from './pages/reports/VendorMasterReport'
import CampaignMasterReport from './pages/reports/CampaignMasterReport'
import EstimatesReport from './pages/reports/EstimatesReport'
import POReport from './pages/reports/POReport'
import InvoicesReport from './pages/reports/InvoicesReport'
import VendorInvoicesReport from './pages/reports/VendorInvoicesReport'
import InvoiceLevelVendorBillsReport from './pages/reports/InvoiceLevelVendorBillsReport'
import CampaignMarginReport from './pages/reports/CampaignMarginReport'
import ClientOutstandingReport from './pages/reports/ClientOutstandingReport'
import VendorOutstandingReport from './pages/reports/VendorOutstandingReport'

const antdTheme = {
  token: {
    colorPrimary: '#0057FF',
    fontFamily: "'DM Sans', sans-serif",
    borderRadius: 6,
    colorBgContainer: '#FFFFFF',
    colorBorder: '#E2E6F0',
  },
}

export default function App() {
  return (
    <ConfigProvider theme={antdTheme}>
      <AntApp>
        <BrowserRouter>
        <Routes>

          {/* ── Public auth routes ── */}
          <Route path="/login"           element={<LoginPage />} />
          <Route path="/register"        element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password"  element={<ResetPasswordPage />} />

          {/* ── Protected app routes ── */}
          <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />

            {/* Masters */}
            <Route path="clients"          element={<ClientListPage />} />
            <Route path="clients/new"      element={<ClientFormPage />} />
            <Route path="clients/:id/edit" element={<ClientFormPage />} />
            <Route path="clients/:id"      element={<ClientDetailPage />} />

            <Route path="vendors"          element={<VendorListPage />} />
            <Route path="vendors/new"      element={<VendorFormPage />} />
            <Route path="vendors/:id/edit" element={<VendorFormPage />} />
            <Route path="vendors/:id"      element={<VendorDetailPage />} />

            <Route path="banks"          element={<BankListPage />} />
            <Route path="banks/new"      element={<BankFormPage />} />
            <Route path="banks/:id/edit" element={<BankFormPage />} />

            <Route path="campaigns"          element={<CampaignListPage />} />
            <Route path="campaigns/new"      element={<CampaignFormPage />} />
            <Route path="campaigns/:id/edit" element={<CampaignFormPage />} />

            {/* Estimates */}
            <Route path="estimates"          element={<EstimateListPage />} />
            <Route path="estimates/new"      element={<EstimateFormPage />} />
            <Route path="estimates/:id/edit" element={<EstimateFormPage />} />
            <Route path="estimates/:id"      element={<EstimateDetailPage />} />

            {/* Invoices */}
          <Route path="invoices/credit-note/new" element={<CreditNoteFormPage />} />
            <Route path="invoices"     element={<InvoiceListPage />} />
            <Route path="invoices/new" element={<InvoiceFormPage />} />
            <Route path="invoices/:id" element={<InvoiceDetailPage />} />

            {/* Vendor Bills */}
            <Route path="vendor-bills"          element={<VendorBillListPage />} />
            <Route path="vendor-bills/new"      element={<VendorBillFormPage />} />
            <Route path="vendor-bills/:id/edit" element={<VendorBillFormPage />} /> {/* ✅ YE ADD KIA */}

            {/* Bank Entries */}
            <Route path="bank-entries"             element={<BankEntryListPage />} />
            <Route path="bank-entries/receipt/new" element={<ReceiptFormPage />} />
            <Route path="bank-entries/payment/new" element={<PaymentFormPage />} />
            <Route path="bank-entries/contra/new"  element={<ContraFormPage />} />

            {/* Reports */}
            <Route path="reports"                        element={<ReportsIndexPage />} />
            <Route path="reports/client-master"          element={<ClientMasterReport />} />
            <Route path="reports/vendor-master"          element={<VendorMasterReport />} />
            <Route path="reports/campaign-master"        element={<CampaignMasterReport />} />
            <Route path="reports/estimates"              element={<EstimatesReport />} />
            <Route path="reports/purchase-orders"        element={<POReport />} />
            <Route path="reports/invoices"               element={<InvoicesReport />} />
            <Route path="reports/vendor-invoices"        element={<VendorInvoicesReport />} />
            <Route path="reports/invoice-vendor-bills"   element={<InvoiceLevelVendorBillsReport />} />
            <Route path="reports/campaign-margin"        element={<CampaignMarginReport />} />
            <Route path="reports/client-outstanding"     element={<ClientOutstandingReport />} />
            <Route path="reports/vendor-outstanding"     element={<VendorOutstandingReport />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />

        </Routes>
      </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  )
}