import { CheckCircleIcon } from '@heroicons/react/24/outline'

const diseaseItems = [
    "고혈압", "고지혈증", "당뇨",
    "신장 질환", "간 질환", "심혈관 질환",
    "고콜레스테롤혈증", "통풍", "골다공증"
];

export default function Signup3({ userForm, setUserForm }) {
    const handleToggle = (diseaseItem) => {
        setUserForm((prev) => {
            const alreadySelected = prev.diseases.includes(diseaseItem);
            return {
                ...prev,
                diseases: alreadySelected
                    ? prev.diseases.filter((d) => d !== diseaseItem)
                    : [...prev.diseases, diseaseItem]
            };
        });
    };

    return (
        <div className="px-[30px] py-[90px] space-y-[25px]">
            <div>
                <h2 className="font-semibold text-lg text-[#999999]">3</h2>
                <p className="font-medium text-lg">
                    앓고 계신 질환을 모두 골라주세요.
                </p>
                <p className="font-medium text-sm text-[#999999]">
                    선택지에 없을 경우, 다음 단계로 넘어가주세요.
                </p>
            </div>

            <div className="font-medium text-base text-[#003853]">
                • 질환
            </div>

            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                {diseaseItems.map((diseaseItem) => {
                    const isSelected = userForm.diseases.includes(diseaseItem);

                    return (
                        <button
                            type="button"
                            key={diseaseItem}
                            onClick={() => handleToggle(diseaseItem)}
                            className={`relative flex justify-center items-center p-2.5
                                rounded-[20px] w-full max-w-[100px] mx-auto aspect-square 
                                text-[15px] font-medium transition
                                ${isSelected
                                    ? "bg-[#003853] text-white"
                                    : "bg-[#EDEDED] text-black"
                                }
                            `}
                        >
                            <span className="absolute top-2.5 right-2.5">
                                {isSelected && (
                                    <CheckCircleIcon width={20} height={20} stroke="#A0B9C9" strokeWidth={2.5}/>
                                )}
                            </span>
                            {diseaseItem}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}