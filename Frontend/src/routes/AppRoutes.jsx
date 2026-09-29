import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";
import Loader from "../components/common/Loader";

// ============================================================
// Layouts
// ============================================================

const PublicLayout = lazy(
  () => import("../components/layout/PublicLayout")
);

const DashboardLayout = lazy(
  () => import("../components/layout/DashboardLayout")
);

// ============================================================
// Authentication Pages
// ============================================================

const Login = lazy(
  () => import("../pages/auth/Login")
);

const Register = lazy(
  () => import("../pages/auth/Register")
);

const ForgotPassword = lazy(
  () => import("../pages/auth/ForgotPassword")
);

const ResetPassword = lazy(
  () => import("../pages/auth/ResetPassword")
);

// ============================================================
// Public Pages
// ============================================================

const Home = lazy(
  () => import("../pages/public/Home")
);

const AboutVillage = lazy(
  () => import("../pages/public/AboutVillage")
);

const Businesses = lazy(
  () => import("../pages/public/Businesses")
);

const BusinessDetails = lazy(
  () => import("../pages/public/BusinessDetails")
);

const Events = lazy(
  () => import("../pages/public/Events")
);

const EventDetails = lazy(
  () => import("../pages/public/EventDetails")
);

const Jobs = lazy(
  () => import("../pages/public/Jobs")
);

const JobDetails = lazy(
  () => import("../pages/public/JobDetails")
);

const Notices = lazy(
  () => import("../pages/public/Notices")
);

const NoticeDetails = lazy(
  () => import("../pages/public/NoticeDetails")
);

const Services = lazy(
  () => import("../pages/public/Services")
);

const ServiceDetails = lazy(
  () => import("../pages/public/ServiceDetails")
);

const Emergency = lazy(
  () => import("../pages/public/Emergency")
);

const VillagePlaces = lazy(
  () => import("../pages/public/VillagePlaces")
);

const VillageGallery = lazy(
  () => import("../pages/public/VillageGallery")
);

const ContactVillage = lazy(
  () => import("../pages/public/ContactVillage")
);

// ============================================================
// Government & Important Contacts
// ============================================================

const GovernmentContacts = lazy(
  () => import("../pages/public/GovernmentContacts")
);

const Community = lazy(
  () => import("../pages/public/Community")
);

// ============================================================
// Citizen Pages
// ============================================================

const CitizenDashboard = lazy(
  () => import("../pages/citizen/Dashboard")
);

const CitizenProfile = lazy(
  () => import("../pages/citizen/Profile")
);

const CreateComplaint = lazy(
  () => import("../pages/citizen/CreateComplaint")
);

const MyComplaints = lazy(
  () => import("../pages/citizen/MyComplaints")
);

const RequestCertificate = lazy(
  () => import("../pages/citizen/RequestCertificate")
);

const MyCertificates = lazy(
  () => import("../pages/citizen/MyCertificates")
);

const EmergencySOS = lazy(
  () => import("../pages/public/EmergencySOS")
);

const MyHousehold = lazy(
  () => import("../pages/citizen/MyHousehold")
);

const VillageServices = lazy(
  () => import("../pages/citizen/VillageServices")
);

const AdminVillageFeatures = lazy(
  () => import("../pages/admin/VillageFeatures")
);

const MyPosts = lazy(
  () => import("../pages/citizen/MyPosts")
);

const CitizenNotifications = lazy(
  () => import("../pages/citizen/Notifications")
);

const MyApplications = lazy(
  () => import("../pages/citizen/MyApplications")
);

const MyJobApplications = lazy(
  () => import("../pages/citizen/MyJobApplications")
);

const MyBazaar = lazy(
  () => import("../pages/citizen/MyBazaar")
);

const MyPhotos = lazy(
  () => import("../pages/citizen/MyPhotos")
);

const GaonBazaar = lazy(
  () => import("../pages/public/GaonBazaar")
);

const AdminSubmissions = lazy(
  () => import("../pages/admin/Submissions")
);

// ============================================================
// Business Owner Pages
// ============================================================

const BusinessOwnerDashboard = lazy(
  () => import("../pages/businessOwner/Dashboard")
);

const AddBusiness = lazy(
  () => import("../pages/businessOwner/AddBusiness")
);

const EditBusiness = lazy(
  () => import("../pages/businessOwner/EditBusiness")
);

const MyBusiness = lazy(
  () => import("../pages/businessOwner/MyBusiness")
);

const MyJobs = lazy(
  () => import("../pages/businessOwner/MyJobs")
);

const Applications = lazy(
  () => import("../pages/businessOwner/Applications")
);

// ============================================================
// Admin Pages
// ============================================================

const AdminDashboard = lazy(
  () => import("../pages/admin/Dashboard")
);

