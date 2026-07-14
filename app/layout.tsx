// app/layout.tsx
import "../globals.css";
import { Inter } from "next/font/google";
import BottomNav from "../components/BottomNav"; // <-- IMPORTAZIONE AGGIUNTA
import Header from "../components/Header";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata = {
  title: "Cantina Vini",
  description: "La tua cantina personale di vini",
};

// Definiamo il tipo per la prop children, essenziale in TypeScript/TSX
interface RootLayoutProps {
    children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) { // <-- TIPO AGGIUNTO
  return (
    <html lang="it">
      <body className={`${inter.className} bg-sand-50`}>
        
        {/*
          <main> Centrata (max-w-[500px]) e con padding in basso (pb-24)
          per fare spazio alla BottomNav fissa.
        */}
        <main className="min-h-screen bg-sand-50 max-w-[500px] mx-auto pb-24 relative"> 
          <Header />
          {children}
        </main>
        
        {/* BARRA DI NAVIGAZIONE FISSA */}
        <BottomNav /> 
        
      </body>
    </html>
  );
}