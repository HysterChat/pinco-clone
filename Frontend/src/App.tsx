import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './components/Login';
import Signup from './components/Signup';
import ForgotPassword from './components/ForgotPassword';
import Dashboard from './components/Dashboard/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import InterviewSession from './components/Dashboard/Interview/InterviewSession';
import HomePage from './components/HomePage';
import About from './components/About';
import Blog from './components/Blog';
import Careers from './components/Careers';
import Contact from './components/Contact';
import FAQ from './components/FAQ';
import TermsAndService from './components/TermsAndService';
import PrivacyPolicy from './components/PrivacyPolicy';
import PaymentTerms from './components/PaymentTerms';
import RefundPolicy from './components/RefundPolicy';
import Navbar from './components/Navbar';
import Reading from './components/Versant/Reading';
import RepeatSentence from './components/Versant/RepeatSentence';
import ShortAnswerQuestion from './components/Versant/ShortAnswerQuestion';
import SentenceBuild from './components/Versant/SentenceBuild';
import OpenResponse from './components/Versant/OpenResponse';
import RetellingRound from './components/Versant/RetellingRound';
import VersantFlow from './components/Versant/VersantFlow';
import Parallexsection from './components/parallex/Parallexsection';

// ScrollToTop component
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Layout component to handle Navbar display
const Layout = ({ children }: { children: React.ReactNode }) => {
  const { pathname } = useLocation();
  const isDashboard = pathname.startsWith('/dashboard');

  return (
    <>
      {!isDashboard && <Navbar />}
      {children}
    </>
  );
};

function App() {

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Toaster position="top-center" />
      <ScrollToTop />
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/interview-session" element={<InterviewSession />} />
          <Route path="/dashboard/versant/flow" element={
            <ProtectedRoute>
              <VersantFlow />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/versant/reading" element={
            <ProtectedRoute>
              <Reading onComplete={(recordings) => {
                // Handle the recordings here
                console.log('Test completed with recordings:', recordings);
              }} />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/versant/repeat-sentence" element={
            <ProtectedRoute>
              <RepeatSentence onComplete={(recordings) => {
                console.log('Repeat test completed:', recordings);
              }} />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/versant/short-answer" element={
            <ProtectedRoute>
              <ShortAnswerQuestion questions={[]} onComplete={() => { }} />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/versant/sentence-build" element={
            <ProtectedRoute>
              <SentenceBuild />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/versant/open-question" element={
            <ProtectedRoute>
              <OpenResponse />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/versant/retelling-round" element={
            <ProtectedRoute>
              <RetellingRound onComplete={() => { }} />
            </ProtectedRoute>
          } />
          <Route path="/" element={
            <>
              <Parallexsection />
              <HomePage />
            </>
          } />

          {/* Footer Links Routes */}
          <Route path="/about" element={<About />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/terms" element={<TermsAndService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/payment-terms" element={<PaymentTerms />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;







