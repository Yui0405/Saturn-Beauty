import Link from "next/link";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4 text-white font-dancing-script">
              Saturn Beauty
            </h3>
            <p className="text-sm font-poppins">
              Cosméticos naturales para una belleza radiante y sostenible.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4 text-white font-playfair">
              Enlaces
            </h3>
            <ul className="space-y-2 text-sm font-poppins">
              <li>
                <Link href="/" className="text-white no-underline">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/productos" className="text-white no-underline">
                  Productos
                </Link>
              </li>
              <li>
                <Link href="/comunidad" className="text-white no-underline">
                  Comunidad
                </Link>
              </li>
              <li>
                <Link
                  href="/sobre-nosotros"
                  className="text-white no-underline"
                >
                  Sobre Nosotros
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4 text-white font-playfair">
              Contacto
            </h3>
            <ul className="space-y-2 text-sm font-poppins">
              <li>Email: info@saturnbeauty.com</li>
              <li>Teléfono: +34 912 345 678</li>
              <li>Dirección: Calle Belleza 123, Madrid</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4 text-white font-playfair">
              Síguenos
            </h3>
            <div className="flex space-x-4">
              <Link
                href="https://facebook.com"
                className="text-white no-underline"
              >
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link
                href="https://instagram.com"
                className="text-white no-underline"
              >
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link
                href="https://twitter.com"
                className="text-white no-underline"
              >
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link
                href="https://youtube.com"
                className="text-white no-underline"
              >
                <Youtube className="h-5 w-5" />
                <span className="sr-only">YouTube</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-divider-color mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-white font-poppins">
            &copy; {new Date().getFullYear()} Saturn Beauty. Todos los derechos
            reservados.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0 text-sm font-poppins">
            <Link href="/terminos" className="text-white no-underline">
              Términos y Condiciones
            </Link>
            <Link href="/privacidad" className="text-white no-underline">
              Política de Privacidad
            </Link>
            <Link href="/cookies" className="text-white no-underline">
              Política de Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
