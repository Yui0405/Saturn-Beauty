import Hero from "@/components/hero"
import ProductCarousel from "@/components/product-carousel"
import SkinTypeRecommendations from "@/components/skin-type-recommendations"
import NewsSection from "@/components/news-section"
import TipsSection from "@/components/tips-section"
import ScrollToTop from "@/components/scroll-to-top"

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <ProductCarousel />
        </div>
      </section>

      <section className="py-12 bg-mint-green-light">
        <div className="container mx-auto px-4">
          <SkinTypeRecommendations />
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="section-title text-center mb-8">Noticias</h2>
          <NewsSection />
        </div>
      </section>

      <section className="py-12 bg-mint-green-light">
        <div className="container mx-auto px-4">
          <h2 className="section-title text-center mb-8">Consejos del día</h2>
          <TipsSection />
        </div>
      </section>

      <ScrollToTop />
    </div>
  )
}
