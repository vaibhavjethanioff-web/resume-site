// ============================================================
// config.js — THE ONLY FILE YOU NEED TO EDIT
// Change anything here and the whole site updates automatically.
// ============================================================

const CONFIG = {

  // --- PERSONAL INFO ---
  name: "Your Name",
  tagline: "Your resume has 6 seconds. Make that count.",
  subTagline: "I write resumes that survive ATS bots, stop the scroll, and land you the interview.",
  photo: "./assets/photo.jpg",   // put your photo at this path
  email: "your@gmail.com",
  phone: "9XXXXXXXXX",
  linkedin: "https://linkedin.com/in/yourprofile",
  whatsapp: "9XXXXXXXXX",

  // --- HERO STATS ---
  stats: [
    { number: "200+", label: "Resumes Written" },
    { number: "94%",  label: "Interview Rate"  },
    { number: "50+",  label: "Industries"      }
  ],

  // --- SERVICES ---
  services: [
    { number: "01", title: "Resume Writing",   description: "Fresh, powerful resumes built from scratch tailored to the role you want." },
    { number: "02", title: "Resume Review",    description: "Detailed feedback on structure, keywords, and impact statements." },
    { number: "03", title: "ATS Optimisation", description: "Make sure your resume passes bots and lands on a real recruiter's desk." },
    { number: "04", title: "LinkedIn Profile", description: "A keyword-rich LinkedIn that attracts recruiters and gets you noticed." }
  ],

  // --- ABOUT ---
  aboutHeading: "Hi, I'm Your Name",
  aboutText: [
    "I've spent X years helping professionals across India land their dream jobs — from fresh graduates to senior executives.",
    "Whether you're switching careers, returning from a gap, or just not getting calls back — I'll fix your resume fast."
  ],
  skills: ["IT & Tech", "Finance", "Marketing", "HR", "MBA", "Freshers"],

  // --- HOW IT WORKS ---
  steps: [
    { number: "1", title: "Book & Pay",        description: "Pick a slot and pay ₹199 to lock in your 30-minute session." },
    { number: "2", title: "Share Details",     description: "Send your current resume and target job via WhatsApp or email." },
    { number: "3", title: "Strategy Call",     description: "30-min deep dive on your goals, gaps, and what needs to change." },
    { number: "4", title: "Get Hired",         description: "Polished ATS-ready resume in your inbox within 24 hours." }
  ],

  // --- TESTIMONIALS ---
  testimonials: [
    { quote: "3 interview calls within a week. Absolute game-changer.", name: "Priya M.", role: "Software Engineer, Bangalore" },
    { quote: "Had a 2-year gap and was terrified. The call helped me reframe my story perfectly.", name: "Rahul S.", role: "Product Manager, Mumbai" },
    { quote: "Worth every rupee. My LinkedIn views shot up 5x.", name: "Anjali T.", role: "MBA Fresher, Delhi" }
  ],

  // --- BOOKING ---
  sessionPrice: 199,
  sessionDuration: "30 minutes",
  sessionIncludes: [
    "Live resume audit on the call",
    "ATS keyword gap analysis",
    "Specific rewrites and action plan",
    "Follow-up notes by email",
    "Session via Google Meet or Zoom"
  ],
  availableSlots: [
    "Mon–Fri, 9–10 AM",
    "Mon–Fri, 12–1 PM",
    "Mon–Fri, 6–7 PM",
    "Sat, 10 AM–12 PM",
    "Sat, 3–5 PM"
  ],

  // --- FAQ ---
  faqs: [
    { q: "Do I get a full resume or just feedback?",  a: "Full rewrite + polished resume delivered within 24 hours of the call." },
    { q: "What if I don't have a resume yet?",        a: "No problem — I'll build it from scratch based on what we discuss on the call." },
    { q: "Does ₹199 cover everything?",               a: "Yes — 30-min consultation + one resume draft included." },
    { q: "Is the payment refundable?",                a: "We'll reschedule if you can't make it. No refunds after the session." }
  ],

  // --- COLORS ---
  // Change these hex values to completely restyle the entire site.
  colors: {
    primary:     "#bf4e18",
    primaryHover:"#e06635",
    gold:        "#c9a24a",
    dark:        "#0e0c0a",
    cream:       "#faf7f0",
    warm:        "#f2ebe0"
  }
}
