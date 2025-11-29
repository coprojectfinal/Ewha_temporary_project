import { useState, useRef, useLayoutEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeftIcon, HomeIcon, PlusIcon, ArrowUpCircleIcon } from '@heroicons/react/24/solid'

export default function Chatbot() {
    const [messages, setMessages] = useState([
        { 
            id: 1, role: "assistant", 
            text: "ProdCheck의 Q&A 챗봇입니다.\n무엇이든 물어보세요!\n\nex) 내 건강 정보에 맞는 밀키트를 찾아줘!" 
        }
    ]);
    const [input, setInput] = useState("");

    const bottomRef = useRef(null);

    const navigate = useNavigate();

    const sendMessage = async (text) => {
        if (!text.trim()) return;

        const userMessage = { id: Date.now(), role: "user", text: text.trim() };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");

        // API 호출
        try {
        const res = await fetch("http://localhost:8080/api/chatbot/ask", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: "1",  // 나중에 로그인 연동하면 아이디로 바꾸면 됨
                message: text
            })
        });

        const data = await res.json();

        const botMessage = {
            id: Date.now() + 1,
            role: "assistant",
            text: data.reply
        };

        setMessages((prev) => [...prev, botMessage]);

    } catch (err) {
        const errMsg = {
            id: Date.now() + 1,
            role: "assistant",
            text: "⚠️ 응답 오류: " + err.message
        };
        setMessages((prev) => [...prev, errMsg]);
    }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        sendMessage(input);
    };
    
    useLayoutEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [messages]);

    return (
        <div className="flex flex-col min-h-screen bg-white">
            {/* 상단 내비게이션 */}
            <header className="fixed top-0 left-0 z-50 bg-white w-full h-[67px] flex items-center justify-between px-[20px]">
                <button 
                    onClick={() => navigate(-1)}
                    className="hover:scale-105 transition"
                >
                    <ArrowLeftIcon width={25} height={25}/>
                </button>
                <h1 className="flex-1 text-center text-xl font-medium">
                    챗봇
                </h1>
                <button 
                    onClick={() => navigate("/")}
                    className="hover:scale-105 transition"
                >
                    <HomeIcon width={25} height={25}/>
                </button>
            </header>

            {/* 메시지 리스트 */}
            <div
                className="flex-1 overflow-y-auto px-5 py-[70px] space-y-3"
            >
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`max-w-[75%] rounded-xl p-3 text-[13px] font-medium
                                whitespace-pre-wrap break-words  ${
                                msg.role === "user" ? "bg-[#A0B9C9]" : "bg-[#EDEDED]"
                            }`}
                        >
                            {msg.text}
                        </div>
                    </div>
                ))}
                <div ref={bottomRef} className="pt-[63px]"/>
            </div>

            {/* 입력창 */}
            <form
                onSubmit={handleSubmit} 
                className="fixed bottom-0 left-0 w-full z-50 h-[63px] px-2.5 sm:px-5 py-2.5 bg-[#003853]"
            >
                <div className="flex items-center max-w-3xl">
                    <PlusIcon width={25} height={25} fill="#A0B9C9"/>
                    <input
                        type="text"
                        placeholder="자유롭게 질문해 보세요!"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="w-full h-[43px] ml-[15px] mr-2.5 px-5
                        placeholder:text-[13px] placeholder:text-[#CCCCCC]
                        rounded-[20px] focus:outline-none"
                    />
                    <button type="submit">
                        <ArrowUpCircleIcon width={36} height={36} fill="#A0B9C9"/>
                    </button>
                </div>
            </form>
        </div>
    )
}