import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import {
  Utensils,
  Shell,
  Truck,
  Moon,
  Calendar,
  Clock,
  CheckCircle2,
  Sparkles,
  FileText,
  Mic,
  Upload,
  Plus,
  ChevronRight,
  ArrowLeft,
  Eye,
  Edit3,
  Trash2,
  Mail,
  Phone,
  Globe,
  User,
  Award,
  Layers,
  AlertCircle,
  Send,
  Copy,
  Check,
  Search,
  SlidersHorizontal,
  Image as ImageIcon,
  Euro,
  HelpCircle,
  RefreshCw,
  FileAudio,
  BookOpen,
  Building2,
  MessageSquare,
  X
} from 'lucide-react';

// ==========================================
// FIREBASE INITIALISATIE
// ==========================================
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// ==========================================
// VASTE DEFINITIES: 4 GRADATIES & STATUSSEN
// ==========================================
const CATEGORIES = [
  {
    id: 'hoofdstands',
    title: 'Hoofdstands',
    subtitle: 'Foodtrucks & Maaltijdconcepten',
    description: 'Alle grotere foodtrucks en stands die broodjes, friet, pizza, gyros, kip en volledige maaltijden op hoge capaciteit verkopen.',
    icon: Utensils,
    accent: 'from-amber-500/20 via-amber-600/5 to-transparent',
    borderAccent: 'hover:border-amber-500/50'
  },
  {
    id: 'oesters',
    title: 'Oesters',
    subtitle: 'Oesterbarren & Oesterlopers',
    description: 'Gespecialiseerde oesterconcepten, mobiele oesterbarren en champagne/oester-beleving op het lustrumterrein.',
    icon: Shell,
    accent: 'from-sky-500/20 via-sky-600/5 to-transparent',
    borderAccent: 'hover:border-sky-400/50'
  },
  {
    id: 'mobiel',
    title: 'Overige mobiele kleine concepten',
    subtitle: 'Compacte Kramen & Mobiele Beleving',
    description: 'Kleine mobiele karren, specialistische hapjes, barista-karren en flexibele concepten op het terrein.',
    icon: Truck,
    accent: 'from-emerald-500/20 via-emerald-600/5 to-transparent',
    borderAccent: 'hover:border-emerald-400/50'
  },
  {
    id: 'latenight',
    title: 'Late night snack',
    subtitle: 'Eetmuren & Nachtelijke Snacks',
    description: 'Automatieken, eetmuren en snelle warme snacks met hoge doorloopsnelheid voor de late uren.',
    icon: Moon,
    accent: 'from-purple-500/20 via-purple-600/5 to-transparent',
    borderAccent: 'hover:border-purple-400/50'
  }
];

const STATUS_OPTIONS = [
  'Benaderd',
  'Kick-off gehad / In gesprek',
  'Wachten op offerte',
  'Offerte binnen'
];

const getStatusBadgeStyle = (status) => {
  switch (status) {
    case 'Benaderd':
      return 'bg-slate-800/90 text-slate-300 border-slate-700';
    case 'Kick-off gehad / In gesprek':
      return 'bg-amber-950/80 text-amber-300 border-amber-700/60';
    case 'Wachten op offerte':
      return 'bg-sky-950/80 text-sky-300 border-sky-700/60';
    case 'Offerte binnen':
      return 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60';
    default:
      return 'bg-slate-800 text-slate-300 border-slate-700';
  }
};

// ==========================================
// STARTBEDRIJVEN (SEED DATA)
// ==========================================
const INITIAL_VENDORS = [
  {
    id: 'silty-pleasure',
    name: 'Silty Pleasure',
    category: 'oesters',
    status: 'Kick-off gehad / In gesprek',
    tagline: 'Gespecialiseerde oesterbar & evenementencatering',
    contactPerson: 'In te vullen vanuit gespreksnotities',
    phone: '',
    email: '',
    website: '',
    lastMeetingDate: 'Recent',
    lastMeetingSummary: 'Eerste meeting / kick-off gesprek gehad. Details staan klaar om via notities of audio toe te voegen.',
    nextMeetingDate: 'Binnenkort inplannen',
    nextMeetingAction: 'Gespreksnotities invoeren en vervolgstap bepalen',
    offering: 'Oesterbar concept voor op het lustrumterrein. Specifieke aantallen, soorten oesters en opstelling worden hier geladen zodra je de informatie uit jullie meeting toevoegt.',
    capacity: 'Nog uit te werken uit gespreksnotities',
    setupSpecs: 'Afmetingen en stroomvoorziening volgen',
    experience: 'Ervaring op eerdere evenementen en festivals staat klaar om ingevuld te worden met jouw informatie uit het gesprek.',
    pastEvents: ['Klaar voor invoer referenties'],
    financialSummary: 'Volgt in een later stadium zodra de offerte wordt opgevraagd.',
    priceIndication: 'Volgt bij offerte',
    feeStructure: 'Nog niet besproken (focus ligt nu op aanbod en ervaring)',
    blindSpots: [
      'Voeg je notities of audiobestand van het eerste gesprek toe om de brochure automatisch te vullen.',
      'Welke vergelijkbare grote studentenevenementen of festivals hebben zij eerder gedraaid?',
      'Hoeveel oesters kunnen zij per uur openen en uitserveren tijdens piekuren?'
    ],
    images: [],
    meetings: [
      {
        id: 'm-init-1',
        date: 'Kick-off gesprek',
        partner: 'Silty Pleasure',
        offeringNotes: 'Eerste kennismaking gehad over deelname aan de oester-gradatie op de food court.',
        experienceNotes: 'Details over eerdere evenementen kunnen direct via de AI-notulenverwerker worden toegevoegd.',
        nextStep: 'Informatie uit het gesprek toevoegen aan deze brochure.'
      }
    ],
    documents: [],
    customAttributes: {},
    updatedAt: new Date().toISOString()
  },
  {
    id: 'de-oesterbazen',
    name: 'De Oesterbazen',
    category: 'oesters',
    status: 'Kick-off gehad / In gesprek',
    tagline: 'Mobiele oesterbarren & ervaren oestermeesters op locatie',
    contactPerson: 'In te vullen vanuit gespreksnotities',
    phone: '',
    email: '',
    website: '',
    lastMeetingDate: 'Recent',
    lastMeetingSummary: 'Eerste meeting / kick-off gesprek gehad. Details staan klaar om via notities of audio toe te voegen.',
    nextMeetingDate: 'Binnenkort inplannen',
    nextMeetingAction: 'Gespreksnotities invoeren en vervolgstap bepalen',
    offering: 'Oesterconcept met oesterbar en/of mobiele oesterlopers. Specifieke invulling en mogelijkheden worden automatisch aangevuld zodra je je gespreksinformatie invoert.',
    capacity: 'Nog uit te werken uit gespreksnotities',
    setupSpecs: 'Mobiel en/of vaste bar opstelling',
    experience: 'Track record, referenties en festivalervaring staan klaar om ingevuld te worden met jouw informatie uit het gesprek.',
    pastEvents: ['Klaar voor invoer referenties'],
    financialSummary: 'Volgt in een later stadium zodra de offerte wordt opgevraagd.',
    priceIndication: 'Volgt bij offerte',
    feeStructure: 'Nog niet besproken (focus ligt nu op aanbod en ervaring)',
    blindSpots: [
      'Voeg je notities of audiobestand van het eerste gesprek toe om de brochure automatisch te vullen.',
      'Werken zij met een vaste oesterbar, rondlopende oestermeesters of een combinatie?',
      'Op welke grote evenementen hebben zij eerder gestaan en met welke aantallen?'
    ],
    images: [],
    meetings: [
      {
        id: 'm-init-2',
        date: 'Kick-off gesprek',
        partner: 'De Oesterbazen',
        offeringNotes: 'Eerste kennismaking gehad over hun oesterconcept voor het lustrumterrein.',
        experienceNotes: 'Details over hun ervaring kunnen direct via de AI-notulenverwerker worden toegevoegd.',
        nextStep: 'Informatie uit het gesprek toevoegen aan deze brochure.'
      }
    ],
    documents: [],
    customAttributes: {},
    updatedAt: new Date().toISOString()
  }
];

// ==========================================
// GEMINI API HELPER MET EXPONENTIAL BACKOFF
// ==========================================
async function callGeminiAPI({ prompt, systemInstruction, responseSchema = null, inlineData = null }) {
  const apiKey = '';
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

  const parts = [{ text: prompt }];
  if (inlineData) {
    parts.push({ inlineData });
  }

  const payload = {
    contents: [{ role: 'user', parts }],
    systemInstruction: {
      parts: [{ text: systemInstruction }]
    }
  };

  if (responseSchema) {
    payload.generationConfig = {
      responseMimeType: 'application/json',
      responseSchema
    };
  }

  const delays = [1000, 2000, 4000];
  let lastError = null;

  for (let attempt = 0; attempt <= delays.length; attempt++) {
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`API status ${response.status}`);
      }

      const result = await response.json();
      const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error('Leeg antwoord van AI model.');
      }

      return responseSchema ? JSON.parse(text) : text;
    } catch (err) {
      lastError = err;
      if (attempt < delays.length) {
        await new Promise((r) => setTimeout(r, delays[attempt]));
      }
    }
  }
  throw lastError;
}

