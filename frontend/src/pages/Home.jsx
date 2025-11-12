import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { MagnifyingGlassIcon, ScaleIcon, UserIcon } from '@heroicons/react/24/outline'
import { HomeIcon, ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/solid'

export default function Home() {
    const [query, setQuery] = useState("");
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim() !== "") {
            navigate(`/search?q=${encodeURIComponent(query)}`);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-white">
            {/* 로고 */}
            <div className="flex justify-center items-center mt-[150px]">
                <img src="/logo.svg" className="w-20 sm:w-[100px]" alt="로고" />
            </div>

            {/* 검색창 */}
            <form onSubmit={handleSearch} className="w-full px-[15px] mt-[50px]">
                <div className="relative w-full max-w-xl mx-auto">
                    <input
                        type="text"
                        placeholder="상품 검색하기"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full h-[50px] pl-[25px] pr-[35px]
                        placeholder:text-base placeholder:text-[#CCCCCC]
                        border-[0.5px] border-[#CCCCCC] rounded-[25px] focus:outline-none"
                    />
                    <button
                        type="submit"
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                        <MagnifyingGlassIcon className="w-5 h-5"/>
                    </button>
                </div>
            </form>

            {/* 챗봇 버튼 */}
            <div className="fixed bottom-[85px] left-0 w-full pr-5 flex justify-end">
                <button
                    type="button"
                    onClick={() => navigate("/chatbot")}
                    className="w-9 h-9 rounded-full bg-[#A0B9C9] flex items-center justify-center"
                >
                    <ChatBubbleLeftEllipsisIcon width={25} height={25} fill="#003853"/>
                </button>
            </div>

            {/* 하단 내비게이션 */}
            <div className="fixed bottom-0 left-0 w-full flex items-center h-[63px] bg-[#003853]">
                <div
                    className="flex-1 flex flex-col 
                    items-center justify-center 
                    text-xs font-medium text-[#A0B9C9]"
                >
                    <HomeIcon className="w-[25px] h-[25px] mb-1.5"/>
                    홈
                </div>
                <Link to="/comparison/select"
                    className="flex-1 flex flex-col 
                    items-center justify-center 
                    text-xs font-medium text-[#A0B9C9] 
                    hover:scale-105 transition"
                >
                    <ScaleIcon className="w-[25px] h-[25px] mb-1.5"/>
                    상품 비교
                </Link>
                <Link to="/login"
                    className="flex-1 flex flex-col 
                    items-center justify-center 
                    text-xs font-medium text-[#A0B9C9] 
                    hover:scale-105 transition"
                >
                    <UserIcon className="w-[25px] h-[25px] mb-1.5"/>
                    마이페이지
                </Link>
            </div>
        </div>
    )
}