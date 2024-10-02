"use client"
import { onAuthStateChanged, User } from "firebase/auth";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { auth } from "../../firebase";

type AppProviderProps = {
    children: ReactNode
}

type AppContextType = {
    user: User | null;
    userid: string | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    selectRoom: string | null;
    setSelectRoom: React.Dispatch<React.SetStateAction<string | null>>;
    selectRoomName: string | null;
    setSelectRoomName: React.Dispatch<React.SetStateAction<string | null>>;    
}

const defaultContextData = {
    user: null,
    userid: null,
    setUser: () => {},
    selectRoom: null,
    setSelectRoom: () => {},
    selectRoomName: null,
    setSelectRoomName: () => {},
};

const AppContext = createContext<AppContextType>(defaultContextData);

export function AppProvider({children}: AppProviderProps){
    const [user, setUser] = useState<User | null>(null);
    const [userid, setUserid] = useState<string | null>(null);
    const [selectRoom, setSelectRoom] = useState<string | null>(null);
    const [selectRoomName, setSelectRoomName] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (newUser) => {
            setUser(newUser);
            setUserid(newUser ? newUser.uid : null)
        });

        return () => {
            unsubscribe();
        }
    }, [])

    return <AppContext.Provider
    value={{user, userid, setUser, selectRoom, setSelectRoom, selectRoomName, setSelectRoomName}}
    >
        {children}
    </AppContext.Provider>
}

export function useAppContext() {
    return useContext(AppContext);
  }