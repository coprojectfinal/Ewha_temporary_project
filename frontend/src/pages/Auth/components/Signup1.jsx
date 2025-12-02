import { useState } from 'react'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

export default function Signup1({ userForm, setUserForm }) {
    const [showPassword, setShowPassword] = useState(false);
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserForm((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="px-[30px] py-[90px] space-y-[25px]">
            <div>
                <h2 className="font-semibold text-lg text-[#999999]">1</h2>
                <p className="font-medium text-lg">
                    환영합니다!<br/>기본 정보를 입력해주세요.
                </p>
                <p className="font-medium text-sm text-[#999999]">
                    모두 필수로 입력해주세요.
                </p>
            </div>

            {/* 닉네임 */}
            <div>
                <div className="font-medium text-[15px] text-[#003853]">
                    • 사용하실 닉네임
                </div>
                <input 
                    type="text"
                    name="displayName"
                    value={userForm.displayName}
                    onChange={handleChange}
                    className="w-full max-w-xl h-[30px] ml-[7px] mt-[5px] p-[5px] 
                        text-[15px] border border-[#CCCCCC] focus:outline-none"
                />
            </div>

            {/* 나이 */}
            <div>
                <div className="font-medium text-[15px] text-[#003853]">
                    • 나이
                </div>
                <div className="flex items-center ml-[7px] mt-[5px]">
                    <span className="font-medium text-[15px]">만</span>
                    <input 
                        type="number"
                        name="age"
                        value={userForm.age}
                        onChange={handleChange}
                        className="w-[60px] h-[30px] ml-[7px] p-[5px] text-[15px]
                            border border-[#CCCCCC] focus:outline-none"
                    />
                    <span className="font-medium text-[15px] ml-[3px]">세</span>
                </div>
            </div>

            {/* 성별 */}
            <div>
                <div className="font-medium text-[15px] text-[#003853]">
                    • 성별
                </div>
                <div className="flex ml-[7px] mt-[5px] gap-3">
                    <button
                        type="button"
                        onClick={() => setUserForm({ ...userForm, gender: "남성" })}
                        className={`w-[50px] h-[30px] rounded-xl text-[15px] font-medium transition ${
                            userForm.gender === "남성"
                                ? "bg-[#003853] text-[#A0B9C9]"
                                : "bg-[#A0B9C9] text-[#003853]"
                        }`}
                    >
                        남성
                    </button>
                    <button
                        type="button"
                        onClick={() => setUserForm({ ...userForm, gender: "여성" })}
                        className={`w-[50px] h-[30px] rounded-xl text-[15px] font-medium transition ${
                            userForm.gender === "여성"
                                ? "bg-[#003853] text-[#A0B9C9]"
                                : "bg-[#A0B9C9] text-[#003853]"
                        }`}
                    >
                        여성
                    </button>
                </div>
            </div>

            {/* 아이디 */}
            <div>
                <div className="font-medium text-[15px] text-[#003853]">
                    • 아이디
                </div>
                <input 
                    type="text"
                    name="id"
                    value={userForm.id}
                    onChange={handleChange}
                    className="w-full max-w-xl h-[30px] ml-[7px] mt-[5px] p-[5px] 
                        text-[15px] border border-[#CCCCCC] focus:outline-none"
                />
            </div>

            {/* 비밀번호 */}
            <div>
                <div className="font-medium text-[15px] text-[#003853]">
                    • 비밀번호
                </div>
                <div className="relative w-full max-w-xl h-[30px] ml-[7px] mt-[5px]">
                    <input 
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={userForm.password}
                        onChange={handleChange}
                        className="w-full h-[30px] p-[5px] pr-[30px] text-[15px] border border-[#CCCCCC] focus:outline-none"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#CCCCCC]"
                    >
                        {showPassword ? (
                            <EyeSlashIcon width={17} height={17}/>
                        ) : (
                            <EyeIcon width={17} height={17}/>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}