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

interface SessionUser {
  id: string;
  username: string;
  email: string;
  role: "admin" | "user";
  name: string;
  avatar: string;
  isLoggedIn: boolean;
}

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

const setSession = (user: SessionUser | null) => {
  if (typeof window === "undefined") return;

  if (user) {
    localStorage.setItem("session", JSON.stringify(user));
  } else {
    localStorage.removeItem("session");
  }
};

const getUsers = async (): Promise<User[]> => {
  try {
    const storedUsers = localStorage.getItem('saturn-users');
    const localStorageUsers = storedUsers ? JSON.parse(storedUsers) : [];
    
    const response = await fetch('/data/users.json');
    const data = await response.json();
    const jsonUsers = data.users || [];
    
    const usersMap = new Map();
    
    jsonUsers.forEach((user: User) => usersMap.set(user.id, user));
    localStorageUsers.forEach((user: User) => usersMap.set(user.id, user));
    
    return Array.from(usersMap.values());
  } catch (error) {
    console.error('Error loading users:', error);
    return [];
  }
};

export const login = async (
  emailOrUsername: string,
  password: string
): Promise<SessionUser | null> => {
  try {
    const users = await getUsers();
    
    const user = users.find(
      (u) => 
        (u.email.toLowerCase() === emailOrUsername.toLowerCase() || 
        u.username.toLowerCase() === emailOrUsername.toLowerCase()) &&
        u.password === password
    );

    if (user) {
      const updatedUser = {
        ...user,
        lastLogin: new Date().toISOString()
      };
      
      const storedUsers = localStorage.getItem('saturn-users') || '[]';
      const usersList = JSON.parse(storedUsers);
      const userIndex = usersList.findIndex((u: User) => u.id === user.id);
      
      if (userIndex >= 0) {
        usersList[userIndex] = updatedUser;
      } else {
        usersList.push(updatedUser);
      }
      
      localStorage.setItem('saturn-users', JSON.stringify(usersList));
      
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

export const register = async (userData: Omit<User, 'id' | 'joinDate' | 'lastLogin' | 'avatar' | 'bio' | 'telefono' | 'direccion'> & { confirmPassword: string }): Promise<{ success: boolean; message: string }> => {
  try {
    if (!userData.name || !userData.email || !userData.username || !userData.password || !userData.confirmPassword) {
      return { success: false, message: 'Por favor, completa todos los campos.' };
    }

    if (userData.password !== userData.confirmPassword) {
      return { success: false, message: 'Las contraseñas no coinciden.' };
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(userData.password)) {
      return { 
        success: false, 
        message: 'La contraseña debe tener al menos 8 caracteres, incluyendo al menos un número y un carácter especial.' 
      };
    }

    const users = await getUsers();
    
    if (users.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
      return { success: false, message: 'Este correo electrónico ya está registrado.' };
    }

    if (users.some(u => u.username.toLowerCase() === userData.username.toLowerCase())) {
      return { success: false, message: 'Este nombre de usuario ya está en uso.' };
    }

    const newUser: User = {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      username: userData.username,
      password: userData.password, 
      role: 'user',
      bio: '',
      telefono: '',
      direccion: '',
      avatar: '/images/users/default-avatar.png',
      joinDate: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    const storedUsers = localStorage.getItem('saturn-users') || '[]';
    const usersList = JSON.parse(storedUsers);
    usersList.push(newUser);
    localStorage.setItem('saturn-users', JSON.stringify(usersList));

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

export const logout = () => {
  setSession(null);
};

export const isAdmin = (): boolean => {
  if (typeof window === "undefined") return false;
  const session = getSession();
  return session?.role === "admin" && session?.isLoggedIn === true;
};

export const isAuthenticated = (): boolean => {
  if (typeof window === "undefined") return false;
  const session = getSession();
  return session?.isLoggedIn === true;
};

export const getCurrentUser = (): SessionUser | null => {
  if (typeof window === "undefined") return null;
  return getSession();
};

export const useAuth = () => {
  return {
    session: getSession(),
    isAdmin: isAdmin(),
    isAuthenticated: isAuthenticated(),
    login,
    logout,
  };
};
