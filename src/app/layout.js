import localFont from "next/font/local";
// import Head from 'next/head';
// import "./globals.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import AddBootstrap from "./AddBootstrap";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "TorahAnytime | DailyDose",
  description: "New Daily Doses Book is a collection of the most powerful and inspiring Torah teachings shared by our esteemed speakers on the DailyDose App and TorahAnyTime platform.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
        <AddBootstrap />
        <script src="https://code.jquery.com/jquery-3.7.1.min.js" ></script>
      </body>
    </html>
  );
}
     
   