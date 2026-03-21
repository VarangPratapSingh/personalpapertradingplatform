import "./globals.css";
import "./navibar.css";
import "./leftbar.css";
import "./tradbar.css";
import "./logregi.css";
import {TASA_Explorer} from "next/font/google";

const tasa = TASA_Explorer ({
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Paper Trading Prototype",
  description: "Paper Trading App Which Allows NASDAQ Trading In Fake Currency",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={tasa.className}>
        {children}
      </body>
    </html>
  );
}