const AdminUsers = lazy(
  () => import("../pages/admin/Users")
);

const AdminUserDetail = lazy(
  () => import("../pages/admin/UserDetail")
);

const AdminComplaints = lazy(
  () => import("../pages/admin/Complaints")
);

const AdminCertificates = lazy(
  () => import("../pages/admin/CertificateRequests")
);

const AdminBusinesses = lazy(
  () => import("../pages/admin/Businesses")
);

const AdminEvents = lazy(
  () => import("../pages/admin/Events")
);

const AdminJobs = lazy(
  () => import("../pages/admin/Jobs")
);

const AdminNotices = lazy(
  () => import("../pages/admin/Notices")
);

const AdminServices = lazy(
  () => import("../pages/admin/Services")
);

const AdminEmergency = lazy(
  () => import("../pages/admin/EmergencyContacts")
);

const AdminCommunity = lazy(
  () => import("../pages/admin/CommunityPosts")
);

const AdminReports = lazy(
  () => import("../pages/admin/Reports")
);

const AdminVillageSettings = lazy(
  () => import("../pages/admin/VillageSettings")
);

const AdminVillageDirectory = lazy(
  () => import("../pages/admin/VillageDirectory")
);

const AdminGovernmentContacts = lazy(
  () => import("../pages/admin/GovernmentContacts")
);

const AdminHouseholds = lazy(
  () => import("../pages/admin/Households")
);

// ============================================================
// Loading Fallback
// ============================================================

const Fallback = () => (
  <Loader fullScreen />
);

// ============================================================
// App Routes
// ============================================================

