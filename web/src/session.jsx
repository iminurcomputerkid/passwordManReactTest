import { createContext, useContext, useEffect, useMemo, useState } from "react";

const SessionContext = createContext(null);

function getStored(key) {
  return sessionStorage.getItem(key);
}

export function SessionProvider({ children }) {
  const [sessionToken, setSessionToken] = useState(() => getStored("sessionToken"));
  const [username, setUsername] = useState(() => getStored("username"));

  useEffect(() => {
    if (sessionToken) {
      sessionStorage.setItem("sessionToken", sessionToken);
    } else {
      sessionStorage.removeItem("sessionToken");
    }
  }, [sessionToken]);

  useEffect(() => {
    if (username) {
      sessionStorage.setItem("username", username);
    } else {
      sessionStorage.removeItem("username");
    }
  }, [username]);

  const value = useMemo(
    () => ({
      sessionToken,
      username,
      login: (token, user) => {
        setSessionToken(token);
        setUsername(user);
      },
      logout: () => {
        setSessionToken(null);
        setUsername(null);
      },
    }),
    [sessionToken, username]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return ctx;
}
