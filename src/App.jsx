import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import RequireAuth from "./components/RequireAuth";
import RequireAdmin from "./components/RequireAdmin";
import CmsRuntime from "./components/CmsRuntime";
import SeoManager from "./components/SeoManager";
import TrackingManager from "./components/TrackingManager";
import { AuthProvider } from "./context/AuthProvider";
import { SelectionProvider } from "./context/SelectionProvider";
import { SitePreferencesProvider } from "./context/SitePreferences";
import { useSitePreferences } from "./context/SitePreferencesContext";

const HomePage = lazy(() => import("./Pages/HomePage"));
const CollectionsPage = lazy(() => import("./Pages/CollectionsPage"));
const CollectionDetailPage = lazy(() => import("./Pages/CollectionDetailPage"));
const ProductsPage = lazy(() => import("./Pages/ProductsPage"));
const ProductStoryPage = lazy(() => import("./Pages/ProductStoryPage"));
const ServicesPage = lazy(() => import("./Pages/ServicesPage"));
const OurWorldPage = lazy(() => import("./Pages/OurWorldPage"));
const ArtGalleryPage = lazy(() => import("./Pages/ArtGalleryPage"));
const JournalPage = lazy(() => import("./Pages/JournalPage"));
const JournalArticlePage = lazy(() => import("./Pages/JournalArticlePage"));
const ShopPage = lazy(() => import("./Pages/ShopPage"));
const ContactPage = lazy(() => import("./Pages/ContactPage"));
const LoginPage = lazy(() => import("./Pages/LoginPage"));
const WishlistPage = lazy(() => import("./Pages/WishlistPage"));
const AccountPage = lazy(() => import("./Pages/AccountPage"));
const SelectionPage = lazy(() => import("./Pages/SelectionPage"));
const NotFoundPage = lazy(() => import("./Pages/NotFoundPage"));
const AdminPage = lazy(() => import("./Pages/AdminPage"));

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--surface)]">
      <div className="text-center text-[#B08A57]">
        <span className="mx-auto block h-10 w-10 animate-spin rounded-full border border-[#B08A57]/25 border-t-[#B08A57]" />
        <span className="mt-4 block text-xs tracking-[0.3em]">DIDAR</span>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { direction, theme } = useSitePreferences();

  return (
    <BrowserRouter>
      <main dir={direction} data-theme={theme} className="min-h-screen bg-[var(--surface)] font-doran text-[var(--ink)] transition-colors duration-500">
        <SeoManager />
        <TrackingManager />
        <CmsRuntime />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/collections" element={<CollectionsPage />} />
            <Route path="/collections/:collectionId" element={<CollectionDetailPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:productId" element={<ProductStoryPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/our-world" element={<OurWorldPage />} />
            <Route path="/art-gallery" element={<ArtGalleryPage />} />
            <Route path="/journal" element={<JournalPage />} />
            <Route path="/journal/:articleId" element={<JournalArticlePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/wishlist" element={<RequireAuth><WishlistPage /></RequireAuth>} />
            <Route path="/account" element={<RequireAuth><AccountPage /></RequireAuth>} />
            <Route path="/selection" element={<SelectionPage />} />
            <Route path="/admin" element={<RequireAdmin><AdminPage /></RequireAdmin>} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <SitePreferencesProvider>
      <AuthProvider>
        <SelectionProvider>
          <AppRoutes />
        </SelectionProvider>
      </AuthProvider>
    </SitePreferencesProvider>
  );
}
