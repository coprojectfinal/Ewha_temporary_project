import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeftIcon, HomeIcon } from '@heroicons/react/24/solid'

const nutriFacts = [
    "칼로리", "나트륨", "탄수화물", "당류",
    "지방", "트랜스지방", "포화지방",
    "콜레스테롤", "단백질"
];

export default function CriteriaSetting() {
    const [step, setStep] = useState(1);
    const [criteria, setCriteria] = useState([]); // 객체 구조) ex. {"열량": "낮게", "당류": "낮게"}
    const selectedNutri = Object.keys(criteria); // 선택된 영양성분
    const [isContinueClicked, setIsContinueClicked] = useState(false);

    const navigate = useNavigate();

    const handleBack = () =>{
        if (step === 1) {
            navigate(-1);
        }

        if (step === 2) {
            setStep(1);
        }
    };

    const handleContinue = () => {
        setIsContinueClicked(true);

        if (step === 1) {
            if (Object.keys(criteria).length === 0) {
                return;
            }
            setStep(2);
            setIsContinueClicked(false);
            return;
        }

        if (step === 2) {
            if (Object.values(criteria).some(direction => !direction)) {
                return;
            }
            localStorage.setItem("userStandard", JSON.stringify(criteria));
            navigate("/comparison/result");
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <header className="fixed top-0 left-0 z-50 bg-white w-full h-[67px] flex items-center justify-between px-[20px]">
                <button 
                    onClick={handleBack}
                    className="hover:scale-105 transition"
                >
                    <ArrowLeftIcon width={25} height={25}/>
                </button>
                <button 
                    onClick={() => navigate("/")}
                    className="hover:scale-105 transition"
                >
                    <HomeIcon width={25} height={25}/>
                </button>
            </header>

            <main className="pt-[90px] px-[30px] pb-[70px]">
                {/* 1. 영양성분 선택 */}
                {step === 1 && (
                    <NutriFactsSelect
                        setCriteria={setCriteria}
                        selectedNutri={selectedNutri}
                        isContinueClicked={isContinueClicked}
                    />
                )}

                {/* 2. 비교 방향 선택 */}
                {step === 2 && (
                    <DirectionSelect 
                        criteria={criteria}
                        setCriteria={setCriteria}
                        selectedNutri={selectedNutri}
                        isContinueClicked={isContinueClicked}
                    />
                )}
            </main>

            <button 
                onClick={handleContinue}
                className="fixed bottom-0 left-0 w-full h-[63px] py-5 
                font-semibold md:text-lg text-white bg-[#003853]"
            >
                {step === 1 ? "다음 단계" : "비교하기"}
            </button>
        </div>
    )
}


// ============================================================================================================================
//   1. 영양 성분 선택 페이지
// ============================================================================================================================
function NutriFactsSelect({ setCriteria, selectedNutri, isContinueClicked }) {
    const handleToggle = (nutriItem) => {
        setCriteria(prev => {
            // 이미 선택되어 있으면 제거
            if(nutriItem in prev) {
                const { [nutriItem]: _, ...rest } = prev;
                return rest;
            }
            // 최대 3개 선택 가능
            if (Object.keys(prev).length >= 3) {
                return prev;
            }
            // 선택
            return { ...prev, [nutriItem]: "" };
        })
    };

    return (
        <div className="w-full">
            <p className="text-lg font-medium">비교하고 싶은 성분을 선택해 주세요!</p>
            <p className="mt-2.5 text-sm text-[#999999] font-medium">최대 3개까지 선택 가능해요.</p>
            {selectedNutri.length === 0 && isContinueClicked && (
                <p className="text-sm text-red-600">최소 1개 이상의 성분을 선택해주세요.</p>
            )}
            <div className="flex flex-wrap mt-[30px] gap-x-[20px] gap-y-[15px]">
                {nutriFacts.map((nutriItem) => (
                    <button
                        type="button"
                        key={nutriItem}
                        onClick={() => handleToggle(nutriItem)}
                        className={`flex items-center justify-center
                            h-[37px] px-[20px] text-[15px] font-medium
                            ${selectedNutri.includes(nutriItem) 
                                ? "bg-[#003853] text-[#FFFFFF]" 
                                : "bg-[#A0B9C9] text-[#003853]"
                            } transition rounded-[30px]`
                        }
                    >
                        {nutriItem}
                    </button>
                ))}
            </div>
        </div>
    )
}


// ============================================================================================================================
//   2. 비교 방향 선택 페이지
// ============================================================================================================================
function DirectionSelect({ criteria, setCriteria, selectedNutri, isContinueClicked }) {
    const handleToggle = (nutri, dir) => {
        setCriteria(prev => ({
            ...prev,
            [nutri]: dir
        }));
    };

    return (
        <div className="w-full">
            <p className="text-lg font-medium">선택한 성분에 대해,<br/>원하는 비교 방향을 설정해 주세요.</p>
            <p className="mt-2.5 text-sm text-[#999999] font-medium">많을수록 좋은가요, 적을수록 좋은가요?</p>
            {selectedNutri.some(n => !criteria[n]) && isContinueClicked && (
                <p className="text-sm text-red-600">설정하지 않은 항목이 있어요.</p>
            )}
            <div className="mt-[30px] space-y-[15px]">
                {selectedNutri.map((sNutri) => (
                    <div key={sNutri} className="flex items-center">
                        <p className="w-[100px] h-[30px] text-base font-medium flex items-center">
                            • {sNutri}
                        </p>
                        <div className="flex h-[30px] space-x-[20px]">
                            {["높게", "낮게"].map((direction) => (
                                <button
                                    key={direction}
                                    type="button"
                                    onClick={() => handleToggle(sNutri, direction)}
                                    className={`w-[60px] h-[30px] rounded-[30px]
                                        ${criteria[sNutri] === direction
                                            ? "bg-[#003853] text-[#A0B9C9]"
                                            : "bg-[#A0B9C9] text-[#003853]"
                                        } transition text-[15px] font-medium`
                                    }
                                >
                                    {direction}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}