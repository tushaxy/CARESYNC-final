import axios from 'axios';
import Doctor from '../models/Doctor.js';
import Medicine from '../models/Medicine.js';
import ChatSession from '../models/ChatSession.js';
import { medicinesSeed } from '../data/medicines.seed.js';

// 8.1 (a) Red-flag patterns
const RED_FLAG_REGEX = /\b(chest pain|difficulty breathing|shortness of breath|breathless|unconscious|unconsciousness|passing out|seizure|seizures|convulsion|heavy bleeding|bleeding heavily|slurred speech|one side weakness|stroke|heart attack|suicide|suicidal|overdose|severe allergic reaction|anaphylaxis)\b/i;

// Haversine distance in km
export function getHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Allowed catalog injection string for system prompt
const allowedCatalogString = medicinesSeed
  .map((m) => `[${m.sku}: ${m.name}]`)
  .join(', ');

// Verbatim system prompt from Section 8.2
const SYSTEM_PROMPT = `You are CareSync Assist, an AI health-guide for patients in India. You receive a symptom description and sometimes a photo. You NEVER diagnose. You always answer with ONLY one valid JSON object, no markdown, matching this shape: {triage: emergency or doctor or selfcare, confidence: 0-100, summary: 2-3 friendly sentences in simple English, possibleCauses: [{name, likelihood: high or medium or low}], specialty: string or null, advice: [3 to 5 practical care steps], otc: [{sku, name, why, dosage: follow pack label}], followUpIn: string}. Rules: use triage emergency only for red-flag situations such as suspected heart attack, stroke signs, breathing difficulty, unconsciousness, heavy bleeding, seizures or suicidal intent. For everyday minor issues (cold, mild fever under three days, acidity, minor rash, tiredness) use selfcare and recommend only items from this allowed catalog: ${allowedCatalogString}. For everything else use doctor and set specialty to exactly one of: General Physician, Dermatologist, Pediatrician, Gynecologist and Obstetrician, Orthopedic Surgeon, Psychiatrist, Neurologist, ENT Specialist, Dentist, Ophthalmologist, Gastroenterologist, Pulmonologist, Endocrinologist, Urologist, Nephrologist, Oncologist, Rheumatologist, Nutritionist and Dietitian, Physiotherapist, Ayurvedic Physician. In the summary be warm and plain-spoken and mention one thing the person can do right now. Never claim certainty; prefer words like commonly and often. Indian context: suggest ORS for dehydration; never suggest antibiotics. Return ONLY the JSON object.`;

