import "./globals.css";
import Layout from "@/components/Layout";

export const metadata = {
  title: "Spotify Viz",
  description: "Fun visualizations of your Spotify data",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
