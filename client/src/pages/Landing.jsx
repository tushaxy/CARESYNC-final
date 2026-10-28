import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  Users,
  Lock,
  ArrowRight,
  Send,
  Video,
  FileText,
  Pill,
  Clock,
  CheckCircle2,
  AlertCircle,
  Activity,
  HeartHandshake,
  Star,
  Mic,
  Camera,
} from 'lucide-react';
import api from '../lib/api';
import DoctorCard from '../components/DoctorCard';
import ProductCard from '../components/ProductCard';
import StepCard from '../components/StepCard';
import RatingStars from '../components/RatingStars';
import AvailabilityChip from '../components/AvailabilityChip';
import { formatRupee } from '../lib/format';

export const Landing = () => {
  const navigate = useNavigate();
  const [featuredDoctors, setFeaturedDoctors] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch doctors and medicines
    Promise.all([
      api.get('/doctors?sort=rating').catch(() => ({ data: { doctors: [] } })),
      api.get('/medicines').catch(() => ({ data: { medicines: [] } })),
    ])
      .then(([docRes, medRes]) => {
        setFeaturedDoctors(docRes.data?.doctors?.slice(0, 6) || []);
        setFeaturedProducts(medRes.data?.medicines?.slice(0, 4) || []);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      {/* ===================== HERO SECTION ===================== */}
      <section className="relative overflow-hidden pt-8 pb-16 sm:pb-24 bg-gradient-to-b from-mint/60 via-mint/20 to-mist">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Copy */}
            <div className="lg:col-span-7 space-y-6">
              {/* Overline badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-paper shadow-sm border border-mint">
                <span className="w-2 h-2 rounded-full bg-leaf animate-pulse"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-forest">
                  Trusted Telemedicine for India
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-ink leading-[1.1] tracking-tight">
                Healthcare that{' '}
                <span className="relative inline-block text-forest">
                  understands
                  <span className="absolute bottom-1.5 left-0 right-0 h-3 bg-limeChip -z-10 rounded-sm"></span>
                </span>{' '}
                you.
              </h1>

              <p className="text-base sm:text-lg text-sage max-w-xl leading-relaxed">
                Describe your symptoms in natural words, get instant AI guidance, consult Bengaluru's top verified specialists via encrypted video, and order medicines directly to your door.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/doctors"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-bold text-white bg-forest hover:bg-evergreen active:scale-95 shadow-neumorph transition"
                >
                  <span>Find My Doctor</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/pharmacy"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-bold text-forest bg-paper border border-mint hover:bg-mint/60 active:scale-95 shadow-sm transition"
                >
                  Explore Pharmacy
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-4 flex flex-wrap items-center gap-4 text-xs font-semibold text-ink/80">
                <div className="flex items-center gap-2 bg-paper/80 px-3 py-1.5 rounded-full border border-mint/60">
                  <Sparkles className="w-4 h-4 text-forest" />
                  <span>AI-Assisted Triage</span>
                </div>
                <div className="flex items-center gap-2 bg-paper/80 px-3 py-1.5 rounded-full border border-mint/60">
                  <Users className="w-4 h-4 text-forest" />
                  <span>15,000+ Consultations</span>
                </div>
                <div className="flex items-center gap-2 bg-paper/80 px-3 py-1.5 rounded-full border border-mint/60">
                  <Lock className="w-4 h-4 text-forest" />
                  <span>Encrypted & ABHA-Ready</span>
                </div>
              </div>
            </div>

            {/* Right Hero: Floating Scripted AI Demo Card (Matches approved mockup) */}
            <div className="lg:col-span-5">
              <div className="bg-paper rounded-clinic-lg p-6 shadow-neumorph-lg border border-mint/60 relative">
                {/* Demo Card Header */}
                <div className="flex items-center justify-between border-b border-mint/60 pb-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-forest flex items-center justify-center text-white">
                      <Sparkles className="w-4 h-4 text-limeChip" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-ink">CareSync AI</h3>
                      <p className="text-[10px] text-sage">Live Symptom Intake Demo</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-aiGlow text-white text-[10px] font-extrabold uppercase tracking-wider">
                    DEMO
                  </span>
                </div>

                {/* Scripted Chat Transcript */}
                <div className="space-y-3 text-xs">
                  {/* User message */}
                  <div className="flex justify-end">
                    <div className="bg-forest text-white p-3 rounded-2xl rounded-br-none max-w-[85%] leading-relaxed shadow-xs">
                      <p>I have this itchy rash on my arm since morning, attaching a photo.</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded bg-white/20 text-[10px] font-mono">
                        📎 arm_rash.jpg attached
                      </span>
                    </div>
                  </div>

                  {/* AI response */}
                  <div className="flex justify-start">
                    <div className="bg-mist border border-mint p-3 rounded-2xl rounded-bl-none max-w-[90%] leading-relaxed shadow-xs">
                      <div className="flex items-center gap-1.5 text-leaf font-bold mb-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>No emergency signs detected.</span>
                      </div>
                      <p className="text-ink">
                        Analyzing your symptoms and skin presentation: likely localized contact irritation or mild allergic dermatitis.
                      </p>

                      {/* Doctor Recommendation Tile */}
                      <div className="mt-3 p-3 bg-paper rounded-xl border border-mint shadow-xs flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs text-ink truncate">Dr. Priya Sharma</h4>
                          <p className="text-[10px] text-sage">Dermatologist • 9 yrs exp</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] font-bold text-forest">₹350</span>
                            <span className="text-[10px] text-leaf font-semibold">Today 6:00 PM</span>
                          </div>
                        </div>
                        <Link
                          to="/doctors/doc-003"
                          className="px-3 py-1.5 rounded-full bg-forest text-white text-[11px] font-bold hover:bg-evergreen transition whitespace-nowrap shadow-xs"
                        >
                          Book Now
                        </Link>
                      </div>

                      {/* Triage chips */}
                      <div className="mt-2.5 flex flex-wrap gap-1">
                        <span className="px-2 py-0.5 bg-mint text-forest text-[10px] font-semibold rounded-md">
                          Prescription needed
                        </span>
                        <span className="px-2 py-0.5 bg-mint text-forest text-[10px] font-semibold rounded-md">
                          Post-visit opinion
                        </span>
                        <span className="px-2 py-0.5 bg-mint text-forest text-[10px] font-semibold rounded-md">
                          Second opinion
                        </span>
                      </div>

                      <span className="block mt-2 text-[10px] text-sage italic">
                        AI guidance, not a medical diagnosis
                      </span>
                    </div>
                  </div>
                </div>

                {/* Input prompt mockup */}
                <div className="mt-4 pt-3 border-t border-mint flex items-center gap-2">
                  <div className="flex-1 px-3 py-2 rounded-full bg-mist clinic-inset text-xs text-sage truncate">
                    Describe your symptoms e.g. fever since morning...
                  </div>
                  <div className="w-8 h-8 rounded-full bg-forest text-white flex items-center justify-center">
                    <Send className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== STATS BAND ===================== */}
      <section className="bg-paper py-8 border-y border-mint/60 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center divide-y sm:divide-y-0 sm:divide-x divide-mint">
            <div className="py-2">
              <span className="block text-3xl sm:text-4xl font-extrabold text-forest tabular-nums">
                15,000+
              </span>
              <span className="text-xs sm:text-sm font-semibold text-sage mt-1 block">
                Completed Teleconsultations
              </span>
            </div>
            <div className="py-2">
              <span className="block text-3xl sm:text-4xl font-extrabold text-forest tabular-nums">
                25+
              </span>
              <span className="text-xs sm:text-sm font-semibold text-sage mt-1 block">
                Medical Specialties Covered
              </span>
            </div>
            <div className="py-2">
              <span className="block text-3xl sm:text-4xl font-extrabold text-forest tabular-nums">
                4.9 / 5
              </span>
              <span className="text-xs sm:text-sm font-semibold text-sage mt-1 block">
                Patient Satisfaction Score
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== FOUR SERVICE CARDS ===================== */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-paper rounded-clinic p-6 shadow-neumorph hover:shadow-neumorph-lg transition border border-mint/40">
            <div className="w-12 h-12 rounded-2xl bg-mint flex items-center justify-center text-forest mb-4">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-ink mb-1">Qualified Doctors</h3>
            <p className="text-xs sm:text-sm text-sage leading-relaxed">
              Curated board-certified MDs and surgeons across Bengaluru with verified credentials.
            </p>
          </div>

          <div className="bg-paper rounded-clinic p-6 shadow-neumorph hover:shadow-neumorph-lg transition border border-mint/40">
            <div className="w-12 h-12 rounded-2xl bg-mint flex items-center justify-center text-forest mb-4">
              <Video className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-ink mb-1">Seamless Telemedicine</h3>
            <p className="text-xs sm:text-sm text-sage leading-relaxed">
              Crystal-clear WebRTC video consultations with zero waiting lines and private invite links.
            </p>
          </div>

          <div className="bg-paper rounded-clinic p-6 shadow-neumorph hover:shadow-neumorph-lg transition border border-mint/40">
            <div className="w-12 h-12 rounded-2xl bg-mint flex items-center justify-center text-forest mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-ink mb-1">Encrypted Records</h3>
            <p className="text-xs sm:text-sm text-sage leading-relaxed">
              Digital e-prescriptions and clinical session notes preserved securely in your personal vault.
            </p>
          </div>

          <div className="bg-paper rounded-clinic p-6 shadow-neumorph hover:shadow-neumorph-lg transition border border-mint/40">
            <div className="w-12 h-12 rounded-2xl bg-mint flex items-center justify-center text-forest mb-4">
              <Pill className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-ink mb-1">Express Pharmacy</h3>
            <p className="text-xs sm:text-sm text-sage leading-relaxed">
              One-click fulfillment of prescribed medications & OTC essentials right to your doorstep.
            </p>
          </div>
        </div>
      </section>

      {/* ===================== DIRECTORY PREVIEW ===================== */}
      <section className="py-12 bg-mist/50 border-t border-mint/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-leaf block mb-2">
                VERIFIED SPECIALISTS
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-ink">
                Meet your healthcare team.
              </h2>
              <p className="text-sm text-sage mt-2">
                Explore specializations and find the right medical expert for your symptoms.
              </p>
            </div>
            <Link
              to="/doctors"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-forest hover:text-leaf transition group"
            >
              <span>View All 25 Doctors</span>
              <ArrowRight className="w-4 h-4 transition group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredDoctors.map((doc) => (
              <DoctorCard key={doc.docId} doctor={doc} />
            ))}
          </div>
        </div>
      </section>

      {/* ===================== HOW CARESYNC WORKS (01 - 04) ===================== */}
      <section id="how-it-works" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-extrabold uppercase tracking-widest text-leaf block mb-2">
            PATIENT JOURNEY
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-ink">
            How CareSync Works
          </h2>
          <p className="text-sm sm:text-base text-sage mt-2">
            Four simple steps from first symptom inquiry to verified treatment.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StepCard
            numeral="01"
            icon={Sparkles}
            title="Tell Us What Is Wrong"
            description="Type your symptoms or upload a symptom photo into CareSync AI for instant clinical triage guidance."
          />
          <StepCard
            numeral="02"
            icon={Users}
            title="Discover the Right Doctor"
            description="Review matching verified specialists sorted by rating, proximity in Bengaluru, and real-time open slots."
          />
          <StepCard
            numeral="03"
            icon={Video}
            title="Book Your Consultation"
            description="Choose a slot, pay the doctor fee securely via Razorpay in test mode, and receive an instant video room link."
          />
          <StepCard
            numeral="04"
            icon={Pill}
            title="Get Professional Guidance"
            description="Join your private WebRTC consult, receive your digital prescription, and order medicines in one click."
          />
        </div>
      </section>

      {/* ===================== CLINICAL INTELLIGENCE BAND (Dark Evergreen Mockup Match) ===================== */}
      <section className="py-20 bg-evergreen text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest text-limeChip text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>CLINICAL INTELLIGENCE OUTPUT</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">
                Less searching.{' '}
                <span className="text-limeChip">More clarity.</span>
              </h2>

              <p className="text-sm sm:text-base text-mint/80 leading-relaxed">
                CareSync transforms fragmented medical inquiries into structured diagnostic summaries before the video call begins, saving vital clinical minutes.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-forest text-limeChip flex-shrink-0">
                    <Mic className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Multimodal Voice Triage</h4>
                    <p className="text-xs text-mint/70">
                      Understand symptom narratives across English, Hindi, and regional dialects.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-forest text-limeChip flex-shrink-0">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Prescription OCR Recognition</h4>
                    <p className="text-xs text-mint/70">
                      Instantly parses past medical records, lab reports, and doctor slips.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-forest text-limeChip flex-shrink-0">
                    <AlertCircle className="w-4 h-4 text-aiGlow" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Urgent Care Red-Flag Alerts</h4>
                    <p className="text-xs text-mint/70">
                      Automated screening for severe distress immediately reroutes to 112/108 ambulance protocols.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card: Triage Synthesis Demo Card (Matches Section 11) */}
            <div className="lg:col-span-6">
              <div className="bg-forest/80 backdrop-blur-md rounded-clinic p-6 border border-leaf/30 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-leaf/20 pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-limeChip">
                    Triage Synthesis Demo
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-aiGlow text-white text-[10px] font-extrabold uppercase">
                    AI Active
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-evergreen/70 border border-leaf/20 text-xs">
                    <span className="text-sage text-[10px] uppercase font-bold block">
                      DEMO CASE:
                    </span>
                    <p className="text-white font-bold text-sm mt-0.5">
                      Acute Contact Dermatitis (Probable)
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-forest text-limeChip">
                        Confidence: 96.4%
                      </span>
                      <span className="px-2 py-0.5 rounded bg-forest text-limeChip">
                        Specialty: Dermatology
                      </span>
                      <span className="px-2 py-0.5 rounded bg-forest text-mint">
                        Token: ICD-10 L23.9
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-evergreen/50 border border-leaf/20 flex items-center justify-between text-xs text-mint">
                    <span>Attached file: derm_case_004.jpg</span>
                    <span className="text-limeChip font-mono text-[10px]">Verified OCR</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== PHARMACY PREVIEW ===================== */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-leaf block mb-2">
              CARE STORE
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-ink">
              Your everyday healthcare essentials
            </h2>
            <p className="text-sm text-sage mt-2">
              Order doctor-prescribed medications and genuine health monitors with rapid dispatch.
            </p>
          </div>
          <Link
            to="/pharmacy"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-forest hover:text-leaf transition group"
          >
            <span>Explore Pharmacy Catalog</span>
            <ArrowRight className="w-4 h-4 transition group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((prod) => (
            <ProductCard key={prod.sku} product={prod} />
          ))}
        </div>
      </section>

      {/* ===================== TESTIMONIALS (CARED ACROSS INDIA) ===================== */}
      <section className="py-16 bg-mint/40 border-t border-mint/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-extrabold uppercase tracking-widest text-leaf block mb-2">
              PATIENT REVIEWS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-ink">
              Cared for across India
            </h2>
            <p className="text-sm text-sage mt-2">
              Real stories from patients receiving prompt telecare when they needed it most.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-paper rounded-clinic p-6 shadow-neumorph border border-mint/40 flex flex-col justify-between">
              <div>
                <div className="flex gap-1 text-gold mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-ink leading-relaxed">
                  "I had a sudden allergic reaction while traveling. The AI assistant immediately routed me to Dr. Priya Sharma. Got an online consult within 20 minutes and my prescription was delivered to my hotel!"
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-mint/60 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-forest text-white text-xs font-bold flex items-center justify-center">
                  RS
                </div>
                <div>
                  <h4 className="text-xs font-bold text-ink">Rohan Sen</h4>
                  <p className="text-[10px] text-sage">Bengaluru • Verified Patient</p>
                </div>
              </div>
            </div>

            <div className="bg-paper rounded-clinic p-6 shadow-neumorph border border-mint/40 flex flex-col justify-between">
              <div>
                <div className="flex gap-1 text-gold mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-ink leading-relaxed">
                  "My toddler woke up with a sharp fever. Booking Dr. Vikram Desai was seamless on Razorpay, and the video quality was crystal clear. Highly recommend CareSync for any parent."
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-mint/60 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-forest text-white text-xs font-bold flex items-center justify-center">
                  MK
                </div>
                <div>
                  <h4 className="text-xs font-bold text-ink">Meenakshi Kulkarni</h4>
                  <p className="text-[10px] text-sage">Mysuru • Verified Patient</p>
                </div>
              </div>
            </div>

            <div className="bg-paper rounded-clinic p-6 shadow-neumorph border border-mint/40 flex flex-col justify-between">
              <div>
                <div className="flex gap-1 text-gold mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-ink leading-relaxed">
                  "The emergency short-circuit feature is genuine life-saving engineering. When I entered severe chest symptoms for my uncle, it immediately showed the 112/108 banner instead of a booking link. That built our trust."
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-mint/60 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-forest text-white text-xs font-bold flex items-center justify-center">
                  AS
                </div>
                <div>
                  <h4 className="text-xs font-bold text-ink">Aniket Shinde</h4>
                  <p className="text-[10px] text-sage">Pune • Verified Patient</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
