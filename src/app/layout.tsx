import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MCP Web Client',
  description: 'AI-powered data analysis with Model Context Protocol',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground antialiased">{children}</body>
    </html>
  );
}