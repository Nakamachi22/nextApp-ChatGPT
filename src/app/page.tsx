"use client"
import { useAppContext } from "@/context/Appcontext";
import Chat from "./components/Chat";
import Sidebar from "./components/Sidebar";
import { useRouter } from "next/navigation";

export default function Home() {

  const {user} = useAppContext();
  const router = useRouter()

  if(!user) {
    router.push("auth/login");
  }

  return (
    <>
    <div className="flex h-screen justify-center items-center">
      <div className="h-full flex" style={{width: "1280px"}}>
        <div className="w-1/5 border-r bg-red-200">
          <Sidebar />
        </div>
        <div className="w-4/5 ">
          <Chat />
        </div>
      </div>
    </div>
    </>
  );
}
