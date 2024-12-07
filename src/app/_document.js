import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="fr">
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icon512_maskable.png" />
        <meta name="theme-color" content="#000000" />
        <meta name="description" content="Description de l'application PWA" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
