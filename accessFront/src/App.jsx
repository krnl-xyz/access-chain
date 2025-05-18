import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { WagmiConfig } from 'wagmi';
import { config as wagmiConfig } from './config/wagmi';
import { AccessibilityProvider, useAccessibility } from './context/AccessibilityContext';
import generateTheme from './theme/accessibilityTheme';
import Layout from './components/Layout/Layout';
import NGORoute from './components/auth/NGORoute';
import AdminRoute from './components/auth/AdminRoute';

// Pages
import Home from './pages/Home/Home';
import About from './pages/About/About';
import Contact from './pages/Contact/Contact';
import FAQ from './pages/FAQ/FAQ';
import Terms from './pages/Terms/Terms';
import Privacy from './pages/Privacy/Privacy';
import DonorDashboard from './pages/Donor/DonorDashboard';
import NGODashboard from './pages/NGO/NGODashboard';
import CreateGrantPage from './pages/CreateGrantPage';
import AdminDashboard from './pages/Admin/AdminDashboard';
import GrantRequest from './pages/Grants/GrantRequests';
import GrantDetails from './pages/Grants/GrantDetails';
import Profile from './pages/Profile/Profile';
import NotFound from './pages/NotFound/NotFound';
import GrantsPage from './pages/Grants/GrantsPage';
import GrantDetailPage from './pages/Grants/GrantDetailPage';
import GrantApplicationPage from './pages/Grants/GrantApplicationPage';
import CreateSimpleGrantPage from './pages/Grants/CreateSimpleGrantPage';
import GrantApplications from './pages/Grants/GrantApplications';
import DisabilityOnboarding from './pages/Accessibility/DisabilityOnboarding';
import AccessibilitySettings from './pages/Accessibility/AccessibilitySettings';
import NGOManagement from './pages/Admin/NGOManagement';
import DemoDashboard from './pages/Demo/DemoDashboard';
import StakingPage from './pages/Token/StakingPage';
import NGODashboardOverview from './pages/NGO/NGODashboardOverview';

// Theme wrapper to apply dynamic accessibility theme
const ThemeWrapper = ({ children }) => {
  const accessibilitySettings = useAccessibility();
  const theme = generateTheme({
    highContrast: accessibilitySettings.highContrast,
    largeText: accessibilitySettings.largeText,
    reduceMotion: accessibilitySettings.reduceMotion,
    screenReader: accessibilitySettings.screenReader,
  });

  return (
    <ChakraProvider theme={theme}>
      {children}
    </ChakraProvider>
  );
};

const App = () => {
  return (
    <WagmiConfig config={wagmiConfig}>
      <AccessibilityProvider>
        <ThemeWrapper>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/donor-dashboard" element={<DonorDashboard />} />
                
                {/* Demo Dashboard */}
                <Route path="/demo" element={<DemoDashboard />} />
                
                {/* NGO Routes - Protected */}
                <Route path="/ngo-dashboard" element={
                  <NGORoute>
                    <NGODashboardOverview />
                  </NGORoute>
                } />
                <Route path="/ngo/:ngoAddress" element={
                  <NGORoute>
                    <NGODashboard />
                  </NGORoute>
                } />
                <Route path="/ngo/create-grant" element={
                  <NGORoute>
                    <CreateSimpleGrantPage />
                  </NGORoute>
                } />
                <Route path="/ngo/grants/:grantId/applications" element={
                  <NGORoute>
                    <GrantApplications />
                  </NGORoute>
                } />
                
                {/* Grant Routes */}
                <Route path="/grants" element={<GrantsPage />} />
                <Route path="/grants/create" element={
                  <NGORoute>
                    <CreateSimpleGrantPage />
                  </NGORoute>
                } />
                <Route path="/grants/:grantId" element={<GrantDetailPage />} />
                <Route path="/grants/:grantId/apply" element={<GrantApplicationPage />} />
                <Route path="/grants/:grantId/applications" element={<GrantApplications />} />
                <Route path="/grant-request" element={<GrantRequest />} />
                <Route path="/grant/:id" element={<GrantDetails />} />
                
                {/* Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/ngos"
                  element={
                    <AdminRoute>
                      <NGOManagement />
                    </AdminRoute>
                  }
                />
                
                {/* Accessibility Routes */}
                <Route path="/accessibility/onboarding" element={<DisabilityOnboarding />} />
                <Route path="/accessibility/settings" element={<AccessibilitySettings />} />
                
                <Route path="/profile" element={<Profile />} />
                <Route path="/token/staking" element={<StakingPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </Router>
        </ThemeWrapper>
      </AccessibilityProvider>
    </WagmiConfig>
  );
};

export default App;
