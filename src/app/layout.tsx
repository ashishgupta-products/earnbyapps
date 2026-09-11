import type { Metadata } from "next";
import "./globals.css";
import { AppContextProvider } from "../context/AppContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import UserProfileModal from "../components/UserProfileModal";
import SessionProviderWrapper from "../components/SessionProviderWrapper";

export const metadata: Metadata = {
  title: "EarnByApps | India's #1 App Testing & Real Cash Earning Platform",
  description: "Earn real cash via UPI, Paytm, and Direct Bank Transfer by testing, reviewing, and installing top apps in India. Fast payouts and verified campaigns.",
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="light-theme">
        <SessionProviderWrapper>
          <AppContextProvider>
            {/* Glowing Background Orbs */}
            <div className="bg-glow-container">
              <div className="glow-orb-1"></div>
              <div className="glow-orb-2"></div>
            </div>

            {/* Global Client Navigation Header */}
            <Header />

            {/* User profile collection modal */}
            <UserProfileModal />

            {children}

            {/* Footer */}
            <Footer />
          </AppContextProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
