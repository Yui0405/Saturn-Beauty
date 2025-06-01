import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Hero() {
  return (
    <section className="relative h-[500px] overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/images/Banner.png"
          alt="Mujer rodeada de flores naturales"
          width={1920}
          height={500}
          className="object-cover w-full h-full"
          priority
        />
        <div className="absolute inset-0 hero-overlay"></div>
      </div>

      <div className="relative h-full flex items-center justify-center">
        <div className="max-w-2xl bg-mint-green/90 backdrop-blur-sm p-8 rounded-lg text-center">
          <h1 className="text-3xl md:text-4xl font-bold mt-2 mb-4 text-white font-playfair">
            Descubre la belleza natural
          </h1>
          <p className="text-white mb-6 font-poppins">
            Productos cosméticos naturales que realzan tu belleza y cuidan tu piel con ingredientes puros y sostenibles.
          </p>
          <Link href="/productos">
            <Button className="bg-white text-mint-green-dark hover:bg-gray-100 font-poppins">
              Descubrir productos
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