// 8.4 Deterministic fallback matcher
export function deterministicTriageFallback(text) {
  const t = text.toLowerCase();

  // Emergency check
  if (RED_FLAG_REGEX.test(t)) {
    return {
      triage: 'emergency',
      confidence: 99,
      summary: 'Your described symptoms indicate a critical emergency that requires immediate medical care. Please contact emergency services right now.',
      possibleCauses: [{ name: 'Acute cardiopulmonary or neurological event', likelihood: 'high' }],
      specialty: null,
      advice: [
        'Call emergency ambulance 112 or 108 immediately.',
        'Keep the patient sitting or lying down comfortably and remain calm.',
        'Do not give oral medication or fluids until emergency responders arrive.',
      ],
      otc: [],
      followUpIn: 'Immediate',
    };
  }

  // Selfcare detection
  const isMinorRash = /rash|itch|bite|itching/i.test(t) && !/severe|spreading rapidly|fever/i.test(t);
  const isAcidity = /acidity|heartburn|gas|indigestion/i.test(t);
  const isColdFever = /cold|cough|mild fever|sore throat|sneezing/i.test(t);
  const isDehydration = /hydration|loose motions|diarrhea|vomiting/i.test(t);

  if (isAcidity) {
    return {
      triage: 'selfcare',
      confidence: 88,
      summary: 'Your symptoms commonly indicate mild hyperacidity or gastric irritation. Sip cool water and avoid spicy or oily food right now.',
      possibleCauses: [{ name: 'Gastric acid reflux', likelihood: 'high' }, { name: 'Dietary indigestion', likelihood: 'medium' }],
      specialty: 'Gastroenterologist',
      advice: [
        'Drink a glass of cold milk or lukewarm water.',
        'Avoid lying flat immediately after eating.',
        'Eat small, light meals and limit spicy dishes.',
      ],
      otc: [
        { sku: 'MED-04', name: 'Gelusil Antacid Gel (200 ml)', why: 'Rapid cooling relief from acid reflux and heartburn', dosage: 'Follow pack label' },
      ],
      followUpIn: '2 to 3 days if symptoms persist',
    };
  }

  if (isMinorRash) {
    return {
      triage: 'doctor',
      confidence: 86,
      summary: 'You have reported an itchy skin rash. While often caused by contact irritants or mild allergies, having a dermatologist evaluate the skin helps determine the exact trigger.',
      possibleCauses: [{ name: 'Contact Dermatitis', likelihood: 'high' }, { name: 'Allergic Urticaria', likelihood: 'medium' }],
      specialty: 'Dermatologist',
      advice: [
        'Apply a cool, damp cloth to soothe itching immediately.',
        'Avoid scratching to prevent breaking the skin barrier.',
        'Wear loose, breathable cotton clothes.',
      ],
      otc: [
        { sku: 'MED-07', name: 'Calamine Lotion (100 ml)', why: 'Soothes itching and calms irritated skin', dosage: 'Follow pack label' },
        { sku: 'MED-02', name: 'Cetirizine 10mg (strip of 10)', why: 'Reduces allergic skin response and histamine itching', dosage: 'Follow pack label' },
      ],
      followUpIn: 'Consult doctor if redness worsens or lasts > 48 hours',
    };
  }

  // Specialty keyword map
  let specialty = 'General Physician';
  if (/skin|rash|acne|itch|hives|hair loss/i.test(t)) specialty = 'Dermatologist';
  else if (/child|infant|baby|toddler|pediatric/i.test(t)) specialty = 'Pediatrician';
  else if (/period|pcos|pregnancy|cramps|gynec/i.test(t)) specialty = 'Gynecologist and Obstetrician';
  else if (/anxiety|depression|panic|sleep|stress|sadness/i.test(t)) specialty = 'Psychiatrist';
  else if (/migraine|headache|nerve|numbness|dizziness/i.test(t)) specialty = 'Neurologist';
  else if (/ear|throat|tonsil|sinus|hearing|nose/i.test(t)) specialty = 'ENT Specialist';
  else if (/tooth|teeth|gum|dental|cavity/i.test(t)) specialty = 'Dentist';
  else if (/eye|vision|blur|conjunctivitis/i.test(t)) specialty = 'Ophthalmologist';
  else if (/stomach|acidity|vomit|nausea|liver|digest/i.test(t)) specialty = 'Gastroenterologist';
  else if (/cough|asthma|wheezing|chest congestion|lungs/i.test(t)) specialty = 'Pulmonologist';
  else if (/diabetes|thyroid|sugar|hormone/i.test(t)) specialty = 'Endocrinologist';
  else if (/urine|kidney|flank pain|bladder/i.test(t)) specialty = 'Urologist';
  else if (/joint|knee|back pain|shoulder|fracture|bone/i.test(t)) specialty = 'Orthopedic Surgeon';

  const defaultOtc = [];
  if (isColdFever) {
    defaultOtc.push({ sku: 'MED-01', name: 'Dolo 650 (Paracetamol 650mg, strip of 15)', why: 'Relieves fever and body ache', dosage: 'Follow pack label' });
    defaultOtc.push({ sku: 'MED-05', name: 'Cough Relief Syrup (150 ml)', why: 'Soothes throat and chest congestion', dosage: 'Follow pack label' });
  } else if (isDehydration) {
    defaultOtc.push({ sku: 'MED-03', name: 'ORS Electrolyte Powder (10 sachets)', why: 'Restores essential fluids and salts', dosage: 'Follow pack label' });
  }

  return {
    triage: 'doctor',
    confidence: 85,
    summary: `Your symptoms are commonly evaluated by a ${specialty}. A brief video consultation will help confirm the cause and establish a personalized care plan.`,
    possibleCauses: [
      { name: `Condition requiring ${specialty} evaluation`, likelihood: 'medium' },
      { name: 'Common viral or environmental response', likelihood: 'medium' },
    ],
    specialty,
    advice: [
      'Rest adequately and monitor for any sudden changes in symptoms.',
      'Maintain adequate hydration with water or electrolytes.',
      `Schedule a consultation with a verified ${specialty}.`,
    ],
    otc: defaultOtc,
    followUpIn: 'Within 24 to 48 hours',
  };
}

// Call Gemini API via plain axios
async function callGemini(text, base64Image, mimeType = 'image/jpeg', temperature = 0.3) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey.includes('your_google_ai')) {
    throw new Error('GEMINI_API_KEY_NOT_CONFIGURED');
  }

  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const parts = [];
  if (base64Image) {
    parts.push({
      inline_data: {
        mime_type: mimeType,
        data: base64Image.replace(/^data:image\/[a-z]+;base64,/, ''),
      },
    });
  }
  parts.push({ text: `Patient statement: "${text}"\nPlease evaluate and respond with ONLY the JSON object.` });

  const payload = {
    contents: [{ role: 'user', parts }],
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    generationConfig: {
      temperature,
      maxOutputTokens: 900,
      responseMimeType: 'application/json',
    },
  };

  const response = await axios.post(url, payload, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
  });

  const candidate = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!candidate) {
    throw new Error('Empty response from Gemini API');
  }

  return candidate;
}

