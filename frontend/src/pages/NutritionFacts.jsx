import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api/axios'
import { ArrowLeftIcon, HomeIcon, XCircleIcon } from '@heroicons/react/24/solid'

export default function NutritionFacts() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [me, setMe] = useState(null); // 로그인 사용자
  const [isOpen, setIsOpen] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [explanation, setExplanation] = useState("AI 설명을 불러오는 중...");
  const [isRecommendationLoading, setIsRecommendationLoading] = useState(true);

  // 사용자 정보 불러오기
  useEffect(() => {
    const loadMe = async () => {
      try {
        const res = await api.get('/api/users/me');
        setMe(res.data);
      } catch (e) {
        console.error('내 정보 불러오기 실패:', e);
        navigate('/login');
      }
    };
    loadMe();
  }, [navigate]);

  // 상품 정보 불러오기
  useEffect(() => {
    if (!id) return;
    api
      .get(`/api/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch((err) => console.error('상품 불러오기 오류:', err));
  }, [id]);

  // 상품 변경 -> AI 상태 리셋
  useEffect(() => {
    if (!id) return;

    setExplanation("AI 설명을 불러오는 중...");
    setRecommendedProducts([]);
    setIsRecommendationLoading(true);
  }, [id])

  // 스크롤 잠금
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }
  }, [isOpen]);

  // AI 요청
  const fetchAI = async () => {
    if (!product) {
      alert("상품 정보가 없습니다.");
      return;
    }

    try {
      const userId = localStorage.getItem("user_id");

      if (!userId) {
        alert("로그인 정보가 없습니다. 다시 로그인 해주세요.");
        return;
      }

      //console.log("📤 전송할 데이터:", { user_id: userId, product_name: product.name });

      // Spring → FastAPI로 전달되는 JSON 구조에 맞춤
      const res = await api.post("/api/ai/analyze", {
        user_id: String(userId),
        product_name: product.name,
      });

      //console.log("✅ FastAPI 응답:", res.data);

      // FastAPI 응답 중 ai_description 키 확인
      const aiText =
        res.data?.ai_description ??
        res.data?.aiDescription ??
        "AI 설명을 불러올 수 없습니다.";

      setExplanation(aiText);

      // 추천 상품 세팅
      setRecommendedProducts( 
        res.data.recommendations ?? []
      );
    } catch (err) {
      console.error("❌ AI 요청 실패:", err);
      setExplanation("AI 설명을 불러올 수 없습니다.");
      setRecommendedProducts([]); // 실패 시 추천 초기화
    } finally {
      setIsRecommendationLoading(false); 
    }
  };

  if (!product || !me) {
    return <p className="text-center mt-10">로딩 중...</p>;
  }

  const items = [
    { label: '열량', value: product.calories, unit: 'kcal' },
    { label: '나트륨', value: product.sodium, unit: 'mg' },
    { label: '탄수화물', value: product.carbohydrate, unit: 'g' },
    { label: '당류', value: product.sugar, unit: 'g' },
    { label: '지방', value: product.fat, unit: 'g' },
    { label: '트랜스지방', value: product.transFat, unit: 'g' },
    { label: '포화지방', value: product.saturatedFat, unit: 'g' },
    { label: '콜레스테롤', value: product.cholesterol, unit: 'mg' },
    { label: '단백질', value: product.protein, unit: 'g' },
  ];

  let allergyNote = '';
  let potentialAllergyNote = '';
  try {
    const userAllergiesArray = (me.allergies || '').split(',').map((s) => s.trim()).filter(Boolean);
    const allergensArray = (product.allergy || '').split(',').map((s) => s.trim()).filter(Boolean);
    const potentialAllergensArray = (product.indirectAllergy || '').split(',').map((s) => s.trim()).filter(Boolean);

    const matchedAllergies = userAllergiesArray.filter((a) => allergensArray.includes(a));
    const matchedPotential = userAllergiesArray.filter((a) => potentialAllergensArray.includes(a));

    allergyNote =
      matchedAllergies.length > 0
        ? `❌ ${matchedAllergies.join(', ')} 성분이 함유되어 있어요.`
        : userAllergiesArray.length > 0
        ? `✅ ${userAllergiesArray.join(', ')} 성분이 함유되어 있지 않아요.`
        : '✅ 등록된 알레르기가 없어요.';

    potentialAllergyNote =
      matchedPotential.length > 0 ? `⚠️ 제조 과정에서 ${matchedPotential.join(', ')}의 혼입 가능성이 있어요.` : null;
  } catch (e) {
    console.error('알레르기 비교 오류:', e);
  }

  const suitability = {
    suitable: { text: '적합', color: 'text-green-500' },
    unsuitable: { text: '부적합', color: 'text-red-500' },
    caution: { text: '주의가 필요', color: 'text-yellow-500' }
  };

  const userAll = (me.allergies || '').split(',').map((s) => s.trim()).filter(Boolean);
  const matchedA = userAll.filter((a) => (product.allergy || '').includes(a));
  const matchedP = userAll.filter((a) => (product.indirectAllergy || '').includes(a));
  let resultStatus = 'suitable';
  if (matchedA.length > 0) resultStatus = 'unsuitable';
  else if (matchedP.length > 0) resultStatus = 'caution';

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="fixed top-0 left-0 bg-white w-full h-[67px] flex items-center justify-between px-5">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="hover:scale-105 transition"
        >
          <ArrowLeftIcon width={25} height={25}/>
        </button>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="hover:scale-105 transition"
        >
          <HomeIcon width={25} height={25}/>
        </button>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 py-[70px]">
        <div className="w-full max-w-[360px] mx-auto md:mt-[75px]">
          <img
            src={product.imageUrl}
            alt={`${product.name} 이미지`}
            className="w-full aspect-square object-cover"
          />
        </div>

        <div className="md:mt-[50px]">
          <div className="w-full text-xl font-medium p-3">
            {product.name}
          </div>
          <div className="w-full h-2.5 bg-[#EAEAEA]"/>
          <div className="w-full text-base font-medium px-6 py-3 mb-2 border-b border-[#EAEAEA]">
            영양 정보
          </div>
          <div className="w-full px-6 py-3 space-y-2">
            {items.map((item) => (
              <div
                key={item.label}
                className="flex justify-between font-light text-sm md:text-base"
              >
                <span>{item.label}</span>
                <span>
                  {item.value} {item.unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>

      <button
        type="button"
        onClick={() => {
          setIsOpen(true);
          fetchAI();
        }}
        className="fixed bottom-0 left-0 w-full py-5 h-[63px] 
        font-semibold text-xl text-white bg-[#003853]"
      >
        상품 적합성 판단하기
      </button>

      {isOpen && (
        <div className="fixed inset-0 flex items-end md:items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="flex flex-col bg-white p-5 relative w-full md:w-1/2 h-[80%]
                          rounded-t-2xl rounded-b-none md:rounded-2xl"
          >
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3"
            >
              <XCircleIcon className="w-9 h-9 text-[#EAEAEA]" />
            </button>

            <div className="mt-10 overflow-y-auto flex-1">
              <div className="bg-[#EAEAEA] rounded-xl p-3 text-center">
                <p className="text-xl font-medium">
                  이 상품은 {me.nickname ?? me.username} 님께{' '}
                  <span className={suitability[resultStatus].color}>
                    {suitability[resultStatus].text}
                  </span>
                  해요!
                </p>
              </div>

              <div className="mt-[15px] py-[5px] space-y-[5px]">
                <p className="text-base font-medium">{allergyNote}</p>
                {potentialAllergyNote && <p className="text-base font-medium">{potentialAllergyNote}</p>}
              </div>

              <div className="mt-2.5 px-[5px] py-[15px] border-t border-[#CCCCCC]">
                <p className="whitespace-pre-line">{explanation}</p>
              </div>

              <div className="px-2.5 py-[15px] border-t border-[#CCCCCC]">
                <p className="text-lg font-light">
                  {isRecommendationLoading
                    ? "추천 상품을 불러오는 중이에요 ⏳"
                    : recommendedProducts.length === 0
                      ? "추천할 수 있는 상품이 없어요 🥲"
                      : resultStatus === 'unsuitable'
                        ? "대신 이런 상품을 추천해요 😆"
                        : "이런 상품도 추천해요 😆"
                  }
                </p>
              </div>
              <div className="p-1.5 grid grid-cols-3 gap-3">
                {recommendedProducts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setIsOpen(false);
                      navigate(`/product/${p.id}`)
                    }}
                    className="p-[3px] w-full max-w-[150px] mx-auto hover:scale-105 transition"
                  >
                    <div className="w-full mb-3">
                      <img
                        src={p.image_url}
                        alt={`${p.name} 이미지`}
                        className="w-full aspect-square object-cover border-[0.5px] border-[#CCCCCC]"
                      />
                    </div>
                    <div className="h-12 mt-1.5 flex items-start">
                      <span className="text-left text-base font-normal line-clamp-2 overflow-hidden">
                        {p.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
