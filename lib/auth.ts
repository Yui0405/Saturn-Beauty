// Constants
const ADMIN_USERNAME = "lisbethAdmin";
const ADMIN_PASSWORD = "Qwerty04*+";

// Interface for session data
interface SessionUser {
  username: string;
  role: "admin" | "user";
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

// Login function
export const login = (
  username: string,
  password: string
): SessionUser | null => {
  // Check admin credentials
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const adminUser: SessionUser = {
      username: ADMIN_USERNAME,
      role: "admin",
      isLoggedIn: true,
    };
    setSession(adminUser);
    return adminUser;
  }

  // TODO: Add regular user login logic here
  return null;
};

// Logout function
export const logout = () => {
  setSession(null);
};

// Check if user is admin
export const isAdmin = (): boolean => {
  const session = getSession();
  return session?.role === "admin";
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const session = getSession();
  return session?.isLoggedIn ?? false;
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
