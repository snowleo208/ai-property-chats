import type { Metadata } from "next";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import './globals.css';

export const metadata: Metadata = {
  title: "Just Ask House Prices",
  description: "Ask anything about the UK housing market. This chatbot uses GPT and real-time document retrieval to answer your questions with linked sources and data charts",
  robots: {
    index: false,
    follow: false,
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <main>
          <Theme
            accentColor="violet"
            grayColor="mauve"
            radius="large"
            scaling="100%"
          >
            {children}
          </Theme>
        </main>
      </body>
    </html>
  );
}
