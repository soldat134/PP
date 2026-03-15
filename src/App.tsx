/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Users, ChevronRight, LayoutDashboard, Info, Filter, X, ExternalLink, RefreshCw, Copy, Check } from 'lucide-react';
import Papa from 'papaparse';

// Types
interface ParliamentMember {
  id: number | string;
  robloxName: string;
  position: string;
  name: string;
  image: string;
  party: string;
  house: 'house' | 'senate';
}

// Data from Google Sheet
const SHEET_ID = '1VDYrZvIFbkb8zZtm75ReVL6RZ7eYa4ttKmo6Z4GsiJI';
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;

const DEFAULT_DATA: ParliamentMember[] = [
  { id: 1, robloxName: "uiyhrdhr3", position: "สมาชิกสภาผู้แทนราษฎร", name: "นายศิริศักดิ์ บรรยายรัตน", image: "https://tr.rbxcdn.com/30DAY-Avatar-0342AD7BE23E0EC20D2A2BF4E37B8A92-Png/720/720/Avatar/Webp/noFilter", party: "พรรคเสรีร่วมใจ", house: "house" },
  { id: 2, robloxName: "Hari_45452", position: "สมาชิกสภาผู้แทนราษฎร", name: "สมเด็จพระนางเจ้าศิรินภา บรรยายรัตน พระบรมราชินี", image: "https://tr.rbxcdn.com/30DAY-Avatar-F9CFE6F0DC27B51F3FBAC082C3A390E4-Png/720/720/Avatar/Webp/noFilter", party: "พรรคเสรีร่วมใจ", house: "house" },
  { id: 3, robloxName: "INDY964843", position: "สมาชิกสภาผู้แทนราษฎร", name: "พระบาทสมเด็จพระดารุเดชนาวินทมหาราช พระอัครกษัตริยาธิราชเกล้าเจ้าอยู่หัว", image: "https://tr.rbxcdn.com/30DAY-Avatar-9E186E7BE11A8C3CD75F6CBCFA8BA41A-Png/720/720/Avatar/Webp/noFilter", party: "พรรคเสรีร่วมใจ", house: "house" },
  { id: 4, robloxName: "masathai", position: "ประธานสภาผู้แทนราษฎร", name: "นายณัฐพงศ์ วิชัยชาญ", image: "https://tr.rbxcdn.com/30DAY-Avatar-45C61BB10A9AB66F31524849ACB0B76F-Png/720/720/Avatar/Webp/noFilter", party: "พรรคเสรีร่วมใจ", house: "house" },
  { id: 5, robloxName: "hhkfkihlkhlh", position: "สมาชิกสภาผู้แทนราษฎร", name: "นายสุขกาย พาเกรียน", image: "https://tr.rbxcdn.com/30DAY-Avatar-91A47FCBAB5D24B8B5E601AF4D70B84D-Png/720/720/Avatar/Webp/noFilter", party: "พรรคเสรีร่วมใจ", house: "house" },
  { id: 6, robloxName: "jojoooo550", position: "สมาชิกสภาผู้แทนราษฎร", name: "นายปรีชา เดชากุล", image: "https://tr.rbxcdn.com/30DAY-Avatar-1B6806F9654E3E1C9E70473D6279D38E-Png/720/720/Avatar/Webp/noFilter", party: "พรรคเสรีร่วมใจ", house: "house" },
  { id: 7, robloxName: "svrbcn", position: "สมาชิกสภาผู้แทนราษฎร", name: "นายคุณภัทร เรืองโรจน์", image: "https://tr.rbxcdn.com/30DAY-Avatar-B293F238B3EBF52AF64DF591C3F241B6-Png/720/720/Avatar/Webp/noFilter", party: "พรรคเสรีร่วมใจ", house: "house" },
  { id: 8, robloxName: "UURTYOPTT", position: "สมาชิกสภาผู้แทนราษฎร", name: "นายศิรีพระดุง ผัดไข่", image: "https://tr.rbxcdn.com/30DAY-Avatar-B9D46947BE05FF5BDF6C5404DE92522B-Png/720/720/Avatar/Webp/noFilter", party: "พรรครวมใจ", house: "house" },
  { id: 9, robloxName: "marwin18118", position: "สมาชิกสภาผู้แทนราษฎร", name: "นายกัณฎิฑัตต์ สุขผล", image: "https://tr.rbxcdn.com/30DAY-Avatar-8F9399DCF4AF904D2A87C950BC09CBB1-Png/720/720/Avatar/Webp/noFilter", party: "พรรคก้าวไกล", house: "house" },
  { id: 10, robloxName: "DXXXX26", position: "สมาชิกสภาผู้แทนราษฎร", name: "นายรพีภัทร บุณก้อน", image: "https://tr.rbxcdn.com/30DAY-Avatar-1B7D65FB73A0254CDB45575EAB28DC7F-Png/720/720/Avatar/Webp/noFilter", party: "พรรคก้าวไกล", house: "house" },
  { id: 11, robloxName: "Thai42881", position: "สมาชิกวุฒิสภา", name: "นายสมาย ละลายแม่น้ำ", image: "https://tr.rbxcdn.com/30DAY-Avatar-738276F87D540BCDF8435CD9AE5023A0-Png/720/720/Avatar/Webp/noFilter", party: "ไม่มี", house: "senate" },
  { id: 12, robloxName: "goodguys_141", position: "สมาชิกสภาผู้แทนราษฎร", name: "นายวาริช บรรยายรัตน", image: "https://tr.rbxcdn.com/30DAY-Avatar-B4553C59034A91DB6478F9D1B4D3C01E-Png/720/720/Avatar/Webp/noFilter", party: "พรรคเสรีร่วมใจ", house: "house" },
  { id: 13, robloxName: "Shabushi_01", position: "สมาชิกสภาผู้แทนราษฎร", name: "นายรณกร เจริญพงศ์", image: "https://tr.rbxcdn.com/30DAY-Avatar-DD0BD170DD047A1425FD93F03EAAF202-Png/720/720/Avatar/Webp/noFilter", party: "พรรคเสรีร่วมใจ", house: "house" },
];

