/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/

import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { HelmetProvider } from "react-helmet-async";
import { AccessibilityProvider } from "./components/AccessibilityProvider";
import AccessibilitySettings from "./components/AccessibilitySettings";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ToastProvider } from "./components/Toast";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ProgressProvider } from "./contexts/ProgressContext";
import ChatAssistant from "./components/ChatAssistant";
import "./styles/accessibility.css";
import "./styles/theme.css";
import "./styles/responsive.css";

const HomePage = lazy(() => import("./pages/HomePage"));
const FullSailLanding = lazy(() => import("./pages/FullSailLanding"));
const ProfessionalHome = lazy(() => import("./pages/ProfessionalHome"));
const StudentPortalLMS = lazy(() => import("./pages/StudentPortalLMS"));
const TestPage = lazy(() => import("./pages/TestPage"));
const Government = lazy(() => import("./pages/Government"));
const Philanthropy = lazy(() => import("./pages/Philanthropy"));
const Compliance = lazy(() => import("./pages/Compliance"));
const Accessibility = lazy(() => import("./pages/Accessibility"));
const DurableLanding = lazy(() => import("./pages/DurableLanding"));
const MainLanding = lazy(() => import("./pages/MainLanding"));
const DurableAI = lazy(() => import("./pages/DurableAI"));
const DurableTemplates = lazy(() => import("./pages/DurableTemplates"));
const DurableFeatures = lazy(() => import("./pages/DurableFeatures"));
const DurablePricing = lazy(() => import("./pages/DurablePricing"));
const Programs = lazy(() => import("./pages/Programs"));
const ProgramsDurable = lazy(() => import("./pages/ProgramsDurable"));
const Student = lazy(() => import("./pages/Student"));
const LMS = lazy(() => import("./pages/LMS"));
const LMSLanding = lazy(() => import("./pages/LMSLanding"));
const LMSDashboard = lazy(() => import("./pages/LMSDashboard"));
const Partners = lazy(() => import("./pages/Partners"));
const Donate = lazy(() => import("./pages/Donate"));
const Pay = lazy(() => import("./pages/Pay"));
const About = lazy(() => import("./pages/About"));
const Hub = lazy(() => import("./pages/Hub"));
const Account = lazy(() => import("./pages/Account"));
const Connect = lazy(() => import("./pages/Connect"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AskWidget = lazy(() => import('./components/AskWidget'));
const NavBar = lazy(() => import('./components/NavBar'));

// New pages for complete platform
const GetStarted = lazy(() => import("./pages/GetStarted"));
const VideoMeeting = lazy(() => import("./pages/VideoMeeting"));
const FileManager = lazy(() => import("./pages/FileManager"));
const Sheets = lazy(() => import("./pages/Sheets"));
const Slides = lazy(() => import("./pages/Slides"));
const Forms = lazy(() => import("./pages/Forms"));
const Vids = lazy(() => import("./pages/Vids"));
const Sites = lazy(() => import("./pages/Sites"));
const Groups = lazy(() => import("./pages/Groups"));

// Additional pages
const AITutor = lazy(() => import("./pages/AITutor"));
const AccessibilitySettingsPage = lazy(() => import("./pages/AccessibilitySettings"));
const AdminConsole = lazy(() => import("./pages/AdminConsole"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const Analytics = lazy(() => import("./pages/Analytics"));
const AnalyticsDashboard = lazy(() => import("./pages/AnalyticsDashboard"));
const Assignment = lazy(() => import("./pages/Assignment"));
const BingSiteVerification = lazy(() => import("./pages/BingSiteVerification"));
const Branding = lazy(() => import("./pages/Branding"));
const BusinessHub = lazy(() => import("./pages/BusinessHub"));
const Calendar = lazy(() => import("./pages/Calendar"));
const Certificates = lazy(() => import("./pages/Certificates"));
const CloneLanding = lazy(() => import("./pages/CloneLanding"));
const Community = lazy(() => import("./pages/Community"));
const CommunityHub = lazy(() => import("./pages/CommunityHub"));
const Course = lazy(() => import("./pages/Course"));
const CourseBuilder = lazy(() => import("./pages/CourseBuilder"));
const CourseCatalog = lazy(() => import("./pages/CourseCatalog"));
const CourseDetail = lazy(() => import("./pages/CourseDetail"));
const CourseLibrary = lazy(() => import("./pages/CourseLibrary"));
const CurriculumUpload = lazy(() => import("./pages/CurriculumUpload"));
const Docs = lazy(() => import("./pages/Docs"));
const DonatePage = lazy(() => import("./pages/DonatePage"));
const Ecommerce = lazy(() => import("./pages/Ecommerce"));
const Ecosystem = lazy(() => import("./pages/Ecosystem"));
const EducatorHub = lazy(() => import("./pages/EducatorHub"));
const ElevateBrain = lazy(() => import("./pages/ElevateBrain"));
const Email = lazy(() => import("./pages/Email"));
const FundingImpact = lazy(() => import("./pages/FundingImpact"));
const GoogleAnalyticsSetup = lazy(() => import("./pages/GoogleAnalyticsSetup"));
const GoogleSiteVerification = lazy(() => import("./pages/GoogleSiteVerification"));
const Home = lazy(() => import("./pages/Home"));
const Instructor = lazy(() => import("./pages/Instructor"));
const InstructorEdit = lazy(() => import("./pages/InstructorEdit"));
const InstructorNew = lazy(() => import("./pages/InstructorNew"));
const Integrations = lazy(() => import("./pages/Integrations"));
const KingdomKonnect = lazy(() => import("./pages/KingdomKonnect"));
const Login = lazy(() => import("./pages/Login"));
const MobileApp = lazy(() => import("./pages/MobileApp"));
const NotebookLM = lazy(() => import("./pages/NotebookLM"));
const Notifications = lazy(() => import("./pages/Notifications"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Profile = lazy(() => import("./pages/Profile"));
const Quiz = lazy(() => import("./pages/Quiz"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const SereneComfortCare = lazy(() => import("./pages/SereneComfortCare"));
const Settings = lazy(() => import("./pages/Settings"));
const Sitemap = lazy(() => import("./pages/Sitemap"));
// Removed SomePage - was a placeholder
const StudentDashboard = lazy(() => import("./pages/StudentDashboard"));
const StudentHandbook = lazy(() => import("./pages/StudentHandbook"));
const StudentHub = lazy(() => import("./pages/StudentHub"));
const Support = lazy(() => import("./pages/Support"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const ThankYou = lazy(() => import("./pages/ThankYou"));
const UrbanBuildCrew = lazy(() => import("./pages/UrbanBuildCrew"));
const UserManagement = lazy(() => import("./pages/UserManagement"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const VerifyCertificate = lazy(() => import("./pages/VerifyCertificate"));
const SearchResults = lazy(() => import("./pages/SearchResults"));

// Sister site pages
const MentorDirectory = lazy(() => import("./pages/sisters/MentorDirectory"));
const MentorSignup = lazy(() => import("./pages/sisters/MentorSignup"));
const Mentorship = lazy(() => import("./pages/sisters/Mentorship"));
const PeerSupport = lazy(() => import("./pages/sisters/PeerSupport"));
const Volunteer = lazy(() => import("./pages/sisters/Volunteer"));
const VolunteerOpportunities = lazy(() => import("./pages/sisters/VolunteerOpportunities"));
const VolunteerStories = lazy(() => import("./pages/sisters/VolunteerStories"));
const Wellness = lazy(() => import("./pages/sisters/Wellness"));
const WellnessResources = lazy(() => import("./pages/sisters/WellnessResources"));

// Wrapper to provide page context to ChatAssistant
function ChatAssistantWrapper() {
  const location = useLocation();
  
  // Determine page context from route
  const getPageContext = () => {
    const path = location.pathname;
    if (path.includes('/courses') || path.includes('/lms')) return 'courses';
    if (path.includes('/dashboard') || path.includes('/hub')) return 'dashboard';
    if (path.includes('/profile') || path.includes('/account')) return 'profile';
    if (path.includes('/admin')) return 'admin';
    return 'general';
  };

  // Determine user role (you can enhance this with actual auth context)
  const getUserRole = () => {
    // This should come from your auth context
    // For now, defaulting to 'guest'
    return 'guest';
  };

  return <ChatAssistant pageContext={getPageContext()} userRole={getUserRole()} />;
}

export default function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <AccessibilityProvider>
          <ToastProvider>
            <ProgressProvider>
              <BrowserRouter>
                <ErrorBoundary>
              <Suspense fallback={<div style={{ padding: 40 }}>Loading...</div>}>
                <NavBar />
                <Routes>
                <Route path="/" element={<StudentPortalLMS />} />
                <Route path="/test" element={<TestPage />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/fullsail" element={<FullSailLanding />} />
                <Route path="/professional" element={<ProfessionalHome />} />
                <Route path="/government" element={<Government />} />
                <Route path="/philanthropy" element={<Philanthropy />} />
                <Route path="/compliance" element={<Compliance />} />
                <Route path="/accessibility" element={<Accessibility />} />
                <Route path="/programs" element={<ProgramsDurable />} />
                <Route path="/programs-old" element={<Programs />} />
                <Route path="/student" element={<Student />} />
                <Route path="/lms" element={<LMSDashboard />} />
                <Route path="/lms/landing" element={<LMSLanding />} />
                <Route path="/lms/old" element={<LMS />} />
                <Route path="/partners" element={<Partners />} />
                <Route path="/donate" element={<Donate />} />
                <Route path="/pay" element={<Pay />} />
                <Route path="/about" element={<About />} />
                <Route path="/hub" element={<Hub />} />
                <Route path="/account" element={<Account />} />
                <Route path="/connect" element={<Connect />} />
                <Route path="/durable" element={<DurableLanding />} />
                <Route path="/main-landing" element={<MainLanding />} />
                <Route path="/durable-ai" element={<DurableAI />} />
                <Route path="/durable-templates" element={<DurableTemplates />} />
                <Route path="/durable-features" element={<DurableFeatures />} />
                <Route path="/durable-pricing" element={<DurablePricing />} />
                
                {/* New platform features */}
                <Route path="/get-started" element={<GetStarted />} />
                <Route path="/meet/:meetingCode" element={<VideoMeeting />} />
                <Route path="/meet" element={<VideoMeeting />} />
                <Route path="/drive" element={<FileManager />} />
                <Route path="/sheets" element={<Sheets />} />
                <Route path="/slides" element={<Slides />} />
                <Route path="/forms" element={<Forms />} />
                <Route path="/vids" element={<Vids />} />
                <Route path="/sites" element={<Sites />} />
                <Route path="/groups" element={<Groups />} />
                
                        <Route path="/a-i-tutor" element={<AITutor />} />
        <Route path="/accessibility-settings" element={<AccessibilitySettingsPage />} />
        <Route path="/admin-console" element={<ProtectedRoute requiredRole="admin"><AdminConsole /></ProtectedRoute>} />
        <Route path="/admin-dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/analytics-dashboard" element={<AnalyticsDashboard />} />
        <Route path="/assignment" element={<Assignment />} />
        <Route path="/bing-site-verification" element={<BingSiteVerification />} />
        <Route path="/branding" element={<Branding />} />
        <Route path="/business-hub" element={<BusinessHub />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/certificates" element={<Certificates />} />
        <Route path="/clone-landing" element={<CloneLanding />} />
        <Route path="/community" element={<Community />} />
        <Route path="/community-hub" element={<CommunityHub />} />
        <Route path="/course" element={<Course />} />
        <Route path="/course-builder" element={<ProtectedRoute requiredRole="instructor"><CourseBuilder /></ProtectedRoute>} />
        <Route path="/course-catalog" element={<CourseCatalog />} />
        <Route path="/course-detail" element={<CourseDetail />} />
        <Route path="/course-library" element={<CourseLibrary />} />
        <Route path="/curriculum-upload" element={<ProtectedRoute requiredRole="instructor"><CurriculumUpload /></ProtectedRoute>} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/donate-page" element={<DonatePage />} />
        <Route path="/donate-page" element={<DonatePage />} />
        <Route path="/durable-a-i" element={<DurableAI />} />
        <Route path="/durable-landing" element={<DurableLanding />} />
        <Route path="/ecommerce" element={<Ecommerce />} />
        <Route path="/ecosystem" element={<Ecosystem />} />
        <Route path="/educator-hub" element={<EducatorHub />} />
        <Route path="/elevate-brain" element={<ElevateBrain />} />
        <Route path="/email" element={<Email />} />
        <Route path="/file-manager" element={<FileManager />} />
        <Route path="/funding-impact" element={<FundingImpact />} />
        <Route path="/google-analytics-setup" element={<GoogleAnalyticsSetup />} />
        <Route path="/google-site-verification" element={<GoogleSiteVerification />} />
        <Route path="/instructor" element={<ProtectedRoute requiredRole="instructor"><Instructor /></ProtectedRoute>} />
        <Route path="/instructor-edit" element={<ProtectedRoute requiredRole="instructor"><InstructorEdit /></ProtectedRoute>} />
        <Route path="/instructor-new" element={<ProtectedRoute requiredRole="instructor"><InstructorNew /></ProtectedRoute>} />
        <Route path="/integrations" element={<Integrations />} />
        <Route path="/kingdom-konnect" element={<KingdomKonnect />} />
        <Route path="/l-m-s" element={<LMS />} />
        <Route path="/l-m-s" element={<LMS />} />
        <Route path="/login" element={<Login />} />
        <Route path="/mobile-app" element={<MobileApp />} />
        <Route path="/notebook-l-m" element={<NotebookLM />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/serene-comfort-care" element={<SereneComfortCare />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/sitemap" element={<Sitemap />} />
        {/* Removed /some-page - was a placeholder */}
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/student-handbook" element={<StudentHandbook />} />
        <Route path="/student-hub" element={<StudentHub />} />
        <Route path="/support" element={<Support />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/thank-you" element={<ThankYou />} />
        <Route path="/urban-build-crew" element={<UrbanBuildCrew />} />
        <Route path="/user-management" element={<ProtectedRoute requiredRole="admin"><UserManagement /></ProtectedRoute>} />
        <Route path="/video-meeting" element={<VideoMeeting />} />
        <Route path="/mentor-directory" element={<MentorDirectory />} />
        <Route path="/mentor-signup" element={<MentorSignup />} />
        <Route path="/mentorship" element={<Mentorship />} />
        <Route path="/peer-support" element={<PeerSupport />} />
        <Route path="/volunteer" element={<Volunteer />} />
        <Route path="/volunteer-opportunities" element={<VolunteerOpportunities />} />
        <Route path="/volunteer-stories" element={<VolunteerStories />} />
        <Route path="/wellness" element={<Wellness />} />
        <Route path="/wellness-resources" element={<WellnessResources />} />
        
        {/* Authentication & Verification Routes */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/verify-certificate" element={<VerifyCertificate />} />
        
        {/* Search */}
        <Route path="/search" element={<SearchResults />} />
        
        <Route path="*" element={<NotFound />} />
              </Routes>
              <ChatAssistantWrapper />
              <AskWidget />
              <AccessibilitySettings />
            </Suspense>
          </ErrorBoundary>
        </BrowserRouter>
            </ProgressProvider>
          </ToastProvider>
        </AccessibilityProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}
