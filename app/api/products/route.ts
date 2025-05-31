import { NextResponse } from "next/server";
import {
  getProducts,
  updateProduct,
  createProduct,
  deleteProduct,
  getProductById,
} from "@/lib/api-service";

export async function GET(request: Request) {
  try {
    console.log('Solicitud GET a /api/products');
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      console.log(`Buscando producto con ID: ${id}`);
      const product = await getProductById(id);
      if (product) {
        console.log('Producto encontrado:', product);
        return NextResponse.json(product);
      }
      console.warn(`Producto no encontrado con ID: ${id}`);
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    console.log('Obteniendo todos los productos...');
    const products = await getProducts();
    console.log(`Devolviendo ${products.length} productos`);
    
    // Asegurarse de que siempre devolvemos un objeto con la propiedad products
    const responseData = Array.isArray(products) ? { products } : products;
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error en GET /api/products:', error);
    return NextResponse.json(
      { message: "Error al obtener los productos", error: error instanceof Error ? error.message : 'Error desconocido' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const product = await request.json();
    const newProduct = await createProduct(product);

    if (newProduct) {
      return NextResponse.json(newProduct);
    } else {
      return NextResponse.json(
        { message: "Error creating product" },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { message: "Error processing request" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const product = await request.json();
    const success = await updateProduct(product);

    if (success) {
      return NextResponse.json({ message: "Product updated successfully" });
    } else {
      return NextResponse.json(
        { message: "Error updating product" },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { message: "Error processing request" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "Product ID is required" },
        { status: 400 }
      );
    }

    const success = await deleteProduct(id);

    if (success) {
      return NextResponse.json({ message: "Product deleted successfully" });
    } else {
      return NextResponse.json(
        { message: "Error deleting product" },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { message: "Error processing request" },
      { status: 500 }
    );
  }
}
