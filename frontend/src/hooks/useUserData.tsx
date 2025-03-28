import { useContext } from "react";
import UserContext, {UserContextType } from "../context/UserContext";

export const useUserData = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("UserData must be used within a UserProvider");
  }
  return context;
}