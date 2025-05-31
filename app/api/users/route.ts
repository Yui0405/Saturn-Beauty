import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import {
  readUsers,
  createUser,
  updateUser,
  deleteUser,
  User,
} from "@/lib/user-service";

// Función auxiliar para escribir en el archivo JSON
async function writeUsersToFile(users: User[]) {
  const filePath = path.join(process.cwd(), "public", "data", "users.json");
  await fs.writeFile(filePath, JSON.stringify({ users }, null, 2));
}

export async function GET(request: Request) {
  try {
    const filePath = path.join(process.cwd(), "public", "data", "users.json");
    const fileContent = await fs.readFile(filePath, "utf-8");
    const data = JSON.parse(fileContent);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error reading users:", error);
    return NextResponse.json(
      { error: "Failed to read users" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const data = await request.json();

    // Si hay ID, actualizar usuario específico
    if (id) {
      const users = await readUsers();
      const userIndex = users.findIndex((u) => u.id === id);

      if (userIndex === -1) {
        return NextResponse.json(
          { message: "User not found" },
          { status: 404 }
        );
      }

      // Actualizar usuario existente
      const updatedUser = {
        ...users[userIndex],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      users[userIndex] = updatedUser;

      await writeUsersToFile(users);
      return NextResponse.json(updatedUser);
    }

    // Si no hay ID, actualizar toda la lista de usuarios
    if (!data.users || !Array.isArray(data.users)) {
      return NextResponse.json(
        { error: "Invalid data format" },
        { status: 400 }
      );
    }

    await writeUsersToFile(data.users);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating users:", error);
    return NextResponse.json(
      { message: "Error updating users" },
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
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    // Eliminar del localStorage
    await deleteUser(id);

    // Actualizar el archivo JSON
    const users = await readUsers();
    const updatedUsers = users.filter((u) => u.id !== id);
    await writeUsersToFile(updatedUsers);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { message: "Error deleting user" },
      { status: 500 }
    );
  }
}
