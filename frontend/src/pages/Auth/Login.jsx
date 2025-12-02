import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../api/axios' // axios 인스턴스

export default function Login() {
  const [credentials, setCredentials] = useState({
    id: "",
    password: ""
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1️⃣ 로그인 요청
      const res = await api.post("/auth/login", {
        username: credentials.id,
        password: credentials.password
      });

      const token = res.data.accessToken;
      localStorage.setItem("accessToken", token);

      // 2️⃣ 로그인 성공 후 사용자 정보 1회만 요청
      const meRes = await api.get("/api/users/me", {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("📍 getMyInfo 응답:", meRes.data);

      // 3️⃣ userId 안전하게 추출
      const userData = meRes.data;
      const userId =
        typeof userData.userId !== "undefined"
          ? userData.userId
          : userData.id ?? null;

      console.log("✅ 저장할 userId:", userId);

      if (userId !== null) {
        localStorage.setItem("user_id", userId.toString());
      } else {
        console.warn("⚠️ userId가 null입니다. 실제 구조:", userData);
      }

      alert("로그인 성공!");
      navigate("/");
    } catch (err) {
      console.error("로그인 실패:", err);
      alert("아이디 또는 비밀번호를 확인해주세요.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Link
        to="/"
        className="flex justify-center items-center mt-[73px]"
      >
        <img src="/logo.svg" className="w-[75px] sm:w-[100px]" alt="로고" />
      </Link>

      <div className="w-full max-w-xl mx-auto px-5 mt-[50px]">
        <form onSubmit={handleSubmit} className="w-full">
          <input
            type="text"
            name="id"
            placeholder="아이디"
            value={credentials.id}
            onChange={handleChange}
            className="w-full h-[57px] px-[30px] mb-[17px] rounded-[27px]
                    border border-[#CCCCCC] placeholder:text-[#CCCCCC] focus:outline-none"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="비밀번호"
            value={credentials.password}
            onChange={handleChange}
            className="w-full h-[57px] px-[30px] mb-[30px] rounded-[27px]
                    border border-[#CCCCCC] placeholder:text-[#CCCCCC] focus:outline-none"
            required
          />

          <button
            type="submit"
            className="w-full h-[50px] rounded-[25px]
                    font-medium text-[#FFFFFF] bg-[#003853]
                    hover:shadow-lg transition"
          >
            로그인
          </button>
        </form>

        <button
          onClick={() => navigate("/signup")}
          className="w-full h-[50px] mt-[15px] rounded-[25px]
                    font-medium text-[#003853] bg-[#A0B9C9]
                    hover:shadow-lg transition"
        >
          회원가입
        </button>
      </div>
    </div>
  )
}
