import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Signup1 from './components/Signup1'
import Signup2 from './components/Signup2'
import Signup3 from './components/Signup3'
import Signup4 from './components/Signup4'
import api from '../../api/axios'

export default function Signup() {
    const [step, setStep] = useState(1);
    const [userForm, setUserForm] = useState({
        id: "",
        password: "",
        displayName: "",
        age: "",
        gender: "",
        allergies: [],
        diseases: [],
        adjustments: [{ nutriFacts: "", direction: "" }]
    });
    const navigate = useNavigate();

    const handleBack = () => {
        if (step > 1) setStep(current => current - 1);
        else navigate("/login");
    };

    const handleNext = async (e) => {
        e?.preventDefault();

        if (step < 4) {
            // 유효성 검사 (기본정보)
            if (step === 1) {
                const { displayName, age, gender, id, password } = userForm;
                if (!displayName || !age || !gender || !id || !password) {
                    alert("모든 항목을 입력해주세요!");
                    return;
                }
            }
            setStep(current => current + 1);
        } else {
            // 마지막 단계 → 백엔드로 회원가입 요청
            try {
                const body = {
                    nickname: userForm.displayName,
                    age: parseInt(userForm.age),
                    gender: userForm.gender === "남성" ? "Male" : "Female",
                    username: userForm.id,
                    password: userForm.password,
                    allergies: userForm.allergies,
                    medicalConditions: userForm.diseases,
                    ingredients: userForm.adjustments.map((adj) => ({
                        ingredient: adj.nutriFacts,
                        direction: adj.direction === "늘리고" ? "up" : "down"
                    }))
                };

                await api.post("/auth/signup", body);
                //alert("회원가입이 완료되었습니다!");
                navigate("/signup/complete");
            } catch (error) {
                console.error(error);
                alert("회원가입에 실패했습니다.");
            }
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <header className="fixed top-0 left-0 z-50 bg-white w-full h-[67px] flex items-center justify-center p-3">
                <button
                    type="button"
                    onClick={handleBack}
                    className="absolute left-3 hover:scale-105 transition"
                >
                    <ArrowLeftIcon width={25} height={25}/>
                </button>
                <h1 className="text-center text-xl font-medium">
                    회원 정보 입력
                </h1>
                <div className="absolute bottom-0 left-0 w-full px-7 flex justify-between gap-2">
                    {[1, 2, 3, 4].map((s) => (
                        <div 
                            key={s}
                            className={`flex-1 h-[5px] 
                                ${step > s ? "bg-[#A0B9C9]" : "bg-[#D9D9D9]"}
                            `} 
                        />
                    ))}
                </div>
            </header>

            <main>
                {step === 1 && <Signup1 userForm={userForm} setUserForm={setUserForm} />}
                {step === 2 && <Signup2 userForm={userForm} setUserForm={setUserForm} />}
                {step === 3 && <Signup3 userForm={userForm} setUserForm={setUserForm} />}
                {step === 4 && <Signup4 userForm={userForm} setUserForm={setUserForm} />}
            </main>

            <button
                onClick={handleNext}
                className="fixed bottom-0 left-0 z-50 w-full h-[63px] py-5 
                font-semibold text-xl text-white bg-[#003853]"
            >
                {step < 4 ? "다음 단계" : "입력 완료하기"}
            </button>
        </div>
    )
}
