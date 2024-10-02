"use client"
import { addDoc, collection, doc, onSnapshot, orderBy, query, serverTimestamp, Timestamp } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react'
import { IoMdSend } from "react-icons/io";
import { db } from '../../../firebase';
import { useAppContext } from '@/context/Appcontext';
import OpenAI from 'openai';
import LoadingIcons from 'react-loading-icons'

type Message = {
    text: string;
    sender: string;
    createAt: Timestamp
}

    const Chat = () => {
    const openai = new OpenAI({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true
    });

    const { selectRoom, selectRoomName } = useAppContext();
    const [inputMessage, setInputMessage] = useState<string>("")
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const scrollDiv = useRef<HTMLDivElement>(null); 

    const messageData = {
        text: inputMessage,
        sender: "user",
        createAt: serverTimestamp(),
    }

    //各roomのメッセージの取得
    useEffect(() => {
        if(selectRoom){
            const fetchMessages = async() => {
                const roomDocRef = doc(db, "rooms", selectRoom );
                const messageCollectionRef = collection(roomDocRef, "messages");
                const q = query(messageCollectionRef, orderBy("createAt"));
                const unsubscribe = onSnapshot(q, (snapshot) => {
                    const newMessage = snapshot.docs.map((doc) => doc.data() as Message);
                    setMessages(newMessage);
                })
    
                return () => {
                    unsubscribe();
                }
            }
            fetchMessages();            
        }
    },[selectRoom])

    useEffect(() => {
        if(scrollDiv.current){
            const element = scrollDiv.current;
            element.scrollTo({
                top: element.scrollHeight,
                behavior: "smooth",
            })
        }
    })

    const sendMessege = async() => {
        if(!inputMessage.trim()) return;
        //メッセージをfirestoreに保存する
        if(selectRoom) {
            const roomDocRef = doc(db, "rooms", selectRoom);
            const messageCollectionRef = collection(roomDocRef, "messages");
            await addDoc(messageCollectionRef,messageData);

            setIsLoading(true);
            setInputMessage("");
        //OpenAIからの返信
        const gptResponse = await openai.chat.completions.create({
        messages: [{role: "user", content: inputMessage}],
        model: "gpt-3.5-turbo"
         });

        setIsLoading(false);

        const botResponse = gptResponse.choices[0].message.content;
        await addDoc(messageCollectionRef,{
            text: botResponse,
            sender: "bot",
            createAt: serverTimestamp(),
        })
        }

    }


    



    //const botResponse = gptResponse.choices[0].message.content

  return (
    <>
        <div className='bg-gray-50 h-full p-4 flex flex-col'>
            <h1 className='text-2xl font-semibold'>{selectRoomName}</h1>
            <div className='flex-grow overflow-y-auto mb-4' ref={scrollDiv}>
                {messages.map((message, index) => (
                     <div key={index} 
                     className={message.sender === "user" ? "text-right" : "text-left"}
                     >
                        <div 
                        className={
                            message.sender === "user"
                            ? "bg-red-200 inline-block rounded py-2 px-4 mb-2"
                            : "bg-blue-200 inline-block rounded py-2 px-4 mb-2"
                        }>
                            <p>{message.text}</p>
                        </div>
                     </div>
                ))}
                {isLoading && <LoadingIcons.TailSpin/>}
            </div>

            <div className='flex-shrink-0 relative '>
                <input 
                type='text'
                placeholder='Send a Message'
                className='border-2 rounded w-full pr-10 focus:outline-none p-2 '
                onChange={(e) => setInputMessage(e.target.value)}
                value={inputMessage}
                /*クリックしたら送信できるようになる処理
                onKeyDown={(e) => {
                    if(e.key === "Enter"){
                        sendMessege()
                    }
                }}
                */
                ></input>
                <button 
                className='absolute inset-y-0 right-2 flex items-center'
                onClick={() => sendMessege()}>
                    <IoMdSend />
                </button>
            </div>
        </div>
    </>

  )
}

export default Chat