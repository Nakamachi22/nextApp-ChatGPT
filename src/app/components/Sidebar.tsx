"use client"

import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp, Timestamp, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import { MdLogout } from "react-icons/md";
import { auth, db } from '../../../firebase';
import { useAppContext } from '@/context/Appcontext';

type Room = {
    id: string,
    name: string,
    createAt: Timestamp
}

const Sidebar = () => {
    const {user, userid, setSelectRoom, setSelectRoomName} = useAppContext();

    const [rooms, setRooms] = useState<Room[]>([]);

    useEffect(() => {
        const fetchRooms = async () => {
            const RoomCollectionRef = collection(db, "rooms");
            const q = query(RoomCollectionRef, where("userid", "==", userid), orderBy("createAt"));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const newRooms:Room[] = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    name: doc.data().name,
                    createAt: doc.data().createAt
                }));
                setRooms(newRooms)
                console.log(userid);
            })

            return () => {
                unsubscribe();
            }
        }
        fetchRooms();

    },[userid])

    const selectRoom = (roomid: string, roomname: string) => {
        setSelectRoom(roomid);
        setSelectRoomName(roomname)
    }

    const addNewRoom = async () => {
        const roomName = prompt("ルーム名を入力してください")
        if(roomName) {
            const newRoomRef = collection(db, "rooms");
            await addDoc(newRoomRef, {
                name: roomName,
                userid: userid,
                createAt: serverTimestamp(),
            })
        }
    }

    const handleLogout = () => {
        auth.signOut();
    }

  return (
    <>
        <div className='h-full overflow-y-auto px-5 flex-col '>
            <div className='flex-grow'>
                <div 
                onClick={addNewRoom}
                className='flex justify-evenly items-center border mt-2 rounded-md hover:bg-red-300 duration-150'>
                    <span className='p-4 text-2xl'>+</span>
                    <h1 className='text-sm font-semibold p-4'>新しいチャットの作成</h1>
                </div>
                <ul>
                    {rooms.map((room) => (
                        <li 
                        key={room.id}
                        className='cursor-pointer border-b p-4  hover:bg-red-300'
                        onClick={() => selectRoom(room.id, room.name)}
                        >{room.name}</li>
                    ))}
                </ul>
            </div>
            <div className='absolute bottom-0 rounded bg-red-100'>
            {user && <div className='mb-2 p-1 font-medium'>ログインしているユーザー：<br/>{user.email}</div>}
            <div 
            className='mb-2 cursor-pointer p-1 hover:bg-red-300 flex justify-evenly items-center'
            onClick={() => handleLogout()}
            >
                <MdLogout />
                <span>ログアウト</span>
            </div>
            </div>
        </div>
    </>
  )
}

export default Sidebar