import './globals.css';
export const metadata = { title: 'FarmTrack Dashboard', description: '採卵鶏農場 分析システム' };
export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body style={{margin:0,padding:0,background:'#f8fafc'}}>{children}</body>
    </html>
  );
}
