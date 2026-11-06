import { CartProvider } from '@/components/CartProvider';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { JsonLd } from '@/components/JsonLd';
import { getStyleTiles } from '@/lib/queries';
import { organizationJsonLd, websiteJsonLd } from '@/lib/seo';

export const revalidate = 300;

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const styles = (await getStyleTiles()).map((tile) => tile.style);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
      >
        Skip to content
      </a>
      <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
      <CartProvider>
        <Header styles={styles} />
        <main id="main">{children}</main>
        <Footer />
      </CartProvider>
    </>
  );
}
