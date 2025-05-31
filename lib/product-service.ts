import fs from "fs/promises";
import path from "path";
import { Product } from "./api-service";

const PRODUCTS_FILE_PATH = path.join(
  process.cwd(),
  "public/data/products.json"
);

export async function readProducts(): Promise<Product[]> {
  const content = await fs.readFile(PRODUCTS_FILE_PATH, "utf-8");
  const data = JSON.parse(content);
  return data.products;
}

export async function writeProducts(products: Product[]): Promise<void> {
  await fs.writeFile(PRODUCTS_FILE_PATH, JSON.stringify({ products }, null, 2));
}

export async function createProduct(
  product: Omit<Product, "id">
): Promise<Product> {
  const products = await readProducts();
  const newId = (
    Math.max(...products.map((p) => parseInt(p.id)), 0) + 1
  ).toString();
  const newProduct = { ...product, id: newId };

  await writeProducts([...products, newProduct]);
  return newProduct;
}

export async function updateProduct(
  id: string,
  product: Omit<Product, "id">
): Promise<Product> {
  const products = await readProducts();
  const updatedProduct = { ...product, id };
  const updatedProducts = products.map((p) =>
    p.id === id ? updatedProduct : p
  );

  await writeProducts(updatedProducts);
  return updatedProduct;
}

export async function deleteProduct(id: string): Promise<void> {
  const products = await readProducts();
  const updatedProducts = products.filter((p) => p.id !== id);
  await writeProducts(updatedProducts);
}
