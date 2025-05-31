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
  createdAt: string;
  name?: string;
  avatar?: string;
  bio?: string;
  password: string;
}

// Función auxiliar para cargar usuarios iniciales si no existen
const getInitialUsers = (): User[] => [
  {
    id: "1",
    username: "lisbethAdmin",
    email: "admin@saturnbeauty.com",
    role: "admin",
    name: "Lisbeth Administradora",
    avatar: "/placeholder.svg",
    bio: "Administradora principal de Saturn Beauty",
    createdAt: "2024-01-01T00:00:00.000Z",
    password: hashPassword("admin123"),
  },
  {
    id: "2",
    username: "maria.garcia",
    email: "maria.garcia@example.com",
    role: "user",
    name: "María García",
    avatar: "/placeholder.svg",
    bio: "Amante de los cosméticos naturales",
    createdAt: "2024-01-15T00:00:00.000Z",
    password: hashPassword("user123"),
  },
  {
    id: "3",
    username: "ana.lopez",
    email: "ana.lopez@example.com",
    role: "user",
    name: "Ana López",
    avatar: "/placeholder.svg",
    bio: "Experta en maquillaje",
    createdAt: "2024-02-01T00:00:00.000Z",
    password: hashPassword("user123"),
  },
];

export function readUsers(): User[] {
  if (typeof window === "undefined") {
    return getInitialUsers();
  }

  const storedUsers = localStorage.getItem("users");
  if (!storedUsers) {
    const initialUsers = getInitialUsers();
    localStorage.setItem("users", JSON.stringify(initialUsers));
    return initialUsers;
  }

  return JSON.parse(storedUsers);
}

export function writeUsers(users: User[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("users", JSON.stringify(users));
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
