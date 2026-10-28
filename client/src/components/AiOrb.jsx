import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageCircle,
  X,
  Send,
  Image as ImageIcon,
  Sparkles,
  AlertTriangle,
  Stethoscope,
  Pill,
  ArrowRight,
  Plus,
  Check,
} from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import EmergencyBanner from './EmergencyBanner';
import { formatRupee } from '../lib/format';

export const AiOrb = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Hello! I am CareSync Assist, your AI health guide. Describe what you are experiencing, or upload a photo of a rash or symptom, and I will guide you to the right care.',
      disclaimer: true,
    },
  ]);

  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Load history if authenticated
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      api
        .get('/ai/history')
        .then((res) => {
          if (res.data?.history?.length > 0) {
            const formatted = [];
            res.data.history.slice(0, 3).forEach((session) => {
              session.messages?.forEach((m, idx) => {
                formatted.push({
                  id: `${session._id}-${idx}`,
                  role: m.role,
                  text: m.text,
                  triageResult: m.role === 'assistant' ? session.triage : null,
                  disclaimer: m.role === 'assistant',
                });
              });
            });
            if (formatted.length > 0) {
              setMessages((prev) => [prev[0], ...formatted]);
            }
          }
        })
        .catch(() => {});
    }
  }, [isOpen, isAuthenticated]);

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      showToast('Image size must be under 4MB', 'error');
      return;
    }

    setSelectedPhoto(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setPhotoPreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setSelectedPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async (textToSend) => {
    const messageContent = (typeof textToSend === 'string' ? textToSend : inputText).trim();
    if (!messageContent && !selectedPhoto) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      text: messageContent,
      imagePreview: photoPreview,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    const currentPhoto = selectedPhoto;
    const currentPreview = photoPreview;
    removePhoto();
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('text', messageContent);
      if (currentPhoto) {
        formData.append('photo', currentPhoto);
      }

      const res = await api.post('/ai/triage', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const triageData = res.data;

      const aiMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: triageData.summary,
        triageResult: triageData,
        disclaimer: true,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Triage error:', err);
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: 'I could not process your symptom request at this moment. Please check your network or try again.',
        disclaimer: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickChips = [
    'Skin issue',
    'Fever since morning',
    'Acidity',
    'Feeling anxious',
  ];

  return (
    <>
      {/* The Floating AI Orb (Section 4 & 11) */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Ask CareSync AI"
          title="Ask CareSync AI"
          className="relative group w-14 h-14 rounded-full bg-gradient-to-tr from-forest to-leaf text-white flex items-center justify-center shadow-neumorph-lg hover:shadow-glow-ai transition-all duration-300 transform hover:scale-105 active:scale-95 animate-float-orb"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-limeChip" />
          ) : (
            <>
              <MessageCircle className="w-7 h-7 text-white fill-white/20" />
              {/* aiGlow pulse dot (#FF6B5B) */}
              <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-aiGlow border-2 border-paper animate-ping"></span>
              <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-aiGlow border-2 border-paper"></span>
            </>
          )}

          {/* Tooltip */}
          {!isOpen && (
            <span className="absolute -top-10 right-0 px-3 py-1 bg-ink text-paper text-xs font-bold rounded-full shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none">
              Ask CareSync AI
            </span>
          )}
        </button>
      </div>

      {/* Slide-Up Panel (380px wide x 560px tall) */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[92vw] sm:w-[380px] h-[560px] max-h-[85vh] bg-paper rounded-clinic shadow-neumorph-lg border border-mint/70 flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 duration-200">
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-forest to-evergreen text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-leaf/40 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-limeChip animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold tracking-tight">CareSync AI</h3>
                  <span className="px-2 py-0.5 rounded-full bg-aiGlow text-white text-[10px] font-extrabold tracking-wider uppercase">
                    LIVE
                  </span>
                </div>
                <p className="text-[10px] text-mint/80">Clinical Triage & Guidance Engine</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-mint hover:bg-white/10 transition"
              aria-label="Close AI chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick chip row */}
          <div className="px-3 py-2 bg-mist/60 border-b border-mint/40 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {quickChips.map((chip) => (
              <button
                key={chip}
                onClick={() => handleSend(chip)}
                className="px-2.5 py-1 rounded-full bg-paper text-forest text-[11px] font-semibold hover:bg-mint border border-mint/60 whitespace-nowrap shadow-xs transition active:scale-95"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Messages Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                {/* User image bubble if any */}
                {msg.imagePreview && (
                  <div className="mb-1 rounded-xl overflow-hidden max-w-[180px] border-2 border-forest">
                    <img src={msg.imagePreview} alt="User symptom attachment" className="w-full h-auto object-cover" />
                  </div>
                )}

                {/* Main bubble */}
                <div
                  className={`max-w-[88%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-forest text-white rounded-br-none shadow-sm'
                      : 'bg-mist text-ink border border-mint rounded-bl-none shadow-xs'
                  }`}
                >
                  <p>{msg.text}</p>

                  {/* Render Triage Result Components */}
                  {msg.triageResult && (
                    <div className="mt-3 space-y-3 pt-3 border-t border-forest/15">
                      {/* Emergency Banner */}
                      {msg.triageResult.triage === 'emergency' && (
                        <EmergencyBanner message={msg.triageResult.emergency?.message} />
                      )}

                      {/* Doctor cards recommendation */}
                      {msg.triageResult.doctors?.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[11px] font-bold text-forest uppercase tracking-wider block">
                            Recommended Specialists:
                          </span>
                          {msg.triageResult.doctors.map((doc) => (
                            <div
                              key={doc.docId}
                              className="p-2.5 bg-paper rounded-xl border border-mint shadow-xs flex items-center justify-between gap-2"
                            >
                              <div className="min-w-0">
                                <h5 className="font-bold text-xs text-ink truncate">{doc.name}</h5>
                                <p className="text-[10px] text-sage truncate">
                                  {doc.specialization} • {formatRupee(doc.videoConsultFee)}
                                </p>
                              </div>
                              <button
                                onClick={() => {
                                  setIsOpen(false);
                                  navigate(`/book/${doc.docId}`);
                                }}
                                className="px-2.5 py-1 rounded-full text-[11px] font-bold text-white bg-forest hover:bg-evergreen transition whitespace-nowrap"
                              >
                                Book
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Selfcare OTC item cards */}
                      {msg.triageResult.otc?.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[11px] font-bold text-forest uppercase tracking-wider block">
                            Suggested OTC Essentials:
                          </span>
                          {msg.triageResult.otc.map((item) => (
                            <div
                              key={item.sku}
                              className="p-2.5 bg-paper rounded-xl border border-mint shadow-xs flex items-center justify-between gap-2"
                            >
                              <div className="min-w-0">
                                <h5 className="font-bold text-xs text-ink truncate">{item.name}</h5>
                                <p className="text-[10px] text-leaf font-semibold">{formatRupee(item.price)}</p>
                              </div>
                              <button
                                onClick={() => {
                                  addToCart(item, 1);
                                  showToast(`Added ${item.name} to cart!`, 'success');
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold text-white bg-leaf hover:bg-forest transition"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Add</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Section 1 & 8 mandatory disclaimer caption */}
                  {msg.disclaimer && (
                    <span className="block mt-2 text-[10px] text-sage italic">
                      AI guidance, not a medical diagnosis
                    </span>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 text-forest bg-mint/70 p-3 rounded-2xl w-fit text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-forest animate-ping"></span>
                <span>CareSync AI is evaluating symptoms...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Photo Preview Thumbnail */}
          {photoPreview && (
            <div className="px-4 py-2 bg-mist border-t border-mint flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={photoPreview} alt="Symptom preview" className="w-10 h-10 rounded-lg object-cover border border-forest" />
                <span className="text-xs text-ink font-medium">Photo attached</span>
              </div>
              <button onClick={removePhoto} className="p-1 text-sage hover:text-alert">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Input Bar */}
          <div className="p-3 bg-paper border-t border-mint/60">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoSelect}
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Attach symptom photo"
                className={`p-2.5 rounded-full transition ${
                  photoPreview ? 'bg-mint text-forest' : 'hover:bg-mist text-sage hover:text-forest'
                }`}
              >
                <ImageIcon className="w-5 h-5" />
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Describe symptoms e.g. rash on arm..."
                className="flex-1 px-4 py-2.5 rounded-full text-xs sm:text-sm bg-mist clinic-inset border-none focus:outline-none focus:ring-1 focus:ring-forest text-ink placeholder:text-sage"
              />

              <button
                type="submit"
                disabled={isLoading || (!inputText.trim() && !selectedPhoto)}
                className="p-2.5 rounded-full bg-forest text-white disabled:opacity-40 hover:bg-evergreen active:scale-95 transition"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AiOrb;
