import { Header } from "@/components/Headers/header";
import { Footer } from "@/components/Footer/footer";
import MobileBottomNav from "@/components/Layout/MobileBottomNav";
import CityPickerModal from "@/components/CityPickerModal";

/**
 * Wrapper for every public + signed-in user surface.
 *
 * Note: <CityProvider> lives at the App level so admin routes can also read
 * the selected city if they need to. The CityPickerModal lives here because
 * admin pages should never see the "pick your city" overlay.
 *
 * Mobile leaves bottom padding to account for the sticky bottom nav.
 */
export default function PublicShell({ children, className = "" }) {
  return (
    <div
      className={`min-h-screen bg-white text-slate-900 flex flex-col ${className}`}
    >
      <Header />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <Footer />
      <MobileBottomNav />
      <CityPickerModal />
    </div>
  );
}
