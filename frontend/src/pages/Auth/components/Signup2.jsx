import { CheckCircleIcon } from '@heroicons/react/24/outline'

const allergens = [
    "알류(계란)", "우유", "메밀", "땅콩", "대두",
    "밀", "잣", "호두", "게", "새우",
    "오징어", "고등어", "조개류", "복숭아", "토마토",
    "닭고기", "돼지고기", "쇠고기", "아황산류"
];

export default function Signup2({ userForm, setUserForm }) {
    const handleToggle = (allergenItem) => {
        setUserForm((prev) => {
            const alreadySelected = prev.allergies.includes(allergenItem);
            return {
                ...prev,
                allergies: alreadySelected
                    ? prev.allergies.filter((a) => a !== allergenItem)
                    : [...prev.allergies, allergenItem]
            };
        });
    };

    return (
        <div className="px-[30px] py-[90px] space-y-[25px]">
            <div>
                <h2 className="font-semibold text-lg text-[#999999]">2</h2>
                <p className="font-medium text-lg">
                    가지고 계신 알레르기를 모두 골라주세요.
                </p>
                <p className="font-medium text-sm text-[#999999]">
                    없을 경우, 다음 단계로 넘어가주세요.
                </p>
            </div>

            <div className="font-medium text-base text-[#003853]">
                • 알레르기
            </div>

            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                {allergens.map((allergenItem) => {
                    const isSelected = userForm.allergies.includes(allergenItem);

                    return (
                        <button
                            type="button"
                            key={allergenItem}
                            onClick={() => handleToggle(allergenItem)}
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
                            {allergenItem}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}