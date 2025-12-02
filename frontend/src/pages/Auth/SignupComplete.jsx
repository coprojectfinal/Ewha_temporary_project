import { useNavigate } from 'react-router-dom'
import { CheckCircleIcon } from '@heroicons/react/24/solid'

export default function SignupComplete() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-5 bg-white">
            <CheckCircleIcon width={100} height={100} fill="#003853"/>
            <h1 className="text-[22px] font-semibold mt-5">
                회원가입 완료
            </h1>
            <button
                type="button"
                onClick={() => navigate("/login")}
                className="mt-[100px] w-full max-w-lg mx-auto h-[50px] rounded-[25px] 
                font-medium text-[#003853] bg-[#A0B9C9] hover:shadow-lg transition"
            >
                로그인하기
            </button>
        </div>
    )
}