import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { MagnifyingGlassIcon, CheckIcon, HomeIcon, UserIcon } from '@heroicons/react/24/outline'
import { CheckCircleIcon, ScaleIcon } from '@heroicons/react/24/solid'
import api from "../../api/axios";   //백엔드 API 연결

export default function ProductSelect() {
    const [searchTerm, setSearchTerm] = useState("");
    const [products, setProducts] = useState([]);    // 실제 서버 데이터 저장
    const [selectedProducts, setSelectedProducts] = useState([]);

    const navigate = useNavigate();

    // 상품 선택 토글
    const handleToggle = (product) => {
      setSelectedProducts(prev => {
        const exists = prev.find(p => p.id === product.id);

        if (exists) {
            return prev.filter(p => p.id !== product.id);
        } else {
            if (prev.length >= 5) {
                alert("최대 5개까지만 선택 가능합니다");
                return prev;
            }
            return [...prev, product];  // 전체 객체 저장
        }
    })
};

    // 서버에서 상품 불러오기
    const fetchProducts = async (search = "") => {
        try {
            const response = await api.get("/api/products/search", {
                params: {
                    keyword: search,
                    sortBy: "id",
                    order: "asc",
                }
            });

            setProducts(response.data);  // 실제 데이터 저장
        } catch (error) {
            console.error("상품 검색 중 오류:", error);
        }
    };

    // 검색 실행
    const handleSearch = (e) => {
        e.preventDefault();
        fetchProducts(searchTerm.trim());
    };

    // 첫 로딩 시 전체 상품 불러오기
    useEffect(() => {
        fetchProducts("");
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-white">
            {/* 검색 */}
            <header className="fixed top-0 left-0 z-50 bg-white flex items-center w-full h-[67px] px-[30px]">
                <img src="/logo.svg" className="w-[45px] mt-[5px]" alt="로고" />
                <div className="relative flex-1 max-w-full sm:max-w-lg ml-2.5 mt-3">
                    <form onSubmit={handleSearch}>
                        <input
                            type="text"
                            placeholder="상품 검색"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-[45px] pl-[25px] pr-[35px] text-[15px]
                            placeholder:text-[15px] placeholder:text-[#CCCCCC]
                            border-[0.5px] border-[#CCCCCC] rounded-[25px] focus:outline-none"
                        />
                        <button
                            type="submit"
                            className="absolute right-[15px] top-1/2 -translate-y-1/2"
                        >
                            <MagnifyingGlassIcon className="w-5 h-5"/>
                        </button>
                    </form>
                </div>
            </header>

            {/* 상품 목록 */}
            <div
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5
                    pt-[90px] px-[30px] pb-[135px] gap-1.5 sm:gap-3"
            >
                {products.length > 0 ? (
                    products.map((product) => {
                        const isSelected = selectedProducts.some(p => p.id === product.id);

                        return (
                            <button
                                type="button"
                                key={product.id}
                                aria-pressed={isSelected}
                                onClick={() => handleToggle(product)}
                                className="w-full max-w-[250px] mx-auto p-1.5 bg-white"
                            >
                                {/* 이미지 */}
                                <div className="relative w-full overflow-hidden rounded-none">
                                    <img
                                        src={product.imageUrl}
                                        alt={`${product.name} 이미지`}
                                        className="block w-full aspect-square object-cover border-[0.5px] border-[#CCCCCC]"
                                    />
                                    {isSelected && (
                                        <div
                                            className="absolute inset-0 bg-black/25 transition-opacity pointer-events-none"
                                            aria-hidden="true"
                                        />
                                    )}
                                    <CheckCircleIcon
                                        className={
                                            `absolute z-20 top-2.5 right-2.5 transition-colors
                                            ${isSelected ? "text-[#003853]" : "text-[#A0B9C9]"}
                                            w-[20px] h-[20px] lg:w-[25px] lg:h-[25px]`
                                        }
                                    />
                                </div>

                                {/* 상품명 */}
                                <div className="h-[35px] mt-1.5 flex items-start">
                                    <span className="text-left text-[15px] font-medium line-clamp-2 overflow-hidden">
                                        {product.name}
                                    </span>
                                </div>
                            </button>
                        )
                    })
                ) : (
                    <p className="col-span-full text-center text-gray-500 pt-10">
                        검색 결과가 없습니다.
                    </p>
                )}
            </div>

            {/* 다음 단계 버튼 */}
            <button
                type="button"
                onClick={() => {
                    localStorage.setItem("selectedProducts", JSON.stringify(selectedProducts));
                    navigate("/comparison/setting-criteria");
                }}
                className="fixed bottom-[63px] left-0 z-50
                w-full h-[63px] px-[25px] py-[20px]
                font-semibold text-[17px]
                text-[#003853] bg-[#EDEDED]
                flex items-center justify-between"
            >
                {selectedProducts.length}개 상품 선택하기
                <CheckIcon width={20} height={20} strokeWidth={3}/>
            </button>

            {/* 하단 내비게이션 */}
            <div className="fixed bottom-0 left-0 z-50 w-full flex items-center h-[63px] bg-[#003853]">
                <Link to="/"
                    className="flex-1 flex flex-col
                    items-center justify-center
                    text-xs font-medium text-[#A0B9C9]
                    hover:scale-105 transition"
                >
                    <HomeIcon className="w-7 h-7 mb-1"/>
                    홈
                </Link>
                <div
                    className="flex-1 flex flex-col
                    items-center justify-center
                    text-xs font-medium text-[#A0B9C9]"
                >
                    <ScaleIcon className="w-7 h-7 mb-1"/>
                    상품 비교
                </div>
                <Link to="/login"
                    className="flex-1 flex flex-col
                    items-center justify-center
                    text-xs font-medium text-[#A0B9C9]
                    hover:scale-105 transition"
                >
                    <UserIcon className="w-7 h-7 mb-1"/>
                    마이페이지
                </Link>
            </div>
        </div>
    )
}
