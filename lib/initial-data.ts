export interface News {
  id: string;
  title: string;
  description: string;
  image: string;
  originalUrl: string;
}

export interface Tip {
  id: string;
  title: string;
  description: string;
  image: string;
  authorName: string;
}

export const initialNews: News[] = [
  {
    id: "1",
    title: "Últimas tendencias en cuidado facial",
    description:
      "Descubre las nuevas rutinas de skincare que están revolucionando la industria de la belleza en 2024.",
    image: "/placeholder.jpg",
    originalUrl: "https://example.com/news1",
  },
  {
    id: "2",
    title: "Innovaciones en productos naturales",
    description:
      "Los ingredientes orgánicos están transformando la manera en que cuidamos nuestra piel.",
    image: "/placeholder.jpg",
    originalUrl: "https://example.com/news2",
  },
  {
    id: "3",
    title: "Tecnología y belleza",
    description:
      "Nuevos dispositivos y aplicaciones que están cambiando la industria cosmética.",
    image: "/placeholder.jpg",
    originalUrl: "https://example.com/news3",
  },
];

export const initialTips: Tip[] = [
  {
    id: "1",
    title: "Rutina matutina perfecta",
    description:
      "Comienza tu día con estos simples pasos para mantener tu piel radiante y saludable.",
    image: "/placeholder.jpg",
    authorName: "María Rodríguez",
  },
  {
    id: "2",
    title: "Hidratación profunda",
    description:
      "Aprende a mantener tu piel hidratada durante todo el día con estos consejos expertos.",
    image: "/placeholder.jpg",
    authorName: "Ana García",
  },
  {
    id: "3",
    title: "Cuidado nocturno esencial",
    description:
      "Maximiza el proceso de regeneración de tu piel durante la noche con esta rutina.",
    image: "/placeholder.jpg",
    authorName: "Laura Martínez",
  },
];