export default function App() {
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [isEntered, setIsEntered] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParty, setSelectedParty] = useState('ทั้งหมด');
  const [houseType, setHouseType] = useState<'house' | 'senate'>('house');
  const [parliamentData, setParliamentData] = useState<ParliamentMember[]>(DEFAULT_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedMember, setSelectedMember] = useState<ParliamentMember | null>(null);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'roblox' | 'real'>('idle');

  const handleCopy = (text: string, type: 'roblox' | 'real') => {
    navigator.clipboard.writeText(text);
    setCopyStatus(type);
    setTimeout(() => setCopyStatus('idle'), 2000);
  };

  const fetchData = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const response = await fetch(CSV_URL);
      const csvText = await response.text();
      
      Papa.parse(csvText, {
        header: false, // Use index-based mapping as requested
        skipEmptyLines: true,
        complete: (results) => {
          // Skip the first row (header) and map columns A-E
          const parsedData = results.data.slice(1).map((row: any, index: number) => {
            const robloxName = row[0] || '';
            const position = row[1] || '';
            const name = row[2] || '';
            const image = row[3] || '';
            const party = row[4] || 'ไม่มี';
            
            // Categorization logic: Positions with "วุฒิสภา" go to senate, others to house
            const house = position.includes('วุฒิสภา') ? 'senate' : 'house';
            
            return {
              id: index + 1,
              robloxName,
              position,
              name,
              image,
              party: party === '' ? 'ไม่มี' : party,
              house
            };
          }).filter((m: any) => m.name !== '' || m.robloxName !== ''); // Filter out empty rows
          
          if (parsedData.length > 0) {
            setParliamentData(parsedData);
          }
          setIsLoading(false);
          setIsRefreshing(false);
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
          setIsLoading(false);
          setIsRefreshing(false);
        }
      });
    } catch (error) {
      console.error('Error fetching Sheet data:', error);
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Auto-refresh every 60 seconds for "real-time" feel
    const interval = setInterval(() => fetchData(), 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const parties = useMemo(() => {
    return Array.from(new Set(parliamentData.map(mp => mp.party))).filter(p => p !== "ไม่มี");
  }, [parliamentData]);

  const stats = useMemo(() => {
    const currentHouseMembers = parliamentData.filter(m => m.house === houseType);
    const total = currentHouseMembers.length;
    
    const presidentTitle = houseType === 'house' ? 'ประธานสภาผู้แทนราษฎร' : 'ประธานวุฒิสภา';
    const vicePresidentTitle = houseType === 'house' ? 'รองประธานสภาผู้แทนราษฎร' : 'รองประธานวุฒิสภา';
    
    const president = currentHouseMembers.find(m => m.position === presidentTitle);
    const vicePresident = currentHouseMembers.find(m => m.position === vicePresidentTitle);
    
    return { 
      total, 
      president: president ? president.name : "ไม่มีผู้ดำรงตำแหน่ง", 
      vicePresident: vicePresident ? vicePresident.name : "ไม่มีผู้ดำรงตำแหน่ง",
      presidentTitle,
      vicePresidentTitle
    };
  }, [houseType, parliamentData]);

  const filteredMembers = useMemo(() => {
    const filtered = parliamentData.filter(member => {
      const matchesHouse = member.house === houseType;
      const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            member.robloxName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            member.position.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesParty = houseType === 'senate' || selectedParty === 'ทั้งหมด' || member.party === selectedParty;
      return matchesHouse && matchesSearch && matchesParty;
    });

    // Sort: President > Vice President > Others
    return [...filtered].sort((a, b) => {
      const getPriority = (pos: string) => {
        if (pos.includes('ประธานสภา') || pos.includes('ประธานวุฒิสภา')) return 0;
        if (pos.includes('รองประธาน')) return 1;
        return 2;
      };
      return getPriority(a.position) - getPriority(b.position);
    });
  }, [searchTerm, selectedParty, houseType, parliamentData]);

  return (
    <AnimatePresence mode="wait">
      {!disclaimerAccepted ? (
        <motion.div 
          key="disclaimer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.5 }}
          className="min-h-[100dvh] h-[100dvh] flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden bg-white"
        >
          {/* Decorative background glow - Red subtle shine */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-red-100 rounded-full blur-[80px] md:blur-[120px] opacity-50 pointer-events-none" />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 max-w-2xl w-full bg-white p-8 md:p-12 rounded-[32px] border-4 border-red-600 shadow-[0_20px_50px_rgba(220,38,38,0.15)] text-center space-y-8"
          >
            <div className="flex justify-center">
              <div className="bg-red-50 p-4 rounded-full border-2 border-red-100">
                <Info className="w-12 h-12 text-red-600" />
              </div>
            </div>
            
            <div className="space-y-6">
              <h2 className="text-2xl md:text-3xl font-black text-red-700 tracking-tight uppercase">ข้อความแจ้งเตือนสำคัญ</h2>
              <div className="h-1 w-20 bg-red-600 mx-auto rounded-full" />
              <p className="text-lg md:text-xl text-slate-800 leading-relaxed font-bold">
                "เพื่อการจำลองเเละสวมบทบาทมิได้มีเจตนาดูหมิ่น ทำไปเพื่อความสมจริงในการสวมบทบาท เเละไม่มีส่วนเกี่ยวข้องกับ รัฐสภาไทยเเห่งราชอาณาจักรไทยในโลกความเป็นจริง"
              </p>
            </div>

            <button
              onClick={() => setDisclaimerAccepted(true)}
              className="w-full py-4 md:py-5 bg-red-600 text-white rounded-2xl font-bold text-lg md:text-xl shadow-[0_10px_20px_rgba(220,38,38,0.3)] hover:bg-red-700 transition-all active:scale-[0.98] border-b-4 border-red-800"
            >
              เข้าใจเเละดำเนินการต่อ
            </button>
          </motion.div>

          <div className="absolute bottom-6 text-red-600/40 text-[10px] tracking-[0.3em] uppercase font-black">
            Roleplay Simulation Disclaimer
          </div>
        </motion.div>
      ) : !isEntered ? (
        <motion.div 
          key="landing"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="min-h-[100dvh] h-[100dvh] thai-pattern flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden"
        >
          {/* Parliament 2.0 Logo/Title at Top Left */}
          <div className="absolute top-6 left-6 z-20 flex items-center gap-2">
            <div className="bg-gradient-to-br from-amber-600 via-amber-400 to-amber-800 p-1.5 rounded-lg shadow-xl border border-white/40">
              <LayoutDashboard className="text-amber-50 w-4 h-4 md:w-5 md:h-5" />
            </div>
            <span className="font-bold text-lg md:text-xl tracking-tight text-amber-950 drop-shadow-lg">รัฐสภา 2.0</span>
          </div>

          {/* Decorative background glow - subtle shine */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-white rounded-full blur-[80px] md:blur-[120px] opacity-20 pointer-events-none" />

          <div className="relative z-10 max-w-4xl w-full h-full flex flex-col items-center justify-center py-2">
            {/* Ornate Image Frame */}
            <div className="relative inline-block mb-12 md:mb-16 shrink">
              <div className="relative w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 mx-auto max-h-[40vh]">
                {/* Outer Glow */}
                <div className="absolute inset-0 bg-white blur-xl md:blur-2xl opacity-30 scale-110" />
                
                {/* The Frame - Rich Gold Metallic */}
                <div className="absolute inset-0 border-[6px] md:border-[10px] border-double border-amber-200 rounded-[15px] md:rounded-[30px] shadow-[0_0_30px_rgba(0,0,0,0.3)] z-20 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
                <div className="absolute -inset-1 border-2 border-amber-50/50 rounded-[17px] md:rounded-[32px] z-10" />
                
                {/* The Image Container */}
                <div className="absolute inset-1.5 md:inset-3 rounded-[10px] md:rounded-[22px] overflow-hidden z-0 bg-black/5 backdrop-blur-sm flex items-center justify-center">
                  <img 
                    src="https://i.ibb.co/0RY0GDkW/image.png" 
                    alt="รัฐสภาไทย"
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            </div>

            {/* Typography */}
            <div className="space-y-2 md:space-y-4 mb-6 md:mb-8 shrink-0 px-4 w-full max-w-2xl mx-auto text-center">
              <p className="text-2xl sm:text-3xl md:text-5xl font-serif text-amber-950 italic leading-tight drop-shadow-md">
                ยินดีต้อนรับเข้าสู่เว็บไซต์
              </p>
              
              <div className="flex items-center justify-center gap-2 md:gap-4">
                <div className="h-[1px] w-12 md:w-24 bg-gradient-to-r from-transparent via-amber-950 to-transparent" />
                <div className="text-amber-950 text-lg md:text-2xl">❦</div>
                <div className="h-[1px] w-12 md:w-24 bg-gradient-to-l from-transparent via-amber-950 to-transparent" />
              </div>

              <div className="text-amber-950 space-y-1 md:space-y-2">
                <p className="text-lg md:text-2xl font-bold tracking-wide">ระบบฐานข้อมูลสมาชิกสภาผู้แทนราษฎร</p>
                <p className="text-[9px] md:text-sm uppercase tracking-[0.25em] opacity-80 font-black">สำนักงานเลขาธิการสภาผู้แทนราษฎร</p>
              </div>
            </div>

            {/* Enter Button */}
            <button
              onClick={() => setIsEntered(true)}
              className="group relative px-10 md:px-16 py-3 md:py-4 bg-gradient-to-b from-amber-800 to-black text-white rounded-full font-bold text-base md:text-xl shadow-[0_8px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.4)] transition-all shrink-0 active:scale-95 border-b-4 border-black overflow-hidden cursor-pointer"
            >
              <span className="relative z-10 flex items-center gap-2">
                เข้าสู่เว็บไซต์
                <ExternalLink className="w-4 h-4 md:w-5 md:h-5" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>

          {/* Footer info */}
          <div className="absolute bottom-4 w-full text-center text-amber-950/60 text-[9px] md:text-[10px] tracking-[0.35em] uppercase font-bold pointer-events-none">
            Press & Media Information System
          </div>
        </motion.div>
      ) : (
        <motion.div 
          key="main"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="min-h-screen bg-slate-50 text-slate-900 font-sans"
        >
          {/* Navigation - Deep Red like official site */}
          <nav className="sticky top-0 z-50 bg-[#630D0D] border-b border-red-900/30 px-6 py-3 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-1 rounded-lg backdrop-blur-sm border border-white/20 w-10 h-10 flex items-center justify-center overflow-hidden">
                <img 
                  src="https://i.ibb.co/3Y4NMDvp/asda.png" 
                  alt="Logo" 
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight leading-none text-white">ฐานข้อมูลสมาชิกสภาผู้แทนราษฎร</span>
                <span className="text-[10px] text-red-200 uppercase tracking-wider font-medium">House of Representatives Member Database</span>
              </div>
            </div>
            
            <div className="flex-1 max-w-xl mx-8 relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-red-200/50 w-5 h-5" />
              <input 
                type="text" 
                placeholder="ค้นหารายชื่อ สส."
                className="w-full pl-10 pr-4 py-2 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-red-400 transition-all outline-none text-white placeholder:text-red-200/40 backdrop-blur-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => fetchData(true)}
                disabled={isRefreshing}
                className={`p-2 hover:bg-white/10 rounded-full transition-all text-white cursor-pointer ${isRefreshing ? 'animate-spin opacity-50' : ''}`}
                title="รีเฟรชข้อมูล"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <div className="relative group">
                <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-white cursor-pointer">
                  <Info className="w-6 h-6" />
                </button>
                {/* Tooltip UI */}
                <div className="absolute top-full right-0 mt-2 w-48 bg-white text-[#630D0D] p-3 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 pointer-events-none border border-red-100 z-[60] text-center">
                  <div className="absolute -top-1.5 right-4 w-3 h-3 bg-white rotate-45 border-l border-t border-red-100" />
                  <p className="text-xs font-black tracking-tight">เพื่อการจำลองสวมบทบาท</p>
                  <p className="text-[10px] opacity-60 mt-1 font-medium">Roleplay Simulation Only</p>
                </div>
              </div>
            </div>
          </nav>

          <main className="max-w-7xl mx-auto p-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-500 font-medium animate-pulse">กำลังโหลดข้อมูลจาก Google Sheets...</p>
              </div>
            ) : (
              <>
                {/* House Type Selector */}
            <div className="flex gap-4 mb-8">
              <button 
                onClick={() => setHouseType('house')}
                className={`flex-1 py-4 rounded-2xl font-bold transition-all shadow-sm border cursor-pointer ${houseType === 'house' ? 'bg-red-600 text-white border-red-700 shadow-lg scale-[1.02]' : 'bg-white text-slate-600 border-slate-100 hover:border-red-200'}`}
              >
                สภาผู้แทนราษฎร
              </button>
              <button 
                onClick={() => setHouseType('senate')}
                className={`flex-1 py-4 rounded-2xl font-bold transition-all shadow-sm border cursor-pointer ${houseType === 'senate' ? 'bg-red-600 text-white border-red-700 shadow-lg scale-[1.02]' : 'bg-white text-slate-600 border-slate-100 hover:border-red-200'}`}
              >
                วุฒิสภา
              </button>
            </div>

            {/* Header Section */}
            <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-l-4 border-red-600 pl-4 py-2">
              <div>
                <h2 className="text-2xl font-black mb-1 text-slate-900">
                  รายชื่อ{houseType === 'house' ? 'สมาชิกสภาผู้แทนราษฎร' : 'สมาชิกวุฒิสภา'}
                </h2>
                <p className="text-sm text-slate-500">
                  ตรวจสอบข้อมูลและตำแหน่งของ{houseType === 'house' ? 'สมาชิกสภาผู้แทนราษฎร' : 'สมาชิกวุฒิสภา'} ชุดที่ 3
                </p>
              </div>
              
              {houseType === 'house' && (
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-red-600" />
                  <select 
                    className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none text-slate-900 shadow-sm cursor-pointer"
                    value={selectedParty}
                    onChange={(e) => setSelectedParty(e.target.value)}
                  >
                    <option value="ทั้งหมด">ทุกพรรคการเมือง</option>
                    {parties.map(party => (
                      <option key={party} value={party}>{party}</option>
                    ))}
                  </select>
                </div>
              )}
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all group">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-red-50 rounded-lg group-hover:bg-red-600 transition-colors">
                    <Users className="text-red-600 w-5 h-5 group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-slate-500 text-sm font-bold uppercase tracking-wider">จำนวนสมาชิกทั้งหมด</span>
                </div>
                <div className="text-3xl font-black text-slate-900">
                  {stats.total} <span className="text-sm font-normal text-slate-400">ท่าน</span>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-l-red-600 border-slate-100 hover:shadow-md transition-all group">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-red-50 rounded-lg group-hover:bg-red-600 transition-colors">
                    <Users className="text-red-600 w-5 h-5 group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-slate-500 text-sm font-bold uppercase tracking-wider">
                    {stats.presidentTitle}
                  </span>
                </div>
                <div className={`text-xl font-black ${stats.president === "ไม่มีผู้ดำรงตำแหน่ง" ? "text-slate-300 italic" : "text-red-700"}`}>
                  {stats.president}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-l-red-400 border-slate-100 hover:shadow-md transition-all group">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-red-50 rounded-lg group-hover:bg-red-600 transition-colors">
                    <Users className="text-red-600 w-5 h-5 group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-slate-500 text-sm font-bold uppercase tracking-wider">
                    {stats.vicePresidentTitle}
                  </span>
                </div>
                <div className={`text-xl font-black ${stats.vicePresident === "ไม่มีผู้ดำรงตำแหน่ง" ? "text-slate-300 italic" : "text-red-700"}`}>
                  {stats.vicePresident}
                </div>
              </div>
            </div>

            {/* Member List Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredMembers.map((member) => {
                  const isPresident = member.position === 'ประธานสภาผู้แทนราษฎร' || member.position === 'ประธานวุฒิสภา';
                  const isVicePresident = member.position.includes('รองประธาน');
                  
                  return (
                    <motion.div
                      layout
                      key={member.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className={`bg-white rounded-2xl p-5 shadow-sm border transition-all group relative overflow-hidden 
                        ${isPresident ? 'border-red-400 ring-4 ring-red-50 shadow-2xl scale-[1.05] z-10 sm:col-span-2 lg:col-span-1 xl:col-span-1' : 
                          isVicePresident ? 'border-red-200 ring-2 ring-red-50 shadow-md' : 
                          'border-slate-100 hover:shadow-xl hover:border-red-100'}`}
                    >
                      {/* Top Accent Line */}
                      <div className={`absolute top-0 left-0 w-full h-1.5 bg-red-600 transition-transform origin-left ${isPresident || isVicePresident ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
                      
                      {isPresident && (
                        <div className="absolute -right-12 top-6 bg-red-600 text-white text-[10px] font-black py-1 px-12 rotate-45 shadow-lg uppercase tracking-widest">
                          Leader
                        </div>
                      )}

                      <div className="flex flex-col items-center text-center">
                        <div className={`relative w-24 h-24 rounded-full overflow-hidden mb-4 border-4 shadow-inner transition-colors ${isPresident ? 'border-red-200 w-32 h-32' : isVicePresident ? 'border-red-100' : 'border-slate-50 group-hover:border-red-50'}`}>
                          <img 
                            src={member.image} 
                            alt={member.name}
                            className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all"
                            referrerPolicy="no-referrer"
                          />
                          {isPresident && (
                            <div className="absolute inset-0 border-4 border-red-600/20 rounded-full animate-pulse" />
                          )}
                        </div>
                        <h3 className={`font-bold mb-1 ${isPresident ? 'text-2xl text-red-900' : 'text-lg text-slate-900'}`}>{member.name}</h3>
                        <div className={`text-xs font-bold mb-2 ${isPresident ? 'text-white bg-red-600 px-4 py-1 rounded-full shadow-sm' : isVicePresident ? 'text-red-600 bg-red-50 px-2 py-0.5 rounded-md' : 'text-red-600'}`}>{member.position}</div>
                        
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-100 mb-4">
                          {member.party}
                        </div>
                        
                        <div className="w-full grid grid-cols-1 gap-2 text-slate-600 mt-2 pt-4 border-t border-slate-50 text-xs">
                          <div className="text-center">
                            <p className="font-bold text-slate-400 uppercase tracking-tighter mb-1">Roblox Name</p>
                            <p className="font-bold text-slate-700">{member.robloxName}</p>
                          </div>
                        </div>
                      </div>

                      <button 
                        onClick={() => setSelectedMember(member)}
                        className={`absolute top-4 left-4 p-2 transition-opacity bg-red-600 text-white rounded-full shadow-lg cursor-pointer ${isPresident ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {filteredMembers.length === 0 && (
              <div className="text-center py-24">
                <div className="bg-red-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="text-red-200 w-12 h-12" />
                </div>
                <h3 className="text-2xl font-black text-slate-900">ยังไม่มีผู้ดำรงตำแหน่ง</h3>
                <p className="text-slate-500 max-w-md mx-auto mt-2">กรุณาลองใช้คำค้นหาอื่น หรือตรวจสอบข้อมูลอีกครั้ง</p>
                <button 
                  onClick={() => { setSearchTerm(''); setSelectedParty('ทั้งหมด'); }}
                  className="mt-6 px-6 py-2 bg-red-600 text-white rounded-full font-bold hover:bg-red-700 transition-colors shadow-lg"
                >
                  ล้างการค้นหาทั้งหมด
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Copy Modal */}
      <AnimatePresence>
        {selectedMember && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMember(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden border border-slate-100"
            >
              <div className="bg-[#630D0D] p-6 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-xl">
                    <Copy className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-lg">คัดลอกข้อมูล</h3>
                </div>
                <button 
                  onClick={() => setSelectedMember(null)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <img 
                    src={selectedMember.image} 
                    alt={selectedMember.name} 
                    className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900">{selectedMember.name}</h4>
                    <p className="text-xs text-red-600 font-bold">{selectedMember.position}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Roblox Username</label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700">
                        {selectedMember.robloxName}
                      </div>
                      <button 
                        onClick={() => handleCopy(selectedMember.robloxName, 'roblox')}
                        className={`p-3 rounded-xl transition-all cursor-pointer ${copyStatus === 'roblox' ? 'bg-green-500 text-white' : 'bg-[#630D0D] text-white hover:bg-red-700'}`}
                      >
                        {copyStatus === 'roblox' ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ชื่อ-นามสกุลจริง</label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700">
                        {selectedMember.name}
                      </div>
                      <button 
                        onClick={() => handleCopy(selectedMember.name, 'real')}
                        className={`p-3 rounded-xl transition-all cursor-pointer ${copyStatus === 'real' ? 'bg-green-500 text-white' : 'bg-[#630D0D] text-white hover:bg-red-700'}`}
                      >
                        {copyStatus === 'real' ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                  คลิกที่ปุ่มไอคอนเพื่อคัดลอกข้อมูลไปยังคลิปบอร์ด
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

          <footer className="mt-24 border-t border-slate-200 bg-white py-16 px-6">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-red-700 p-2 rounded-lg">
                    <LayoutDashboard className="text-white w-5 h-5" />
                  </div>
                  <span className="font-black text-xl text-slate-900">รัฐสภาไทย</span>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
                  ระบบฐานข้อมูลสารสนเทศเพื่อการสวมบทบาทและจำลองสถานการณ์ มิได้มีส่วนเกี่ยวข้องกับหน่วยงานจริงในโลกความเป็นจริง
                </p>
              </div>
              
              <div className="flex flex-col gap-4">
                <h4 className="font-bold text-slate-900 uppercase tracking-widest text-xs">ลิงก์ที่เป็นประโยชน์</h4>
                <div className="flex flex-col gap-2 text-sm text-slate-600">
                  <a href="#" className="hover:text-red-600 transition-colors">นโยบายความเป็นส่วนตัว</a>
                  <a href="#" className="hover:text-red-600 transition-colors">เงื่อนไขการใช้งาน</a>
                  <a href="#" className="hover:text-red-600 transition-colors">ติดต่อสอบถาม</a>
                </div>
              </div>
              
              <div className="flex flex-col gap-4">
                <h4 className="font-bold text-slate-900 uppercase tracking-widest text-xs">ลิขสิทธิ์</h4>
                <p className="text-red-600/60 text-sm font-medium">© 2026 ระบบข้อมูลรัฐสภาเพื่อการสวมบทบาท (Roleplay Edition)</p>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded bg-slate-100" />
                  <div className="w-8 h-8 rounded bg-slate-100" />
                  <div className="w-8 h-8 rounded bg-slate-100" />
                </div>
              </div>
            </div>
          </footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
