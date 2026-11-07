export const metadata = { title: "Pair WhatsApp Bot", description: "Unganisha WhatsApp yako na bot kwa namba" };
export default function RootLayout({ children }) {
  return (
    <html lang="sw">
      <head><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
