import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Signup from './pages/Auth/Signup'
import SignupComplete from './pages/Auth/SignupComplete'
import Login from './pages/Auth/Login'
import SearchResult from './pages/SearchResult'
import NutritionFacts from './pages/NutritionFacts'
import ProductSelect from './pages/Comparison/ProductSelect'
import CriteriaSetting from './pages/Comparison/CriteriaSetting'
import ComparisonResult from './pages/Comparison/ComparisonResult'
import Chatbot from './pages/Chatbot'
//import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signup/complete" element={<SignupComplete />} />
        <Route path="/login" element={<Login />} />
        <Route path="/search" element={<SearchResult />} />
        <Route path="/product/:id" element={<NutritionFacts />} />
        <Route path="/comparison/select" element={<ProductSelect />} />
        <Route path="/comparison/setting-criteria" element={<CriteriaSetting/>} />
        <Route path="/comparison/result" element={<ComparisonResult />} />
        <Route path="/chatbot" element={<Chatbot />} />
      </Routes>
    </Router>
  )
}

export default App