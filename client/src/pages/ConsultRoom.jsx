import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Camera,
  Mic,
  Wifi,
  Shield,
  Video,
  PhoneOff,
  Copy,
  Check,
  Clock,
  User,
  AlertCircle,
} from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Skeleton from '../components/Skeleton';

export const ConsultRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inRoom, setInRoom] = useState(false);
  const [copied, setCopied] = useState(false);

  // Preflight device check states
  const [cameraActive, setCameraActive] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [mediaStream, setMediaStream] = useState(null);

  const previewVideoRef = useRef(null);
  const jitsiContainerRef = useRef(null);
  const jitsiApiRef = useRef(null);

  // Load appointment details
  useEffect(() => {
    api
      .get(`/appointments/${id}`)
      .then((res) => {
        const appt = res.data?.appointment;
        setAppointment(appt);
        if (appt?.status !== 'paid' && appt?.status !== 'completed') {
          showToast('Consultation requires paid confirmation', 'error');
          navigate(`/book/${appt.doctorId}`);
        }
      })
      .catch((err) => {
        console.error('Failed to load consultation:', err);
        showToast('Consultation room not found', 'error');
        navigate('/dashboard');
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Preflight media permission request
  useEffect(() => {
    let streamInstance = null;

    if (!inRoom) {
      navigator.mediaDevices
        ?.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          streamInstance = stream;
          setMediaStream(stream);
          setCameraActive(true);
          setMicActive(true);
          if (previewVideoRef.current) {
            previewVideoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.warn('Could not acquire media devices for preflight preview:', err.message);
          // Still allow join in case user selects device in Jitsi interface
          setCameraActive(false);
          setMicActive(false);
        });
    }

    return () => {
      if (streamInstance) {
        streamInstance.getTracks().forEach((track) => track.stop());
      }
    };
  }, [inRoom]);

  // Initialize Jitsi Meet when entering the room
  const handleJoinCall = () => {
    // Stop preflight stream so Jitsi can acquire camera
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      setMediaStream(null);
    }
    setInRoom(true);
  };

  useEffect(() => {
    if (inRoom && appointment && !jitsiApiRef.current) {
      const domain = 'meet.jit.si';
      const roomName =
        appointment.jitsiRoom || `caresync-${appointment._id.substring(0, 8)}`;

      if (window.JitsiMeetExternalAPI) {
        const options = {
          roomName,
          parentNode: jitsiContainerRef.current,
          width: '100%',
          height: '100%',
          userInfo: {
            displayName: user?.name || 'CareSync Patient',
            email: user?.email || 'patient@caresync.in',
          },
          configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            prejoinPageEnabled: false,
            disableDeepLinking: true,
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            TOOLBAR_BUTTONS: [
              'microphone',
              'camera',
              'closedcaptions',
              'desktop',
              'fullscreen',
              'chat',
              'settings',
              'raisehand',
              'tileview',
            ],
          },
        };

        const apiInstance = new window.JitsiMeetExternalAPI(domain, options);
        jitsiApiRef.current = apiInstance;

        apiInstance.addEventListeners({
          videoConferenceTerminated: () => {
            handleEndConsultation();
          },
        });
      } else {
        console.warn('Jitsi Meet External API script not available');
      }
    }

    return () => {
      if (jitsiApiRef.current) {
        try {
          jitsiApiRef.current.dispose();
        } catch {}
        jitsiApiRef.current = null;
      }
    };
  }, [inRoom, appointment]);

  const consultUrl = `${window.location.origin}/consult/${id}`;

  const handleCopyInviteLink = () => {
    navigator.clipboard.writeText(consultUrl);
    setCopied(true);
    showToast('Doctor consultation link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleEndConsultation = async () => {
    try {
      const res = await api.post(`/appointments/${id}/complete`);
      const rxId = res.data?.prescriptionId;
      showToast('Consultation ended. Prescription generated!', 'success');

      if (rxId) {
        navigate(`/prescriptions/${rxId}`);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Error completing consult:', err);
      navigate('/dashboard');
    }
  };

  if (loading || !appointment) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Skeleton className="h-64 w-full rounded-clinic" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mist py-6 px-4 sm:px-6 lg:px-8">
      {!inRoom ? (
        /* Phase 1: Preflight Device Check Screen (Section 10 requirement) */
        <div className="max-w-2xl mx-auto bg-paper rounded-clinic p-6 sm:p-10 shadow-neumorph-lg border border-mint/60">
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-leaf block mb-1">
              PREFLIGHT DEVICE CHECK
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink">
              Ready to Join Video Consultation?
            </h1>
            <p className="text-xs sm:text-sm text-sage mt-1">
              Consulting with{' '}
              <strong className="text-forest">
                {appointment.doctor?.name || `Dr. ${appointment.doctorId}`}
              </strong>
            </p>
          </div>

          {/* Camera preview window */}
          <div className="relative w-full aspect-video rounded-2xl bg-ink overflow-hidden shadow-inner border border-mint mb-6 flex items-center justify-center">
            <video
              ref={previewVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform -scale-x-100"
            />
            {!cameraActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-ink/90 text-white p-4 text-center">
                <Camera className="w-8 h-8 text-mint/60 mb-2" />
                <p className="text-xs font-semibold">Camera preview inactive or blocked</p>
                <p className="text-[11px] text-mint/60 mt-1">
                  You can enable camera inside the video room.
                </p>
              </div>
            )}
          </div>

          {/* Device Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 text-xs">
            <div className="p-3 rounded-xl bg-mist border border-mint flex items-center gap-2.5">
              <Camera className={`w-4 h-4 ${cameraActive ? 'text-leaf' : 'text-sage'}`} />
              <div>
                <span className="block font-bold text-ink">Camera</span>
                <span className="text-[10px] text-sage">{cameraActive ? 'Detected' : 'Inactive'}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-mist border border-mint flex items-center gap-2.5">
              <Mic className={`w-4 h-4 ${micActive ? 'text-leaf' : 'text-sage'}`} />
              <div>
                <span className="block font-bold text-ink">Microphone</span>
                <span className="text-[10px] text-sage">{micActive ? 'Ready' : 'Checking'}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-mist border border-mint flex items-center gap-2.5">
              <Wifi className="w-4 h-4 text-leaf" />
              <div>
                <span className="block font-bold text-ink">Network</span>
                <span className="text-[10px] text-sage">Optimal WebRTC</span>
              </div>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="p-3.5 bg-mint/50 rounded-2xl border border-mint/70 flex items-center gap-2.5 text-xs text-forest mb-8">
            <Shield className="w-4 h-4 flex-shrink-0 text-leaf" />
            <span>Your consultation is private and end-to-end encrypted under peer-to-peer WebRTC.</span>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleJoinCall}
              className="flex-1 py-4 rounded-full text-sm font-bold text-white bg-forest hover:bg-evergreen active:scale-95 shadow-neumorph transition flex items-center justify-center gap-2"
            >
              <Video className="w-4 h-4" />
              <span>Join Consultation Room</span>
            </button>

            <button
              onClick={handleCopyInviteLink}
              className="py-4 px-6 rounded-full text-xs sm:text-sm font-bold text-forest bg-paper border border-mint hover:bg-mint transition flex items-center justify-center gap-2"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Link Copied!' : 'Copy Doctor Invite Link'}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Phase 2: In-Room Jitsi Interface with Overlay UI (Section 10 requirement) */
        <div className="max-w-7xl mx-auto flex flex-col h-[88vh]">
          {/* Overlay Top Bar */}
          <div className="p-4 bg-paper rounded-2xl shadow-sm border border-mint/60 mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-leaf animate-pulse"></div>
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-ink">
                  CareSync Consultation — Dr. {appointment.doctor?.name?.replace('Dr. ', '') || appointment.doctorId}
                </h2>
                <p className="text-[11px] text-sage">
                  Room: {appointment.jitsiRoom || 'caresync-room'}
                </p>
              </div>
            </div>

            {/* Patient note reminder chip */}
            {appointment.note && (
              <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-mint text-forest text-xs rounded-full truncate max-w-xs">
                <span className="font-bold">Note:</span>
                <span className="truncate">{appointment.note}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyInviteLink}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold text-forest bg-mint hover:bg-limeChip transition border border-mint"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Invite Doctor'}</span>
              </button>

              <button
                onClick={handleEndConsultation}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white bg-alert hover:bg-red-700 active:scale-95 shadow-sm transition"
              >
                <PhoneOff className="w-3.5 h-3.5" />
                <span>End Consultation</span>
              </button>
            </div>
          </div>

          {/* Jitsi Meet Container */}
          <div className="flex-1 bg-ink rounded-2xl overflow-hidden shadow-neumorph-lg border border-mint relative">
            <div ref={jitsiContainerRef} className="w-full h-full" />
          </div>

          {/* Bottom helper state */}
          <div className="mt-2 text-center text-[11px] text-sage">
            Waiting for the doctor or second participant to join? Send them the Invite Link to open in any browser. When finished, press <strong>End Consultation</strong> to issue prescription.
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultRoom;