export async function processTriage({ text, imageUrl, base64Image, mimeType, lat, lng, userId = null }) {
  // 8.1 (a) Red-flag short-circuit
  if (RED_FLAG_REGEX.test(text)) {
    const emergencyResult = {
      triage: 'emergency',
      confidence: 100,
      summary: 'Emergency indicators detected. Please seek emergency medical assistance immediately. Do not wait for an online appointment.',
      possibleCauses: [{ name: 'Acute medical emergency', likelihood: 'high' }],
      specialty: null,
      advice: [
        'Call emergency ambulance 112 or 108 immediately.',
        'Keep the patient sitting or lying down comfortably and remain calm.',
        'Do not administer oral food or unprescribed medication.',
      ],
      otc: [],
      emergency: {
        show: true,
        message: 'Red-flag symptoms detected. Immediate in-person emergency hospital care is advised.',
        numbers: ['112', '108'],
      },
      doctors: [],
    };

    const chat = await ChatSession.create({
      userId,
      messages: [
        { role: 'user', text, imageUrl },
        { role: 'assistant', text: emergencyResult.summary },
      ],
      triage: emergencyResult,
    });

    return { ...emergencyResult, chatId: chat._id };
  }

  // 8.1 (b & c) Attempt Gemini with strict JSON & 1 retry
  let rawJson = null;
  let parsed = null;

  try {
    rawJson = await callGemini(text, base64Image, mimeType, 0.3);
    parsed = JSON.parse(rawJson);
  } catch (err1) {
    if (err1.message !== 'GEMINI_API_KEY_NOT_CONFIGURED') {
      try {
        console.warn('[Gemini] Retrying with temperature 0...');
        rawJson = await callGemini(text + '\nCRITICAL: Respond ONLY with valid JSON.', base64Image, mimeType, 0.0);
        parsed = JSON.parse(rawJson);
      } catch (err2) {
        console.warn('[Gemini] Retry failed, falling back to deterministic matcher:', err2.message);
      }
    }
  }

  // Fallback if Gemini unavailable or failed
  if (!parsed || !parsed.triage) {
    parsed = deterministicTriageFallback(text);
  }

  // Resolve emergency payload
  const isEmergency = parsed.triage === 'emergency';
  const emergency = {
    show: isEmergency,
    message: isEmergency
      ? 'Critical red-flag symptoms detected. Please seek immediate in-person emergency care.'
      : '',
    numbers: ['112', '108'],
  };

  // Resolve OTC catalog items
  let resolvedOtc = [];
  if (Array.isArray(parsed.otc) && parsed.otc.length > 0) {
    for (const item of parsed.otc) {
      const match = medicinesSeed.find((m) => m.sku === item.sku || m.name.toLowerCase().includes((item.name || '').toLowerCase()));
      if (match) {
        resolvedOtc.push({
          sku: match.sku,
          name: match.name,
          category: match.category,
          price: match.price,
          mrp: match.mrp,
          blurb: match.blurb,
          why: item.why || 'Recommended for symptom management',
          dosage: item.dosage || 'Follow pack label',
        });
      }
    }
  }

  // 8.1 (d) Query matching doctors when triage equals "doctor"
  let matchedDoctors = [];
  if (parsed.triage === 'doctor' && parsed.specialty) {
    let docs = await Doctor.find({ specialization: parsed.specialty }).lean();

    if (docs.length === 0) {
      // Fallback to General Physician if exact specialty has no doctors
      docs = await Doctor.find({ specialization: 'General Physician' }).lean();
    }

    // Rank by rating descending, then Haversine distance if lat/lng, then fee ascending
    docs.sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      if (lat != null && lng != null) {
        const distA = getHaversineDistance(lat, lng, a.location.lat, a.location.lng);
        const distB = getHaversineDistance(lat, lng, b.location.lat, b.location.lng);
        if (distA !== distB) return distA - distB;
      }
      return a.videoConsultFee - b.videoConsultFee;
    });

    matchedDoctors = docs.slice(0, 3).map((d) => ({
      docId: d.docId,
      name: d.name,
      specialization: d.specialization,
      qualifications: d.qualifications,
      experienceYears: d.experienceYears,
      rating: d.rating,
      reviewCount: d.reviewCount,
      videoConsultFee: d.videoConsultFee,
      clinicArea: d.clinicArea,
      nextAvailableLabel: d.nextAvailableLabel,
      avatarHue: d.avatarHue,
      distanceKm:
        lat != null && lng != null
          ? getHaversineDistance(lat, lng, d.location.lat, d.location.lng)
          : null,
    }));
  }

  // Construct full Section 8.3 response
  const responseData = {
    triage: parsed.triage || 'doctor',
    confidence: parsed.confidence || 85,
    summary: parsed.summary || 'Symptoms assessed. AI guidance, not a medical diagnosis.',
    possibleCauses: parsed.possibleCauses || [],
    specialty: parsed.specialty || null,
    advice: parsed.advice || ['Rest and monitor symptoms', 'Stay well hydrated'],
    otc: resolvedOtc,
    emergency,
    doctors: matchedDoctors,
  };

  // 8.1 (e) Persist ChatSession
  try {
    const chat = await ChatSession.create({
      userId,
      messages: [
        { role: 'user', text, imageUrl },
        { role: 'assistant', text: responseData.summary },
      ],
      triage: responseData,
    });
    responseData.chatId = chat._id;
  } catch (dbErr) {
    console.warn('[Triage] ChatSession save warning:', dbErr.message);
  }

  return responseData;
}

