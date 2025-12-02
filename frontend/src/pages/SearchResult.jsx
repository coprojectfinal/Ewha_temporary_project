import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import { MagnifyingGlassIcon, HomeIcon, ScaleIcon, UserIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline'

export default function SearchResult() {
  const location = useLocation();
  const query = decodeURIComponent(
    new URLSearchParams(location.search).get("q") || ""
  );
  const navigate = useNavigate();

  const [sortBy, setSortBy] = useState("id");
  const [order, setOrder] = useState("asc");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSortChange = (option) => {
    if (option.includes("칼로리")) setSortBy("calories");
    else if (option.includes("나트륨")) setSortBy("sodium");
    else if (option.includes("당류")) setSortBy("sugar");
    else if (option.includes("지방")) setSortBy("fat");
    else if (option.includes("단백질")) setSortBy("protein");
    else setSortBy("id");
    setOrder("desc");
  };

  useEffect(() => {
    if (query.trim() === "") return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get("/api/products/search", {
          params: { keyword: query, sortBy, order },
        });
        setResults(response.data);
      } catch (err) {
        console.error("검색 API 에러:", err);
        setError("검색 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [query, sortBy, order]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header 
        className="fixed top-0 left-0 z-50 bg-white shadow
        flex items-center w-full pt-[5px] px-[25px] pb-[15px]"
      >
        <img src="/logo.svg" className="w-[50px]" alt="로고" />
        <SearchBox previousQuery={query} />
      </header>

      <main className="pt-[90px] px-[30px] pb-[70px]">
        <div className="flex justify-end pr-7 pb-3">
          <SortDropdown onChange={handleSortChange} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1.5 sm:gap-3">
          {loading && <p className="col-span-full text-center">검색 중...</p>}
          {error && <p className="col-span-full text-center text-red-500">{error}</p>}
          {!loading && !error && results.length > 0 ? (
            results.map((product) => (
              <div
                key={product.id}
                className="p-[3px] w-full max-w-[250px] mx-auto bg-white hover:scale-105 transition"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <div className="w-full mb-3">
                  <img
                    src={product.imageUrl}
                    alt={`${product.name} 이미지`}
                    className="w-full aspect-square object-cover border-[0.5px] border-[#CCCCCC]"
                  />
                </div>
                <div className="h-12 mt-1.5 flex items-start">
                  <span className="text-left text-[15px] font-medium line-clamp-2 overflow-hidden">
                    {product.name}
                  </span>
                </div>
              </div>
            ))
          ) : (
            !loading && <p className="col-span-full text-center text-gray-700">검색 결과가 없습니다.</p>
          )}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 w-full flex h-[63px] bg-[#003853]">
        <Link to="/"
          className="flex-1 flex flex-col items-center justify-center text-xs font-medium text-[#A0B9C9] hover:scale-105 transition"
        >
          <HomeIcon className="w-7 h-7 mb-1" />
          홈
        </Link>
        <Link to="/comparison/select" 
          className="flex-1 flex flex-col items-center justify-center text-xs font-medium text-[#A0B9C9] hover:scale-105 transition"
        >
          <ScaleIcon className="w-7 h-7 mb-1" />
          상품 비교
        </Link>
        <Link to="/login" 
          className="flex-1 flex flex-col items-center justify-center text-xs font-medium text-[#A0B9C9] hover:scale-105 transition"
        >
          <UserIcon className="w-7 h-7 mb-1" />
          마이페이지
        </Link>
      </div>
    </div>
  )
}

// 검색창
function SearchBox({ previousQuery }) {
  const [query, setQuery] = useState(previousQuery || "");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim() !== "") {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="relative flex-1 max-w-full sm:max-w-lg ml-2.5 mt-3">
      <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="상품 검색하기"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-[45px] pl-[25px] pr-[35px] text-[15px]
            placeholder:text-[15px] placeholder:text-[#CCCCCC]
            border-[0.5px] border-[#CCCCCC] rounded-[25px] focus:outline-none"
          />
          <button type="submit"className="absolute right-3 top-1/2 -translate-y-1/2">
            <MagnifyingGlassIcon className="w-5 h-5" />
          </button>
      </form>
    </div>
  )
}

// 정렬 드롭다운
function SortDropdown({ onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubOpen, setIsSubOpen] = useState(false);
  const [selected, setSelected] = useState("추천순");

  const handleSelect = (option) => {
    setSelected(option);
    setIsOpen(false);
    setIsSubOpen(false);
    if (onChange) onChange(option);
  };

  return (
    <div className="relative">
      <button
        type="button"
        className="flex items-center justify-between w-full text-sm font-medium p-1.5"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen
          ? <ChevronUpIcon width={13} height={13} strokeWidth={2.5} />
          : <ChevronDownIcon width={13} height={13} strokeWidth={2.5} />
        }
        <span className="ml-[3px]">{selected}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 w-36 bg-white border border-[#EAEAEA] z-50">
          <button
            type="button"
            className="flex items-center w-full text-left text-sm font-medium p-1.5"
            onClick={() => handleSelect("추천순")}
          >
            추천순
          </button>

          <button
            type="button"
            className="flex items-center justify-between w-full text-left font-medium text-sm p-1.5"
            onClick={() => setIsSubOpen(!isSubOpen)}
          >
            영양성분함량순
            {isSubOpen
              ? <ChevronUpIcon width={13} height={13} strokeWidth={2.5} />
              : <ChevronDownIcon width={13} height={13} strokeWidth={2.5} />
            }
          </button>

          {isSubOpen && (
            <div className="w-full bg-[#EAEAEA]">
              {["칼로리", "나트륨", "당류", "지방", "단백질"].map((item) => (
                <button
                  key={item}
                  type="button"
                  className="flex items-center w-full text-left text-sm font-medium p-1.5 pl-3"
                  onClick={() => handleSelect(`${item}순`)}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
