
import React, { useState, useEffect, useRef } from 'react';
import { PlanType } from './types';
import { TRADITIONAL_SECTIONS, LEAN_SECTIONS } from './constants';
import { gemini } from './services/geminiService';

const App: React.FC = () => {
  const [activePlan, setActivePlan] = useState<PlanType>(PlanType.TRADITIONAL);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'EDIT' | 'PREVIEW'>('EDIT');
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [loadingFullPlan, setLoadingFullPlan] = useState(false);
  const [loadingFields, setLoadingFields] = useState<Record<string, boolean>>({});
  const [businessIdea, setBusinessIdea] = useState("EduPlan: Plataforma Educativa con IA");
  
  // Audio State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(typeof window !== 'undefined' ? window.speechSynthesis : null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const [companyDetails, setCompanyDetails] = useState({
    businessName: "",
    founder: "",
    rfc: "",
    website: "",
    schedule: "",
    fiscalRegime: "",
    adn: "",
    valor: "",
    competencia: "",
    mercado: "",
    vision2026: "",
    viabilidad: "",
    proyecciones: "",
    valores: "",
    pitch: "",
    blindaje: ""
  });

  const [userContents, setUserContents] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentSections = activePlan === PlanType.TRADITIONAL ? TRADITIONAL_SECTIONS : LEAN_SECTIONS;

  useEffect(() => {
    const savedIdea = localStorage.getItem('eduplan_idea');
    const savedContents = localStorage.getItem('eduplan_contents');
    const savedDetails = localStorage.getItem('eduplan_company_details');
    if (savedIdea) setBusinessIdea(savedIdea);
    if (savedContents) setUserContents(JSON.parse(savedContents));
    if (savedDetails) setCompanyDetails(JSON.parse(savedDetails));

    return () => {
      if (synthRef.current) synthRef.current.cancel();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('eduplan_idea', businessIdea);
    localStorage.setItem('eduplan_contents', JSON.stringify(userContents));
    localStorage.setItem('eduplan_company_details', JSON.stringify(companyDetails));
  }, [businessIdea, userContents, companyDetails]);

  const handleSectionClick = async (sectionTitle: string, id: string) => {
    setSelectedSection(id);
    setViewMode('EDIT');
    setLoadingAi(true);
    const explanation = await gemini.getSectionExplanation(sectionTitle, activePlan, businessIdea);
    setAiExplanation(explanation || null);
    setLoadingAi(false);
  };

  const handleGenerateIdea = async () => {
    setLoadingAi(true);
    const newIdea = await gemini.generateExampleIdea(businessIdea);
    setBusinessIdea(newIdea);
    setLoadingAi(false);
  };

  const handleFillFieldWithAi = async (fieldKey: keyof typeof companyDetails, label: string, desc: string) => {
    if (!businessIdea.trim()) return alert("Define una idea primero.");
    setLoadingFields(prev => ({ ...prev, [fieldKey]: true }));
    const result = await gemini.fillSingleField(businessIdea, label, desc);
    if (result) {
      setCompanyDetails(prev => ({ ...prev, [fieldKey]: result }));
    }
    setLoadingFields(prev => ({ ...prev, [fieldKey]: false }));
  };

  const handleAutoFill = async () => {
    if (!businessIdea.trim()) return alert("Define una idea primero.");
    setLoadingFullPlan(true);
    const sectionsToFill = currentSections.map(s => ({ id: s.id, title: s.title }));
    const generatedData = await gemini.fillEntirePlan(businessIdea, activePlan, sectionsToFill);
    if (generatedData) {
      if (activePlan === PlanType.TRADITIONAL) {
        const sec2Data = generatedData['2'];
        if (typeof sec2Data === 'object' && sec2Data !== null) {
          setCompanyDetails(prev => ({ 
            ...prev, 
            businessName: prev.businessName || businessIdea.split(':')[0],
            website: sec2Data.website || prev.website,
            fiscalRegime: sec2Data.fiscalRegime || prev.fiscalRegime,
            schedule: sec2Data.schedule || prev.schedule,
            adn: sec2Data.adn || prev.adn,
            valor: sec2Data.valor || prev.valor,
            competencia: sec2Data.competencia || prev.competencia,
            mercado: sec2Data.mercado || prev.mercado,
            vision2026: sec2Data.vision2026 || prev.vision2026,
            viabilidad: sec2Data.viabilidad || prev.viabilidad,
            proyecciones: sec2Data.proyecciones || prev.proyecciones,
            valores: sec2Data.valores || prev.valores,
            pitch: sec2Data.pitch || prev.pitch,
            blindaje: sec2Data.blindaje || prev.blindaje
          }));
        }
        const restOfData: Record<string, string> = {};
        Object.keys(generatedData).forEach(key => {
          if (key !== '2') restOfData[key] = generatedData[key];
        });
        setUserContents(prev => ({ ...prev, ...restOfData }));
      } else {
        setUserContents(generatedData);
      }
      alert("¡Plan generado automáticamente!");
    }
    setLoadingFullPlan(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const exportToTxt = () => {
    let content = `EDUPLAN - BUSINESS PLAN\n=========================\nIdea: ${businessIdea}\nFormato: ${activePlan}\n\n`;
    
    if (activePlan === PlanType.TRADITIONAL) {
      content += `DATOS CORPORATIVOS:\n`;
      content += `- Nombre: ${companyDetails.businessName}\n`;
      content += `- CEO: ${companyDetails.founder}\n`;
      content += `- RFC: ${companyDetails.rfc}\n`;
      content += `- Sitio Web: ${companyDetails.website}\n`;
      content += `- Horario: ${companyDetails.schedule}\n`;
      content += `- Régimen Fiscal: ${companyDetails.fiscalRegime}\n\n`;
      content += `1. ADN Y ORIGEN:\n${companyDetails.adn}\n\n`;
      content += `2. NÚCLEO DE VALOR:\n${companyDetails.valor}\n\n`;
      content += `3. COMPETENCIA:\n${companyDetails.competencia}\n\n`;
      content += `4. MERCADO Y FODA:\n${companyDetails.mercado}\n\n`;
      content += `5. VISIÓN 2026:\n${companyDetails.vision2026}\n\n`;
      content += `6. VIABILIDAD:\n${companyDetails.viabilidad}\n\n`;
      content += `7. PROYECCIONES:\n${companyDetails.proyecciones}\n\n`;
      content += `8. VALORES:\n${companyDetails.valores}\n\n`;
      content += `9. PITCH COMERCIAL:\n${companyDetails.pitch}\n\n`;
      content += `10. BLINDAJE ESTRATÉGICO:\n${companyDetails.blindaje}\n\n`;
    }

    currentSections.forEach((sec, idx) => {
      if (sec.id === '2' && activePlan === PlanType.TRADITIONAL) return;
      content += `${sec.title.toUpperCase()}\n-------------------------\n`;
      content += userContents[sec.id] || '(Vacío)';
      content += `\n\n`;
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `EduPlan_${businessIdea.slice(0, 10)}.txt`;
    link.click();
  };

  const startListening = () => {
    if (!synthRef.current) return;
    
    synthRef.current.cancel();

    const fullText = `
      Plan de Negocios para ${companyDetails.businessName || businessIdea}.
      Director: ${companyDetails.founder || 'No especificado'}.
      Identidad Corporativa.
      ${activePlan === PlanType.TRADITIONAL ? `
        Historia y ADN: ${companyDetails.adn}.
        Núcleo de Valor: ${companyDetails.valor}.
        Estrategia de Competencia: ${companyDetails.competencia}.
        Análisis de Mercado: ${companyDetails.mercado}.
        Visión al Futuro: ${companyDetails.vision2026}.
      ` : ''}
      ${currentSections.filter(s => !(activePlan === PlanType.TRADITIONAL && s.id === '2')).map(sec => `${sec.title}: ${userContents[sec.id] || 'Contenido pendiente'}`).join('. ')}
    `;

    utteranceRef.current = new SpeechSynthesisUtterance(fullText);
    utteranceRef.current.lang = 'es-ES';
    utteranceRef.current.rate = 1.0;
    
    utteranceRef.current.onstart = () => setIsSpeaking(true);
    utteranceRef.current.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    synthRef.current.speak(utteranceRef.current);
    setIsSpeaking(true);
    setIsPaused(false);
  };

  const togglePause = () => {
    if (!synthRef.current) return;
    if (isPaused) {
      synthRef.current.resume();
      setIsPaused(false);
    } else {
      synthRef.current.pause();
      setIsPaused(true);
    }
  };

  const stopListening = () => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  return (
    <div className="min-h-screen pb-20 bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900 print:bg-white print:pb-0">
      <input type="file" ref={fileInputRef} className="hidden" accept=".txt,.json" />

      <header className="bg-slate-900 text-white py-6 px-4 shadow-2xl sticky top-0 z-50 border-b border-slate-800 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => { setViewMode('EDIT'); stopListening(); }}>
            <div className="bg-indigo-600 text-white p-3 rounded-2xl text-2xl shadow-lg transition-transform duration-500">🎓</div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter uppercase italic">EduPlan <span className="text-indigo-500">PRO</span></h1>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">High-Tech Business Training</p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-4">
            <nav className="flex bg-slate-800 p-1.5 rounded-2xl border border-slate-700 shadow-inner">
              <button onClick={() => { setActivePlan(PlanType.TRADITIONAL); stopListening(); }} className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activePlan === PlanType.TRADITIONAL ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>Tradicional</button>
              <button onClick={() => { setActivePlan(PlanType.LEAN); stopListening(); }} className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activePlan === PlanType.LEAN ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>Canvas Ágil</button>
            </nav>
            <div className="flex gap-2">
              <button 
                onClick={() => { setViewMode(viewMode === 'EDIT' ? 'PREVIEW' : 'EDIT'); if(viewMode === 'PREVIEW') stopListening(); }} 
                className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border shadow-lg ${viewMode === 'PREVIEW' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'}`}
              >
                {viewMode === 'EDIT' ? '👁️ Vista Final' : '✏️ Volver al Editor'}
              </button>
              <button onClick={exportToTxt} className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-6 py-3 rounded-2xl text-xs uppercase tracking-widest shadow-xl flex items-center gap-2 active:scale-95 transition-all"><span>💾</span> Guardar</button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-10 print:mt-0 print:max-w-full">
        {viewMode === 'EDIT' ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
            <div className="lg:col-span-3">
              {/* Idea Input */}
              <section className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-200 mb-10 relative overflow-hidden group">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-tighter italic">
                    <span className="text-indigo-600">💡</span> Idea de Negocio
                  </h2>
                  <button onClick={handleAutoFill} disabled={loadingFullPlan} className="group relative px-6 py-2.5 rounded-full overflow-hidden font-black text-[10px] uppercase tracking-widest text-white shadow-lg active:scale-95 transition-all disabled:opacity-50">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600"></div>
                    <span className="relative flex items-center gap-2">{loadingFullPlan ? '⏳ Generando...' : '✨ Auto-rellenar Plan'}</span>
                  </button>
                </div>
                <div className="flex gap-4">
                  <input 
                    type="text" 
                    value={businessIdea} 
                    onChange={(e) => setBusinessIdea(e.target.value)}
                    className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-3xl px-6 py-4 focus:border-indigo-500 outline-none font-bold text-slate-800 shadow-inner"
                    placeholder="Ingresa tu idea..."
                  />
                  <button onClick={handleGenerateIdea} className="bg-slate-900 text-white font-black px-8 py-4 rounded-3xl hover:bg-slate-800 transition-all shadow-xl min-w-[150px] uppercase text-xs tracking-widest">
                    🪄 Refinar
                  </button>
                </div>
              </section>

              {/* Sections Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentSections.map((sec) => (
                  <button 
                    key={sec.id} 
                    onClick={() => handleSectionClick(sec.title, sec.id)} 
                    className={`group p-8 rounded-[2.5rem] border-2 transition-all text-left flex flex-col h-full relative overflow-hidden ${selectedSection === sec.id ? 'bg-white border-indigo-600 shadow-2xl scale-[1.02]' : 'bg-white border-slate-100 hover:border-indigo-300 hover:shadow-2xl hover:-translate-y-1'}`}
                  >
                    <div className="flex justify-between items-start mb-6">
                      <span className="text-4xl">{sec.icon}</span>
                      {(userContents[sec.id] || (sec.id === '2' && companyDetails.businessName)) && (
                        <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">✓ LISTO</span>
                      )}
                    </div>
                    <h4 className="font-black text-sm uppercase tracking-tighter text-slate-900 mb-2">{sec.title}</h4>
                    <p className="text-[10px] text-slate-400 font-bold leading-relaxed flex-1 italic">{sec.description}</p>
                  </button>
                ))}
              </div>

              {/* Editor for Traditional Step 2 */}
              {selectedSection === '2' && activePlan === PlanType.TRADITIONAL && (
                <div className="mt-12 bg-white rounded-[3rem] p-10 shadow-2xl border-4 border-indigo-50">
                  <div className="flex justify-between items-center mb-10">
                    <h3 className="text-2xl font-black text-slate-900 uppercase italic">🏢 Estrategia Corporativa</h3>
                    <button onClick={() => setSelectedSection(null)} className="text-slate-300 hover:text-slate-600 text-2xl">✕</button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    <InputField label="Nombre del Negocio" value={companyDetails.businessName} onChange={v => setCompanyDetails({...companyDetails, businessName: v})} onAiFill={() => handleFillFieldWithAi('businessName', 'Nombre', 'Creativo')} isLoading={loadingFields['businessName']} />
                    <InputField label="Fundador / CEO" value={companyDetails.founder} onChange={v => setCompanyDetails({...companyDetails, founder: v})} onAiFill={() => handleFillFieldWithAi('founder', 'Fundador', 'Nombre completo')} isLoading={loadingFields['founder']} />
                    <InputField label="RFC" value={companyDetails.rfc} onChange={v => setCompanyDetails({...companyDetails, rfc: v})} onAiFill={() => handleFillFieldWithAi('rfc', 'RFC', 'Ejemplo')} isLoading={loadingFields['rfc']} />
                    <InputField label="Sitio Web" value={companyDetails.website} onChange={v => setCompanyDetails({...companyDetails, website: v})} onAiFill={() => handleFillFieldWithAi('website', 'Sitio Web', 'Dominio')} isLoading={loadingFields['website']} />
                    <InputField label="Horario" value={companyDetails.schedule} onChange={v => setCompanyDetails({...companyDetails, schedule: v})} onAiFill={() => handleFillFieldWithAi('schedule', 'Horario', 'Sugerido')} isLoading={loadingFields['schedule']} />
                    <InputField label="Régimen Fiscal" value={companyDetails.fiscalRegime} onChange={v => setCompanyDetails({...companyDetails, fiscalRegime: v})} onAiFill={() => handleFillFieldWithAi('fiscalRegime', 'Régimen', 'Adecuado')} isLoading={loadingFields['fiscalRegime']} />
                  </div>

                  <div className="space-y-10">
                    <TextAreaField label="1. ADN Corporativo" sub="Historia y Origen" value={companyDetails.adn} onChange={v => setCompanyDetails({...companyDetails, adn: v})} onAiFill={() => handleFillFieldWithAi('adn', 'ADN', 'Storytelling')} isLoading={loadingFields['adn']} />
                    <TextAreaField label="2. El Núcleo de Valor" sub="Business Core" value={companyDetails.valor} onChange={v => setCompanyDetails({...companyDetails, valor: v})} onAiFill={() => handleFillFieldWithAi('valor', 'Valor', 'Estrategia')} isLoading={loadingFields['valor']} />
                    <TextAreaField label="3. Competencia" sub="USP y Ventajas" value={companyDetails.competencia} onChange={v => setCompanyDetails({...companyDetails, competencia: v})} onAiFill={() => handleFillFieldWithAi('competencia', 'Competencia', 'Diferenciación')} isLoading={loadingFields['competencia']} />
                    <TextAreaField label="4. Análisis FODA" sub="Matriz Estratégica" value={companyDetails.mercado} onChange={v => setCompanyDetails({...companyDetails, mercado: v})} onAiFill={() => handleFillFieldWithAi('mercado', 'Mercado', 'FODA')} isLoading={loadingFields['mercado']} />
                    <TextAreaField label="5. Visión 2026" sub="Innovación e IA" value={companyDetails.vision2026} onChange={v => setCompanyDetails({...companyDetails, vision2026: v})} onAiFill={() => handleFillFieldWithAi('vision2026', 'Visión', 'Tecnología')} isLoading={loadingFields['vision2026']} />
                    <TextAreaField label="6. Viabilidad" sub="Equipo y Recursos" value={companyDetails.viabilidad} onChange={v => setCompanyDetails({...companyDetails, viabilidad: v})} onAiFill={() => handleFillFieldWithAi('viabilidad', 'Viabilidad', 'Estructura')} isLoading={loadingFields['viabilidad']} />
                    <TextAreaField label="7. Proyecciones" sub="Finanzas" value={companyDetails.proyecciones} onChange={v => setCompanyDetails({...companyDetails, proyecciones: v})} onAiFill={() => handleFillFieldWithAi('proyecciones', 'Proyecciones', 'Lineal a Pasivo')} isLoading={loadingFields['proyecciones']} />
                    <TextAreaField label="8. Valores" sub="Cultura" value={companyDetails.valores} onChange={v => setCompanyDetails({...companyDetails, valores: v})} onAiFill={() => handleFillFieldWithAi('valores', 'Valores', 'Automatización')} isLoading={loadingFields['valores']} />
                    <TextAreaField label="9. Pitch" sub="30 Segundos" value={companyDetails.pitch} onChange={v => setCompanyDetails({...companyDetails, pitch: v})} onAiFill={() => handleFillFieldWithAi('pitch', 'Pitch', 'Venta')} isLoading={loadingFields['pitch']} />
                    <TextAreaField label="10. Blindaje Legal" sub="IP y Legal" value={companyDetails.blindaje} onChange={v => setCompanyDetails({...companyDetails, blindaje: v})} onAiFill={() => handleFillFieldWithAi('blindaje', 'Legal', 'Propiedad Intelectual')} isLoading={loadingFields['blindaje']} />
                  </div>
                </div>
              )}

              {selectedSection && !(selectedSection === '2' && activePlan === PlanType.TRADITIONAL) && (
                <div className="mt-12 bg-white rounded-[3rem] p-10 shadow-2xl border-4 border-indigo-50">
                   <div className="flex justify-between items-center mb-8">
                      <h3 className="text-2xl font-black text-slate-900 uppercase italic">{currentSections.find(s=>s.id===selectedSection)?.title}</h3>
                      <button onClick={() => setSelectedSection(null)} className="text-slate-300 hover:text-slate-600 text-2xl">✕</button>
                   </div>
                   <textarea 
                      value={userContents[selectedSection] || ''}
                      onChange={(e) => setUserContents({...userContents, [selectedSection]: e.target.value})}
                      className="w-full h-80 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] p-8 text-sm font-medium text-slate-700 shadow-inner outline-none focus:border-indigo-500"
                      placeholder="Redacta el contenido de esta sección..."
                   />
                </div>
              )}
            </div>

            <aside className="lg:col-span-1">
              <div className="sticky top-32">
                <div className="bg-slate-900 text-white rounded-[3rem] p-10 shadow-2xl border border-slate-800 min-h-[500px] flex flex-col">
                  <div className="flex items-center gap-4 mb-10">
                    <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg">🤖</div>
                    <div>
                      <h3 className="font-black text-lg">Tutor Gemini</h3>
                      <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Master Coach</span>
                    </div>
                  </div>
                  <div className="flex-1 bg-slate-800/50 rounded-[2rem] p-6 overflow-y-auto border border-white/5 shadow-inner">
                    {!selectedSection ? (
                      <div className="text-center py-20 text-slate-500 text-[10px] font-black uppercase tracking-widest leading-loose">Selecciona un paso para recibir asesoría estratégica</div>
                    ) : loadingAi ? (
                      <div className="text-center py-20 text-indigo-400 font-black text-[10px] uppercase tracking-widest animate-pulse">Analizando...</div>
                    ) : (
                      <div className="text-slate-300 leading-relaxed text-xs space-y-4 font-medium italic">
                        {aiExplanation?.split('\n').map((para, i) => <p key={i}>{para}</p>)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto mb-10">
            {/* Toolbar for Preview */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 print:hidden">
              <h2 className="text-2xl font-black text-slate-900 uppercase italic flex items-center gap-3">
                <span className="w-2 h-8 bg-indigo-600 rounded-full"></span> Documento Final
              </h2>
              <div className="flex flex-wrap justify-center gap-4">
                {/* Audio Player Controls */}
                <div className="flex bg-slate-900 rounded-3xl p-1 shadow-2xl overflow-hidden items-center">
                   {!isSpeaking ? (
                      <button 
                        onClick={startListening}
                        className="bg-indigo-600 text-white font-black px-6 py-3 rounded-2xl hover:bg-indigo-500 transition-all uppercase text-[10px] tracking-widest flex items-center gap-2"
                      >
                        <span>🎙️</span> Escuchar Plan
                      </button>
                   ) : (
                      <div className="flex items-center px-4 gap-2">
                        <button 
                          onClick={togglePause}
                          className="w-10 h-10 flex items-center justify-center bg-slate-800 text-white rounded-full hover:bg-slate-700"
                        >
                          {isPaused ? '▶️' : '⏸️'}
                        </button>
                        <button 
                          onClick={stopListening}
                          className="w-10 h-10 flex items-center justify-center bg-red-900/50 text-red-400 rounded-full hover:bg-red-900"
                        >
                          ⏹️
                        </button>
                        <div className="ml-2">
                           <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest animate-pulse">{isPaused ? 'En Pausa' : 'Reproduciendo...'}</span>
                        </div>
                      </div>
                   )}
                </div>

                <div className="hidden md:block h-12 w-[2px] bg-slate-200"></div>

                <button 
                  onClick={handlePrint}
                  className="bg-indigo-600 text-white font-black px-8 py-4 rounded-3xl hover:bg-indigo-500 transition-all shadow-xl uppercase text-[11px] tracking-widest flex items-center gap-2"
                >
                  <span>📄</span> Guardar PDF
                </button>
                <button 
                  onClick={handlePrint}
                  className="bg-slate-900 text-white font-black px-8 py-4 rounded-3xl hover:bg-slate-800 transition-all shadow-xl uppercase text-[11px] tracking-widest flex items-center gap-2"
                >
                  <span>🖨️</span> Imprimir
                </button>
              </div>
            </div>

            {/* Actual Document Content */}
            <div className="bg-white rounded-[3.5rem] p-12 md:p-20 shadow-2xl border-t-[12px] border-indigo-600 print:shadow-none print:p-0 print:rounded-none print:border-t-0">
              <header className="border-b-4 border-slate-100 pb-12 mb-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                  <div className="flex-1">
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 uppercase tracking-tighter italic leading-none mb-6">
                      {companyDetails.businessName || "SIN NOMBRE"}
                    </h1>
                    <div className="flex items-center gap-4">
                      <span className="text-indigo-600 font-black uppercase tracking-[0.4em] text-xs">Plan Estratégico de Negocios</span>
                      <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                      <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">{new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="bg-slate-900 text-white p-10 rounded-[2.5rem] shadow-2xl min-w-[300px]">
                    <div className="flex flex-col gap-6">
                      <div>
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1 block">Responsable</span>
                        <span className="text-xl font-black">{companyDetails.founder || "Pendiente de asignar"}</span>
                      </div>
                      <div className="pt-6 border-t border-slate-800">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Metodología</span>
                        <span className="text-xs font-black uppercase tracking-widest text-indigo-200">{activePlan === PlanType.TRADITIONAL ? 'Tradicional Corporativa' : 'Canvas Ágil / Lean Startup'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20 print:grid-cols-2">
                <DocSummaryItem label="Web Oficial" value={companyDetails.website} icon="🌐" />
                <DocSummaryItem label="Registro Fiscal" value={companyDetails.rfc} icon="📄" />
                <DocSummaryItem label="Operatividad" value={companyDetails.schedule} icon="⏰" />
                <DocSummaryItem label="Régimen Legal" value={companyDetails.fiscalRegime} icon="⚖️" />
              </div>

              <div className="space-y-32">
                {activePlan === PlanType.TRADITIONAL && (
                  <DocSection title="I. Identidad y Estrategia Central">
                    <div className="grid grid-cols-1 gap-14">
                      <DocStrategyPoint title="1. ADN Corporativo" content={companyDetails.adn} />
                      <DocStrategyPoint title="2. Núcleo de Valor" content={companyDetails.valor} />
                      <DocStrategyPoint title="3. Diferenciación Competitiva" content={companyDetails.competencia} />
                      <DocStrategyPoint title="4. Análisis FODA" content={companyDetails.mercado} />
                      <DocStrategyPoint title="5. Visión Tecnológica 2026" content={companyDetails.vision2026} />
                      <DocStrategyPoint title="6. Viabilidad y Recursos" content={companyDetails.viabilidad} />
                      <DocStrategyPoint title="7. Modelo de Proyecciones" content={companyDetails.proyecciones} />
                      <DocStrategyPoint title="8. Cultura y Valores" content={companyDetails.valores} />
                      <DocStrategyPoint title="9. Pitch Ejecutivo" content={companyDetails.pitch} />
                      <DocStrategyPoint title="10. Blindaje Estratégico" content={companyDetails.blindaje} />
                    </div>
                  </DocSection>
                )}

                {currentSections.filter(s => !(activePlan === PlanType.TRADITIONAL && s.id === '2')).map((sec, idx) => (
                  <DocSection key={sec.id} title={`${activePlan === PlanType.TRADITIONAL ? `II.${idx + 1}` : idx + 1}. ${sec.title}`}>
                    <div className="relative pl-12">
                      <div className="absolute left-0 top-0 text-6xl font-black text-slate-50 select-none print:hidden">0{idx + 1}</div>
                      <p className="text-slate-700 leading-relaxed font-medium text-lg whitespace-pre-wrap italic border-l-8 border-indigo-600/10 pl-10 py-6 rounded-r-[3rem] bg-slate-50/50">
                        {userContents[sec.id] || "Sección pendiente de redacción estratégica."}
                      </p>
                    </div>
                  </DocSection>
                ))}
              </div>

              <footer className="mt-40 pt-20 border-t-8 border-slate-50 flex flex-col items-center gap-10">
                <div className="w-24 h-2 bg-indigo-600 rounded-full"></div>
                <div className="text-center space-y-4">
                  <p className="text-sm font-black text-slate-900 uppercase tracking-[0.5em]">Certificación de Estrategia EduPlan</p>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest max-w-xl mx-auto leading-loose">Este documento contiene la estructura fundamental para un negocio escalable, validado mediante inteligencia artificial de alta precisión.</p>
                </div>
              </footer>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const InputField = ({ label, value, onChange, onAiFill, isLoading }: any) => (
  <div className="flex flex-col gap-2">
    <div className="flex justify-between items-center px-1">
      <label className="text-[10px] font-black uppercase text-indigo-500 tracking-widest">{label}</label>
      <button onClick={onAiFill} disabled={isLoading} className="text-[9px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100 disabled:opacity-50 hover:bg-indigo-100">
        {isLoading ? '...' : '✨ IA Fill'}
      </button>
    </div>
    <input value={value} onChange={e => onChange(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3 font-bold text-slate-800 shadow-inner outline-none focus:border-indigo-500" />
  </div>
);

const TextAreaField = ({ label, sub, value, onChange, onAiFill, isLoading }: any) => (
  <div className="flex flex-col gap-2">
    <div className="flex justify-between items-center px-1">
      <div className="flex flex-col"><label className="text-xs font-black uppercase text-slate-900">{label}</label><span className="text-[9px] font-bold text-slate-400 italic">{sub}</span></div>
      <button onClick={onAiFill} disabled={isLoading} className="text-[10px] font-black uppercase text-white bg-indigo-600 px-3 py-1 rounded-full shadow-md active:scale-95 disabled:opacity-50">
        {isLoading ? '⌛...' : '✨ IA Fill'}
      </button>
    </div>
    <textarea value={value} onChange={e => onChange(e.target.value)} className="w-full h-36 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] p-6 text-sm font-medium text-slate-700 shadow-inner outline-none focus:border-indigo-500" />
  </div>
);

const DocSummaryItem = ({ label, value, icon }: any) => (
  <div className="flex items-center gap-6 p-8 rounded-[3rem] bg-slate-50/50 border border-slate-100 shadow-sm">
    <div className="w-14 h-14 bg-white rounded-3xl flex items-center justify-center text-3xl shadow-md border border-slate-50">{icon}</div>
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
      <span className="text-sm font-black text-slate-900 leading-tight">{value || "---"}</span>
    </div>
  </div>
);

const DocSection = ({ title, children }: any) => (
  <section className="print:break-inside-avoid">
    <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-16 pb-8 border-b-8 border-slate-50 flex items-center gap-5">
      <span className="w-5 h-5 bg-indigo-600 rounded-full"></span>
      {title}
    </h2>
    <div className="space-y-20">
      {children}
    </div>
  </section>
);

const DocStrategyPoint = ({ title, content }: any) => (
  <div className="group print:break-inside-avoid">
    <div className="flex items-center gap-5 mb-8">
      <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-sm font-black shadow-xl group-hover:scale-110 transition-transform">✓</div>
      <h4 className="text-lg font-black text-slate-900 uppercase tracking-tighter">{title}</h4>
    </div>
    <div className="text-slate-700 leading-relaxed text-lg font-medium whitespace-pre-wrap pl-16 border-l-4 border-slate-100 group-hover:border-indigo-600 transition-all duration-500">
      {content || <span className="text-slate-300 italic font-normal">Este apartado estratégico aún requiere ser detallado para consolidar la estructura del negocio.</span>}
    </div>
  </div>
);

export default App;