// ==========================================
// HOOFDCOMPONENT: APP
// ==========================================
export default function App() {
  const [user, setUser] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Navigatie in 3 lagen: 'home' | 'category' | 'brochure'
  const [currentView, setCurrentView] = useState('home');
  const [selectedCategoryId, setSelectedCategoryId] = useState('oesters');
  const [selectedVendorId, setSelectedVendorId] = useState(null);

  // Presentatiemodus voor College van Toezicht
  const [presentationMode, setPresentationMode] = useState(false);

  // Modals & Zijpanelen
  const [showTuesdayModal, setShowTuesdayModal] = useState(false);
  const [showNewVendorModal, setShowNewVendorModal] = useState(false);
  const [newVendorCategory, setNewVendorCategory] = useState('oesters');

  // Zoek & Weergave in Laag 2
  const [categoryViewStyle, setCategoryViewStyle] = useState('matrix'); // 'matrix' | 'cards'
  const [searchQuery, setSearchQuery] = useState('');

  // Meldingen (vervangt alert)
  const [notification, setNotification] = useState(null);

  const notify = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  // 1. Firebase Authenticatie
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error('Auth error:', err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  // 2. Firestore Data Synchronisatie
  useEffect(() => {
    if (!user) return;
    const colRef = collection(db, 'artifacts', appId, 'public', 'data', 'lustrum_vendors_v1');

    const unsubscribe = onSnapshot(
      colRef,
      async (snapshot) => {
        if (snapshot.empty) {
          // Vul eenmalig de 2 oesterbarren in als de database nog helemaal leeg is
          try {
            for (const item of INITIAL_VENDORS) {
              await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'lustrum_vendors_v1', item.id), item);
            }
          } catch (e) {
            console.error('Kon startbedrijven niet laden:', e);
          }
          setVendors(INITIAL_VENDORS);
          setLoading(false);
        } else {
          const loaded = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
          loaded.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
          setVendors(loaded);
          setLoading(false);
        }
      },
      (err) => {
        console.error('Firestore fout:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Hulpfuncties voor navigatie
  const openCategory = (catId) => {
    setSelectedCategoryId(catId);
    setCurrentView('category');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openBrochure = (vendorId) => {
    setSelectedVendorId(vendorId);
    setCurrentView('brochure');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goHome = () => {
    setCurrentView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Database operaties
  const saveVendor = async (vendorData) => {
    if (!user) return;
    const id = vendorData.id || `vendor-${Date.now()}`;
    const cleanData = {
      ...vendorData,
      id,
      updatedAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'lustrum_vendors_v1', id), cleanData);
    return id;
  };

  const removeVendor = async (vendorId) => {
    if (!user) return;
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'lustrum_vendors_v1', vendorId));
    notify('Bedrijf is verwijderd uit het overzicht.', 'info');
    if (selectedVendorId === vendorId) {
      setCurrentView('category');
    }
  };

  const activeCategory = CATEGORIES.find((c) => c.id === selectedCategoryId) || CATEGORIES[0];
  const activeVendor = vendors.find((v) => v.id === selectedVendorId) || null;
  const isTuesday = new Date().getDay() === 2;

  return (
    <div className="min-h-screen bg-[#090B10] text-slate-100 font-sans selection:bg-[#C8A96E]/30 selection:text-[#E5C992]">
      {/* Subtiele luxe achtergrond gloed */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/4 w-[550px] h-[550px] bg-[#C8A96E]/5 rounded-full blur-[130px]" />
        <div className="absolute top-1/3 -right-32 w-[450px] h-[450px] bg-sky-900/10 rounded-full blur-[130px]" />
      </div>

      {/* Notificatiebalk */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md animate-fade-in">
          <div
            className={`px-5 py-4 rounded-xl border shadow-2xl backdrop-blur-xl flex items-center gap-3 ${
              notification.type === 'error'
                ? 'bg-red-950/90 border-red-700/60 text-red-100'
                : 'bg-[#141822]/95 border-[#C8A96E]/50 text-slate-100'
            }`}
          >
            <Sparkles className="w-5 h-5 text-[#C8A96E] shrink-0" />
            <span className="text-sm font-medium leading-snug">{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="ml-auto text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* TOP HEADER / NAVIGATIEBALK */}
      <header className="sticky top-0 z-40 bg-[#090B10]/90 backdrop-blur-xl border-b border-[#222836]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Links: Titel & Broodkruimel */}
          <div className="flex items-center gap-4">
            <button
              onClick={goHome}
              className="flex items-center gap-3 text-left group focus:outline-none"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#C8A96E] to-[#8C6D36] p-[1px] shadow-lg shadow-[#C8A96E]/10">
                <div className="w-full h-full bg-[#0F131C] rounded-[11px] flex items-center justify-center group-hover:bg-[#141926] transition">
                  <Award className="w-5 h-5 text-[#E5C992]" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-[0.2em] text-[#C8A96E] font-semibold">
                    Lustrum Food Court
                  </span>
                  {presentationMode && (
                    <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider bg-[#C8A96E]/20 text-[#E5C992] border border-[#C8A96E]/40 rounded-full font-semibold">
                      College van Toezicht
                    </span>
                  )}
                </div>
                <h1 className="text-lg sm:text-xl font-semibold text-white tracking-tight">
                  Regie & Interactieve Brochures
                </h1>
              </div>
            </button>

            {/* Navigatiepad */}
            {currentView !== 'home' && (
              <div className="hidden md:flex items-center gap-2 pl-4 border-l border-[#222836] text-sm">
                <button
                  onClick={goHome}
                  className="text-slate-400 hover:text-[#E5C992] transition"
                >
                  Overzicht
                </button>
                <ChevronRight className="w-4 h-4 text-slate-600" />
                <button
                  onClick={() => openCategory(activeVendor ? activeVendor.category : selectedCategoryId)}
                  className={`${
                    currentView === 'category'
                      ? 'text-[#E5C992] font-medium'
                      : 'text-slate-400 hover:text-[#E5C992]'
                  } transition`}
                >
                  {
                    CATEGORIES.find(
                      (c) => c.id === (activeVendor ? activeVendor.category : selectedCategoryId)
                    )?.title
                  }
                </button>
                {currentView === 'brochure' && activeVendor && (
                  <>
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                    <span className="text-[#E5C992] font-medium truncate max-w-[180px]">
                      {activeVendor.name}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Rechts: Dinsdagochtend Check-in & Presentatiemodus */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {!presentationMode && (
              <button
                onClick={() => setShowTuesdayModal(true)}
                className="relative px-3.5 py-2.5 rounded-xl bg-[#141822] hover:bg-[#1B2130] border border-[#2A3142] hover:border-[#C8A96E]/60 text-xs sm:text-sm font-medium text-slate-200 flex items-center gap-2 transition shadow-sm"
              >
                <Calendar className="w-4 h-4 text-[#C8A96E]" />
                <span className="hidden sm:inline">Dinsdagochtend Check-in</span>
                <span className="sm:hidden">Check-in</span>
                {isTuesday && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                )}
              </button>
            )}

            <button
              onClick={() => {
                setPresentationMode(!presentationMode);
                notify(
                  !presentationMode
                    ? 'Presentatiemodus voor College van Toezicht geactiveerd.'
                    : 'Bewerkmodus weer actief.'
                );
              }}
              className={`px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-medium flex items-center gap-2 transition ${
                presentationMode
                  ? 'bg-gradient-to-r from-[#C8A96E] to-[#A6864C] text-[#090B10] border-[#E5C992] font-semibold shadow-lg shadow-[#C8A96E]/20'
                  : 'bg-[#141822] hover:bg-[#1B2130] text-slate-200 border-[#2A3142]'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">
                {presentationMode ? 'Presentatiemodus Actief' : 'Presentatiemodus'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT CONTAINER */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-4 text-slate-400">
            <RefreshCw className="w-8 h-8 text-[#C8A96E] animate-spin" />
            <p className="text-sm tracking-wide">Food Court Dossiers worden geladen...</p>
          </div>
        ) : (
          <>
            {/* =========================================================
                LAAG 1: HOOFDSCHERM (4 GRADATIES & CONTACTAGENDA)
               ========================================================= */}
            {currentView === 'home' && (
              <div className="space-y-10">
                {/* Intro & Snelle Statistieken */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-[#1E2433]">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[#C8A96E] font-semibold mb-2">
                      Hoofdoverzicht per Segment
                    </p>
                    <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                      De Vier Gradaties van de Food Court
                    </h2>
                    <p className="text-slate-400 text-sm sm:text-base mt-1.5 max-w-2xl">
                      Klik op een van de vier gradaties om het vergelijkingsoverzicht van dat segment te openen, of klik door naar een bedrijf voor de volledige interactieve brochure.
                    </p>
                  </div>

                  {/* Overzichtstellers */}
                  <div className="grid grid-cols-3 gap-3 sm:gap-4 shrink-0">
                    <div className="bg-[#121620] border border-[#222836] rounded-xl px-4 py-3">
                      <span className="text-xs text-slate-400 block">Actieve Partijen</span>
                      <span className="text-xl sm:text-2xl font-semibold text-white mt-0.5 block">
                        {vendors.length}
                      </span>
                    </div>
                    <div className="bg-[#121620] border border-[#222836] rounded-xl px-4 py-3">
                      <span className="text-xs text-slate-400 block">In Gesprek</span>
                      <span className="text-xl sm:text-2xl font-semibold text-[#E5C992] mt-0.5 block">
                        {vendors.filter((v) => v.status === 'Kick-off gehad / In gesprek').length}
                      </span>
                    </div>
                    <div className="bg-[#121620] border border-[#222836] rounded-xl px-4 py-3">
                      <span className="text-xs text-slate-400 block">Offertes Binnen</span>
                      <span className="text-xl sm:text-2xl font-semibold text-emerald-400 mt-0.5 block">
                        {vendors.filter((v) => v.status === 'Offerte binnen').length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* DE 4 GROTE GRADATIE-BLOKKEN */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {CATEGORIES.map((cat) => {
                    const IconComponent = cat.icon;
                    const catVendors = vendors.filter((v) => v.category === cat.id);

                    return (
                      <div
                        key={cat.id}
                        onClick={() => openCategory(cat.id)}
                        className={`group relative rounded-2xl bg-[#11151F] border border-[#232938] ${cat.borderAccent} p-6 sm:p-7 transition-all duration-300 cursor-pointer hover:shadow-2xl hover:shadow-black/60 hover:-translate-y-0.5 flex flex-col justify-between overflow-hidden`}
                      >
                        {/* Subtiele kleur-gradient per gradatie */}
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${cat.accent} opacity-60 pointer-events-none`}
                        />

                        <div className="relative z-10">
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-[#181E2C] border border-[#2B3346] flex items-center justify-center text-[#E5C992] group-hover:scale-105 transition">
                              <IconComponent className="w-6 h-6" />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#181E2C] border border-[#2B3346] text-slate-200">
                                {catVendors.length}{' '}
                                {catVendors.length === 1 ? 'bedrijf' : 'bedrijven'}
                              </span>
                              <div className="w-8 h-8 rounded-full bg-[#181E2C] border border-[#2B3346] flex items-center justify-center text-slate-400 group-hover:text-[#E5C992] group-hover:border-[#C8A96E]/50 transition">
                                <ChevronRight className="w-4 h-4" />
                              </div>
                            </div>
                          </div>

                          <p className="text-xs uppercase tracking-widest text-[#C8A96E] font-medium">
                            {cat.subtitle}
                          </p>
                          <h3 className="text-xl sm:text-2xl font-semibold text-white mt-1 group-hover:text-[#E5C992] transition">
                            {cat.title}
                          </h3>
                          <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                            {cat.description}
                          </p>
                        </div>

                        {/* Preview van bedrijven binnen deze gradatie */}
                        <div className="relative z-10 mt-6 pt-5 border-t border-[#222836]/80">
                          {catVendors.length > 0 ? (
                            <div className="space-y-2.5">
                              <div className="text-xs text-slate-400 uppercase tracking-wider font-medium mb-2">
                                Bedrijven in dit segment:
                              </div>
                              {catVendors.slice(0, 3).map((v) => (
                                <div
                                  key={v.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openBrochure(v.id);
                                  }}
                                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#0C0F17]/80 hover:bg-[#181E2C] border border-[#202635] hover:border-[#C8A96E]/40 transition"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <span className="w-2 h-2 rounded-full bg-[#C8A96E] shrink-0" />
                                    <span className="text-sm font-medium text-white truncate">
                                      {v.name}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <span
                                      className={`text-[11px] px-2.5 py-0.5 rounded-full border ${getStatusBadgeStyle(
                                        v.status
                                      )}`}
                                    >
                                      {v.status}
                                    </span>
                                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                                  </div>
                                </div>
                              ))}
                              {catVendors.length > 3 && (
                                <p className="text-xs text-[#C8A96E] pt-1">
                                  + nog {catVendors.length - 3} andere in dit overzicht
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center justify-between text-xs text-slate-500">
                              <span>Nog geen bedrijven toegevoegd in deze gradatie</span>
                              {!presentationMode && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setNewVendorCategory(cat.id);
                                    setShowNewVendorModal(true);
                                  }}
                                  className="text-[#C8A96E] hover:underline font-medium flex items-center gap-1"
                                >
                                  <Plus className="w-3.5 h-3.5" /> Bedrijf toevoegen
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* CENTRAAL OVERZICHT: LAATSTE MEETINGS & VOLGENDE CONTACTMOMENTEN */}
                <div className="rounded-2xl bg-[#11151F] border border-[#232938] p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <span className="text-xs uppercase tracking-[0.2em] text-[#C8A96E] font-semibold">
                        Chronologisch & Feitelijk
                      </span>
                      <h3 className="text-xl font-semibold text-white mt-1">
                        Waar staan we met welk bedrijf? (Laatste & Volgende Meeting)
                      </h3>
                    </div>
                    {!presentationMode && (
                      <button
                        onClick={() => {
                          setNewVendorCategory('hoofdstands');
                          setShowNewVendorModal(true);
                        }}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C8A96E] to-[#A8894E] text-[#090B10] font-semibold text-xs sm:text-sm flex items-center gap-2 self-start sm:self-auto hover:brightness-110 transition"
                      >
                        <Plus className="w-4 h-4" />
                        Nieuw Bedrijf Toevoegen
                      </button>
                    )}
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[#222836] text-[11px] uppercase tracking-wider text-slate-400">
                          <th className="py-3.5 px-4">Bedrijf & Gradatie</th>
                          <th className="py-3.5 px-4">Status</th>
                          <th className="py-3.5 px-4">Laatste Meeting & Kern</th>
                          <th className="py-3.5 px-4">Volgend Contactmoment</th>
                          <th className="py-3.5 px-4 text-right">Brochure</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1C2230] text-sm">
                        {vendors.map((v) => {
                          const catInfo = CATEGORIES.find((c) => c.id === v.category);
                          return (
                            <tr
                              key={v.id}
                              onClick={() => openBrochure(v.id)}
                              className="hover:bg-[#161B28] transition cursor-pointer group"
                            >
                              <td className="py-4 px-4">
                                <div className="font-semibold text-white group-hover:text-[#E5C992] transition">
                                  {v.name}
                                </div>
                                <div className="text-xs text-slate-400 mt-0.5">
                                  {catInfo?.title || v.category}
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <span
                                  className={`inline-block text-xs px-2.5 py-1 rounded-full border ${getStatusBadgeStyle(
                                    v.status
                                  )}`}
                                >
                                  {v.status}
                                </span>
                              </td>
                              <td className="py-4 px-4 max-w-xs">
                                <div className="text-xs font-medium text-[#E5C992]">
                                  {v.lastMeetingDate || 'Nog geen datum'}
                                </div>
                                <div className="text-xs text-slate-300 line-clamp-2 mt-0.5">
                                  {v.lastMeetingSummary || 'Geen gespreksnotitie ingevoerd'}
                                </div>
                              </td>
                              <td className="py-4 px-4 max-w-xs">
                                <div className="text-xs font-medium text-sky-300 flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5 shrink-0" />
                                  {v.nextMeetingDate || 'Nog in te plannen'}
                                </div>
                                <div className="text-xs text-slate-300 line-clamp-2 mt-0.5">
                                  {v.nextMeetingAction || 'Vervolgstap bepalen'}
                                </div>
                              </td>
                              <td className="py-4 px-4 text-right">
                                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#C8A96E] group-hover:translate-x-0.5 transition">
                                  Open Brochure <ChevronRight className="w-4 h-4" />
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================
                LAAG 2: CATEGORIE & VERGELIJKINGSOVERZICHT
               ========================================================= */}
            {currentView === 'category' && (
              <CategoryComparisonView
                category={activeCategory}
                vendors={vendors.filter((v) => v.category === activeCategory.id)}
                onSelectVendor={openBrochure}
                onBack={goHome}
                onAddVendor={() => {
                  setNewVendorCategory(activeCategory.id);
                  setShowNewVendorModal(true);
                }}
                presentationMode={presentationMode}
                viewStyle={categoryViewStyle}
                setViewStyle={setCategoryViewStyle}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onSaveVendor={saveVendor}
                notify={notify}
              />
            )}

            {/* =========================================================
                LAAG 3: INTERACTIEVE BROCHURE PER BEDRIJF
               ========================================================= */}
            {currentView === 'brochure' && activeVendor && (
              <VendorBrochureView
                vendor={activeVendor}
                category={CATEGORIES.find((c) => c.id === activeVendor.category)}
                onBack={() => openCategory(activeVendor.category)}
                onSave={saveVendor}
                onDelete={removeVendor}
                presentationMode={presentationMode}
                notify={notify}
              />
            )}
          </>
        )}
      </main>

      {/* MODAL: NIEUW BEDRIJF TOEVOEGEN */}
      {showNewVendorModal && (
        <NewVendorModal
          initialCategory={newVendorCategory}
          onClose={() => setShowNewVendorModal(false)}
          onCreate={async (newVendor) => {
            const createdId = await saveVendor(newVendor);
            setShowNewVendorModal(false);
            notify(`${newVendor.name} is toegevoegd aan het overzicht.`);
            if (createdId) {
              openBrochure(createdId);
            }
          }}
        />
      )}

      {/* MODAL: DINSDAGOCHTEND CHECK-IN & AUTOMATISCHE UPDATE VERWERKER */}
      {showTuesdayModal && (
        <TuesdayCheckinModal
          vendors={vendors}
          onClose={() => setShowTuesdayModal(false)}
          onUpdateVendors={async (updatedList) => {
            for (const v of updatedList) {
              await saveVendor(v);
            }
            notify('Alle bedrijven zijn automatisch bijgewerkt vanuit je check-in antwoord!');
          }}
          notify={notify}
        />
      )}
    </div>
  );
}

// ============================================================================
// COMPONENT LAAG 2: CATEGORIE & VERGELIJKINGSOVERZICHT
// ============================================================================
function CategoryComparisonView({
  category,
  vendors,
  onSelectVendor,
  onBack,
  onAddVendor,
  presentationMode,
  viewStyle,
  setViewStyle,
  searchQuery,
  setSearchQuery,
  onSaveVendor,
  notify
}) {
  const [aiRadarLoading, setAiRadarLoading] = useState(false);
  const [aiRadarResult, setAiRadarResult] = useState(null);

  const filteredVendors = vendors.filter((v) => {
    const q = searchQuery.toLowerCase();
    return (
      (v.name || '').toLowerCase().includes(q) ||
      (v.offering || '').toLowerCase().includes(q) ||
      (v.experience || '').toLowerCase().includes(q)
    );
  });

  // Zelflerende Categorie-optimalisatie: Vergelijk bedrijven op blinde vlekken
  const runCategoryOptimizationRadar = async () => {
    if (vendors.length === 0) return;
    setAiRadarLoading(true);
    try {
      const summaryForAi = vendors.map((v) => ({
        naam: v.name,
        status: v.status,
        laatsteMeeting: v.lastMeetingDate,
        volgendContact: v.nextMeetingDate,
        aanbod: v.offering,
        capaciteit: v.capacity,
        ervaring: v.experience,
        prijsIndicatie: v.priceIndication
      }));

      const schema = {
        type: 'OBJECT',
        properties: {
          comparisonSummary: { type: 'STRING' },
          blindSpotsPerVendor: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                vendorName: { type: 'STRING' },
                missingInfo: { type: 'STRING' },
                suggestedQuestion: { type: 'STRING' }
              },
              propertyOrdering: ['vendorName', 'missingInfo', 'suggestedQuestion']
            }
          },
          suggestedNewCriteria: {
            type: 'ARRAY',
            items: { type: 'STRING' }
          }
        },
        propertyOrdering: ['comparisonSummary', 'blindSpotsPerVendor', 'suggestedNewCriteria']
      };

      const res = await callGeminiAPI({
        systemInstruction:
          'Je bent een objectieve data-analist voor de organisatie van een groot Lustrum Food Court. Je maakt GEEN keuzes (geen ja/nee oordeel), maar vergelijkt de feitelijke dossiers in deze categorie om blinde vlekken en ontbrekende vergelijkingsinformatie bloot te leggen.',
        prompt: `Analyseer deze bedrijven binnen de categorie "${category.title}":\n${JSON.stringify(
          summaryForAi,
          null,
          2
        )}\n\nGeef in het Nederlands (zonder gedachtestreepjes):
1. comparisonSummary: Korte feitelijke samenvatting van hoe compleet de dossiers in deze gradatie zijn.
2. blindSpotsPerVendor: Welke cruciale informatie over Ervaring, Capaciteit of Aanbod ontbreekt nog bij welk bedrijf ten opzichte van een volledig dossier?
3. suggestedNewCriteria: 2 of 3 slimme extra vergelijkingspunten die handig zijn voor dit specifieke segment (${category.title}).`,
        responseSchema: schema
      });

      setAiRadarResult(res);
      notify('Vergelijkings- en optimalisatieanalyse voltooid.');
    } catch (e) {
      console.error(e);
      notify('Kon de AI-vergelijking nu niet uitvoeren. Probeer het zo opnieuw.', 'error');
    } finally {
      setAiRadarLoading(false);
    }
  };

  const IconComponent = category.icon;

  return (
    <div className="space-y-8">
      {/* Header van de Gradatie */}
      <div className="rounded-2xl bg-[#11151F] border border-[#232938] p-6 sm:p-8 relative overflow-hidden">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${category.accent} opacity-50 pointer-events-none`}
        />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-slate-400 hover:text-[#E5C992] mb-4 transition"
            >
              <ArrowLeft className="w-4 h-4" /> Terug naar de 4 gradaties
            </button>
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-[#181E2C] border border-[#2B3346] flex items-center justify-center text-[#E5C992]">
                <IconComponent className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-[0.2em] text-[#C8A96E] font-semibold">
                  Segment Vergelijkingsoverzicht
                </span>
                <h2 className="text-2xl sm:text-3xl font-semibold text-white">{category.title}</h2>
              </div>
            </div>
            <p className="text-sm text-slate-300 mt-3 max-w-2xl">{category.description}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Wissel tussen Matrix en Grote Kaarten */}
            <div className="bg-[#0C0F17] p-1 rounded-xl border border-[#232938] flex items-center">
              <button
                onClick={() => setViewStyle('matrix')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  viewStyle === 'matrix'
                    ? 'bg-[#1D2333] text-[#E5C992] border border-[#C8A96E]/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Vergelijkingsmatrix
              </button>
              <button
                onClick={() => setViewStyle('cards')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  viewStyle === 'cards'
                    ? 'bg-[#1D2333] text-[#E5C992] border border-[#C8A96E]/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Brochure Kaarten
              </button>
            </div>

            {!presentationMode && (
              <>
                <button
                  onClick={runCategoryOptimizationRadar}
                  disabled={aiRadarLoading || vendors.length === 0}
                  className="px-4 py-2.5 rounded-xl bg-[#181E2C] hover:bg-[#20283A] border border-[#C8A96E]/40 text-xs sm:text-sm font-medium text-[#E5C992] flex items-center gap-2 transition disabled:opacity-50"
                >
                  {aiRadarLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-[#C8A96E]" />
                  )}
                  <span>Check Blinde Vlekken</span>
                </button>

                <button
                  onClick={onAddVendor}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C8A96E] to-[#A6864C] text-[#090B10] font-semibold text-xs sm:text-sm flex items-center gap-2 hover:brightness-110 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Bedrijf Toevoegen</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ZELFLERENDE OPTIMALISATIE RADAR RESULTAAT */}
      {aiRadarResult && !presentationMode && (
        <div className="rounded-2xl bg-[#131824] border border-[#C8A96E]/50 p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-[#C8A96E]" />
              <h3 className="text-base font-semibold text-white">
                Zelflerende Vergelijkingsradar: Ontbrekende Informatie & Optimalisatie
              </h3>
            </div>
            <button
              onClick={() => setAiRadarResult(null)}
              className="text-slate-400 hover:text-white text-xs"
            >
              Sluiten
            </button>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">{aiRadarResult.comparisonSummary}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {aiRadarResult.blindSpotsPerVendor?.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[#0C0F17] border border-[#232938] space-y-1.5"
              >
                <span className="text-xs font-semibold uppercase tracking-wider text-[#E5C992]">
                  {item.vendorName}
                </span>
                <p className="text-xs text-slate-300">
                  <strong className="text-slate-200">Ontbreekt nog:</strong> {item.missingInfo}
                </p>
                <p className="text-xs text-sky-300">
                  <strong>Vraag voor volgende meeting:</strong> {item.suggestedQuestion}
                </p>
              </div>
            ))}
          </div>

          {aiRadarResult.suggestedNewCriteria?.length > 0 && (
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400">
                Aanbevolen extra aandachtspunten voor {category.title}:
              </span>
              {aiRadarResult.suggestedNewCriteria.map((crit, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2.5 py-1 rounded-full bg-[#1C2232] border border-[#2E374F] text-slate-200"
                >
                  {crit}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Zoekbalk indien meerdere bedrijven */}
      {vendors.length > 1 && (
        <div className="flex items-center gap-3 bg-[#11151F] border border-[#232938] rounded-xl px-4 py-2.5 max-w-md">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Zoek binnen ${category.title} op naam, aanbod of ervaring...`}
            className="bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none w-full"
          />
        </div>
      )}

      {/* GEEN BEDRIJVEN STAAT */}
      {filteredVendors.length === 0 ? (
        <div className="rounded-2xl bg-[#11151F] border border-[#232938] p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#181E2C] border border-[#2B3346] flex items-center justify-center mx-auto text-[#C8A96E]">
            <IconComponent className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-white">
              Nog geen bedrijven in {category.title}
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Voeg het eerste bedrijf toe om hun ervaring, aanbod en gesprekken vast te leggen en te vergelijken.
            </p>
          </div>
          {!presentationMode && (
            <button
              onClick={onAddVendor}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C8A96E] to-[#A6864C] text-[#090B10] font-semibold text-sm inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Eerste bedrijf in {category.title} toevoegen
            </button>
          )}
        </div>
      ) : viewStyle === 'matrix' ? (
        /* WEERGAVE 1: GEDETAILLEERDE VERGELIJKINGSMATRIX NAAST ELKAAR */
        <div className="rounded-2xl bg-[#11151F] border border-[#232938] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b border-[#232938] bg-[#0D1018]">
                  <th className="py-4 px-5 text-xs uppercase tracking-wider text-slate-400 w-48">
                    Kenmerk
                  </th>
                  {filteredVendors.map((v) => (
                    <th key={v.id} className="py-4 px-5 border-l border-[#1E2433] min-w-[280px]">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <button
                            onClick={() => onSelectVendor(v.id)}
                            className="text-lg font-semibold text-white hover:text-[#E5C992] transition text-left"
                          >
                            {v.name}
                          </button>
                          <p className="text-xs text-slate-400 font-normal mt-0.5">
                            {v.tagline || category.title}
                          </p>
                        </div>
                        <button
                          onClick={() => onSelectVendor(v.id)}
                          className="px-2.5 py-1 rounded-lg bg-[#181E2C] hover:bg-[#C8A96E] text-[#E5C992] hover:text-[#090B10] text-xs font-medium transition shrink-0"
                        >
                          Brochure
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2433] text-sm">
                {/* Rij: Status */}
                <tr>
                  <td className="py-4 px-5 font-medium text-slate-300 bg-[#0D1018]/50">
                    Gespreksstatus
                  </td>
                  {filteredVendors.map((v) => (
                    <td key={v.id} className="py-4 px-5 border-l border-[#1E2433]">
                      <span
                        className={`inline-block text-xs px-3 py-1 rounded-full border ${getStatusBadgeStyle(
                          v.status
                        )}`}
                      >
                        {v.status}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Rij: Laatste Meeting */}
                <tr>
                  <td className="py-4 px-5 font-medium text-slate-300 bg-[#0D1018]/50">
                    Laatste Meeting & Onderwerp
                  </td>
                  {filteredVendors.map((v) => (
                    <td key={v.id} className="py-4 px-5 border-l border-[#1E2433] align-top">
                      <div className="text-xs font-semibold text-[#E5C992] mb-1">
                        {v.lastMeetingDate || 'Nog niet ingevuld'}
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {v.lastMeetingSummary || 'Geen samenvatting'}
                      </p>
                    </td>
                  ))}
                </tr>

                {/* Rij: Volgend Contactmoment */}
                <tr>
                  <td className="py-4 px-5 font-medium text-slate-300 bg-[#0D1018]/50">
                    Volgende Meeting / Contact
                  </td>
                  {filteredVendors.map((v) => (
                    <td key={v.id} className="py-4 px-5 border-l border-[#1E2433] align-top">
                      <div className="text-xs font-semibold text-sky-300 mb-1 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {v.nextMeetingDate || 'In te plannen'}
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {v.nextMeetingAction || 'Nog geen vervolgactie genoteerd'}
                      </p>
                    </td>
                  ))}
                </tr>

                {/* Rij: ERVARING (Extra prominent!) */}
                <tr className="bg-[#141927]/60">
                  <td className="py-5 px-5 font-semibold text-[#E5C992] bg-[#141927]">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-[#C8A96E]" />
                      <span>Ervaring & Track Record</span>
                    </div>
                    <span className="text-[11px] font-normal text-slate-400 block mt-0.5">
                      Eerdere evenementen & schaalgrootte
                    </span>
                  </td>
                  {filteredVendors.map((v) => (
                    <td key={v.id} className="py-5 px-5 border-l border-[#1E2433] align-top">
                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                        {v.experience || 'Nog geen ervaring ingevoerd.'}
                      </p>
                      {v.pastEvents?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {v.pastEvents.map((ev, i) => (
                            <span
                              key={i}
                              className="text-[11px] px-2.5 py-0.5 rounded-md bg-[#1F273B] border border-[#C8A96E]/30 text-[#E5C992]"
                            >
                              {ev}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Rij: Aanbod & Mogelijkheden */}
                <tr>
                  <td className="py-5 px-5 font-medium text-slate-300 bg-[#0D1018]/50">
                    Aanbod & Mogelijkheden
                  </td>
                  {filteredVendors.map((v) => (
                    <td key={v.id} className="py-5 px-5 border-l border-[#1E2433] align-top">
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                        {v.offering || 'Nog niet gespecificeerd'}
                      </p>
                      {v.capacity && (
                        <div className="mt-2.5 pt-2.5 border-t border-[#1E2433] text-xs text-slate-400">
                          <strong className="text-slate-200">Capaciteit / Snelheid:</strong>{' '}
                          {v.capacity}
                        </div>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Rij: Financieel & Offerte (Later stadium) */}
                <tr>
                  <td className="py-4 px-5 font-medium text-slate-400 bg-[#0D1018]/50">
                    Offertes & Financieel
                    <span className="block text-[10px] text-slate-500 font-normal">
                      Later stadium
                    </span>
                  </td>
                  {filteredVendors.map((v) => (
                    <td key={v.id} className="py-4 px-5 border-l border-[#1E2433] align-top">
                      <div className="text-xs text-slate-400">
                        {v.financialSummary || 'Volgt zodra offertes worden opgevraagd.'}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Rij: Actieknop naar Interactieve Brochure */}
                <tr>
                  <td className="py-4 px-5 bg-[#0D1018]/50" />
                  {filteredVendors.map((v) => (
                    <td key={v.id} className="py-4 px-5 border-l border-[#1E2433]">
                      <button
                        onClick={() => onSelectVendor(v.id)}
                        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#C8A96E]/20 to-[#C8A96E]/10 hover:from-[#C8A96E] hover:to-[#A8894E] border border-[#C8A96E]/40 text-[#E5C992] hover:text-[#090B10] font-semibold text-xs flex items-center justify-center gap-2 transition"
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>Open Volledige Interactieve Brochure</span>
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* WEERGAVE 2: UITGEBREIDE BROCHURE KAARTEN */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredVendors.map((v) => (
            <div
              key={v.id}
              onClick={() => onSelectVendor(v.id)}
              className="rounded-2xl bg-[#11151F] border border-[#232938] hover:border-[#C8A96E]/60 p-6 sm:p-7 flex flex-col justify-between cursor-pointer transition group"
            >
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span
                      className={`inline-block text-[11px] px-2.5 py-0.5 rounded-full border mb-2 ${getStatusBadgeStyle(
                        v.status
                      )}`}
                    >
                      {v.status}
                    </span>
                    <h3 className="text-2xl font-semibold text-white group-hover:text-[#E5C992] transition">
                      {v.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">{v.tagline}</p>
                  </div>
                  <span className="px-3 py-1.5 rounded-xl bg-[#181E2C] border border-[#2B3346] text-xs font-medium text-[#E5C992] flex items-center gap-1.5 group-hover:bg-[#C8A96E] group-hover:text-[#090B10] transition">
                    Interactieve Brochure <ChevronRight className="w-4 h-4" />
                  </span>
                </div>

                {/* Laatste & Volgende meeting balk */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#0B0E15] border border-[#1E2433]">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 block">
                      Laatste Meeting ({v.lastMeetingDate || '-'})
                    </span>
                    <p className="text-xs text-slate-200 mt-1 line-clamp-2">
                      {v.lastMeetingSummary}
                    </p>
                  </div>
                  <div className="sm:border-l sm:border-[#1E2433] sm:pl-3">
                    <span className="text-[11px] uppercase tracking-wider text-sky-400 block">
                      Volgend Contact ({v.nextMeetingDate || '-'})
                    </span>
                    <p className="text-xs text-slate-200 mt-1 line-clamp-2">
                      {v.nextMeetingAction}
                    </p>
                  </div>
                </div>

                {/* Ervaring blok */}
                <div className="p-4 rounded-xl bg-[#151A28] border border-[#C8A96E]/30">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#E5C992] mb-1.5">
                    <Award className="w-4 h-4 text-[#C8A96E]" />
                    <span>Ervaring & Referenties</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed line-clamp-3">
                    {v.experience}
                  </p>
                </div>

                {/* Aanbod blok */}
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                    Aanbod & Mogelijkheden
                  </span>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-3">
                    {v.offering}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#1E2433] flex items-center justify-between text-xs text-slate-400">
                <span>{v.meetings?.length || 0} gespreksnotulen geregistreerd</span>
                <span className="text-[#E5C992] font-medium">Klik voor volledige brochure</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// COMPONENT LAAG 3: VOLLEDIGE INTERACTIEVE BROCHURE PER BEDRIJF
// ============================================================================
function VendorBrochureView({
  vendor,
  category,
  onBack,
  onSave,
  onDelete,
  presentationMode,
  notify
}) {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(vendor);

  // AI Notulen & Audio/Bestand Verwerker State
  const [rawInputText, setRawInputText] = useState('');
  const [meetingDateInput, setMeetingDateInput] = useState(
    new Date().toLocaleDateString('nl-NL')
  );
  const [uploadedFileInfo, setUploadedFileInfo] = useState(null);
  const [isProcessingAI, setIsProcessingAI] = useState(false);

  // Vraag van College van Toezicht (Interactieve Q&A in de brochure)
  const [boardQuestion, setBoardQuestion] = useState('');
  const [boardAnswer, setBoardAnswer] = useState('');
  const [askingBoardAI, setAskingBoardAI] = useState(false);

  // Afbeelding toevoegen
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageCaption, setNewImageCaption] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setFormData(vendor);
  }, [vendor]);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveManual = async () => {
    await onSave(formData);
    setEditMode(false);
    notify('Brochure wijzigingen zijn opgeslagen.');
  };

  // Bestand uploaden (Audio .mp3/.m4a/.wav, PDF of Tekst) voor AI-analyse
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Controleer grootte voor inline base64 (max ~8MB voor soepele browser verwerking)
    if (file.size > 8 * 1024 * 1024) {
      notify(
        'Dit bestand is groter dan 8MB. Plak de samenvatting of tekst hieronder of gebruik een korter audiobestand.',
        'error'
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result.split(',')[1];
      setUploadedFileInfo({
        name: file.name,
        mimeType: file.type || 'audio/mp3',
        data: base64String,
        sizeKB: Math.round(file.size / 1024)
      });
      notify(`Bestand "${file.name}" klaargezet voor AI-notulenverwerking.`);
    };
    reader.readAsDataURL(file);
  };

  // AI Verwerking van Gesprek / Audio / Offerte -> Vult Brochure & Notulen automatisch!
  const processMeetingWithAI = async () => {
    if (!rawInputText.trim() && !uploadedFileInfo) {
      notify('Typ of plak eerst je gespreksnotities of upload een audiobestand/document.', 'error');
      return;
    }

    setIsProcessingAI(true);
    try {
      const schema = {
        type: 'OBJECT',
        properties: {
          meetingDateAndPartner: { type: 'STRING' },
          meetingOfferingNotes: { type: 'STRING' },
          meetingExperienceNotes: { type: 'STRING' },
          meetingNextStep: { type: 'STRING' },
          updatedStatus: { type: 'STRING' },
          updatedLastMeetingDate: { type: 'STRING' },
          updatedLastMeetingSummary: { type: 'STRING' },
          updatedNextMeetingDate: { type: 'STRING' },
          updatedNextMeetingAction: { type: 'STRING' },
          updatedBrochureOffering: { type: 'STRING' },
          updatedCapacity: { type: 'STRING' },
          updatedSetupSpecs: { type: 'STRING' },
          updatedBrochureExperience: { type: 'STRING' },
          extractedPastEvents: {
            type: 'ARRAY',
            items: { type: 'STRING' }
          },
          updatedFinancialSummary: { type: 'STRING' },
          updatedContactPerson: { type: 'STRING' },
          updatedBlindSpots: {
            type: 'ARRAY',
            items: { type: 'STRING' }
          }
        },
        propertyOrdering: [
          'meetingDateAndPartner',
          'meetingOfferingNotes',
          'meetingExperienceNotes',
          'meetingNextStep',
          'updatedStatus',
          'updatedLastMeetingDate',
          'updatedLastMeetingSummary',
          'updatedNextMeetingDate',
          'updatedNextMeetingAction',
          'updatedBrochureOffering',
          'updatedCapacity',
          'updatedSetupSpecs',
          'updatedBrochureExperience',
          'extractedPastEvents',
          'updatedFinancialSummary',
          'updatedContactPerson',
          'updatedBlindSpots'
        ]
      };

      const prompt = `Je werkt het interactieve brochure-dossier bij van het bedrijf "${vendor.name}" (Gradatie: ${category?.title}).
Huidige brochure-informatie:
- Huidige status: ${vendor.status}
- Huidig aanbod: ${vendor.offering}
- Huidige ervaring: ${vendor.experience}
- Huidige financiële info: ${vendor.financialSummary}

Datum van dit nieuwe contactmoment: ${meetingDateInput}
Nieuwe input van de gebruiker (gespreksnotities, transcript of offerte/audio):
"""
${rawInputText || 'Analyseer het bijgevoegde audio- of documentbestand.'}
"""

Opdracht (in helder Nederlands, gebruik geen gedachtestreepjes):
1. Maak gestructureerde notulen van dit gesprek met focus op: Datum & Gesprekspartner, Aanbod & Mogelijkheden, Ervaring (extra gedetailleerd!), en Vervolgafspraak.
2. Werk direct de hoofdvelden van de Interactieve Brochure bij door de bestaande kennis samen te voegen met deze nieuwe informatie (zodat het profiel steeds completer wordt).
3. Kies bij updatedStatus uitsluitend een van deze 4 feitelijke opties: "Benaderd", "Kick-off gehad / In gesprek", "Wachten op offerte", "Offerte binnen".
4. Formuleer 2 of 3 slimme vervolgvragen (updatedBlindSpots) over punten die nog niet besproken zijn maar wel belangrijk zijn voor het College van Toezicht.`;

      const aiRes = await callGeminiAPI({
        systemInstruction:
          'Je bent de slimme, zelflerende dossier-assistent voor de Lustrum Food Court. Je verwerkt gesprekken en audiobestanden uiterst gedetailleerd en feitelijk, zonder subjectieve ja/nee keuzes te maken.',
        prompt,
        responseSchema: schema,
        inlineData: uploadedFileInfo
          ? { mimeType: uploadedFileInfo.mimeType, data: uploadedFileInfo.data }
          : null
      });

      const newMeetingEntry = {
        id: `meeting-${Date.now()}`,
        date: aiRes.meetingDateAndPartner || meetingDateInput,
        partner: aiRes.updatedContactPerson || vendor.contactPerson || vendor.name,
        offeringNotes: aiRes.meetingOfferingNotes,
        experienceNotes: aiRes.meetingExperienceNotes,
        nextStep: aiRes.meetingNextStep,
        sourceFile: uploadedFileInfo ? uploadedFileInfo.name : null
      };

      const newDocs = [...(vendor.documents || [])];
      if (uploadedFileInfo) {
        newDocs.unshift({
          id: `doc-${Date.now()}`,
          name: uploadedFileInfo.name,
          date: meetingDateInput,
          type: uploadedFileInfo.mimeType,
          summary: aiRes.updatedLastMeetingSummary
        });
      }

      const validStatus = STATUS_OPTIONS.includes(aiRes.updatedStatus)
        ? aiRes.updatedStatus
        : vendor.status;

      const updatedVendor = {
        ...vendor,
        status: validStatus,
        contactPerson: aiRes.updatedContactPerson || vendor.contactPerson,
        lastMeetingDate: aiRes.updatedLastMeetingDate || meetingDateInput,
        lastMeetingSummary: aiRes.updatedLastMeetingSummary || vendor.lastMeetingSummary,
        nextMeetingDate: aiRes.updatedNextMeetingDate || vendor.nextMeetingDate,
        nextMeetingAction: aiRes.updatedNextMeetingAction || vendor.nextMeetingAction,
        offering: aiRes.updatedBrochureOffering || vendor.offering,
        capacity: aiRes.updatedCapacity || vendor.capacity,
        setupSpecs: aiRes.updatedSetupSpecs || vendor.setupSpecs,
        experience: aiRes.updatedBrochureExperience || vendor.experience,
        pastEvents:
          aiRes.extractedPastEvents?.length > 0 ? aiRes.extractedPastEvents : vendor.pastEvents,
        financialSummary: aiRes.updatedFinancialSummary || vendor.financialSummary,
        blindSpots: aiRes.updatedBlindSpots || vendor.blindSpots,
        meetings: [newMeetingEntry, ...(vendor.meetings || [])],
        documents: newDocs
      };

      await onSave(updatedVendor);
      setRawInputText('');
      setUploadedFileInfo(null);
      notify('Notulen gegenereerd en de Interactieve Brochure is automatisch verrijkt!');
    } catch (err) {
      console.error(err);
      notify(
        'Kon het bestand of de tekst niet automatisch verwerken. Probeer kortere tekst of controleer het bestandstype.',
        'error'
      );
    } finally {
      setIsProcessingAI(false);
    }
  };

  // Interactieve Vraag & Antwoord voor tijdens presentatie aan College van Toezicht
  const askBrochureQuestion = async (e) => {
    e.preventDefault();
    if (!boardQuestion.trim()) return;
    setAskingBoardAI(true);
    try {
      const answer = await callGeminiAPI({
        systemInstruction:
          'Je bent de feitelijke dossier-assistent tijdens een presentatie aan het College van Toezicht van het Lustrum. Beantwoord de vraag kort, zakelijk en uitsluitend op basis van het dossier van dit bedrijf. Als iets nog niet in het dossier staat, geef dat eerlijk aan.',
        prompt: `Dossier van ${vendor.name}:
Status: ${vendor.status}
Aanbod: ${vendor.offering}
Capaciteit: ${vendor.capacity}
Ervaring: ${vendor.experience}
Eerdere evenementen: ${(vendor.pastEvents || []).join(', ')}
Laatste meeting: ${vendor.lastMeetingDate} (${vendor.lastMeetingSummary})
Volgende afspraak: ${vendor.nextMeetingDate} (${vendor.nextMeetingAction})
Financieel: ${vendor.financialSummary}
Gespreksgeschiedenis: ${JSON.stringify(vendor.meetings || [])}

Vraag van het College van Toezicht: "${boardQuestion}"`
      });
      setBoardAnswer(answer);
    } catch (err) {
      setBoardAnswer('Kon het antwoord momenteel niet ophalen.');
    } finally {
      setAskingBoardAI(false);
    }
  };

  const addVisualImage = async () => {
    if (!newImageUrl.trim()) return;
    const updatedImages = [
      ...(vendor.images || []),
      {
        id: `img-${Date.now()}`,
        url: newImageUrl.trim(),
        caption: newImageCaption.trim() || `${vendor.name} impressie`
      }
    ];
    await onSave({ ...vendor, images: updatedImages });
    setNewImageUrl('');
    setNewImageCaption('');
    notify('Afbeelding toegevoegd aan de visuele brochure.');
  };

  return (
    <div className="space-y-8">
      {/* Top Actiebalk */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs sm:text-sm text-slate-300 hover:text-[#E5C992] bg-[#121620] border border-[#232938] px-4 py-2.5 rounded-xl transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Terug naar vergelijking ({category?.title})</span>
        </button>

        {!presentationMode && (
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                if (editMode) {
                  handleSaveManual();
                } else {
                  setEditMode(true);
                }
              }}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition ${
                editMode
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-[#141822] hover:bg-[#1C2230] text-[#E5C992] border border-[#C8A96E]/40'
              }`}
            >
              {editMode ? (
                <>
                  <Check className="w-4 h-4" /> Wijzigingen Opslaan
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4" /> Brochure Handmatig Bewerken
                </>
              )}
            </button>

            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="p-2.5 rounded-xl bg-[#141822] hover:bg-red-950/60 border border-[#232938] hover:border-red-700/60 text-slate-400 hover:text-red-300 transition"
                title="Verwijder bedrijf"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-red-950/80 border border-red-700 px-3 py-1.5 rounded-xl">
                <span className="text-xs text-red-200">Zeker weten?</span>
                <button
                  onClick={() => onDelete(vendor.id)}
                  className="text-xs font-bold text-white bg-red-600 px-2 py-1 rounded"
                >
                  Ja, verwijder
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-xs text-slate-300 px-1"
                >
                  Annuleer
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* =================================================================
          LUXE INTERACTIEVE BROCHURE HEADER
         ================================================================= */}
      <div className="rounded-3xl bg-gradient-to-b from-[#151A26] to-[#0F131C] border border-[#283044] p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C8A96E]/10 rounded-full blur-[110px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-start justify-between gap-8">
          <div className="space-y-4 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-xs uppercase tracking-widest font-semibold bg-[#1B2234] text-[#C8A96E] border border-[#C8A96E]/30">
                {category?.title}
              </span>

              {editMode ? (
                <select
                  value={formData.status}
                  onChange={(e) => handleFieldChange('status', e.target.value)}
                  className="bg-[#0B0E15] border border-[#C8A96E] text-xs text-white rounded-full px-3 py-1"
                >
                  {STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              ) : (
                <span
                  className={`text-xs px-3.5 py-1 rounded-full border font-medium ${getStatusBadgeStyle(
                    vendor.status
                  )}`}
                >
                  {vendor.status}
                </span>
              )}
            </div>

            {editMode ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  className="text-3xl font-bold bg-[#0B0E15] border border-[#2E364B] rounded-xl px-4 py-2 text-white w-full"
                />
                <input
                  type="text"
                  value={formData.tagline || ''}
                  onChange={(e) => handleFieldChange('tagline', e.target.value)}
                  placeholder="Korte ondertitel of omschrijving van het bedrijf"
                  className="text-sm bg-[#0B0E15] border border-[#2E364B] rounded-xl px-4 py-2 text-slate-300 w-full"
                />
              </div>
            ) : (
              <div>
                <h1 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">
                  {vendor.name}
                </h1>
                <p className="text-base sm:text-lg text-[#E5C992]/90 mt-1.5">
                  {vendor.tagline || category?.subtitle}
                </p>
              </div>
            )}
          </div>

          {/* Contactkaart in Brochure Header */}
          <div className="bg-[#0B0E15]/90 border border-[#232938] rounded-2xl p-5 min-w-[270px] space-y-2.5 text-xs sm:text-sm">
            <div className="text-[11px] uppercase tracking-widest text-[#C8A96E] font-semibold mb-1">
              Gegevens & Contactpersoon
            </div>
            {editMode ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={formData.contactPerson || ''}
                  onChange={(e) => handleFieldChange('contactPerson', e.target.value)}
                  placeholder="Contactpersoon"
                  className="w-full bg-[#141822] border border-[#2C3448] rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
                <input
                  type="text"
                  value={formData.phone || ''}
                  onChange={(e) => handleFieldChange('phone', e.target.value)}
                  placeholder="Telefoonnummer"
                  className="w-full bg-[#141822] border border-[#2C3448] rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
                <input
                  type="text"
                  value={formData.email || ''}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  placeholder="E-mailadres"
                  className="w-full bg-[#141822] border border-[#2C3448] rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
                <input
                  type="text"
                  value={formData.website || ''}
                  onChange={(e) => handleFieldChange('website', e.target.value)}
                  placeholder="Website"
                  className="w-full bg-[#141822] border border-[#2C3448] rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2.5 text-slate-200">
                  <User className="w-4 h-4 text-[#C8A96E] shrink-0" />
                  <span>{vendor.contactPerson || 'Nog niet ingevuld'}</span>
                </div>
                {vendor.phone && (
                  <div className="flex items-center gap-2.5 text-slate-300">
                    <Phone className="w-4 h-4 text-[#C8A96E] shrink-0" />
                    <span>{vendor.phone}</span>
                  </div>
                )}
                {vendor.email && (
                  <div className="flex items-center gap-2.5 text-slate-300">
                    <Mail className="w-4 h-4 text-[#C8A96E] shrink-0" />
                    <span>{vendor.email}</span>
                  </div>
                )}
                {vendor.website && (
                  <div className="flex items-center gap-2.5 text-slate-300">
                    <Globe className="w-4 h-4 text-[#C8A96E] shrink-0" />
                    <span className="truncate max-w-[200px]">{vendor.website}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* TIJDLIJN BALK: LAATSTE MEETING & VOLGEND CONTACTMOMENT */}
        <div className="relative z-10 mt-8 pt-6 border-t border-[#232A3B] grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-[#0B0E15]/80 border border-[#22293A]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs uppercase tracking-wider text-[#C8A96E] font-semibold">
                Laatste Meeting & Besproken Punten
              </span>
              {editMode ? (
                <input
                  type="text"
                  value={formData.lastMeetingDate || ''}
                  onChange={(e) => handleFieldChange('lastMeetingDate', e.target.value)}
                  placeholder="Datum laatste meeting"
                  className="bg-[#141822] border border-[#2C3448] rounded px-2 py-0.5 text-xs text-white"
                />
              ) : (
                <span className="text-xs font-medium text-[#E5C992]">
                  {vendor.lastMeetingDate || 'Nog geen datum'}
                </span>
              )}
            </div>
            {editMode ? (
              <textarea
                rows={2}
                value={formData.lastMeetingSummary || ''}
                onChange={(e) => handleFieldChange('lastMeetingSummary', e.target.value)}
                className="w-full bg-[#141822] border border-[#2C3448] rounded-lg p-2 text-xs text-white"
              />
            ) : (
              <p className="text-sm text-slate-200 leading-relaxed">{vendor.lastMeetingSummary}</p>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-[#0B0E15]/80 border border-sky-900/50">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs uppercase tracking-wider text-sky-400 font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Volgend Contactmoment & Actie
              </span>
              {editMode ? (
                <input
                  type="text"
                  value={formData.nextMeetingDate || ''}
                  onChange={(e) => handleFieldChange('nextMeetingDate', e.target.value)}
                  placeholder="Datum volgende meeting"
                  className="bg-[#141822] border border-[#2C3448] rounded px-2 py-0.5 text-xs text-white"
                />
              ) : (
                <span className="text-xs font-semibold text-sky-300">
                  {vendor.nextMeetingDate || 'In te plannen'}
                </span>
              )}
            </div>
            {editMode ? (
              <textarea
                rows={2}
                value={formData.nextMeetingAction || ''}
                onChange={(e) => handleFieldChange('nextMeetingAction', e.target.value)}
                className="w-full bg-[#141822] border border-[#2C3448] rounded-lg p-2 text-xs text-white"
              />
            ) : (
              <p className="text-sm text-slate-200 leading-relaxed">{vendor.nextMeetingAction}</p>
            )}
          </div>
        </div>
      </div>

      {/* =================================================================
          INTERACTIEVE VRAAGBAAK VOOR HET COLLEGE VAN TOEZICHT
         ================================================================= */}
      <div className="rounded-2xl bg-[#121722] border border-[#262F45] p-5 sm:p-6">
        <form onSubmit={askBrochureQuestion} className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-[#E5C992] shrink-0">
            <HelpCircle className="w-5 h-5 text-[#C8A96E]" />
            <span>Directe Dossiervraag (College van Toezicht):</span>
          </div>
          <input
            type="text"
            value={boardQuestion}
            onChange={(e) => setBoardQuestion(e.target.value)}
            placeholder={`Stel een specifieke vraag over ${vendor.name} (bijv. "Welke evenementen hebben ze gedaan en wat is hun capaciteit?")`}
            className="flex-1 bg-[#0B0E15] border border-[#232A3B] rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#C8A96E]"
          />
          <button
            type="submit"
            disabled={askingBoardAI}
            className="px-4 py-2 rounded-xl bg-[#1D2436] hover:bg-[#C8A96E] text-[#E5C992] hover:text-[#090B10] text-xs font-semibold transition shrink-0"
          >
            {askingBoardAI ? 'Zoeken in dossier...' : 'Beantwoord Vraag'}
          </button>
        </form>
        {boardAnswer && (
          <div className="mt-4 p-4 rounded-xl bg-[#0B0E15] border border-[#C8A96E]/40 text-sm text-slate-200 flex items-start justify-between gap-4">
            <p className="leading-relaxed">{boardAnswer}</p>
            <button
              onClick={() => setBoardAnswer('')}
              className="text-xs text-slate-400 hover:text-white shrink-0"
            >
              Sluiten
            </button>
          </div>
        )}
      </div>

      {/* =================================================================
          DE 2 KERNPIJLERS VAN DE BROCHURE: ERVARING & AANBOD
         ================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LINKERKOLOM (7/12): ERVARING & TRACK RECORD (EXTRA BELANGRIJK) */}
        <div className="lg:col-span-7 rounded-2xl bg-gradient-to-br from-[#151B2B] to-[#101420] border border-[#C8A96E]/40 p-6 sm:p-8 space-y-5 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C8A96E]/15 border border-[#C8A96E]/40 flex items-center justify-center text-[#E5C992]">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-[0.2em] text-[#C8A96E] font-semibold">
                  Kernpijler 1 • Extra Belangrijk
                </span>
                <h2 className="text-xl font-semibold text-white">
                  Ervaring, Referenties & Track Record
                </h2>
              </div>
            </div>
          </div>

          {editMode ? (
            <div className="space-y-3">
              <label className="text-xs text-slate-400 block">
                Uitgebreide beschrijving van ervaring, festivals en betrouwbaarheid:
              </label>
              <textarea
                rows={6}
                value={formData.experience || ''}
                onChange={(e) => handleFieldChange('experience', e.target.value)}
                className="w-full bg-[#0B0E15] border border-[#2C3448] rounded-xl p-3.5 text-sm text-white leading-relaxed"
              />
              <label className="text-xs text-slate-400 block">
                Eerdere evenementen / festivals (komma-gescheiden):
              </label>
              <input
                type="text"
                value={(formData.pastEvents || []).join(', ')}
                onChange={(e) =>
                  handleFieldChange(
                    'pastEvents',
                    e.target.value
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean)
                  )
                }
                className="w-full bg-[#0B0E15] border border-[#2C3448] rounded-xl px-3.5 py-2 text-sm text-white"
              />
            </div>
          ) : (
            <>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed whitespace-pre-line">
                {vendor.experience}
              </p>

              <div className="pt-4 border-t border-[#252D42]">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-medium block mb-2.5">
                  Genoemde Evenementen, Festivals & Referenties:
                </span>
                <div className="flex flex-wrap gap-2">
                  {(vendor.pastEvents || []).map((ev, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-xl bg-[#0B0E15] border border-[#C8A96E]/40 text-xs font-medium text-[#E5C992]"
                    >
                      {ev}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* RECHTERKOLOM (5/12): AANBOD, CAPACITEIT & OPSTELLING */}
        <div className="lg:col-span-5 rounded-2xl bg-[#11151F] border border-[#232938] p-6 sm:p-8 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#181E2C] border border-[#2B3346] flex items-center justify-center text-[#E5C992]">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-[0.2em] text-slate-400 font-semibold">
                  Kernpijler 2
                </span>
                <h2 className="text-xl font-semibold text-white">Aanbod & Mogelijkheden</h2>
              </div>
            </div>

            {editMode ? (
              <div className="space-y-3">
                <label className="text-xs text-slate-400 block">Wat bieden en verkopen ze precies?</label>
                <textarea
                  rows={4}
                  value={formData.offering || ''}
                  onChange={(e) => handleFieldChange('offering', e.target.value)}
                  className="w-full bg-[#0B0E15] border border-[#2C3448] rounded-xl p-3 text-sm text-white"
                />
                <label className="text-xs text-slate-400 block">Uitserveersnelheid & Capaciteit:</label>
                <input
                  type="text"
                  value={formData.capacity || ''}
                  onChange={(e) => handleFieldChange('capacity', e.target.value)}
                  className="w-full bg-[#0B0E15] border border-[#2C3448] rounded-xl px-3 py-2 text-sm text-white"
                />
                <label className="text-xs text-slate-400 block">Opstelling & Logistiek op het terrein:</label>
                <input
                  type="text"
                  value={formData.setupSpecs || ''}
                  onChange={(e) => handleFieldChange('setupSpecs', e.target.value)}
                  className="w-full bg-[#0B0E15] border border-[#2C3448] rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>
            ) : (
              <>
                <p className="text-sm sm:text-base text-slate-200 leading-relaxed whitespace-pre-line">
                  {vendor.offering}
                </p>

                <div className="space-y-2.5 pt-4 border-t border-[#1E2433] text-xs sm:text-sm">
                  <div className="p-3 rounded-xl bg-[#0B0E15] border border-[#1E2433]">
                    <span className="text-slate-400 block text-xs">Capaciteit & Snelheid:</span>
                    <span className="text-white font-medium">{vendor.capacity || 'Volgt uit gesprek'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0B0E15] border border-[#1E2433]">
                    <span className="text-slate-400 block text-xs">Opstelling op het Lustrumterrein:</span>
                    <span className="text-white font-medium">{vendor.setupSpecs || 'Volgt uit gesprek'}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* =================================================================
          AI AUDIO, NOTULEN & DOCUMENT VERWERKER (VERBORGEN IN PRESENTATIEMODUS)
         ================================================================= */}
      {!presentationMode && (
        <div className="rounded-3xl bg-gradient-to-r from-[#141926] via-[#161C2B] to-[#121622] border border-[#C8A96E]/50 p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#C8A96E]/20 border border-[#C8A96E]/50 flex items-center justify-center text-[#E5C992] shrink-0">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-[0.2em] text-[#C8A96E] font-semibold">
                  Slimme Gespreks- & Audioverwerker
                </span>
                <h3 className="text-xl font-semibold text-white">
                  Voeg Gesprek, Audio-opname of Offerte toe aan {vendor.name}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                  Upload een audiobestand van jullie meeting of plak je ruwe aantekeningen. De AI maakt direct gestructureerde notulen én werkt automatisch het aanbod, de ervaring en de vervolgafspraak in deze brochure bij.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-[#0B0E15] hover:bg-[#1D2436] border border-[#2D364D] text-xs font-medium text-[#E5C992] flex items-center gap-2 transition">
                <Upload className="w-4 h-4 text-[#C8A96E]" />
                <span>Upload Audio / Bestand</span>
                <input
                  type="file"
                  accept="audio/*,.mp3,.m4a,.wav,.pdf,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {uploadedFileInfo && (
            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#0B0E15] border border-emerald-600/50 text-xs text-emerald-300">
              <div className="flex items-center gap-2">
                <FileAudio className="w-4 h-4" />
                <span>
                  Geselecteerd bestand: <strong>{uploadedFileInfo.name}</strong> ({uploadedFileInfo.sizeKB} KB)
                </span>
              </div>
              <button
                onClick={() => setUploadedFileInfo(null)}
                className="text-slate-400 hover:text-white"
              >
                Verwijder
              </button>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="sm:w-64">
                <label className="text-xs text-slate-400 block mb-1">Datum van het gesprek:</label>
                <input
                  type="text"
                  value={meetingDateInput}
                  onChange={(e) => setMeetingDateInput(e.target.value)}
                  placeholder="Bijv. 12 november"
                  className="w-full bg-[#0B0E15] border border-[#2A3246] rounded-xl px-3.5 py-2 text-sm text-white"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-slate-400 block mb-1">
                  Plak hier je gespreksnotities, informatie over {vendor.name} of toelichting bij het audiobestand:
                </label>
                <textarea
                  rows={4}
                  value={rawInputText}
                  onChange={(e) => setRawInputText(e.target.value)}
                  placeholder={`Typ of plak hier alles wat je hebt besproken met ${vendor.name} (bijv. wie je sprak, op welke festivals ze hebben gestaan, hoeveel oesters/porties ze leveren, hoe hun bar eruitziet en wanneer jullie weer contact hebben)...`}
                  className="w-full bg-[#0B0E15] border border-[#2A3246] focus:border-[#C8A96E] rounded-xl p-3.5 text-sm text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={processMeetingWithAI}
                disabled={isProcessingAI}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#C8A96E] to-[#A6864C] text-[#090B10] font-semibold text-sm flex items-center gap-2 hover:brightness-110 transition disabled:opacity-50 shadow-lg shadow-[#C8A96E]/20"
              >
                {isProcessingAI ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Gesprek wordt geanalyseerd & Brochure wordt bijgewerkt...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Maak Notulen & Werk Brochure Automatisch Bij</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Zelflerende Blinde Vlekken voor dit specifieke bedrijf */}
          {vendor.blindSpots?.length > 0 && (
            <div className="pt-4 border-t border-[#252D42]">
              <span className="text-xs uppercase tracking-wider text-[#C8A96E] font-semibold block mb-2">
                Slimme Aandachtspunten voor je volgende gesprek met {vendor.name}:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {vendor.blindSpots.map((spot, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-[#0B0E15]/90 border border-[#232A3B] text-xs text-slate-300 flex items-start gap-2"
                  >
                    <AlertCircle className="w-4 h-4 text-[#C8A96E] shrink-0 mt-0.5" />
                    <span>{spot}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =================================================================
          CHRONOLOGISCHE GESPREKSNOTULEN & OFFERTES (LATER STADIUM)
         ================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Gespreksnotulen Historie (8/12) */}
        <div className="lg:col-span-8 rounded-2xl bg-[#11151F] border border-[#232938] p-6 sm:p-8 space-y-6">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-[#C8A96E] font-semibold">
              Volledig Archief
            </span>
            <h3 className="text-xl font-semibold text-white mt-0.5">
              Geregistreerde Gesprekken & Gestructureerde Notulen
            </h3>
          </div>

          <div className="space-y-4">
            {(vendor.meetings || []).map((m) => (
              <div
                key={m.id}
                className="p-5 rounded-2xl bg-[#0B0E15] border border-[#1E2433] space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#1A202E]">
                  <div className="flex items-center gap-2.5">
                    <span className="px-3 py-1 rounded-lg bg-[#171D2B] text-[#E5C992] text-xs font-semibold">
                      {m.date}
                    </span>
                    <span className="text-sm font-medium text-white">
                      Gesprekspartner: {m.partner}
                    </span>
                  </div>
                  {m.sourceFile && (
                    <span className="text-xs text-emerald-400 flex items-center gap-1">
                      <FileAudio className="w-3.5 h-3.5" /> Bron: {m.sourceFile}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block mb-1">
                      Aanbod & Mogelijkheden:
                    </span>
                    <p className="text-slate-200 leading-relaxed">{m.offeringNotes}</p>
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-wider text-[#C8A96E] font-semibold block mb-1">
                      Ervaring & Referenties:
                    </span>
                    <p className="text-slate-200 leading-relaxed">{m.experienceNotes}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#1A202E] flex items-center gap-2 text-xs text-sky-300">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    <strong>Vervolgafspraak:</strong> {m.nextStep}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rechts (4/12): Offertes & Financieel (Later stadium) + Visuele Impressie */}
        <div className="lg:col-span-4 space-y-6">
          {/* Financieel blok */}
          <div className="rounded-2xl bg-[#11151F] border border-[#232938] p-6 space-y-4">
            <div className="flex items-center gap-2.5">
              <Euro className="w-5 h-5 text-[#C8A96E]" />
              <div>
                <span className="text-[10px] uppercase tracking-widest text-slate-400 block">
                  Later Stadium
                </span>
                <h3 className="text-base font-semibold text-white">
                  Offertes & Financiële Vergelijking
                </h3>
              </div>
            </div>

            {editMode ? (
              <div className="space-y-2.5">
                <textarea
                  rows={3}
                  value={formData.financialSummary || ''}
                  onChange={(e) => handleFieldChange('financialSummary', e.target.value)}
                  placeholder="Samenvatting van offerte, prijzen of afdracht..."
                  className="w-full bg-[#0B0E15] border border-[#2C3448] rounded-xl p-2.5 text-xs text-white"
                />
                <input
                  type="text"
                  value={formData.priceIndication || ''}
                  onChange={(e) => handleFieldChange('priceIndication', e.target.value)}
                  placeholder="Prijsindicatie per portie"
                  className="w-full bg-[#0B0E15] border border-[#2C3448] rounded-xl px-2.5 py-1.5 text-xs text-white"
                />
              </div>
            ) : (
              <div className="space-y-2 text-xs sm:text-sm text-slate-300">
                <p className="leading-relaxed">{vendor.financialSummary}</p>
                <div className="p-3 rounded-xl bg-[#0B0E15] border border-[#1E2433] text-xs">
                  <span className="text-slate-400 block">Prijsindicatie:</span>
                  <span className="text-white font-medium">{vendor.priceIndication || 'Volgt bij offerte'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Visuele Presentatie / Foto's van de Stand */}
          <div className="rounded-2xl bg-[#11151F] border border-[#232938] p-6 space-y-4">
            <div className="flex items-center gap-2.5">
              <ImageIcon className="w-5 h-5 text-[#C8A96E]" />
              <h3 className="text-base font-semibold text-white">
                Visuele Impressie & Beeldmateriaal
              </h3>
            </div>

            {vendor.images?.length > 0 ? (
              <div className="space-y-3">
                {vendor.images.map((img) => (
                  <div
                    key={img.id}
                    className="rounded-xl overflow-hidden border border-[#252D40] bg-[#0B0E15]"
                  >
                    <img
                      src={img.url}
                      alt={img.caption}
                      className="w-full h-40 object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <div className="p-2.5 text-xs text-slate-300">{img.caption}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 leading-relaxed">
                Voeg foto-links van hun foodtruck, oesterbar of menu toe zodat het College van Toezicht direct een visueel beeld heeft.
              </p>
            )}

            {!presentationMode && (
              <div className="space-y-2 pt-2 border-t border-[#1E2433]">
                <input
                  type="text"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="Plak afbeeldings-URL..."
                  className="w-full bg-[#0B0E15] border border-[#232A3B] rounded-lg px-3 py-1.5 text-xs text-white"
                />
                <input
                  type="text"
                  value={newImageCaption}
                  onChange={(e) => setNewImageCaption(e.target.value)}
                  placeholder="Bijschrift (bijv. Mobiele oesterbar)"
                  className="w-full bg-[#0B0E15] border border-[#232A3B] rounded-lg px-3 py-1.5 text-xs text-white"
                />
                <button
                  onClick={addVisualImage}
                  className="w-full py-2 rounded-lg bg-[#1A2130] hover:bg-[#232C40] text-xs font-medium text-[#E5C992] transition"
                >
                  + Beeld Toevoegen aan Brochure
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MODAL: DINSDAGOCHTEND CHECK-IN & 1-KLIK BULK ANTWOORD VERWERKER
// ============================================================================
function TuesdayCheckinModal({ vendors, onClose, onUpdateVendors, notify }) {
  const [emailAddress, setEmailAddress] = useState('');
  const [replyText, setReplyText] = useState('');
  const [processingReply, setProcessingReply] = useState(false);
  const [copied, setCopied] = useState(false);

  // Genereer automatisch de Dinsdagochtend Check-in tekst op basis van de huidige stand
  const generateWeeklyEmailBody = () => {
    const lines = [
      'Goedemorgen! Het is dinsdagochtend: tijd voor de wekelijkse Lustrum Food Court Check-in.',
      '',
      'Hieronder zie je waar we nu met elk bedrijf staan. Beantwoord deze check-in (of plak je antwoord direct in de app) om alle brochures en afspraken in één keer automatisch bij te werken:',
      ''
    ];

    vendors.forEach((v, idx) => {
      const cat = CATEGORIES.find((c) => c.id === v.category)?.title || v.category;
      lines.push(
        `${idx + 1}. ${v.name} (${cat}) - Status: ${v.status}`,
        `   • Laatste meeting: ${v.lastMeetingDate || 'Nog niet ingevuld'}`,
        `   • Geplande vervolgstap: ${v.nextMeetingAction || 'Nog open'}`,
        `   • Vraag voor deze week: Is er nieuw contact geweest, wat is er besproken over hun ervaring/aanbod en wanneer is de volgende meeting?`,
        ''
      );
    });

    lines.push(
      'Ook nieuwe bedrijven gesproken deze week? Noem ze hieronder en de app zet ze in de juiste gradatie.'
    );
    return lines.join('\n');
  };

  const emailSubject = `Dinsdagochtend Check-in: Lustrum Food Court (${new Date().toLocaleDateString(
    'nl-NL'
  )})`;
  const emailBody = generateWeeklyEmailBody();

  const handleOpenMailClient = () => {
    const mailtoUrl = `mailto:${encodeURIComponent(
      emailAddress
    )}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.open(mailtoUrl, '_blank');
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(emailBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    notify('Dinsdagochtend Check-in overzicht gekopieerd.');
  };

  // Verwerk 1 gecombineerd antwoord over meerdere bedrijven tegelijk
  const handleProcessCombinedReply = async () => {
    if (!replyText.trim()) {
      notify('Typ of plak eerst je wekelijkse update in het antwoordveld.', 'error');
      return;
    }

    setProcessingReply(true);
    try {
      const currentSummary = vendors.map((v) => ({
        id: v.id,
        name: v.name,
        category: v.category,
        status: v.status,
        offering: v.offering,
        experience: v.experience
      }));

      const schema = {
        type: 'OBJECT',
        properties: {
          updates: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                vendorId: { type: 'STRING' },
                isNewVendor: { type: 'BOOLEAN' },
                name: { type: 'STRING' },
                category: { type: 'STRING' },
                status: { type: 'STRING' },
                lastMeetingDate: { type: 'STRING' },
                lastMeetingSummary: { type: 'STRING' },
                nextMeetingDate: { type: 'STRING' },
                nextMeetingAction: { type: 'STRING' },
                offeringAddition: { type: 'STRING' },
                experienceAddition: { type: 'STRING' }
              },
              propertyOrdering: [
                'vendorId',
                'isNewVendor',
                'name',
                'category',
                'status',
                'lastMeetingDate',
                'lastMeetingSummary',
                'nextMeetingDate',
                'nextMeetingAction',
                'offeringAddition',
                'experienceAddition'
              ]
            }
          }
        },
        propertyOrdering: ['updates']
      };

      const res = await callGeminiAPI({
        systemInstruction:
          'Je bent de automatische Dinsdagochtend Update-verwerker voor de Lustrum Food Court app. Je splitst een gecombineerd verslag van de gebruiker uit naar updates voor de juiste bedrijven.',
        prompt: `Huidige bedrijven in het systeem:
${JSON.stringify(currentSummary, null, 2)}

Antwoord van de gebruiker tijdens de Dinsdagochtend Check-in:
"""
${replyText}
"""

Koppel elke genoemde update aan het juiste bedrijf (via vendorId). Als de gebruiker een compleet nieuw bedrijf noemt dat nog niet in de lijst staat, zet isNewVendor op true en kies bij category een van: "hoofdstands", "oesters", "mobiel", "latenight".
Kies bij status uitsluitend uit: "Benaderd", "Kick-off gehad / In gesprek", "Wachten op offerte", "Offerte binnen". Gebruik geen gedachtestreepjes.`,
        responseSchema: schema
      });

      const updatedVendorsToSave = [];

      for (const upd of res.updates || []) {
        const existing = vendors.find(
          (v) =>
            v.id === upd.vendorId ||
            v.name.toLowerCase() === (upd.name || '').toLowerCase()
        );

        if (existing) {
          const newMeeting = {
            id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            date: upd.lastMeetingDate || new Date().toLocaleDateString('nl-NL'),
            partner: existing.name,
            offeringNotes: upd.offeringAddition || upd.lastMeetingSummary,
            experienceNotes: upd.experienceAddition || 'Bijgewerkt via dinsdagochtend check-in.',
            nextStep: upd.nextMeetingAction || existing.nextMeetingAction
          };

          updatedVendorsToSave.push({
            ...existing,
            status: STATUS_OPTIONS.includes(upd.status) ? upd.status : existing.status,
            lastMeetingDate: upd.lastMeetingDate || existing.lastMeetingDate,
            lastMeetingSummary: upd.lastMeetingSummary || existing.lastMeetingSummary,
            nextMeetingDate: upd.nextMeetingDate || existing.nextMeetingDate,
            nextMeetingAction: upd.nextMeetingAction || existing.nextMeetingAction,
            offering: upd.offeringAddition
              ? `${existing.offering}\n\nUpdate: ${upd.offeringAddition}`
              : existing.offering,
            experience: upd.experienceAddition
              ? `${existing.experience}\n\nUpdate: ${upd.experienceAddition}`
              : existing.experience,
            meetings: [newMeeting, ...(existing.meetings || [])]
          });
        } else if (upd.isNewVendor && upd.name) {
          const validCat = ['hoofdstands', 'oesters', 'mobiel', 'latenight'].includes(upd.category)
            ? upd.category
            : 'hoofdstands';

          updatedVendorsToSave.push({
            id: `vendor-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            name: upd.name,
            category: validCat,
            status: STATUS_OPTIONS.includes(upd.status)
              ? upd.status
              : 'Kick-off gehad / In gesprek',
            tagline: 'Toegevoegd via Dinsdagochtend Check-in',
            lastMeetingDate: upd.lastMeetingDate || 'Recent',
            lastMeetingSummary: upd.lastMeetingSummary || 'Eerste update verwerkt',
            nextMeetingDate: upd.nextMeetingDate || 'In te plannen',
            nextMeetingAction: upd.nextMeetingAction || 'Vervolggesprek plannen',
            offering: upd.offeringAddition || 'Aanbod verder uit te werken',
            experience: upd.experienceAddition || 'Ervaring verder uit te werken',
            pastEvents: [],
            financialSummary: 'Volgt in offertestadium',
            meetings: [
              {
                id: `m-init-${Date.now()}`,
                date: upd.lastMeetingDate || 'Check-in update',
                partner: upd.name,
                offeringNotes: upd.offeringAddition || upd.lastMeetingSummary,
                experienceNotes: upd.experienceAddition || 'Eerste registratie',
                nextStep: upd.nextMeetingAction || ''
              }
            ]
          });
        }
      }

      if (updatedVendorsToSave.length > 0) {
        await onUpdateVendors(updatedVendorsToSave);
        setReplyText('');
        onClose();
      } else {
        notify('Geen specifieke bedrijfsnamen herkend in je tekst. Noem de naam van het bedrijf.', 'error');
      }
    } catch (e) {
      console.error(e);
      notify('Er trad een fout op bij het verwerken van je update.', 'error');
    } finally {
      setProcessingReply(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#11151F] border border-[#2B3346] rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4 border-b border-[#222836] pb-4">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-[#C8A96E] font-semibold">
              Wekelijkse Automatisering
            </span>
            <h2 className="text-2xl font-semibold text-white mt-0.5">
              Dinsdagochtend Check-in & Automatische Antwoordverwerker
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#181E2C] text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* STAP 1: JE DINSDAGOCHTEND MAIL GENEREREN */}
          <div className="p-5 rounded-2xl bg-[#0B0E15] border border-[#222836] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-[#E5C992] font-semibold">
                1. Jouw Dinsdagochtend Vragenlijst / Mail
              </span>
              <button
                onClick={handleCopyEmail}
                className="text-xs text-[#C8A96E] hover:underline flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Gekopieerd!' : 'Kopieer tekst'}
              </button>
            </div>

            <pre className="text-xs text-slate-300 whitespace-pre-wrap font-sans bg-[#11151F] border border-[#1E2433] rounded-xl p-3.5 max-h-60 overflow-y-auto leading-relaxed">
              {emailBody}
            </pre>

            <div className="space-y-2 pt-1">
              <label className="text-xs text-slate-400 block">
                Jouw e-mailadres (om de check-in mail met 1 klik in je mailprogramma te openen):
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  placeholder="jouwnaam@lustrum.nl"
                  className="flex-1 bg-[#141822] border border-[#2A3246] rounded-xl px-3 py-2 text-xs text-white"
                />
                <button
                  onClick={handleOpenMailClient}
                  className="px-4 py-2 rounded-xl bg-[#1C2333] hover:bg-[#252E42] border border-[#C8A96E]/40 text-xs font-medium text-[#E5C992] flex items-center gap-1.5 shrink-0"
                >
                  <Mail className="w-3.5 h-3.5" /> Open als Mail
                </button>
              </div>
            </div>
          </div>

          {/* STAP 2: ANTWOORD PLAKKEN OF TYPEN -> ALLES AUTOMATISCH BIJWERKEN */}
          <div className="p-5 rounded-2xl bg-[#0B0E15] border border-[#C8A96E]/40 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-wider text-[#C8A96E] font-semibold block">
                2. Plak of typ je antwoord (werkt alle bedrijven in één keer bij)
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Typ of plak hier je antwoord op de check-in mail. Je kunt alle bedrijven die je hebt gesproken in één bericht noemen; de AI splitst alles automatisch uit naar het juiste bedrijf en werkt hun brochure en vervolgdatum bij.
              </p>
              <textarea
                rows={8}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder='Voorbeeld: "Met Silty Pleasure gesproken, ze hebben veel ervaring op grote festivals en kunnen 800 oesters per uur openen. Volgende week donderdag bellen we weer. Met De Oesterbazen hebben we maandag een vervolgmeeting gepland..."'
                className="w-full bg-[#11151F] border border-[#2A3246] focus:border-[#C8A96E] rounded-xl p-3.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none leading-relaxed"
              />
            </div>

            <button
              onClick={handleProcessCombinedReply}
              disabled={processingReply}
              className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-[#C8A96E] to-[#A6864C] text-[#090B10] font-semibold text-sm flex items-center justify-center gap-2 hover:brightness-110 transition disabled:opacity-50"
            >
              {processingReply ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Antwoord wordt automatisch over de bedrijven verdeeld...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Verwerk Antwoord Automatisch in Alle Brochures</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MODAL: NIEUW BEDRIJF TOEVOEGEN
// ============================================================================
function NewVendorModal({ initialCategory, onClose, onCreate }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(initialCategory || 'hoofdstands');
  const [status, setStatus] = useState('Kick-off gehad / In gesprek');
  const [tagline, setTagline] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [lastMeetingDate, setLastMeetingDate] = useState('');
  const [lastMeetingSummary, setLastMeetingSummary] = useState('');
  const [nextMeetingDate, setNextMeetingDate] = useState('');
  const [nextMeetingAction, setNextMeetingAction] = useState('');
  const [offering, setOffering] = useState('');
  const [experience, setExperience] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreate({
      name: name.trim(),
      category,
      status,
      tagline: tagline.trim() || 'Food Court Partner',
      contactPerson: contactPerson.trim(),
      lastMeetingDate: lastMeetingDate.trim() || 'Nog te plannen',
      lastMeetingSummary:
        lastMeetingSummary.trim() || 'Dossier aangemaakt, klaar voor gespreksnotities.',
      nextMeetingDate: nextMeetingDate.trim() || 'In te plannen',
      nextMeetingAction: nextMeetingAction.trim() || 'Kick-off of vervolggesprek voeren',
      offering:
        offering.trim() ||
        'Specifiek aanbod en mogelijkheden kunnen direct of via de AI-notulenverwerker worden aangevuld.',
      experience:
        experience.trim() ||
        'Ervaring en eerdere evenementen kunnen direct of via de AI-notulenverwerker worden aangevuld.',
      pastEvents: [],
      financialSummary: 'Volgt in een later stadium zodra offertes worden opgevraagd.',
      meetings: []
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <form
        onSubmit={handleSubmit}
        className="bg-[#11151F] border border-[#2B3346] rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl my-8"
      >
        <div className="flex items-center justify-between border-b border-[#222836] pb-4">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-[#C8A96E] font-semibold">
              Nieuw Dossier & Brochure
            </span>
            <h2 className="text-xl font-semibold text-white mt-0.5">
              Nieuw Bedrijf Toevoegen aan de Food Court
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-[#181E2C] text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-300 block mb-1">Bedrijfsnaam *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Bijv. De Oesterbazen"
              className="w-full bg-[#0B0E15] border border-[#2A3246] rounded-xl px-3.5 py-2.5 text-sm text-white"
            />
          </div>

          <div>
            <label className="text-xs text-slate-300 block mb-1">Gradatie / Segment *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#0B0E15] border border-[#2A3246] rounded-xl px-3.5 py-2.5 text-sm text-white"
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-300 block mb-1">Huidige Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-[#0B0E15] border border-[#2A3246] rounded-xl px-3.5 py-2.5 text-sm text-white"
            >
              {STATUS_OPTIONS.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-300 block mb-1">Contactpersoon</label>
            <input
              type="text"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              placeholder="Naam contactpersoon"
              className="w-full bg-[#0B0E15] border border-[#2A3246] rounded-xl px-3.5 py-2.5 text-sm text-white"
            />
          </div>

          <div>
            <label className="text-xs text-slate-300 block mb-1">Datum Laatste Meeting</label>
            <input
              type="text"
              value={lastMeetingDate}
              onChange={(e) => setLastMeetingDate(e.target.value)}
              placeholder="Bijv. Afgelopen donderdag"
              className="w-full bg-[#0B0E15] border border-[#2A3246] rounded-xl px-3.5 py-2 text-sm text-white"
            />
          </div>

          <div>
            <label className="text-xs text-slate-300 block mb-1">Datum Volgende Meeting</label>
            <input
              type="text"
              value={nextMeetingDate}
              onChange={(e) => setNextMeetingDate(e.target.value)}
              placeholder="Bijv. Volgende week dinsdag"
              className="w-full bg-[#0B0E15] border border-[#2A3246] rounded-xl px-3.5 py-2 text-sm text-white"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-300 block mb-1">
            Korte omschrijving Aanbod & Mogelijkheden (je kunt later ook direct audio/notities uploaden)
          </label>
          <textarea
            rows={2}
            value={offering}
            onChange={(e) => setOffering(e.target.value)}
            placeholder="Wat verkopen ze en wat zijn de mogelijkheden?"
            className="w-full bg-[#0B0E15] border border-[#2A3246] rounded-xl p-3 text-sm text-white"
          />
        </div>

        <div>
          <label className="text-xs text-[#E5C992] block mb-1">
            Ervaring & Eerdere Evenementen
          </label>
          <textarea
            rows={2}
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            placeholder="Op welke evenementen of festivals hebben ze al gestaan?"
            className="w-full bg-[#0B0E15] border border-[#2A3246] rounded-xl p-3 text-sm text-white"
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-[#222836]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-[#181E2C] text-xs font-medium text-slate-300"
          >
            Annuleren
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C8A96E] to-[#A6864C] text-[#090B10] font-semibold text-xs sm:text-sm"
          >
            Bedrijf & Brochure Aanmaken
          </button>
        </div>
      </form>
    </div>
  );
}