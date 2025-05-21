import { api } from "@/convex/_generated/api";
import { useUser } from "@stackframe/stack";
import { useMutation } from "convex/react";
import React, { useEffect, useState } from "react";
import { UserContext } from "./_context/UserContext";

function AuthProvider({ children }) {
  const user = useUser();
  const CreateUser = useMutation(api.users.CreateUser);
  const [userData, setUserData] = useState();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (user) {
      CreateNewUser();
    }
  }, [user]);

  const CreateNewUser = async () => {
    try {
      const result = await CreateUser({
        name: user?.displayName || user?.primaryEmail?.split("@")[0] || "User",
        email: user?.primaryEmail,
      });
      setUserData(result);
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  return (
    <div>
      <UserContext.Provider value={{ userData, setUserData }}>
        {children}
      </UserContext.Provider>
    </div>
  );
}

export default AuthProvider;
