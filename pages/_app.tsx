import type { AppProps } from 'next/app';
import '../client/src/index.css';

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
