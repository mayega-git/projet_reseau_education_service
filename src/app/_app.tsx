import RootLayout from "./layout";
import { AppProps } from 'next/app';

function MyApp({ Component, pageProps } : AppProps) {
  return (
    <RootLayout>
      <Component {...pageProps} />
    </RootLayout>
  );
}

export default MyApp;
