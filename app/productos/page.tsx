import ProductsGrid from "@/components/products-grid"

export default function ProductsPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-mint-green-dark">Nuestros Productos</h1>
        <ProductsGrid />
      </div>
    </div>
  )
}
