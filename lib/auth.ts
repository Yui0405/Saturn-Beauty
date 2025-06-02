// Interface for user data
interface User {
  id: string;
  username: string;
  email: string;
  role: "admin" | "user";
  name: string;
  bio: string;
  telefono: string;
  direccion: string;
  password: string;
  avatar: string;
  joinDate: string;
  lastLogin: string;
}

// Interface for session data
interface SessionUser {
  id: string;
  username: string;
  email: string;
  role: "admin" | "user";
  name: string;
  avatar: string;
  isLoggedIn: boolean;
}

// Initialize session from localStorage if available
const getSession = (): SessionUser | null => {
  if (typeof window === "undefined") return null;

  const session = localStorage.getItem("session");
  if (!session) return null;

  try {
    return JSON.parse(session) as SessionUser;
  } catch {
    return null;
  }
};

// Save session to localStorage
const setSession = (user: SessionUser | null) => {
  if (typeof window === "undefined") return;

  if (user) {
    localStorage.setItem("session", JSON.stringify(user));
  } else {
    localStorage.removeItem("session");
  }
};

// Helper function to get users from localStorage and JSON file
const getUsers = async (): Promise<User[]> => {
  try {
    // Get users from localStorage
    const storedUsers = localStorage.getItem('saturn-users');
    const localStorageUsers = storedUsers ? JSON.parse(storedUsers) : [];
    
    // Get users from JSON file
    const response = await fetch('/data/users.json');
    const data = await response.json();
    const jsonUsers = data.users || [];
    
    // Combine both sources and remove duplicates by ID
    const usersMap = new Map();
    
    // Add JSON users first
    jsonUsers.forEach((user: User) => usersMap.set(user.id, user));
    // Override with localStorage users (these would be more recent)
    localStorageUsers.forEach((user: User) => usersMap.set(user.id, user));
    
    return Array.from(usersMap.values());
  } catch (error) {
    console.error('Error loading users:', error);
    return [];
  }
};

// Login function
export const login = async (
  emailOrUsername: string,
  password: string
): Promise<SessionUser | null> => {
  try {
    const users = await getUsers();
    
    // Find user by email or username
    const user = users.find(
      (u) => 
        (u.email.toLowerCase() === emailOrUsername.toLowerCase() || 
         u.username.toLowerCase() === emailOrUsername.toLowerCase()) &&
        u.password === password
    );

    if (user) {
      // Update last login time
      const updatedUser = {
        ...user,
        lastLogin: new Date().toISOString()
      };
      
      // Save updated user back to localStorage
      const storedUsers = localStorage.getItem('saturn-users') || '[]';
      const usersList = JSON.parse(storedUsers);
      const userIndex = usersList.findIndex((u: User) => u.id === user.id);
      
      if (userIndex >= 0) {
        usersList[userIndex] = updatedUser;
      } else {
        usersList.push(updatedUser);
      }
      
      localStorage.setItem('saturn-users', JSON.stringify(usersList));
      
      // Create session
      const sessionUser: SessionUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        name: user.name,
        avatar: user.avatar,
        isLoggedIn: true,
      };
      
      setSession(sessionUser);
      return sessionUser;
    }
    
    return null;
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
};

// Register new user
export const register = async (userData: Omit<User, 'id' | 'joinDate' | 'lastLogin' | 'avatar' | 'bio' | 'telefono' | 'direccion'> & { confirmPassword: string }): Promise<{ success: boolean; message: string }> => {
  try {
    // Validate required fields
    if (!userData.name || !userData.email || !userData.username || !userData.password || !userData.confirmPassword) {
      return { success: false, message: 'Por favor, completa todos los campos.' };
    }

    // Validate password match
    if (userData.password !== userData.confirmPassword) {
      return { success: false, message: 'Las contraseñas no coinciden.' };
    }

    // Validate password strength (at least 8 characters, 1 number, 1 special character)
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(userData.password)) {
      return { 
        success: false, 
        message: 'La contraseña debe tener al menos 8 caracteres, incluyendo al menos un número y un carácter especial.' 
      };
    }

    const users = await getUsers();
    
    // Check if email already exists
    if (users.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
      return { success: false, message: 'Este correo electrónico ya está registrado.' };
    }

    // Check if username already exists
    if (users.some(u => u.username.toLowerCase() === userData.username.toLowerCase())) {
      return { success: false, message: 'Este nombre de usuario ya está en uso.' };
    }

    // Create new user
    const newUser: User = {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      username: userData.username,
      password: userData.password, // In a real app, this should be hashed
      role: 'user',
      bio: '',
      telefono: '',
      direccion: '',
      avatar: '/images/users/default-avatar.png',
      joinDate: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    // Save to localStorage
    const storedUsers = localStorage.getItem('saturn-users') || '[]';
    const usersList = JSON.parse(storedUsers);
    usersList.push(newUser);
    localStorage.setItem('saturn-users', JSON.stringify(usersList));

    // Create and set session
    const sessionUser: SessionUser = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
      avatar: newUser.avatar,
      isLoggedIn: true,
    };
    
    setSession(sessionUser);
    
    return { 
      success: true, 
      message: '¡Registro exitoso! Bienvenido/a a Saturn Beauty.' 
    };
  } catch (error) {
    console.error('Registration error:', error);
    return { 
      success: false, 
      message: 'Ocurrió un error al registrar el usuario. Por favor, inténtalo de nuevo.' 
    };
  }
};

// Logout function
export const logout = () => {
  setSession(null);
};

// Check if user is admin
export const isAdmin = (): boolean => {
  if (typeof window === "undefined") return false;
  const session = getSession();
  return session?.role === "admin" && session?.isLoggedIn === true;
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  if (typeof window === "undefined") return false;
  const session = getSession();
  return session?.isLoggedIn === true;
};

// Get current user
export const getCurrentUser = (): SessionUser | null => {
  if (typeof window === "undefined") return null;
  return getSession();
};

// Export session getter for use in components
export const useAuth = () => {
  return {
    session: getSession(),
    isAdmin: isAdmin(),
    isAuthenticated: isAuthenticated(),
    login,
    logout,
  };
};
