import type { Metadata } from "next";
import "../styles/globals.css"; // فایلی CSS سەرەکی
import { Inter } from "next/font/google";
import AIConnectionProvider from "../services/AI_Connection_Services/AIConnectionProvider"; // بۆ پەیوەندی کاتی ڕاستەقینە

const inter = Inter({ subsets: ["latin"] });

// Metadataی پڕۆژە
export const metadata: Metadata = {
  title: "Create App Builder AI - Flutter 20X Platform",
  description: "Advanced Flutter Project Generation and Code Fixing with 70 AI Agents and DeepSeek.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ku" className="dark">
      <body className={`${inter.className} bg-ai-bg-dark text-white min-h-screen antialiased`}>
        {/*
          AIConnectionProvider: بەکارهێنانی React Context بۆ بەڕێوەبردنی پەیوەندیی Socket.IO
          ئەمە دڵنیایی دەدات لەوەی هەموو پێکهاتەکان دەتوانن Agent و AI و Health Stats وەربگرن.
        */}
        <AIConnectionProvider>
            {/* پێکهاتەی سەرەکیی گۆڕاو (Responsive Structure):
              لێرەدا دوو جۆر Navigation Bar (شریتە) دروست دەکەین: یەکێکیان بۆ مۆبایل و ئەوی تریان بۆ لاپتۆپ.
            */}
            
            {/* Navigation Bar بۆ لاپتۆپ و شاشەی گەورە (mobile:hidden, desktop:block) */}
            <header className="hidden lg:block w-full border-b border-gray-700 bg-ai-code sticky top-0 z-50">
                <DesktopNavBar /> 
            </header>

            {/* Navigation Bar بۆ مۆبایل (mobile:block, desktop:hidden) */}
            <header className="lg:hidden w-full border-b border-gray-700 bg-ai-code sticky top-0 z-50">
                <MobileNavBar />
            </header>

            <main className="flex flex-col flex-1">
                {children}
            </main>

            {/* دەتوانین پێکهاتەی Notificationsی Agent لێرە زیاد بکەین */}
            <AgentNotificationCenter />

        </AIConnectionProvider>
      </body>
    </html>
  );
}

// پێکهاتەی ساختە (Placeholder Components)
// ئەم پێکهاتانە دواتر بە وردی دروست دەکرێن بۆ دیزاینی تایبەت بە هەر ئامێرێک
const DesktopNavBar = () => (
    <nav className="p-4 flex justify-between items-center max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-ai-primary">Create App Builder AI (Desktop)</h1>
        <div className="flex space-x-6 text-sm">
            <a href="#" className="hover:text-ai-secondary transition-colors">Workspace</a>
            <a href="#" className="hover:text-ai-secondary transition-colors">Agent Dashboard</a>
            <a href="#" className="hover:text-ai-secondary transition-colors">20X Monitor</a>
            <a href="#" className="hover:text-ai-secondary transition-colors">DeepSeek Config</a>
        </div>
    </nav>
);

const MobileNavBar = () => (
    <nav className="p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-ai-primary">CAB-AI (Mobile)</h1>
        <button className="text-ai-secondary">☰ Menu</button>
        {/* لۆژیکی دەرکەوتن و نەدەرکەوتنی مێنیوی مۆبایل (Off-canvas menu) لێرە دادەنرێت */}
    </nav>
);

const AgentNotificationCenter = () => (
    <div className="fixed bottom-4 right-4 z-50 p-3 bg-ai-secondary text-ai-code rounded-lg shadow-xl animate-bounce" style={{ display: 'none' }}>
        {/* Agent 007 just fixed a critical bug! */}
    </div>
);
