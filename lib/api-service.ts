import fs from "fs";
import path from "path";

// Use path relative to the project root
const dataDir = path.join(process.cwd(), 'public/data');
const tipsPath = path.join(dataDir, 'tips.json');
const newsPath = path.join(dataDir, 'news.json');
const productsPath = path.join(dataDir, 'products.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Tip types
export interface Tip {
  id: string;
  title: string;
  description: string;
  authorName: string;
  image: string;
}

// News types
export interface News {
  id: string;
  title: string;
  content: string;
  image: string;
  url: string;
  date: string;
}

// productsPath is now defined above

// Product types
export interface Product {
  id: string;
  name: string;
  description: string;
  rating: number;
  skinType: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  popularity: string;
}

// Read products from JSON file
export const getProducts = async (): Promise<Product[]> => {
  try {
    console.log('Buscando archivo de productos en:', productsPath);
    
    if (!fs.existsSync(productsPath)) {
      console.error('El archivo de productos no existe en la ruta:', productsPath);
      // Crear el directorio si no existe
      if (!fs.existsSync(path.dirname(productsPath))) {
        fs.mkdirSync(path.dirname(productsPath), { recursive: true });
      }
      // Crear un archivo de productos vacío
      fs.writeFileSync(productsPath, JSON.stringify({ products: [] }, null, 2));
      return [];
    }
    
    console.log('Leyendo archivo de productos...');
    const data = fs.readFileSync(productsPath, "utf8");
    console.log('Contenido del archivo de productos:', data.substring(0, 200) + '...');
    
    const parsedData = JSON.parse(data);
    console.log('Datos parseados:', Array.isArray(parsedData) ? `Array de ${parsedData.length} elementos` : 'Objeto con propiedades: ' + Object.keys(parsedData).join(', '));
    
    // Manejar tanto el formato { products: [...] } como [...]
    const products = Array.isArray(parsedData) ? parsedData : (parsedData.products || []);
    console.log(`Se encontraron ${products.length} productos`);
    
    return products;
  } catch (error) {
    console.error("Error reading products:", error);
    return [];
  }
};

export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const products = await getProducts();
    return products.find((product) => product.id === id) || null;
  } catch (error) {
    console.error("Error getting product:", error);
    return null;
  }
};

export const updateProduct = async (
  updatedProduct: Product
): Promise<boolean> => {
  try {
    const products = await getProducts();
    const updatedProducts = products.map((product) =>
      product.id === updatedProduct.id ? updatedProduct : product
    );

    fs.writeFileSync(
      productsPath,
      JSON.stringify({ products: updatedProducts }, null, 2)
    );
    return true;
  } catch (error) {
    console.error("Error updating product:", error);
    return false;
  }
};

export const createProduct = async (
  newProduct: Omit<Product, "id">
): Promise<Product | null> => {
  try {
    const products = await getProducts();
    const product: Product = {
      ...newProduct,
      id: Math.max(...products.map((p) => parseInt(p.id)), 0) + 1 + "",
    };

    fs.writeFileSync(
      productsPath,
      JSON.stringify({ products: [...products, product] }, null, 2)
    );
    return product;
  } catch (error) {
    console.error("Error creating product:", error);
    return null;
  }
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  try {
    const products = await getProducts();
    const updatedProducts = products.filter((product) => product.id !== id);

    fs.writeFileSync(
      productsPath,
      JSON.stringify({ products: updatedProducts }, null, 2)
    );
    return true;
  } catch (error) {
    console.error("Error deleting product:", error);
    return false;
  }
};

export const getTips = async (): Promise<Tip[]> => {
  try {
    const data = await fs.promises.readFile(tipsPath, "utf8");
    return JSON.parse(data).tips;
  } catch (error) {
    console.error("Error reading tips:", error);
    return [];
  }
};

export const updateTip = async (updatedTip: Tip): Promise<boolean> => {
  try {
    const data = await fs.promises.readFile(tipsPath, "utf8");
    const { tips } = JSON.parse(data);
    const updatedTips = tips.map((tip: Tip) =>
      tip.id === updatedTip.id ? updatedTip : tip
    );

    await fs.promises.writeFile(
      tipsPath,
      JSON.stringify({ tips: updatedTips }, null, 2),
      "utf8"
    );
    return true;
  } catch (error) {
    console.error("Error updating tip:", error);
    return false;
  }
};

export const getNews = async (): Promise<News[]> => {
  try {
    const data = await fs.promises.readFile(newsPath, "utf8");
    return JSON.parse(data).news;
  } catch (error) {
    console.error("Error reading news:", error);
    return [];
  }
};

export const updateNews = async (updatedNews: News): Promise<boolean> => {
  try {
    const data = await fs.promises.readFile(newsPath, "utf8");
    const { news } = JSON.parse(data);
    const updatedNewsItems = news.map((item: News) =>
      item.id === updatedNews.id ? updatedNews : item
    );

    await fs.promises.writeFile(
      newsPath,
      JSON.stringify({ news: updatedNewsItems }, null, 2),
      "utf8"
    );
    return true;
  } catch (error) {
    console.error("Error updating news:", error);
    return false;
  }
};
