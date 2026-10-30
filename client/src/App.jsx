import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import WeatherDashboard from './pages/WeatherDashboard';
import ModelDocumentation from './pages/ModelDocumentation';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-[#090D14] text-slate-100 font-sans">
        <Navbar />
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
          <Routes>
            <Route path="/" element={<WeatherDashboard />} />
            <Route path="/model-docs" element={<ModelDocumentation />} />
            <Route path="*" element={<WeatherDashboard />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
