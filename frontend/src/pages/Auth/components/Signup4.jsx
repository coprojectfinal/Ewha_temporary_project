import { PlusIcon, MinusIcon } from '@heroicons/react/24/outline'

const nutriOptions = [
    "칼로리", "나트륨", "탄수화물", "당류", 
    "지방", "트랜스지방", "포화지방", 
    "콜레스테롤", "단백질"
];

export default function Signup4({ userForm, setUserForm }) {
    const handleChange = (index, key, value) => {
        setUserForm(prev => {
            const updatedAdjustments = prev.adjustments.map((item, i) =>
                i === index ? { ...item, [key]: value } : item
            );
            return { ...prev, adjustments: updatedAdjustments };
        });
    };

    const handleAddAdjustment = () => {
        setUserForm(prev => ({
            ...prev,
            adjustments: [
                ...prev.adjustments,
                { nutriFacts: "", direction: ""}
            ]
        }));
    };

    const handleRemoveAdjustment = (index) => {
        setUserForm(prev => ({
            ...prev,
            adjustments: prev.adjustments.filter((_, i) => i !== index)
        }));
    };

    return (
        <div className="px-[30px] py-[90px] space-y-[25px]">
            <div>
                <h2 className="font-semibold text-lg text-[#999999]">4</h2>
                <p className="font-medium text-lg">
                    섭취량을 조절하고 싶은 영양성분이 있다면 알려주세요.
                </p>
            </div>

            <div className="space-y-[15px]">
                {userForm.adjustments.map((adj, index) => (
                    <div
                        key={index}
                        className="flex items-center space-x-[9px]"
                    >
                        <span className="font-medium text-[#003853]">•</span>

                        <select
                            name="nutriFacts"
                            value={adj.nutriFacts}
                            onChange={(e) =>
                                handleChange(index, "nutriFacts", e.target.value)
                            }
                            className="w-[100px] border border-[#CCCCCC] p-[5px] text-sm font-medium"
                        >
                            <option value="" disabled hidden />
                            {nutriOptions.map((nutri) => (
                                <option key={nutri} value={nutri}>
                                    {nutri}
                                </option>
                            ))}
                        </select>

                        <span className="text-sm font-medium whitespace-nowrap">섭취를</span>

                        <select
                            name="direction"
                            value={adj.direction}
                            onChange={(e) =>
                                handleChange(index, "direction", e.target.value)
                            }
                            className="w-[70px] border border-[#CCCCCC] p-[5px] text-sm font-medium"
                        >
                            <option value="" disabled hidden/>
                            <option value="늘리고">늘리고</option>
                            <option value="줄이고">줄이고</option>
                        </select>

                        <span className="text-sm font-medium whitespace-nowrap">싶어요.</span>

                        {/* 추가/삭제 버튼 */}
                        {index === userForm.adjustments.length - 1 ? (
                            <button
                                type="button"
                                onClick={handleAddAdjustment}
                            >
                                <PlusIcon width={15} height={15} stroke="#003853" strokeWidth={3}/>
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => handleRemoveAdjustment(index)}
                            >
                                <MinusIcon width={15} height={15} stroke="#003853" strokeWidth={3}/>
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}