export default function AppRoutes() {
  return (
    <Suspense fallback={<Fallback />}>
      <Routes>

        {/* ================================================== */}
        {/* Authentication Routes */}
        {/* ================================================== */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        {/* ================================================== */}
        {/* Public Routes */}
        {/* ================================================== */}

        <Route element={<PublicLayout />}>

          {/* Home */}
          <Route
            path="/"
            element={<Home />}
          />

          {/* About Village */}
          <Route
            path="/about"
            element={<AboutVillage />}
          />

          {/* Businesses */}
          <Route
            path="/businesses"
            element={<Businesses />}
          />

          <Route
            path="/businesses/:id"
            element={<BusinessDetails />}
          />

          {/* Events */}
          <Route
            path="/events"
            element={<Events />}
          />

          <Route
            path="/events/:id"
            element={<EventDetails />}
          />

          {/* Jobs */}
          <Route
            path="/jobs"
            element={<Jobs />}
          />

          <Route
            path="/jobs/:id"
            element={<JobDetails />}
          />

          {/* Notices */}
          <Route
            path="/notices"
            element={<Notices />}
          />

          <Route
            path="/notices/:id"
            element={<NoticeDetails />}
          />

          {/* Services */}
          <Route
            path="/services"
            element={<Services />}
          />

          <Route
            path="/services/:id"
            element={<ServiceDetails />}
          />

          {/* Emergency */}
          <Route
            path="/emergency"
            element={<Emergency />}
          />

          {/* Village Places */}
          <Route
            path="/village-places"
            element={<VillagePlaces />}
          />

          {/* Gallery */}
          <Route
            path="/gallery"
            element={<VillageGallery />}
          />

          {/* Contact */}
          <Route
            path="/contact"
            element={<ContactVillage />}
          />

          {/* ================================================== */}
          {/* Government & Important Contacts */}
          {/* ================================================== */}

          <Route
            path="/government-contacts"
            element={<GovernmentContacts />}
          />

          {/* Community (public read, login to post) */}
          <Route
            path="/community"
            element={<Community />}
          />

          {/* Village Services: mandi, schemes, gram sabha (public read, login to apply) */}
          <Route
            path="/village-services"
            element={<VillageServices />}
          />

          {/* Gaon Bazaar: buy-sell, lost-found, rental (public read, approved only) */}
          <Route
            path="/gaon-bazaar"
            element={<GaonBazaar />}
          />

        </Route>

        {/* ================================================== */}
        {/* Citizen Routes */}
        {/* ================================================== */}

        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >

          {/* Citizen Dashboard */}
          <Route
            path="/citizen/dashboard"
            element={<CitizenDashboard />}
          />

          {/* Citizen Profile */}
          <Route
            path="/citizen/profile"
            element={<CitizenProfile />}
          />

          {/* Create Complaint */}
          <Route
            path="/citizen/complaints/create"
            element={<CreateComplaint />}
          />

          {/* My Complaints */}
          <Route
            path="/citizen/complaints"
            element={<MyComplaints />}
          />

          {/* Certificates */}
          <Route
            path="/citizen/certificates"
            element={<MyCertificates />}
          />

          <Route
            path="/citizen/certificates/request"
            element={<RequestCertificate />}
          />

          {/* Emergency SOS */}
          <Route
            path="/citizen/sos"
            element={<EmergencySOS />}
          />

          {/* Village Services (schemes, farmer, health, etc.) */}
          <Route
            path="/citizen/village-services"
            element={<VillageServices />}
          />

          {/* My Household (parivar) */}
          <Route
            path="/citizen/household"
            element={<MyHousehold />}
          />

          {/* My Posts */}
          <Route
            path="/citizen/posts"
            element={<MyPosts />}
          />

          {/* Notifications */}
          <Route
            path="/citizen/notifications"
            element={<CitizenNotifications />}
          />

          {/* My Yojana / Village Service Applications */}
          <Route
            path="/citizen/applications"
            element={<MyApplications />}
          />

          {/* My Job Applications */}
          <Route
            path="/citizen/job-applications"
            element={<MyJobApplications />}
          />

          {/* My Gaon Bazaar posts */}
          <Route
            path="/citizen/bazaar"
            element={<MyBazaar />}
          />

          {/* My Gallery photos */}
          <Route
            path="/citizen/photos"
            element={<MyPhotos />}
          />

          {/* ================================================== */}
          {/* Business Features */}
          {/* Every logged-in citizen can access these */}
          {/* ================================================== */}

          <Route
            path="/business-owner/dashboard"
            element={<BusinessOwnerDashboard />}
          />

          <Route
            path="/business-owner/add-business"
            element={<AddBusiness />}
          />

          <Route
            path="/business-owner/edit-business/:id"
            element={<EditBusiness />}
          />

          <Route
            path="/business-owner/my-business"
            element={<MyBusiness />}
          />

          <Route
            path="/business-owner/my-jobs"
            element={<MyJobs />}
          />

          <Route
            path="/business-owner/applications/:jobId"
            element={<Applications />}
          />

        </Route>

        {/* ================================================== */}
        {/* Admin Routes */}
        {/* ================================================== */}

        <Route
          element={
            <ProtectedRoute>
              <RoleRoute roles={["admin"]}>
                <DashboardLayout />
              </RoleRoute>
            </ProtectedRoute>
          }
        >

          {/* Admin Dashboard */}
          <Route
            path="/admin/dashboard"
            element={<AdminDashboard />}
          />

          {/* Users */}
          <Route
            path="/admin/users"
            element={<AdminUsers />}
          />

          <Route
            path="/admin/users/:id"
            element={<AdminUserDetail />}
          />

          {/* Complaints */}
          <Route
            path="/admin/complaints"
            element={<AdminComplaints />}
          />

          {/* Certificate Requests */}
          <Route
            path="/admin/certificates"
            element={<AdminCertificates />}
          />

          {/* Businesses */}
          <Route
            path="/admin/businesses"
            element={<AdminBusinesses />}
          />

          {/* Events */}
          <Route
            path="/admin/events"
            element={<AdminEvents />}
          />

          {/* Jobs */}
          <Route
            path="/admin/jobs"
            element={<AdminJobs />}
          />

          {/* Notices */}
          <Route
            path="/admin/notices"
            element={<AdminNotices />}
          />

          {/* Services */}
          <Route
            path="/admin/services"
            element={<AdminServices />}
          />

          {/* Village Features */}
          <Route
            path="/admin/village-features"
            element={<AdminVillageFeatures />}
          />

          {/* Emergency Contacts */}
          <Route
            path="/admin/emergency"
            element={<AdminEmergency />}
          />

          {/* Community */}
          <Route
            path="/admin/community"
            element={<AdminCommunity />}
          />

          {/* Reports */}
          <Route
            path="/admin/reports"
            element={<AdminReports />}
          />

          {/* Village Settings */}
          <Route
            path="/admin/village-settings"
            element={<AdminVillageSettings />}
          />

          {/* Village Directory */}
          <Route
            path="/admin/village-directory"
            element={<AdminVillageDirectory />}
          />

          {/* Government Contacts */}
          <Route
            path="/admin/government-contacts"
            element={<AdminGovernmentContacts />}
          />

          {/* Households (Parivar) */}
          <Route
            path="/admin/households"
            element={<AdminHouseholds />}
          />

          {/* Citizen submissions: Gaon Bazaar + Gallery approvals */}
          <Route
            path="/admin/submissions"
            element={<AdminSubmissions />}
          />

        </Route>

        {/* ================================================== */}
        {/* 404 Route */}
        {/* ================================================== */}

        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
              <div className="text-center">

                <h1 className="text-6xl font-bold text-primary-600">
                  404
                </h1>

                <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
                  Page not found
                </p>

                <a
                  href="/"
                  className="mt-6 inline-block btn-primary"
                >
                  Go Home
                </a>

              </div>
            </div>
          }
        />

      </Routes>
    </Suspense>
  );
}