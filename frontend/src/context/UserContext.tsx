import axios from "axios";
import React, {
  createContext,
  ReactNode,
//   useContext,
  useEffect,
  useState,
} from "react";
import toast, { Toaster } from "react-hot-toast";

// const server = "http://13.235.70.183:5000";

const API_URL = import.meta.env.VITE_API_USER_URL;
const API_USER_PORT = import.meta.env.VITE_API_USER_PORT;

const server = `${API_URL}:${API_USER_PORT}`;

// const server = 'http://localhost:5001';


// const server = `${process.env.API_URL}:${process.env.API_USER_PORT}`;

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  playlists: string[];
}

export interface UserContextType {
  user: User | null;
  isAuth: boolean;
  loading: boolean;
  btnLoading: boolean;
  loginUser: (
    email: string,
    password: string,
    navigate: (path: string) => void
  ) => Promise<void>;
  registerUser: (
    name: string,
    email: string,
    password: string,
    navigate: (path: string) => void
  ) => Promise<void>;
  addToPlaylist: (id: string) => void;
  logoutUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

  async function registerUser(
    name: string,
    email: string,
    password: string,
    navigate: (path: string) => void
  ) {
    setBtnLoading(true);
    try {
      const { data } = await axios.post(`${server}/api/v1/user/registerUser`, {
        name,
        email,
        password,
      });

      toast.success(data.message);
      localStorage.setItem("token", data.token);
      setUser(data.user);
      setIsAuth(true);
      setBtnLoading(false);
      navigate("/");
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data?.message || "An error occurred");
      } else {
        toast.error("An unexpected error occurred");
      }
      setBtnLoading(false);
    }
  }

  async function loginUser(
    email: string,
    password: string,
    navigate: (path: string) => void
  ) {
    setBtnLoading(true);
    try {
      const { data } = await axios.post(`${server}/api/v1/user/loginUser`, {
        email,
        password,
      });

      toast.success(data.message);
      localStorage.setItem("token", data.token);
      setUser(data.user);
      setIsAuth(true);
      setBtnLoading(false);
      navigate("/");
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data?.message || "An error occurred");
      } else {
        toast.error("An unexpected error occurred");
      }
      setBtnLoading(false);
    }
  }

  async function fetchUser() {
    try {
      const { data } = await axios.get(`${server}/api/v1/user/getUserProfile`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });

      setUser(data);
      setIsAuth(true);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }

  async function logoutUser() {
    localStorage.clear();
    setUser(null);
    setIsAuth(false);

    toast.success("User Logged Out");
  }

  async function addToPlaylist(id: string) {
    try {
      const { data } = await axios.post(
        `${server}/api/v1/songs/${id}`,
        {},
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );

      toast.success(data.message);
      fetchUser();
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data?.message || "An Error Occurred");
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  }

  useEffect(() => {
    fetchUser();
  }, []);
  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        isAuth,
        btnLoading,
        loginUser,
        registerUser,
        logoutUser,
        addToPlaylist,
      }}
    >
      {children}
      <Toaster />
    </UserContext.Provider>
  );
};

export default UserContext

// export const useUserData = (): UserContextType => {
//   const context = useContext(UserContext);
//   if (!context) {
//     throw new Error("useUserData must be used within a UserProvider");
//   }
//   return context;
// };