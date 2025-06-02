import { createHash } from "crypto";

// Simple password hashing using SHA-256
function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: "admin" | "user";
  name: string;
  avatar: string;
  bio: string;
  telefono: string;
  direccion: string;
  password: string;
  joinDate: string;
  lastLogin: string;
  createdAt?: string; // Mantener para compatibilidad
  updatedAt?: string; // Track when user was last updated
}

// Función auxiliar para cargar usuarios iniciales si no existen
const getInitialUsers = (): User[] => {
  try {
    // Intentar cargar desde el archivo JSON primero
    if (typeof window !== 'undefined') {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', '/data/users.json', false); // Sincrónico
      xhr.send();
      
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        if (data?.users?.length > 0) {
          return data.users;
        }
      }
    }
  } catch (error) {
    console.error('Error al cargar usuarios iniciales:', error);
  }
  
  // Datos por defecto si no se puede cargar el archivo
  return [
    {
      id: "1",
      username: "lisbethAdmin",
      email: "admin@saturnbeauty.com",
      role: "admin" as const,
      name: "Lisbeth Administradora",
      avatar: "/images/users/User1.webp",
      bio: "Administradora principal de Saturn Beauty",
      telefono: "+1234567890",
      direccion: "Av. Principal #123, Ciudad",
      password: hashPassword("admin123"),
      joinDate: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }
  ];
};

export function readUsers(): User[] {
  if (typeof window === "undefined") {
    return getInitialUsers();
  }

  const storedUsers = localStorage.getItem("saturn-users");
  if (!storedUsers) {
    const initialUsers = getInitialUsers();
    localStorage.setItem("saturn-users", JSON.stringify(initialUsers));
    return initialUsers;
  }

  try {
    return JSON.parse(storedUsers);
  } catch (error) {
    console.error("Error al analizar usuarios desde localStorage:", error);
    return [];
  }
}

export function writeUsers(users: User[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("saturn-users", JSON.stringify(users));
  }
}

export function createUser(user: Omit<User, "id">): User {
  const users = readUsers();
  const newId = (
    Math.max(...users.map((p) => parseInt(p.id)), 0) + 1
  ).toString();

  const hashedPassword = hashPassword(user.password);

  const newUser = {
    ...user,
    id: newId,
    password: hashedPassword,
  };

  writeUsers([...users, newUser]);
  return newUser;
}

export function updateUser(id: string, user: Partial<Omit<User, "id">>): User {
  const users = readUsers();
  const existingUser = users.find((u) => u.id === id);

  if (!existingUser) {
    throw new Error("User not found");
  }

  if (user.password) {
    user.password = hashPassword(user.password);
  }

  const updatedUser = {
    ...existingUser,
    ...user,
    id,
  };

  const updatedUsers = users.map((u) => (u.id === id ? updatedUser : u));
  writeUsers(updatedUsers);

  return updatedUser;
}

export function deleteUser(id: string): void {
  const users = readUsers();
  const updatedUsers = users.filter((u) => u.id !== id);
  writeUsers(updatedUsers);
}

export function validateUser(email: string, password: string): User | null {
  const users = readUsers();
  const user = users.find((u) => u.email === email);

  if (!user) return null;

  const hashedPassword = hashPassword(password);
  if (hashedPassword === user.password) {
    return user;
  }

  return null;
}

export function getUserById(id: string): User | null {
  const users = readUsers();
  return users.find((u) => u.id === id) || null;
}

export function getUserByEmail(email: string): User | null {
  const users = readUsers();
  return users.find((u) => u.email === email) || null;
}
