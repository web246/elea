
const defaults = {
  phone: '+49 152 16019843',
  email: 'eleacleaning@gmail.com',
  whatsapp: '+49 152 16019843',
  instagram: 'https://instagram.com/eleacleaningcompany',
  instagramDisplay: '@eleacleaningcompany',
  whatsappNumber: '4915216019843',
  notificationEmail: 'websitesbrian585@gmail.com'
};
// Set this to your Google Apps Script Web App URL after deploying (see README_APPSCRIPT.md)
defaults.bookingEndpoint = '';

const ADMIN_STORAGE_KEY = 'elea-admin-state';

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

function getDefaultAssetCatalog() {
  return [
    { id: 'asset-hero', name: 'Hero', path: 'assets/images/hero.png', active: true },
    { id: 'asset-kitchen', name: 'Kitchen', path: 'assets/images/kitchen.png', active: true },
    { id: 'asset-bathroom', name: 'Bathroom', path: 'assets/images/bathroom.png', active: true },
    { id: 'asset-bedroom', name: 'Bedroom', path: 'assets/images/bedroom.png', active: true },
    { id: 'asset-living', name: 'Living room', path: 'assets/images/living.png', active: true },
    { id: 'asset-wardrobe', name: 'Wardrobe', path: 'assets/images/wardrobe.png', active: true },
    { id: 'asset-movein', name: 'Move-in', path: 'assets/images/moveIn.png', active: true },
    { id: 'asset-moveout', name: 'Move-out', path: 'assets/images/moveOut.png', active: true },
    { id: 'asset-oven', name: 'Oven', path: 'assets/images/oven.png', active: true },
    { id: 'asset-laundry', name: 'Laundry', path: 'assets/images/laundry.png', active: true },
    { id: 'asset-window', name: 'Window', path: 'assets/images/window.png', active: true },
    { id: 'asset-reno', name: 'After renovation', path: 'assets/images/afterReno.png', active: true },
    { id: 'asset-best', name: 'Site logo', path: 'assets/best.png', active: true }
  ];
}

function mergeAssetCatalog(assets) {
  const catalog = [...getDefaultAssetCatalog()];
  const seen = new Map();

  catalog.forEach((asset) => {
    const key = asset.path || asset.id;
    seen.set(key, { ...asset, active: asset.active !== false });
  });

  (Array.isArray(assets) ? assets : []).forEach((asset) => {
    const key = asset.path || asset.id;
    if (!key) return;
    seen.set(key, {
      ...seen.get(key),
      ...asset,
      id: asset.id || seen.get(key)?.id || `asset-${seen.size}`,
      name: asset.name || seen.get(key)?.name || key,
      path: asset.path || seen.get(key)?.path || key,
      active: asset.active !== false
    });
  });

  return [...seen.values()];
}

function getDefaultAdminState() {
  return {
    site: {
      businessName: 'ELEA',
      phone: defaults.phone,
      email: defaults.email,
      whatsapp: defaults.whatsapp,
      instagram: defaults.instagram,
      instagramDisplay: defaults.instagramDisplay,
      footerText: 'Cleaning & Home Organization'
    },
    bookings: [],
    reviews: [],
    ctas: [],
    assets: getDefaultAssetCatalog()
  };
}

function normalizeAdminState(raw) {
  const base = getDefaultAdminState();
  const state = raw && typeof raw === 'object' ? raw : {};
  const normalized = {
    site: { ...base.site, ...(state.site || {}) },
    bookings: Array.isArray(state.bookings) ? state.bookings : base.bookings,
    reviews: Array.isArray(state.reviews) ? state.reviews : base.reviews,
    ctas: Array.isArray(state.ctas) ? state.ctas : base.ctas,
    assets: Array.isArray(state.assets) ? mergeAssetCatalog(state.assets) : base.assets
  };

  const legacyBookingIds = ['booking-001', 'booking-002', 'EL-7NQ2', 'EL-4RJC'];
  const legacyReviewIds = ['review-001', 'review-002'];
  const looksLegacy =
    normalized.bookings.some((booking) => legacyBookingIds.includes(booking.id) || legacyBookingIds.includes(booking.reference)) ||
    normalized.reviews.some((review) => legacyReviewIds.includes(review.id)) ||
    normalized.ctas.some((cta) => cta.id && /^cta-\d+$/.test(cta.id) && (cta.title === 'Autumn Refresh' || cta.title === 'Move-In Reset'));

  return looksLegacy ? base : normalized;
}

function getAdminState() {
  try {
    const raw = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (raw) {
      const parsed = normalizeAdminState(JSON.parse(raw));
      if (JSON.stringify(parsed) !== raw) {
        localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(parsed));
      }
      return parsed;
    }
  } catch (error) {
    console.warn('Unable to read admin state from localStorage', error);
  }

  const initial = getDefaultAdminState();
  localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

function saveAdminState(state) {
  const normalized = normalizeAdminState(state);
  localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}

function applyAdminSiteValues() {
  const state = getAdminState();
  defaults.phone = state.site.phone || defaults.phone;
  defaults.email = state.site.email || defaults.email;
  defaults.whatsapp = state.site.whatsapp || defaults.whatsapp;
  defaults.instagram = state.site.instagram || defaults.instagram;
  defaults.instagramDisplay = state.site.instagramDisplay || defaults.instagramDisplay;
  document.documentElement.style.setProperty('--admin-brand', state.site.businessName || 'ELEA');
}

// Ensure legacy references to older logo files load the new best.png at runtime
document.addEventListener('DOMContentLoaded', function () {
  // Replace img src attributes
  document.querySelectorAll('img').forEach(function (img) {
    const src = img.getAttribute('src');
    if (!src) return;
    if (src && (src.endsWith('assets/logo.jpeg') || src.endsWith('/assets/logo.png') || src.endsWith('/assets/logo.jpeg') || src === 'assets/logo.jpeg' || src === 'assets/logo.png')) {
      img.setAttribute('src', 'assets/best.png');
    }
  });
  // Replace favicon / apple touch icon
  document.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"]').forEach(function (link) {
    const href = link.getAttribute('href');
    if (!href) return;
    if (href && (href.endsWith('assets/logo.jpeg') || href.endsWith('assets/logo.png') || href === 'assets/logo.jpeg' || href === 'assets/logo.png')) link.setAttribute('href', 'assets/best.png');
  });
  // Replace social meta images
  document.querySelectorAll('meta[property="og:image"], meta[name="twitter:image"]').forEach(function (m) {
    const c = m.getAttribute('content');
    if (!c) return;
    if (c && (c.endsWith('assets/logo.jpeg') || c.endsWith('assets/logo.png') || c === 'assets/logo.jpeg' || c === 'assets/logo.png')) m.setAttribute('content', 'assets/best.png');
  });
  // Normalize header/footer logo images site-wide: add `logo-img`, remove inline styles, ensure png source
  try {
    document.querySelectorAll('img.site-logo').forEach(function (img) {
      img.classList.add('logo-img');
      const s = img.getAttribute('src');
      if (s && (s.endsWith('logo.jpeg') || s.endsWith('logo.png'))) img.setAttribute('src', 'assets/best.png');
      // remove inline sizing to allow CSS to control appearance
      img.removeAttribute('style');
    });
  } catch (e) { /* non-fatal */ }
});

const translations = {
  en: {
    nav: { home: 'Home', about: 'About', services: 'Services', transformations: 'Transformations', reviews: 'Reviews', contact: 'Contact', book: 'Book Now' },
    hero: { eyebrow: 'CLEANING & HOME ORGANIZATION', headline: 'A cleaner home. A calmer life.', body: 'Premium cleaning and home organization services designed to make your Berlin home feel fresh, beautiful and effortlessly organized.', cta1: 'Book a Service', cta2: 'WhatsApp Us', manifesto: 'Your home, beautifully cared for.' },
    reasons: {
      eyebrow: 'Why Elea', heading: 'A higher standard of care.', body: 'Elea was founded on the belief that a clean, organized home is the foundation of a calmer life. Every visit is approached with meticulous attention, respect for your space, and a commitment to detail that goes beyond the expected.',
      f1: { title: 'Detail-Focused Service', desc: 'Every corner, every surface, every detail — approached with precision and care.' },
      f2: { title: 'Reliable Scheduling', desc: 'Punctual arrivals and consistent service you can plan your life around.' },
      f3: { title: 'Respectful Professionals', desc: 'Trusted, vetted professionals who treat your home with genuine respect.' },
      f4: { title: 'Customized Cleaning', desc: 'Tailored plans that fit your home, your needs and your lifestyle.' },
      f5: { title: 'Organization Expertise', desc: 'Beyond cleaning — we bring order and intention to every space.' },
      f6: { title: 'Satisfaction-Focused', desc: "If something isn't right, we return within one day to make it right." }
    },
    services: {
      eyebrow: 'Signature Services', heading: 'Curated care for every space.', quote: 'Book Service',
      s1: { title: 'Home Cleaning', desc: 'Comprehensive cleaning of your entire home — bathrooms, kitchen, living spaces and bedrooms, approached with editorial precision.' },
      s2: { title: 'Move-In', desc: 'Begin fresh. A thorough top-to-bottom clean so your new home feels truly yours from the very first day.' },
      s3: { title: 'Move-Out', desc: 'Leave it beautiful. Detailed cleaning to hand over your space in immaculate condition and recover your deposit.' },
      s4: { title: 'After-Renovation', desc: 'Post-construction dust and debris removed with care, revealing the finished beauty of your renewed space.' },
      s5: { title: 'Oven & Appliance', desc: 'Deep restoration of ovens, refrigerators and appliances — degreased, descaled and brought back to gleaming.' },
      s6: { title: 'Scheduled Laundry', desc: 'Washing, folding and care of linens and garments on a schedule that fits seamlessly into your routine.' },
      s7: { title: 'Window Cleaning', desc: "Streak-free clarity for every pane — letting Berlin's light pour into your home unhindered." },
      s8: { title: 'Home Organization', desc: 'Wardrobes, sitting rooms and storage reimagined — systems that bring lasting order and calm to your space.' }
    },
    beforeAfter: {
      eyebrow: 'Transformations', heading: 'Before & After', note: 'Before & After — real Elea project photography showcasing our work.',
      before: 'Before', after: 'After',
      tab1: 'Kitchen', tab2: 'Bathroom', tab3: 'Living Room', tab4: 'Bedroom', tab5: 'Wardrobe', tab6: 'Renovation Cleanup',
      tabs: ['Kitchen', 'Bathroom', 'Living Room', 'Bedroom', 'Wardrobe', 'Renovation Cleanup']
    },
    difference: {
      eyebrow: 'The Elea Difference', heading: "We don't simply clean your home.", subheading: 'We help create a space that feels better to live in.', body: "Elea approaches home care as an act of curation. We don't rush through rooms — we study them. We consider how light moves, how surfaces are used, how order can be restored in a way that lasts. The result is not just a clean home, but a home that feels cared for.", cta: 'Book a Service',
      b1: 'A considered approach to every room, every visit',
      b2: 'Products and methods chosen for your surfaces and your wellbeing',
      b3: 'Organization that brings lasting order, not a temporary fix',
      b4: "A satisfaction guarantee — we return within one day if something isn't right"
    },
    reviews: { eyebrow: 'Reviews', heading: 'What our clients say.', leave: 'Leave a Review', empty: 'No reviews yet.', placeholder: 'Verified client testimonials appear here.', request: 'Request Testimonials' },
    satisfaction: { heading: 'Our Satisfaction Promise', body: 'If you are not fully satisfied with any service, Elea will return within one day to address your concerns — free of charge for minor corrections, or at a fair rate for larger revisions. Your home, and your peace of mind, are our commitment.' },
    contact: { eyebrow: 'Contact', heading: 'Get in touch.', phone: 'Phone', email: 'Email', whatsapp: 'WhatsApp', instagram: 'Instagram' },
    footer: { tagline: 'Cleaning & Home Organization', rights: 'All rights reserved.' },
    legal: { notice: 'Notice: ' },
    booking: {
      title: 'Book a Service',
      steps: ['Service', 'Home', 'Cleaning Type', 'Date', 'Time', 'Details', 'Review'],
      stepLabels: ['01 SERVICE', '02 HOME', '03 CLEANING TYPE', '04 DATE', '05 TIME', '06 DETAILS', '07 REVIEW'],
      next: 'Continue', back: 'Back', submit: 'Request Booking',
      serviceQuestion: 'Which services do you need?', serviceHint: 'Select all that apply.',
      homeQuestion: 'Tell us about your home.', roomsLabel: 'Number of rooms', areasLabel: 'Additional areas',
      typeQuestion: 'What kind of cleaning?',
      dateQuestion: 'When would you like us to visit?',
      timeQuestion: 'What time works best?',
      detailsQuestion: 'Your contact details',
      fullName: 'Full name', phone: 'Phone', email: 'Email', country: 'Country', postcode: 'ZIP code', street: 'Street', location: 'Location', address: 'Address', notes: 'Additional notes',
      countryOptions: [
        { value: 'DE', label: '🇩🇪 Germany (+49)' },
        { value: 'US', label: '🇺🇸 United States (+1)' },
        { value: 'GB', label: '🇬🇧 United Kingdom (+44)' },
        { value: 'KE', label: '🇰🇪 Kenya (+254)' }
      ],
      postcodeOptions: ['10115', '10117', '10119', '10178', '10243', '10435', '10437', '10439', '10551', '10557', '10629', '10777', '10779', '10961', '10963', '12043', '12045', '12047', '12099', '12157', '12163', '12203', '12247', '12347', '12435', '12459', '12487', '13347', '13349', '13581', '13585', '13589', '14193', '14199', '14305', '14309'],
      streetOptions: ['Friedrichstraße', 'Schönhauser Allee', 'Bergmannstraße', 'Kottbusser Damm', 'Müllerstraße', 'Torstraße', 'Potsdamer Straße', 'Oranienburger Straße', 'Hauptstraße', 'Kaiserstraße', 'Prenzlauer Allee', 'Frankfurter Allee', 'Other'],
      locationOptions: ['Berlin Mitte', 'Berlin Neukölln', 'Berlin Prenzlauer Berg', 'Berlin Friedrichshain', 'Berlin Charlottenburg', 'Berlin Kreuzberg', 'Berlin Tempelhof', 'Berlin Schöneberg', 'Berlin Pankow', 'Berlin Other'],
      reviewQuestion: 'Review your request',
      successTitle: 'Request Received', successBody: 'Your booking request has been received. Elea will contact you via WhatsApp or email to confirm availability and final details.', referenceLabel: 'Your booking reference', whatsappBtn: 'Send via WhatsApp', emailBtn: 'Send via Email', closeBtn: 'Close',
      required: 'This field is required', selectService: 'Please select at least one service', selectRooms: 'Please select the number of rooms', selectDate: 'Please select a date', selectTime: 'Please select a time',
      rooms: ['1', '2', '3', '4', '5', '6+'],
      areas: ['Kitchen', 'Bathroom', 'Bedroom', 'Living room', 'Windows', 'Oven', 'Appliances', 'Wardrobe', 'Other'],
      times: ['08:00', '10:00', '12:00', '14:00', '16:00'],
      types: [
        { name: 'Regular Cleaning', desc: 'Routine maintenance cleaning to keep your home consistently fresh.' },
        { name: 'Deep Cleaning', desc: 'A thorough, detailed clean reaching every surface and corner.' }
      ]
    },
    about: { eyebrow: 'About Elea', heading: 'Founded on care and detail.', body1: 'Elea was founded by Joan Kayaga in Berlin with a simple conviction: that a clean, organized home is the foundation of a calmer, more intentional life.', body2: 'What began as a commitment to meticulous, respectful home care has grown into a full-service home organization brand — one that treats every home as a space worthy of genuine attention. From routine cleaning to complete wardrobe transformations, Elea approaches each visit with the same editorial standard: nothing overlooked, nothing rushed.', body3: 'We believe home care is not a transaction but a relationship. We learn your space, respect your routines, and return with consistency — so your home always feels cared for, never just cleaned.', founderRole: 'Founder of Elea', valuesHeading: 'What guides us' },
    terms: {
      eyebrow: 'Legal',
      title: 'Terms & Conditions',
      s1: { title: '1. Scope of Services', body: 'ELEA provides residential cleaning and home organization services in Berlin. The scope of each appointment is confirmed during the inquiry and booking conversation.' },
      s2: { title: '2. Client Responsibilities', body: 'Clients are responsible for providing access to the property and ensuring safe and reasonable conditions for the team to work.' },
      s3: { title: '3. Payment', body: 'Services are billed according to the agreed scope and time. Additional work beyond the original arrangement may be quoted separately.' },
      s4: { title: '4. Cancellations', body: 'Cancellations and rescheduling must be communicated promptly. Standard policies apply in line with ELEA’s booking terms.' }
    },
    cancellation: {
      eyebrow: 'Legal',
      title: 'Booking & Cancellation',
      s1: { title: 'Booking Process', body: 'To book an ELEA service, you may contact us via phone, email, WhatsApp or the booking form on this website. We confirm availability and service details before the appointment is finalized.' },
      s2: { title: 'Cancellation Policy', body: 'We understand schedules change. If you need to cancel or reschedule your booking, please contact us as soon as possible. We will do our best to accommodate a new time slot.' },
      s3: { title: 'Late Arrivals', body: 'Late arrivals may affect the appointment duration and therefore the service completion time. We appreciate your understanding and will communicate any changes as clearly as possible.' }
    },
    impressum: {
      eyebrow: 'Legal',
      title: 'Imprint',
      s1: { title: 'Provider Information', body: 'Elea Cleaning & Home Organization\nJoan Kayaga\n[Street Address]\n[Postal Code] Berlin\nGermany' },
      s2: { title: 'Contact', body: 'Phone: +49 152 16019843\nEmail: eleacleaning@gmail.com' },
      s3: { title: 'VAT ID', body: 'VAT identification number according to §27a VAT Act: [To be provided]' },
      s4: { title: 'Responsible for content', body: 'Joan Kayaga\neleacleaning@gmail.com' }
    },
    datenschutz: {
      eyebrow: 'Legal',
      title: 'Privacy Policy',
      s1: { title: '1. Privacy at a glance', body: 'Protecting your personal data is important to us. This privacy policy informs you about the collection, processing and use of your data when using our website and services.' },
      s2: { title: '2. Controller', body: 'Controller for data processing: Elea Cleaning & Home Organization, Joan Kayaga, eleacleaning@gmail.com' },
      s3: { title: '3. Data Collection', body: 'We collect data you provide in booking inquiries, including name, contact details and information about your home. This data is used only to process your request.' },
      s4: { title: '4. Your rights', body: 'You have the right to access, rectify, erase and restrict processing of your personal data.' }
    },
    legalPages: { impressum: 'Impressum', datenschutz: 'Datenschutzerklärung', terms: 'Terms & Conditions', cancellation: 'Booking & Cancellation' },
    auth: { login: { title: 'Welcome back', subtitle: 'Log in to your account', footer: 'Don\'t have an account?', create: 'Create one', or: 'or', g: 'Continue with Google', email: 'Email', password: 'Password', forgot: 'Forgot password?', submitLabel: 'Log in', loading: 'Logging in...' }, register: { title: 'Create your account', subtitle: 'Sign up to get started', footer: 'Already have an account?', login: 'Log in', or: 'or', g: 'Continue with Google', email: 'Email', password: 'Password', confirm: 'Confirm Password', submitLabel: 'Create account', loading: 'Creating account...' }, verify: { title: 'Verify your email', subtitle: 'We sent a code to', resend: 'Resend', verify: 'Verify', verifying: 'Verifying...' }, forgot: { title: 'Forgot your password?', subtitle: 'We\'ll send a reset link to your email', submit: 'Send reset link', email: 'Email', success: 'If an account exists for that email, we\'ve sent a reset link.' }, reset: { title: 'Reset your password', subtitle: 'Choose a new password', new: 'New password', confirm: 'Confirm password', submit: 'Reset password' } },
    admin: { bookings: 'Bookings', reviews: 'Reviews', settings: 'Settings' },
    common: { continue: 'Continue', back: 'Back', save: 'Save', close: 'Close' }
  },
  de: {
    nav: { home: 'Startseite', about: 'Über uns', services: 'Leistungen', transformations: 'Verwandlungen', reviews: 'Bewertungen', contact: 'Kontakt', book: 'Jetzt buchen' },
    hero: { eyebrow: 'REINIGUNG & HAUSORGANISATION', headline: 'Ein sauberer Ort. Ein ruhigeres Leben.', body: 'Premium-Reinigungs- und Hausorganisationsdienste, die Ihr Berliner Zuhause frisch, schön und mühelos organisiert wirken lassen.', cta1: 'Service buchen', cta2: 'WhatsApp schreiben', manifesto: 'Ihr Zuhause, liebevoll betreut.' },
    reasons: {
      eyebrow: 'Warum Elea', heading: 'Ein höherer Standard an Pflege.', body: 'Elea wurde aus der Überzeugung gegründet, dass ein sauberes, organisiertes Zuhause die Grundlage eines ruhigeren Lebens ist. Jeder Besuch erfolgt mit sorgfältiger Aufmerksamkeit, Respekt vor Ihrem Raum und einem Engagement für Details, das über das Erwartete hinausgeht.',
      f1: { title: 'Detailorientierter Service', desc: 'Jede Ecke, jede Oberfläche, jedes Detail — mit Präzision und Sorgfalt behandelt.' },
      f2: { title: 'Zuverlässige Terminplanung', desc: 'Pünktliche Ankunft und konstanter Service, auf den Sie sich verlassen können.' },
      f3: { title: 'Respektvolle Profis', desc: 'Vertrauenswürdige, geprüfte Fachkräfte, die Ihr Zuhause mit echtem Respekt behandeln.' },
      f4: { title: 'Maßgeschneiderte Reinigung', desc: 'Individuelle Pläne, die zu Ihrem Zuhause, Ihren Bedürfnissen und Ihrem Lebensstil passen.' },
      f5: { title: 'Organisationsexpertise', desc: 'Mehr als Reinigung — wir bringen Ordnung und Absicht in jeden Raum.' },
      f6: { title: 'Zufriedenheitsorientiert', desc: 'Wenn etwas nicht stimmt, kommen wir innerhalb eines Tages zurück, um es zu korrigieren.' }
    },
    services: {
      eyebrow: 'Signature-Leistungen', heading: 'Kuratierte Pflege für jeden Raum.', quote: 'Service buchen',
      s1: { title: 'Hausreinigung', desc: 'Umfassende Reinigung Ihres gesamten Zuhauses — Badezimmer, Küche, Wohnräume und Schlafzimmer, mit redaktioneller Präzision.' },
      s2: { title: 'Einzug', desc: 'Frisch beginnen. Eine gründliche Reinigung von oben bis unten, damit sich Ihr neues Zuhause vom ersten Tag an wirklich als Ihres anfühlt.' },
      s3: { title: 'Auszug', desc: 'Hinterlassen Sie es makellos. Detaillierte Reinigung zur Übergabe Ihres Raums in einwandfreiem Zustand und zur Sicherung Ihrer Kaution.' },
      s4: { title: 'Nach der Renovierung', desc: 'Staub und Schutt nach dem Umbau sorgfältig entfernt — für die volle Schönheit Ihres erneuerten Raums.' },
      s5: { title: 'Ofen & Geräte', desc: 'Tiefenreinigung von Öfen, Kühlschränken und Geräten — entfettet, entkalkt und wieder zum Glänzen gebracht.' },
      s6: { title: 'Geplante Wäsche', desc: 'Waschen, Falten und Pflege von Wäsche und Kleidung nach einem Zeitplan, der sich nahtlos in Ihren Alltag einfügt.' },
      s7: { title: 'Fensterreinigung', desc: 'Streifenfreie Klarheit für jede Scheibe — damit Berlins Licht ungehindert in Ihr Zuhause fällt.' },
      s8: { title: 'Hausorganisation', desc: 'Kleiderschränke, Wohnräume und Stauraum neu gedacht — Systeme, die dauerhafte Ordnung und Ruhe in Ihren Raum bringen.' }
    },
    beforeAfter: {
      eyebrow: 'Verwandlungen', heading: 'Vor & Nachher', note: 'Vor & Nachher — echte Elea-Projektfotografie, die unsere Arbeit zeigt.',
      before: 'Vorher', after: 'Nachher',
      tab1: 'Küche', tab2: 'Badezimmer', tab3: 'Wohnzimmer', tab4: 'Schlafzimmer', tab5: 'Kleiderschrank', tab6: 'Renovierung',
      tabs: ['Küche', 'Badezimmer', 'Wohnzimmer', 'Schlafzimmer', 'Kleiderschrank', 'Renovierung']
    },
    difference: {
      eyebrow: 'Der Elea-Unterschied', heading: 'Wir reinigen Ihr Zuhause nicht einfach.', subheading: 'Wir schaffen einen Raum, in dem es sich besser leben lässt.', body: 'Elea betrachtet Hauspflege als Akt der Kuratierung. Wir hetzen nicht durch Räume — wir studieren sie. Wir beachten, wie Licht fällt, wie Oberflächen genutzt werden, wie Ordnung dauerhaft wiederhergestellt werden kann. Das Ergebnis ist nicht nur ein sauberes Zuhause, sondern ein Zuhause, das sich betreut anfühlt.', cta: 'Service buchen',
      b1: 'Ein durchdachter Ansatz für jeden Raum, bei jedem Besuch',
      b2: 'Produkte und Methoden, gewählt für Ihre Oberflächen und Ihr Wohlbefinden',
      b3: 'Organisation, die dauerhafte Ordnung schafft — keine kurzfristige Lösung',
      b4: 'Eine Zufriedenheitsgarantie — wir kommen innerhalb eines Tages zurück, wenn etwas nicht stimmt'
    },
    reviews: { eyebrow: 'Bewertungen', heading: 'Was unsere Kunden sagen.', leave: 'Bewertung abgeben', empty: 'Noch keine Bewertungen.', placeholder: 'Verifizierte Kundenbewertungen erscheinen hier.', request: 'Erfahrungsberichte anfragen' },
    satisfaction: { heading: 'Unsere Zufriedenheitsgarantie', body: 'Wenn Sie mit einer Leistung nicht vollständig zufrieden sind, kommt Elea innerhalb eines Tages zurück, um Ihre Anliegen zu klären — kostenlos für kleinere Korrekturen oder zu einem fairen Preis für größere Überarbeitungen. Ihr Zuhause und Ihre Ruhe sind unser Versprechen.' },
    contact: { eyebrow: 'Kontakt', heading: 'Treten Sie in Kontakt.', phone: 'Telefon', email: 'E-Mail', whatsapp: 'WhatsApp', instagram: 'Instagram' },
    footer: { tagline: 'Reinigung & Hausorganisation', rights: 'Alle Rechte vorbehalten.' },
    legal: { notice: 'Hinweis: ' },
    booking: {
      title: 'Service buchen',
      steps: ['Leistung', 'Zuhause', 'Reinigungsart', 'Datum', 'Zeit', 'Details', 'Überprüfung'],
      stepLabels: ['01 LEISTUNG', '02 ZUHAUSE', '03 REINIGUNGSART', '04 DATUM', '05 ZEIT', '06 DETAILS', '07 ÜBERPRÜFUNG'],
      next: 'Weiter', back: 'Zurück', submit: 'Buchung anfragen',
      serviceQuestion: 'Welche Leistungen benötigen Sie?', serviceHint: 'Alle zutreffenden auswählen.',
      homeQuestion: 'Erzählen Sie uns von Ihrem Zuhause.', roomsLabel: 'Anzahl der Räume', areasLabel: 'Zusätzliche Bereiche',
      typeQuestion: 'Welche Art der Reinigung?',
      dateQuestion: 'Wann sollen wir kommen?',
      timeQuestion: 'Welche Zeit passt am besten?',
      detailsQuestion: 'Ihre Kontaktdaten',
      fullName: 'Vollständiger Name', phone: 'Telefon', email: 'E-Mail', country: 'Land', postcode: 'ZIP-Code', street: 'Straße', location: 'Standort', address: 'Adresse', notes: 'Zusätzliche Notizen',
      countryOptions: [
        { value: 'DE', label: '🇩🇪 Deutschland (+49)' },
        { value: 'US', label: '🇺🇸 Vereinigte Staaten (+1)' },
        { value: 'GB', label: '🇬🇧 Vereinigtes Königreich (+44)' },
        { value: 'KE', label: '🇰🇪 Kenia (+254)' }
      ],
      postcodeOptions: ['10115', '10117', '10119', '10178', '10243', '10435', '10437', '10439', '10551', '10557', '10629', '10777', '10779', '10961', '10963', '12043', '12045', '12047', '12099', '12157', '12163', '12203', '12247', '12347', '12435', '12459', '12487', '13347', '13349', '13581', '13585', '13589', '14193', '14199', '14305', '14309'],
      streetOptions: ['Friedrichstraße', 'Schönhauser Allee', 'Bergmannstraße', 'Kottbusser Damm', 'Müllerstraße', 'Torstraße', 'Potsdamer Straße', 'Oranienburger Straße', 'Hauptstraße', 'Kaiserstraße', 'Prenzlauer Allee', 'Frankfurter Allee', 'Andere'],
      locationOptions: ['Berlin Mitte', 'Berlin Neukölln', 'Berlin Prenzlauer Berg', 'Berlin Friedrichshain', 'Berlin Charlottenburg', 'Berlin Kreuzberg', 'Berlin Tempelhof', 'Berlin Schöneberg', 'Berlin Pankow', 'Berlin Andere'],
      reviewQuestion: 'Überprüfen Sie Ihre Anfrage',
      successTitle: 'Anfrage eingegangen', successBody: 'Ihre Buchungsanfrage ist eingegangen. Elea wird Sie per WhatsApp oder E-Mail kontaktieren, um Verfügbarkeit und Details zu bestätigen.', referenceLabel: 'Ihre Buchungsreferenz', whatsappBtn: 'Per WhatsApp senden', emailBtn: 'Per E-Mail senden', closeBtn: 'Schließen',
      required: 'Dieses Feld ist erforderlich', selectService: 'Bitte wählen Sie mindestens eine Leistung', selectRooms: 'Bitte wählen Sie die Anzahl der Räume', selectDate: 'Bitte wählen Sie ein Datum', selectTime: 'Bitte wählen Sie eine Zeit',
      rooms: ['1', '2', '3', '4', '5', '6+'],
      areas: ['Küche', 'Badezimmer', 'Schlafzimmer', 'Wohnzimmer', 'Fenster', 'Ofen', 'Geräte', 'Kleiderschrank', 'Andere'],
      times: ['08:00', '10:00', '12:00', '14:00', '16:00'],
      types: [
        { name: 'Regular Cleaning', desc: 'Regelmäßige Unterhaltsreinigung für ein konstant frisches Zuhause.' },
        { name: 'Deep Cleaning', desc: 'Eine gründliche, detaillierte Reinigung jeder Oberfläche und Ecke.' }
      ]
    },
    about: { eyebrow: 'Über Elea', heading: 'Gegründet auf Pflege und Detail.', body1: 'Elea wurde von Joan Kayaga in Berlin mit einer einfachen Überzeugung gegründet: dass ein sauberes, organisiertes Zuhause die Grundlage eines ruhigeren, bewussteren Lebens ist.', body2: 'Was als Engagement für sorgfältige, respektvolle Hauspflege begann, ist zu einer Vollservice-Hausorganisationsmarke herangewachsen — die jedes Zuhause als einen Raum behandelt, der echter Aufmerksamkeit würdig ist.', body3: 'Wir glauben, dass Hauspflege keine Transaktion ist, sondern eine Beziehung. Wir lernen Ihren Raum kennen, respektieren Ihre Routinen und kehren beständig zurück — damit Ihr Zuhause sich immer betreut anfühlt, nie nur gereinigt.', founderRole: 'Gründerin von Elea', valuesHeading: 'Was uns leitet' },
    terms: {
      eyebrow: 'Rechtliches',
      title: 'AGB',
      s1: { title: '1. Leistungsumfang', body: 'ELEA erbringt wohnwirtschaftliche Reinigungs- und Hausorganisationsleistungen in Berlin. Der Umfang jedes Termins wird im Rahmen der Anfrage und Buchung abgestimmt.' },
      s2: { title: '2. Pflichten der Kundin / des Kunden', body: 'Kundinnen und Kunden sind dafür verantwortlich, Zugang zur Immobilie zu ermöglichen und sichere sowie zumutbare Arbeitsbedingungen zu gewährleisten.' },
      s3: { title: '3. Zahlung', body: 'Leistungen werden nach vereinbartem Umfang und Zeitaufwand abgerechnet. Zusätzliche Arbeiten können gesondert berechnet werden.' },
      s4: { title: '4. Stornierung', body: 'Stornierungen und Terminänderungen sind zeitnah mitzuteilen. Es gelten die in den Buchungsbedingungen genannten Regelungen.' }
    },
    cancellation: {
      eyebrow: 'Rechtliches',
      title: 'Buchung & Stornierung',
      s1: { title: 'Buchungsprozess', body: 'Um einen ELEA-Service zu buchen, können Sie uns telefonisch, per E-Mail, WhatsApp oder über das Buchungsformular auf dieser Website kontaktieren. Wir bestätigen Verfügbarkeit und Leistungsdetails, bevor der Termin finalisiert wird.' },
      s2: { title: 'Stornierungsbedingungen', body: 'Wir verstehen, dass sich Pläne ändern können. Wenn Sie eine Buchung stornieren oder verschieben müssen, kontaktieren Sie uns bitte so bald wie möglich. Wir bemühen uns, einen neuen Termin zu ermöglichen.' },
      s3: { title: 'Verspätete Ankunft', body: 'Verspätete Ankünfte können die Dauer des Termins und damit die Fertigstellung der Leistung beeinträchtigen. Wir danken für Ihr Verständnis und werden Änderungen klar kommunizieren.' }
    },
    impressum: {
      eyebrow: 'Rechtliches',
      title: 'Impressum',
      s1: { title: 'Angaben gemäß § 5 TMG', body: 'Elea Cleaning & Home Organization\nJoan Kayaga\n[Strasse und Hausnummer]\n[PLZ] Berlin\nDeutschland' },
      s2: { title: 'Kontakt', body: 'Telefon: +49 152 16019843\nE-Mail: eleacleaning@gmail.com' },
      s3: { title: 'Umsatzsteuer-ID', body: 'Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz: [wird noch bereitgestellt]' },
      s4: { title: 'Verantwortlich für den Inhalt', body: 'Joan Kayaga\neleacleaning@gmail.com' }
    },
    datenschutz: {
      eyebrow: 'Rechtliches',
      title: 'Datenschutzerklärung',
      s1: { title: '1. Datenschutz auf einen Blick', body: 'Der Schutz Ihrer persönlichen Daten ist uns wichtig. Diese Datenschutzerklärung informiert Sie über die Erhebung, Verarbeitung und Nutzung Ihrer Daten bei der Nutzung unserer Website und Dienste.' },
      s2: { title: '2. Verantwortliche Stelle', body: 'Verantwortlich für die Datenverarbeitung: Elea Cleaning & Home Organization, Joan Kayaga, eleacleaning@gmail.com' },
      s3: { title: '3. Datenerhebung', body: 'Wir erheben Daten, die Sie uns im Rahmen einer Buchungsanfrage zur Verfügung stellen, einschließlich Name, Kontaktdaten und Angaben zu Ihrer Wohnung. Diese Daten werden ausschließlich zur Bearbeitung Ihrer Anfrage verwendet.' },
      s4: { title: '4. Ihre Rechte', body: 'Sie haben das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung Ihrer personenbezogenen Daten.' }
    },
    legalPages: { impressum: 'Impressum', datenschutz: 'Datenschutz', terms: 'AGB', cancellation: 'Buchung & Stornierung' },
    auth: { login: { title: 'Willkommen zurück', subtitle: 'Melden Sie sich bei Ihrem Konto an', footer: 'Sie haben noch kein Konto?', create: 'Erstellen Sie eines', or: 'oder', g: 'Mit Google fortfahren', email: 'E-Mail', password: 'Passwort', forgot: 'Passwort vergessen?', submitLabel: 'Anmelden', loading: 'Anmeldung...' }, register: { title: 'Konto erstellen', subtitle: 'Registrieren Sie sich, um loszulegen', footer: 'Sie haben bereits ein Konto?', login: 'Anmelden', or: 'oder', g: 'Mit Google fortfahren', email: 'E-Mail', password: 'Passwort', confirm: 'Passwort bestätigen', submitLabel: 'Konto erstellen', loading: 'Erstellen...' }, verify: { title: 'E-Mail verifizieren', subtitle: 'Wir haben einen Code an', resend: 'Erneut senden', verify: 'Verifizieren', verifying: 'Verifizieren...' }, forgot: { title: 'Passwort vergessen?', subtitle: 'Wir senden Ihnen einen Link zum Zurücksetzen', submit: 'Link senden', email: 'E-Mail', success: 'Wenn ein Konto für diese E-Mail existiert, haben wir einen Link zum Zurücksetzen gesendet.' }, reset: { title: 'Passwort zurücksetzen', subtitle: 'Wählen Sie ein neues Passwort', new: 'Neues Passwort', confirm: 'Passwort bestätigen', submit: 'Passwort zurücksetzen' } },
    admin: { bookings: 'Buchungen', reviews: 'Bewertungen', settings: 'Einstellungen' },
    common: { continue: 'Weiter', back: 'Zurück', save: 'Speichern', close: 'Schließen' }
  }
};

const serviceData = [
  { key: 'Home Cleaning', titleKey: 'services.s1.title', title: 'Home Cleaning', desc: 'Comprehensive cleaning of your entire home — bathrooms, kitchen, living spaces and bedrooms, approached with editorial precision.' },
  { key: 'Move-In', titleKey: 'services.s2.title', title: 'Move-In', desc: 'Begin fresh. A thorough top-to-bottom clean so your new home feels truly yours from the very first day.' },
  { key: 'Move-Out', titleKey: 'services.s3.title', title: 'Move-Out', desc: 'Leave it beautiful. Detailed cleaning to hand over your space in immaculate condition and recover your deposit.' },
  { key: 'After-Renovation', titleKey: 'services.s4.title', title: 'After-Renovation', desc: 'Post-construction dust and debris removed with care, revealing the finished beauty of your renewed space.' },
  { key: 'Oven & Appliance', titleKey: 'services.s5.title', title: 'Oven & Appliance', desc: 'Deep restoration of ovens, refrigerators and appliances — degreased, descaled and brought back to gleaming.' },
  { key: 'Scheduled Laundry', titleKey: 'services.s6.title', title: 'Scheduled Laundry', desc: 'Washing, folding and care of linens and garments on a schedule that fits seamlessly into your routine.' },
  { key: 'Window Cleaning', titleKey: 'services.s7.title', title: 'Window Cleaning', desc: 'Streak-free clarity for every pane — letting Berlin\'s light pour into your home unhindered.' },
  { key: 'Home Organization', titleKey: 'services.s8.title', title: 'Home Organization', desc: 'Wardrobes, sitting rooms and storage reimagined — systems that bring lasting order and calm to your space.' }
];

const countryOptions = [
  { code: 'DE', flag: '🇩🇪', name: 'Germany', dialCode: '+49', zipCodes: ['10115', '10117', '10119', '10178', '10243', '10435', '10437', '10439', '10551', '10557', '10629', '10777', '10779', '10961', '10963', '12043', '12045', '12047', '12099', '12157', '12163', '12203', '12247', '12347', '12435', '12459', '12487', '13347', '13349', '13581', '13585', '13589', '14193', '14199', '14305', '14309'] },
  { code: 'US', flag: '🇺🇸', name: 'United States', dialCode: '+1', zipCodes: ['10001', '10002', '10003', '10009', '10016', '10022', '10036', '11201', '30303', '94105', '60601', '90210'] },
  { code: 'GB', flag: '🇬🇧', name: 'United Kingdom', dialCode: '+44', zipCodes: ['SW1A 1AA', 'EC1A 1BB', 'M1 1AE', 'B1 1AA', 'W1A 1AA', 'EH1 1AA', 'LS1 1AA'] },
  { code: 'KE', flag: '🇰🇪', name: 'Kenya', dialCode: '+254', zipCodes: ['00100', '00200', '00500', '01000', '02000', '10000', '40000'] }
];

function getCountryByCode(code) {
  return countryOptions.find((country) => country.code === code) || countryOptions[0];
}

function getZipCodeOptions(code) {
  return getCountryByCode(code).zipCodes;
}

const pageLanguageMap = {
  home: 'en', about: 'en', services: 'en', contact: 'en', impressum: 'de', datenschutz: 'de', terms: 'en', cancellation: 'en', login: 'en', register: 'en', forgot: 'en', reset: 'en', admin: 'en'
};

function getLang() {
  return localStorage.getItem('elea-lang') || 'en';
}

function setLang(lang) {
  localStorage.setItem('elea-lang', lang);
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-lang-toggle]').forEach((btn) => {
    const isActive = btn.dataset.langToggle === lang;
    btn.classList.toggle('active', isActive);
  });
  applyTranslations();
  // If there's a page-specific title translation, update document.title
  try {
    const pageId = getPageId();
    const titleKey = `${pageId}.title`;
    const headlineKey = `${pageId}.headline`;
    if (hasTranslation(titleKey, lang)) {
      document.title = t(titleKey);
    } else if (hasTranslation(headlineKey, lang)) {
      document.title = t(headlineKey);
    }
  } catch (e) { /* non-fatal */ }
}

function getPageId() {
  // derive a short page id from the filename (e.g. cancellation.html -> cancellation)
  try {
    const path = window.location.pathname || '';
    const parts = path.split('/').filter(Boolean);
    const file = parts.length ? parts[parts.length - 1] : 'index.html';
    return file.replace(/\.html?$/i, '') || 'index';
  } catch (e) { return 'index'; }
}

function hasTranslation(key, lang) {
  lang = lang || getLang();
  const parts = key.split('.');
  let node = translations[lang];
  for (const p of parts) {
    if (!node || typeof node !== 'object' || !(p in node)) return false;
    node = node[p];
  }
  return typeof node === 'string' || typeof node === 'number';
}

function t(key) {
  const lang = getLang();
  const parts = key.split('.');
  let val = translations[lang];
  for (const part of parts) {
    val = val && val[part];
  }
  return val || key;
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    el.textContent = t(key);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  document.querySelectorAll('[data-i18n-href]').forEach((el) => {
    const key = el.dataset.i18nHref;
    el.href = t(key);
  });
  // HTML content (allowing simple markup in translations)
  document.querySelectorAll('[data-i18n-html]').forEach((el) => {
    const key = el.dataset.i18nHtml;
    el.innerHTML = t(key);
  });
  // title attribute
  document.querySelectorAll('[data-i18n-title]').forEach((el) => {
    const key = el.dataset.i18nTitle;
    el.title = t(key);
  });
  // alt attribute for images
  document.querySelectorAll('[data-i18n-alt]').forEach((el) => {
    const key = el.dataset.i18nAlt;
    el.alt = t(key);
  });
  // aria-label attribute
  document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
    const key = el.dataset.i18nAria;
    el.setAttribute('aria-label', t(key));
  });
  // value (inputs/buttons)
  document.querySelectorAll('[data-i18n-value]').forEach((el) => {
    const key = el.dataset.i18nValue;
    el.value = t(key);
  });
  // src (images / media)
  document.querySelectorAll('[data-i18n-src]').forEach((el) => {
    const key = el.dataset.i18nSrc;
    el.src = t(key);
  });
  document.querySelectorAll('[data-lang-toggle]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.langToggle === getLang());
  });
  // Booking modal / review modal re-render on language change so injected markup translates too
  const modal = document.getElementById('booking-modal');
  if (modal && modal.classList.contains('open') && modal.bookingState) {
    renderBookingModal();
  }

  // Update footer services list (keep an internal service key for booking behavior)
  try {
    const footerServices = document.querySelectorAll('.footer-services-list a');
    if (footerServices && serviceData && serviceData.length) {
      footerServices.forEach((link, idx) => {
        const svc = serviceData[idx];
        if (svc) {
          // store canonical service key so booking modal can open the correct English key
          link.dataset.serviceKey = svc.key;
          // set translated label
          if (svc.titleKey) link.textContent = t(svc.titleKey);
        }
      });
    }
    const fsTitle = document.querySelector('.footer-services .footer-services-title');
    if (fsTitle) fsTitle.textContent = t('services.eyebrow') || fsTitle.textContent;
  } catch (e) { /* non-fatal */ }
}

function initNavbar() {
  const nav = document.querySelectorAll('.desktop-nav a');
  nav.forEach((link) => {
    if (link.dataset.href) {
      link.href = link.dataset.href;
    }
  });

  document.querySelectorAll('.lang-toggle-btn').forEach((btn) => {
    btn.addEventListener('click', () => setLang(btn.dataset.langToggle));
  });

  document.querySelectorAll('.navbar-book, [data-book-btn]').forEach((button) => {
    button.addEventListener('click', () => openBookingModal());
  });

  const mobileToggle = document.querySelector('[data-mobile-toggle]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');
  const closeBtn = document.querySelector('[data-mobile-close]');
  const closeMobileMenu = () => {
    mobileMenu?.classList.remove('is-open');
    document.body.classList.remove('menu-open');
  };

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = !mobileMenu.classList.contains('is-open');
      mobileMenu.classList.toggle('is-open', isOpen);
      document.body.classList.toggle('menu-open', isOpen);
    });
  }
  if (closeBtn && mobileMenu) {
    closeBtn.addEventListener('click', closeMobileMenu);
  }
  mobileMenu?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMobileMenu);
  });

  window.addEventListener('scroll', () => {
    document.querySelector('.navbar')?.classList.toggle('scrolled', window.scrollY > 20);
  });
}

function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -20px 0px' });
  document.querySelectorAll('.scroll-reveal').forEach((el) => observer.observe(el));
}

function initServiceButtons() {
  // Prefer direct binding, but use delegated handler as a fallback
  document.querySelectorAll('[data-service]').forEach((button) => {
    button.addEventListener('click', () => {
      openBookingModal(button.dataset.service);
    });
  });
  // Delegated handler ensures dynamically replaced DOM still responds
  document.addEventListener('click', (e) => {
    const card = e.target.closest && e.target.closest('[data-service]');
    if (card && card.dataset && card.dataset.service) {
      openBookingModal(card.dataset.service);
    }
  });
  // Footer service links should open booking modal directly
  document.querySelectorAll('.footer-services-list a').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const svc = link.dataset.serviceKey || link.textContent.trim();
      openBookingModal(svc);
    });
  });
}

function initBeforeAfterTabs() {
  const tabs = document.querySelectorAll('[data-tab]');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.toggle('active', t === tab));
      const before = document.querySelectorAll('.before-after-box.before img')[0];
      const after = document.querySelectorAll('.before-after-box.after img')[0];
      const map = {
        Kitchen: 'assets/images/kitchen.png',
        Bathroom: 'assets/images/bathroom.png',
        'Living Room': 'assets/images/living.png',
        Bedroom: 'assets/images/bedroom.png',
        Wardrobe: 'assets/images/wardrobe.png',
        'Renovation Cleanup': 'assets/images/afterReno.png'
      };
      const activeKey = tab.dataset.tab;
      const image = map[activeKey] || map.Kitchen;
      if (before) before.src = image;
      if (after) after.src = image;
    });
  });
}

function initReviewModal() {
  const trigger = document.querySelector('[data-review-trigger]');
  const modal = document.getElementById('review-modal');
  const close = document.getElementById('review-close');
  const form = document.getElementById('review-form');
  const thanks = document.getElementById('review-thanks');
  const stars = [...document.querySelectorAll('[data-rating-star]')];
  let rating = 5;

  if (!modal) return;

  const open = () => {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    form.classList.remove('hidden');
    thanks.classList.add('hidden');
  };
  const closeModal = () => {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  };

  trigger?.addEventListener('click', open);
  close?.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  stars.forEach((button) => {
    button.addEventListener('click', () => {
      rating = Number(button.dataset.ratingStar);
      stars.forEach((star) => star.classList.toggle('active', Number(star.dataset.ratingStar) <= rating));
    });
  });

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('review-name');
    const service = document.getElementById('review-service');
    const review = document.getElementById('review-text');
    if (!name.value.trim() || !review.value.trim()) return;

    const state = getAdminState();
    state.reviews.unshift({
      id: `review-${Date.now()}`,
      name: name.value.trim(),
      service: service.value.trim() || 'General Service',
      rating,
      text: review.value.trim(),
      status: 'pending'
    });
    saveAdminState(state);

    form.classList.add('hidden');
    thanks.classList.remove('hidden');
    renderHomepageContent();
    if (document.body.dataset.adminTab === 'reviews') {
      renderAdminDashboard();
    }
  });
}

function openBookingModal(serviceName = '') {
  const modal = document.getElementById('booking-modal');
  if (!modal) return;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  const state = {
    step: 0,
    serviceOptions: serviceData.map(item => item.key),
    selectedServices: serviceName ? [serviceName] : [],
    rooms: '',
    areas: [],
    cleaningType: '',
    date: '',
    time: '',
    details: { fullName: '', phone: '', email: '', street: '', location: '', address: '', notes: '' },
    errors: {},
    success: false,
    reference: ''
  };

  modal.bookingState = state;
  renderBookingModal();
}

function closeBookingModal() {
  const modal = document.getElementById('booking-modal');
  if (!modal) return;
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

function renderBookingModal() {
  const modal = document.getElementById('booking-modal');
  if (!modal || !modal.bookingState) return;
  const state = modal.bookingState;
  if (state.success) {
    modal.innerHTML = `
      <div class="booking-progress"><div class="booking-progress-fill" style="width:100%"></div></div>
      <header class="booking-header">
        <div class="elea-container booking-header-inner">
          <div class="booking-title">${t('booking.successTitle')}</div>
          <button class="booking-close" data-booking-close aria-label="Close"><i data-lucide="x"></i></button>
        </div>
      </header>
      <div class="elea-container booking-body">
        <div class="booking-success">
          <div class="success-icon"><i data-lucide="check"></i></div>
          <h2 class="elea-heading">${t('booking.successTitle')}</h2>
          <p class="elea-body mt-4">${t('booking.successBody')}</p>
          <div class="success-reference-box">
            <div class="eyebrow">${t('booking.referenceLabel')}</div>
            <div class="success-reference">${state.reference}</div>
          </div>
          <div class="success-actions">
            <a class="elea-button-primary" href="https://wa.me/${defaults.whatsappNumber}?text=${encodeURIComponent(buildWhatsAppMessage(state))}" target="_blank" rel="noreferrer"><i data-lucide="message-circle"></i> ${t('booking.whatsappBtn')}</a>
            <a class="elea-button-outline" href="mailto:${defaults.email}?subject=${encodeURIComponent(`Elea booking ${state.reference}`)}&body=${encodeURIComponent(buildEmailBody(state))}" target="_blank"><i data-lucide="mail"></i> ${t('booking.emailBtn')}</a>
          </div>
          <button class="success-close" data-booking-close>${t('booking.closeBtn')}</button>
        </div>
      </div>
    `;
    lucide.createIcons();
    modal.querySelectorAll('[data-booking-close]').forEach((btn) => btn.addEventListener('click', closeBookingModal));
    return;
  }

  const stepLabels = t('booking.stepLabels');
  const stepNames = t('booking.steps');

  modal.innerHTML = `
    <div class="booking-progress"><div class="booking-progress-fill" style="width:${((state.step + 1) / 7) * 100}%"></div></div>
    <header class="booking-header">
      <div class="elea-container booking-header-inner">
        <div class="booking-title">${t('booking.title')}</div>
        <button class="booking-close" data-booking-close aria-label="Close"><i data-lucide="x"></i></button>
      </div>
    </header>
    <div class="elea-container booking-body">
      <div class="booking-step-labels">${stepLabels.map((label, idx) => `<span class="${idx === state.step ? 'active' : ''}">${label}</span>`).join('')}</div>
      <div class="booking-step-panel">${renderBookingStep(state)}</div>
      <div class="booking-actions">
        <button class="booking-back ${state.step === 0 ? 'disabled' : ''}" ${state.step === 0 ? 'disabled' : ''} data-booking-back><i data-lucide="arrow-left"></i> ${t('booking.back')}</button>
        ${state.step < 6 ? `<button class="booking-submit-button" data-booking-next>${t('booking.next')} <i data-lucide="arrow-right"></i></button>` : `<button class="booking-submit-button" data-booking-submit>${t('booking.submit')} <i data-lucide="arrow-right"></i></button>`}
      </div>
      <div class="booking-error ${state.errors.general ? 'show' : ''}">${state.errors.general || ''}</div>
    </div>
  `;
  lucide.createIcons();
  if (state.loading) {
    modal.querySelectorAll('.booking-submit-button').forEach((btn) => {
      try { btn.disabled = true; btn.classList.add('disabled'); btn.textContent = 'Submitting...'; } catch (e) { /* ignore */ }
    });
  }
  modal.querySelector('[data-booking-close]')?.addEventListener('click', closeBookingModal);
  modal.querySelector('[data-booking-back]')?.addEventListener('click', () => {
    if (state.step > 0) {
      state.step -= 1;
      renderBookingModal();
    }
  });
  modal.querySelector('[data-booking-next]')?.addEventListener('click', () => {
    if (validateStep(state)) {
      state.step += 1;
      renderBookingModal();
    }
  });
  modal.querySelector('[data-booking-submit]')?.addEventListener('click', () => submitBookingModal());

  if (state.step === 0) {
    const buttons = modal.querySelectorAll('[data-service-select]');
    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        const value = button.dataset.serviceSelect;
        const index = state.selectedServices.indexOf(value);
        if (index >= 0) state.selectedServices.splice(index, 1);
        else state.selectedServices.push(value);
        renderBookingModal();
      });
    });
  }

  if (state.step === 1) {
    modal.querySelectorAll('[data-room-select]').forEach((button) => {
      button.addEventListener('click', () => {
        state.rooms = button.dataset.roomSelect;
        renderBookingModal();
      });
    });
    modal.querySelectorAll('[data-area-select]').forEach((button) => {
      button.addEventListener('click', () => {
        const area = button.dataset.areaSelect;
        if (state.areas.includes(area)) state.areas = state.areas.filter(item => item !== area);
        else state.areas.push(area);
        renderBookingModal();
      });
    });
  }

  if (state.step === 2) {
    modal.querySelectorAll('[data-cleaning-type]').forEach((card) => {
      card.addEventListener('click', () => {
        state.cleaningType = card.dataset.cleaningType;
        renderBookingModal();
      });
    });
  }

  if (state.step === 3) {
    const input = modal.querySelector('#booking-date');
    input?.addEventListener('input', (e) => { state.date = e.target.value; });
  }

  if (state.step === 4) {
    modal.querySelectorAll('[data-time-select]').forEach((button) => {
      button.addEventListener('click', () => {
        state.time = button.dataset.timeSelect;
        renderBookingModal();
      });
    });
  }

  if (state.step === 5) {
    const fields = ['fullName', 'street', 'phone', 'email', 'location', 'address', 'notes'];
    fields.forEach((key) => {
      const element = modal.querySelector(`#booking-${key}`);
      if (!element) return;

      if (['street', 'location'].includes(key)) {
        element.value = state.details[key] || '';
        element.addEventListener('change', (e) => {
          state.details[key] = e.target.value;
        });
        return;
      }

      element.value = state.details[key] || '';
      element.addEventListener('input', (e) => {
        state.details[key] = e.target.value;
      });
    });
  }
}

function validateStep(state) {
  state.errors = {};
  if (state.step === 0 && state.selectedServices.length === 0) {
    state.errors.general = t('booking.selectService');
    return false;
  }
  if (state.step === 1 && !state.rooms) {
    state.errors.general = t('booking.selectRooms');
    return false;
  }
  if (state.step === 3 && !state.date) {
    state.errors.general = t('booking.selectDate');
    return false;
  }
  if (state.step === 4 && !state.time) {
    state.errors.general = t('booking.selectTime');
    return false;
  }
  if (state.step === 5) {
    const required = ['fullName', 'street', 'phone', 'email', 'location', 'address'];
    required.forEach((field) => {
      if (!state.details[field] || !state.details[field].trim()) {
        state.errors[field] = t('booking.required');
      }
    });
    if (Object.keys(state.errors).length) {
      state.errors.general = t('booking.required');
      return false;
    }
  }
  return true;
}

function renderBookingStep(state) {
  const current = state.step;
  if (current === 0) {
    return `
      <h2 class="elea-heading booking-step-question">${t('booking.serviceQuestion')}</h2>
      <p class="elea-body booking-step-hint">${t('booking.serviceHint')}</p>
      <div class="booking-service-grid">
        ${serviceData.map((service) => {
          const active = state.selectedServices.includes(service.key);
          return `
            <button class="booking-toggle ${active ? 'active' : ''}" data-service-select="${service.key}">
              <span class="toggle-title">${t(service.titleKey)}</span>
              <span class="toggle-check"><i data-lucide="check"></i></span>
            </button>
          `;
        }).join('')}
      </div>
    `;
  }
  if (current === 1) {
    return `
      <h2 class="elea-heading booking-step-question">${t('booking.homeQuestion')}</h2>
      <div class="mb-8">
        <p class="elea-eyebrow">${t('booking.roomsLabel')}</p>
        <div class="booking-room-grid mt-4">
          ${t('booking.rooms').map((room) => `
            <button class="booking-room-btn ${state.rooms === room ? 'active' : ''}" data-room-select="${room}">${room}</button>
          `).join('')}
        </div>
      </div>
      <div>
        <p class="elea-eyebrow">${t('booking.areasLabel')}</p>
        <div class="booking-area-grid mt-4">
          ${t('booking.areas').map((area) => `
            <button class="booking-area-btn ${state.areas.includes(area) ? 'active' : ''}" data-area-select="${area}">${area}</button>
          `).join('')}
        </div>
      </div>
    `;
  }
  if (current === 2) {
    return `
      <h2 class="elea-heading booking-step-question">${t('booking.typeQuestion')}</h2>
      <div class="booking-type-grid">
        ${t('booking.types').map((type, idx) => {
          const active = state.cleaningType === type.name;
          return `
            <button class="booking-type-card ${active ? 'active' : ''}" data-cleaning-type="${type.name}">
              <div>
                <h3 class="font-heading">${type.name}</h3>
                <p>${type.desc}</p>
              </div>
              <span class="toggle-check"><i data-lucide="check"></i></span>
            </button>
          `;
        }).join('')}
      </div>
    `;
  }
  if (current === 3) {
    return `
      <h2 class="elea-heading booking-step-question">${t('booking.dateQuestion')}</h2>
      <input id="booking-date" class="elea-input booking-date-input" type="date" min="${new Date().toISOString().split('T')[0]}" value="${state.date || ''}" />
    `;
  }
  if (current === 4) {
    return `
      <h2 class="elea-heading booking-step-question">${t('booking.timeQuestion')}</h2>
      <div class="booking-time-row">
        ${t('booking.times').map((time) => `
          <button class="booking-time-btn ${state.time === time ? 'active' : ''}" data-time-select="${time}">${time}</button>
        `).join('')}
      </div>
    `;
  }
  if (current === 5) {
    return `
      <h2 class="elea-heading booking-step-question">${t('booking.detailsQuestion')}</h2>
      <div class="booking-details-grid">
        <div class="booking-detail-field">
          <label>${t('booking.fullName')}</label>
          <input id="booking-fullName" class="elea-input" value="${state.details.fullName || ''}" />
        </div>
        <div class="booking-detail-field">
          <label>${t('booking.email')}</label>
          <input id="booking-email" class="elea-input" type="email" value="${state.details.email || ''}" />
        </div>
        <div class="booking-detail-field">
          <label>${t('booking.phone')}</label>
          <input id="booking-phone" class="elea-input" value="${state.details.phone || ''}" />
        </div>
        <div class="booking-detail-field">
          <label>${t('booking.street')}</label>
          <select id="booking-street" class="elea-input booking-location-select">
            <option value="">${t('booking.street')}</option>
            ${t('booking.streetOptions').map((option) => `<option value="${option}" ${state.details.street === option ? 'selected' : ''}>${option}</option>`).join('')}
          </select>
        </div>
        <div class="booking-detail-field">
          <label>${t('booking.location')}</label>
          <select id="booking-location" class="elea-input booking-location-select">
            <option value="">${t('booking.location')}</option>
            ${t('booking.locationOptions').map((option) => `<option value="${option}" ${state.details.location === option ? 'selected' : ''}>${option}</option>`).join('')}
          </select>
        </div>
        <div class="booking-detail-field full">
          <label>${t('booking.address')}</label>
          <input id="booking-address" class="elea-input" value="${state.details.address || ''}" />
        </div>
        <div class="booking-detail-field full">
          <label>${t('booking.notes')}</label>
          <textarea id="booking-notes" class="elea-input">${state.details.notes || ''}</textarea>
        </div>
      </div>
    `;
  }
  const rowData = [
    { label: t('booking.serviceQuestion'), value: state.selectedServices.map(key => {
        const svc = serviceData.find(s => s.key === key);
        return svc ? t(svc.titleKey) : key;
      }).join(', ') || '' },
    { label: t('booking.roomsLabel'), value: state.rooms || '' },
    { label: t('booking.areasLabel'), value: state.areas.join(', ') },
    { label: t('booking.typeQuestion'), value: state.cleaningType },
    { label: t('booking.dateQuestion'), value: state.date },
    { label: t('booking.timeQuestion'), value: state.time },
    { label: t('booking.fullName'), value: state.details.fullName },
    { label: t('booking.phone'), value: state.details.phone },
    { label: t('booking.email'), value: state.details.email },
    { label: t('booking.street'), value: state.details.street },
    { label: t('booking.location'), value: state.details.location },
    { label: t('booking.address'), value: state.details.address },
    { label: t('booking.notes'), value: state.details.notes }
  ];
  return `
    <h2 class="elea-heading booking-step-question">${t('booking.reviewQuestion')}</h2>
    <div class="booking-review-list">
      ${rowData.map((row) => row.value ? `
        <div class="booking-review-row">
          <div class="booking-review-label">${row.label}</div>
          <div class="booking-review-value">${row.value}</div>
        </div>
      ` : '').join('')}
    </div>
  `;
}

function submitBookingModal() {
  const modal = document.getElementById('booking-modal');
  if (!modal || !modal.bookingState) return;
  const state = modal.bookingState;
  if (!validateStep(state)) {
    renderBookingModal();
    return;
  }
  // generate a reference and attempt to POST booking to configured endpoint
  state.reference = generateReference();
  const payload = {
    reference: state.reference,
    services: state.selectedServices,
    rooms: state.rooms,
    areas: state.areas,
    cleaningType: state.cleaningType,
    date: state.date,
    time: state.time,
    details: state.details
  };

  const endpoint = defaults.bookingEndpoint;
  if (endpoint && endpoint.trim()) {
    // optimistic UI: show loading state inside modal
    state.loading = true;
    renderBookingModal();
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then((res) => res.json()).then((data) => {
      state.loading = false;
      if (data && data.success) {
        // server may return canonical reference
        state.reference = data.reference || state.reference;
        state.success = true;
      } else {
        state.errors.general = data && data.error ? data.error : 'Failed to submit booking. Please try again.';
      }
      renderBookingModal();
    }).catch((err) => {
      state.loading = false;
      state.errors.general = 'Network error while submitting booking. Please try again later.';
      console.error('Booking submit error', err);
      renderBookingModal();
    });
  } else {
    // no endpoint configured — fallback to local success flow
    console.warn('No bookingEndpoint configured in defaults; using local success flow.');
    const adminState = getAdminState();
    adminState.bookings.unshift({
      id: `booking-${Date.now()}`,
      reference: state.reference,
      name: state.details.fullName || 'Guest',
      service: state.selectedServices.join(', ') || 'General booking',
      rooms: state.rooms || '-',
      date: state.date || new Date().toISOString().slice(0, 10),
      status: 'pending',
      details: { ...state.details }
    });
    saveAdminState(adminState);
    state.success = true;
    renderBookingModal();
    renderAdminDashboard();
    initAdminCalendar();
    updateAdminTabBadges();
  }
}

function generateReference() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = 'EL-';
  for (let i = 0; i < 4; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function buildWhatsAppMessage(state) {
  return `Hello Elea, I would like to confirm my booking request.\nReference: ${state.reference}\nName: ${state.details.fullName}\nServices: ${state.selectedServices.join(', ')}\nRooms: ${state.rooms}\nCleaning Type: ${state.cleaningType}\nDate: ${state.date}\nTime: ${state.time}\nStreet: ${state.details.street || 'Not specified'}\nLocation: ${state.details.location || 'Not specified'}\nAddress: ${state.details.address}\nPhone: ${state.details.phone}\nEmail: ${state.details.email}\nNotes: ${state.details.notes || 'None'}`;
}

function buildEmailBody(state) {
  return `Booking reference: ${state.reference}\nName: ${state.details.fullName}\nServices: ${state.selectedServices.join(', ')}\nRooms: ${state.rooms}\nCleaning Type: ${state.cleaningType}\nDate: ${state.date}\nTime: ${state.time}\nStreet: ${state.details.street || 'Not specified'}\nLocation: ${state.details.location || 'Not specified'}\nAddress: ${state.details.address}\nPhone: ${state.details.phone}\nEmail: ${state.details.email}\nNotes: ${state.details.notes || 'None'}`;
}

function initFloatingWhatsApp() {
  const button = document.querySelector('.whatsapp-float');
  if (!button) return;
  setTimeout(() => button.classList.add('visible'), 1200);
  button.addEventListener('click', () => {
    window.open(`https://wa.me/${defaults.whatsappNumber}`, '_blank', 'noopener');
  });
}

function renderHomepageContent() {
  const state = getAdminState();

  const promoTarget = document.getElementById('promo-cards');
  if (promoTarget) {
    const promos = (state.ctas || []).filter((promo) => promo.active !== false);
    if (!promos.length) {
      promoTarget.innerHTML = '<div class="reviews-placeholder"><p class="elea-body">No active promotions right now.</p></div>';
    } else {
      promoTarget.innerHTML = promos.map((promo) => `
        <article class="promo-card">
          <img src="${promo.image || 'assets/images/kitchen.png'}" alt="${escapeHtml(promo.title)}" />
          <div class="promo-card-body">
            <span class="promo-eyebrow">Featured</span>
            <h3>${escapeHtml(promo.title)}</h3>
            <p>${escapeHtml(promo.text)}</p>
            <a href="${escapeHtml(promo.link || 'https://wa.me/4915216019843')}" target="_blank" rel="noreferrer">${escapeHtml(promo.cta || 'Book now')}</a>
          </div>
        </article>
      `).join('');
    }
  }

  const reviewsTarget = document.querySelector('.reviews-grid');
  if (reviewsTarget) {
    const approved = (state.reviews || []).filter((review) => review.status === 'approved');
    if (!approved.length) {
      reviewsTarget.innerHTML = `
        <div class="reviews-placeholder">
          <p class="elea-body">Verified client testimonials appear here. Submit feedback to have your review featured.</p>
          <a class="elea-button-outline" href="contact.html">Request Testimonials</a>
        </div>
      `;
      return;
    }

    reviewsTarget.innerHTML = approved.slice(0, 3).map((review) => `
      <article class="review-item-card">
        <div class="review-topline">
          <div class="review-name">${escapeHtml(review.name)}</div>
          <span class="review-rating">${'★'.repeat(review.rating || 5)}${'☆'.repeat(Math.max(0, 5 - (review.rating || 5)))}</span>
        </div>
        <div class="review-service">${escapeHtml(review.service)}</div>
        <p>“${escapeHtml(review.text)}”</p>
      </article>
    `).join('');
  }
}

function renderAdminDashboard(selectedDate = document.body.dataset.calendarDate || '') {
  const state = getAdminState();

  const bookingTarget = document.getElementById('admin-bookings-list');
  if (bookingTarget) {
    const bookings = state.bookings || [];
    const visibleBookings = selectedDate ? bookings.filter((booking) => (booking.date || '').slice(0, 10) === selectedDate) : bookings;
    const stats = `
      <div class="admin-stat-grid">
        <div class="admin-stat-card"><span>Total</span><strong>${visibleBookings.length}</strong></div>
        <div class="admin-stat-card"><span>Pending</span><strong>${visibleBookings.filter((booking) => booking.status !== 'confirmed').length}</strong></div>
        <div class="admin-stat-card"><span>Confirmed</span><strong>${visibleBookings.filter((booking) => booking.status === 'confirmed').length}</strong></div>
      </div>
    `;

    bookingTarget.innerHTML = visibleBookings.length ? stats + visibleBookings.map((booking) => `
      <article class="admin-card admin-booking-card">
        <div class="admin-card-top">
          <div class="admin-card-ref">${escapeHtml(booking.reference || booking.id)}</div>
          <span class="status-badge ${booking.status === 'confirmed' ? 'status-confirmed' : booking.status === 'pending' ? 'status-pending' : 'status-new'}">${escapeHtml(booking.status || 'new')}</span>
        </div>
        <div class="admin-card-meta">${escapeHtml(booking.name || 'Guest')}</div>
        <div class="admin-card-services">${escapeHtml(booking.service || 'General booking')}</div>
        <div class="booking-meta-row">
          <span>${escapeHtml(booking.date || 'TBD')}</span>
          <span>${escapeHtml(booking.rooms || '-')} rooms</span>
        </div>
        <div class="booking-action-row">
          <button class="action-btn approve" type="button" data-booking-action="confirm" data-booking-action-id="${escapeHtml(booking.id)}">Confirm</button>
          <button class="action-btn delete" type="button" data-booking-action="delete" data-booking-action-id="${escapeHtml(booking.id)}">Delete</button>
        </div>
      </article>
    `).join('') : stats + '<div class="admin-note">' + (selectedDate ? `No bookings recorded for ${selectedDate}.` : 'No bookings recorded yet.') + '</div>';
  }

  const reviewTarget = document.getElementById('admin-reviews-list');
  if (reviewTarget) {
    const reviews = state.reviews || [];
    reviewTarget.innerHTML = reviews.length ? reviews.map((review) => `
      <article class="admin-review-card">
        <div class="admin-card-top">
          <div class="admin-card-ref">${escapeHtml(review.name)}</div>
          <span class="status-badge ${review.status === 'approved' ? 'status-confirmed' : 'status-pending'}">${escapeHtml(review.status || 'pending')}</span>
        </div>
        <div class="admin-card-meta">${'★'.repeat(review.rating || 5)}${'☆'.repeat(Math.max(0, 5 - (review.rating || 5)))} · ${escapeHtml(review.service)}</div>
        <div class="admin-card-services">“${escapeHtml(review.text)}”</div>
        <div class="review-actions">
          <button class="action-btn approve" type="button" data-review-action="approve" data-review-id="${escapeHtml(review.id)}"><i data-lucide="check"></i> ${review.status === 'approved' ? 'Approved' : 'Approve'}</button>
          <button class="action-btn delete" type="button" data-review-action="delete" data-review-id="${escapeHtml(review.id)}"><i data-lucide="trash-2"></i> Delete</button>
        </div>
      </article>
    `).join('') : '<div class="admin-note">No review submissions yet.</div>';
    if (window.lucide) lucide.createIcons();
  }

  const assetsTarget = document.getElementById('admin-assets-list');
  if (assetsTarget) {
    const assets = state.assets || [];
    assetsTarget.innerHTML = assets.length ? assets.map((asset) => `
      <div class="asset-card">
        <img src="${asset.path || 'assets/images/kitchen.png'}" alt="${escapeHtml(asset.name)}" onerror="this.onerror=null;this.src='assets/best.png';" />
        <div class="asset-card-meta">
          <strong>${escapeHtml(asset.name)}</strong>
          <div class="asset-path">${escapeHtml(asset.path || '')}</div>
          <div class="asset-actions">
            <button type="button" class="asset-btn" data-asset-toggle="${escapeHtml(asset.id)}">${asset.active === false ? 'Enable' : 'Disable'}</button>
            <button type="button" class="asset-btn danger" data-asset-remove="${escapeHtml(asset.id)}">Remove</button>
          </div>
        </div>
      </div>
    `).join('') : '<div class="admin-note">No asset images yet.</div>';
  }

  const ctaTarget = document.getElementById('admin-cta-list');
  if (ctaTarget) {
    const ctas = state.ctas || [];
    ctaTarget.innerHTML = ctas.length ? ctas.map((cta) => `
      <div class="promo-admin-card">
        <img src="${cta.image || 'assets/images/kitchen.png'}" alt="${escapeHtml(cta.title)}" />
        <div class="promo-admin-body">
          <div class="promo-admin-header">
            <h3>${escapeHtml(cta.title)}</h3>
            <span class="status-badge ${cta.active === false ? 'status-cancelled' : 'status-confirmed'}">${cta.active === false ? 'hidden' : 'live'}</span>
          </div>
          <p>${escapeHtml(cta.text)}</p>
          <div class="cta-admin-actions">
            <button type="button" class="asset-btn" data-cta-toggle="${escapeHtml(cta.id)}">${cta.active === false ? 'Show on site' : 'Hide from site'}</button>
          </div>
        </div>
      </div>
    `).join('') : '<div class="admin-note">No promo cards yet.</div>';
  }

  const settingsForm = document.getElementById('admin-settings-form');
  if (settingsForm) {
    const fields = settingsForm.querySelectorAll('input, textarea');
    fields.forEach((field) => {
      if (field.name === 'businessName') field.value = state.site.businessName || 'ELEA';
      if (field.name === 'phone') field.value = state.site.phone || defaults.phone;
      if (field.name === 'email') field.value = state.site.email || defaults.email;
      if (field.name === 'whatsapp') field.value = state.site.whatsapp || defaults.whatsapp;
      if (field.name === 'instagram') field.value = state.site.instagram || defaults.instagram;
      if (field.name === 'footerText') field.value = state.site.footerText || 'Cleaning & Home Organization';
    });
  }

  updateAdminTabBadges();
}

function updateAdminTabBadges() {
  const state = getAdminState();
  const bookingCount = (state.bookings || []).length;
  const reviewCount = (state.reviews || []).filter((review) => review.status !== 'approved').length;
  const promoCount = (state.ctas || []).filter((cta) => cta.active !== false).length;

  document.querySelectorAll('[data-admin-tab]').forEach((button) => {
    const target = button.dataset.adminTab;
    if (target === 'bookings') {
      button.querySelector('.tab-badge')?.replaceChildren(document.createTextNode(String(bookingCount)));
    }
    if (target === 'reviews') {
      button.querySelector('.tab-badge')?.replaceChildren(document.createTextNode(String(reviewCount)));
    }
    if (target === 'promos') {
      button.querySelector('.tab-badge')?.replaceChildren(document.createTextNode(String(promoCount)));
    }
    if (target === 'assets' || target === 'settings') {
      button.querySelector('.tab-badge')?.replaceChildren(document.createTextNode(''));
    }
  });
}

async function writeAssetToProjectDirectory(file) {
  const safeName = (file.name || 'asset-image.png')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9._-]/g, '-');
  const targetPath = `assets/images/${safeName}`;
  const statusNode = document.getElementById('admin-asset-status');

  if (!('showDirectoryPicker' in window) || !window.isSecureContext) {
    if (statusNode) {
      statusNode.textContent = 'Folder access is unavailable in this browser. The image path has been prepared for manual copy into assets/images.';
    }
    return targetPath;
  }

  try {
    const projectRoot = await window.showDirectoryPicker({ mode: 'readwrite' });
    const assetsDir = await projectRoot.getDirectoryHandle('assets', { create: true });
    const imagesDir = await assetsDir.getDirectoryHandle('images', { create: true });
    const fileHandle = await imagesDir.getFileHandle(safeName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(await file.arrayBuffer());
    await writable.close();
    if (statusNode) {
      statusNode.textContent = `Saved to ${targetPath}.`;
    }
    return targetPath;
  } catch (error) {
    console.warn('Unable to save asset directly to project directory:', error);
    if (statusNode) {
      statusNode.textContent = 'Direct folder save was blocked. Please confirm the target path manually or select the project folder again.';
    }
    return targetPath;
  }
}

function initAdminPage() {
  document.querySelectorAll('[data-admin-tab]').forEach((button) => {
    button.addEventListener('click', () => {
      const target = button.dataset.adminTab;
      document.body.dataset.adminTab = target;
      document.querySelectorAll('[data-admin-section]').forEach((section) => {
        section.classList.toggle('hidden', section.dataset.adminSection !== target);
      });
      document.querySelectorAll('[data-admin-tab]').forEach((btn) => btn.classList.toggle('active', btn.dataset.adminTab === target));
    });
  });

  const searchInput = document.querySelector('.admin-search input');
  searchInput?.addEventListener('input', (event) => {
    const query = event.target.value.trim().toLowerCase();
    const target = document.body.dataset.adminTab || 'bookings';
    const list = document.getElementById(target === 'bookings' ? 'admin-bookings-list' : target === 'reviews' ? 'admin-reviews-list' : target === 'promos' ? 'admin-cta-list' : 'admin-bookings-list');
    if (!list) return;
    const rows = [...list.querySelectorAll('.admin-card, .admin-review-card, .promo-admin-card, .asset-card')];
    rows.forEach((row) => {
      const text = (row.textContent || '').toLowerCase();
      row.style.display = text.includes(query) ? '' : 'none';
    });
  });

  const settingsForm = document.getElementById('admin-settings-form');
  settingsForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const state = getAdminState();
    state.site.businessName = settingsForm.businessName.value.trim() || 'ELEA';
    state.site.phone = settingsForm.phone.value.trim() || defaults.phone;
    state.site.email = settingsForm.email.value.trim() || defaults.email;
    state.site.whatsapp = settingsForm.whatsapp.value.trim() || defaults.whatsapp;
    state.site.instagram = settingsForm.instagram.value.trim() || defaults.instagram;
    state.site.footerText = settingsForm.footerText.value.trim() || 'Cleaning & Home Organization';
    saveAdminState(state);
    applyAdminSiteValues();
    renderHomepageContent();
    renderAdminDashboard();
  });

  const assetForm = document.getElementById('admin-asset-form');
  const assetUpload = document.getElementById('admin-asset-upload');

  assetUpload?.addEventListener('change', async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const pathInput = document.getElementById('admin-asset-path');
    if (!pathInput) return;
    const savedPath = await writeAssetToProjectDirectory(file);
    pathInput.value = savedPath;
  });

  assetForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const state = getAdminState();
    const name = assetForm.assetName.value.trim();
    const path = assetForm.assetPath.value.trim();
    if (!name || !path) return;
    state.assets.unshift({ id: `asset-${Date.now()}`, name, path, active: true });
    saveAdminState(state);
    assetForm.reset();
    const statusNode = document.getElementById('admin-asset-status');
    if (statusNode) statusNode.textContent = '';
    renderAdminDashboard();
  });

  const ctaForm = document.getElementById('admin-cta-form');
  ctaForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const state = getAdminState();
    const title = ctaForm.ctaTitle.value.trim();
    const text = ctaForm.ctaText.value.trim();
    const link = ctaForm.ctaLink.value.trim();
    const image = ctaForm.ctaImage.value.trim();
    if (!title || !text) return;
    state.ctas.unshift({
      id: `cta-${Date.now()}`,
      title,
      text,
      link: link || 'https://wa.me/4915216019843',
      image: image || 'assets/images/kitchen.png',
      cta: 'Book now',
      active: true
    });
    saveAdminState(state);
    ctaForm.reset();
    renderHomepageContent();
    renderAdminDashboard();
  });

  document.addEventListener('click', (event) => {
    const bookingAction = event.target.closest('[data-booking-action]');
    if (bookingAction) {
      const state = getAdminState();
      const id = bookingAction.dataset.bookingActionId;
      const action = bookingAction.dataset.bookingAction;
      if (action === 'confirm') {
        const item = state.bookings.find((entry) => entry.id === id);
        if (item) item.status = 'confirmed';
      }
      if (action === 'delete') {
        state.bookings = (state.bookings || []).filter((item) => item.id !== id);
      }
      saveAdminState(state);
      renderAdminDashboard();
      initAdminCalendar();
      updateAdminTabBadges();
      return;
    }

    const reviewAction = event.target.closest('[data-review-action]');
    if (reviewAction) {
      const state = getAdminState();
      const id = reviewAction.dataset.reviewId;
      if (reviewAction.dataset.reviewAction === 'approve') {
        const review = state.reviews.find((item) => item.id === id);
        if (review) review.status = 'approved';
      }
      if (reviewAction.dataset.reviewAction === 'delete') {
        state.reviews = state.reviews.filter((item) => item.id !== id);
      }
      saveAdminState(state);
      renderHomepageContent();
      renderAdminDashboard();
      updateAdminTabBadges();
      return;
    }

    const assetToggle = event.target.closest('[data-asset-toggle]');
    if (assetToggle) {
      const state = getAdminState();
      const item = state.assets.find((asset) => asset.id === assetToggle.dataset.assetToggle);
      if (item) item.active = item.active === false;
      saveAdminState(state);
      renderAdminDashboard();
      return;
    }

    const assetRemove = event.target.closest('[data-asset-remove]');
    if (assetRemove) {
      const state = getAdminState();
      state.assets = (state.assets || []).filter((asset) => asset.id !== assetRemove.dataset.assetRemove);
      saveAdminState(state);
      renderAdminDashboard();
      return;
    }

    const ctaToggle = event.target.closest('[data-cta-toggle]');
    if (ctaToggle) {
      const state = getAdminState();
      const item = state.ctas.find((cta) => cta.id === ctaToggle.dataset.ctaToggle);
      if (item) item.active = item.active === false;
      saveAdminState(state);
      renderHomepageContent();
      renderAdminDashboard();
      updateAdminTabBadges();
      return;
    }
  });

  document.querySelectorAll('[data-admin-logout]').forEach((button) => {
    button.addEventListener('click', () => {
      localStorage.removeItem(ADMIN_STORAGE_KEY);
      const resetState = getDefaultAdminState();
      saveAdminState(resetState);
      renderHomepageContent();
      renderAdminDashboard();
      initAdminCalendar();
      updateAdminTabBadges();
    });
  });

  renderAdminDashboard();
  updateAdminTabBadges();
}

function initAdminCalendar() {
  const el = document.getElementById('admin-calendar');
  if (!el) return;
  const state = getAdminState();
  const selectedDate = document.body.dataset.calendarDate || '';
  const monthDate = new Date();
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const totalDays = lastDay.getDate();
  const bookingMap = new Map();

  (state.bookings || []).forEach((booking) => {
    if (!booking.date) return;
    const parsedDate = new Date(`${booking.date}T12:00:00`);
    if (Number.isNaN(parsedDate.getTime())) return;
    if (parsedDate.getFullYear() !== year || parsedDate.getMonth() !== month) return;
    const key = String(parsedDate.getDate());
    bookingMap.set(key, (bookingMap.get(key) || 0) + 1);
  });

  const cells = [];
  for (let i = 0; i < startOffset; i++) {
    cells.push('<div class="mini-day empty" aria-hidden="true"></div>');
  }
  for (let day = 1; day <= totalDays; day++) {
    const dayKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const count = bookingMap.get(String(day)) || 0;
    const isSelected = selectedDate === dayKey;
    cells.push(`
      <button type="button" class="mini-day ${count ? 'has-booking' : ''} ${isSelected ? 'selected' : ''}" data-calendar-day="${dayKey}" aria-label="${dayKey}${count ? ` - ${count} booking${count > 1 ? 's' : ''}` : ' - no bookings'}">
        <span>${day}</span>${count ? `<small>${count}</small>` : ''}
      </button>
    `);
  }
  const trailing = (7 - (cells.length % 7)) % 7;
  for (let i = 0; i < trailing; i++) {
    cells.push('<div class="mini-day empty" aria-hidden="true"></div>');
  }

  const monthLabel = monthDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  el.innerHTML = `
    <div class="mini-calendar-wrap">
      <div class="mini-calendar-header">${monthLabel}</div>
      <div class="mini-calendar-grid">
        ${dayNames.map((day) => `<div class="mini-day-name">${day}</div>`).join('')}
        ${cells.join('')}
      </div>
    </div>
  `;

  el.querySelectorAll('[data-calendar-day]').forEach((button) => {
    button.addEventListener('click', () => {
      const dateKey = button.dataset.calendarDay;
      document.body.dataset.calendarDate = document.body.dataset.calendarDate === dateKey ? '' : dateKey;
      initAdminCalendar();
      renderAdminDashboard(document.body.dataset.calendarDate || '');
    });
  });
}

function initAdminBookings() {
  renderAdminDashboard();
}

function initAuthHandlers() {
  // Auth screens have been removed from the site.
}
function normalizeWhatsAppLinks() {
  document.querySelectorAll('a[href*="wa.me/254762097075"]').forEach((a) => {
    a.href = a.href.replace('wa.me/254762097075', 'wa.me/4915216019843');
    const val = a.querySelector('.contact-row-value');
    if (val && val.textContent.includes('+254')) val.textContent = '+49 152 16019843';
  });
}
function initFooterYear() {
  document.querySelectorAll('[data-i18n-year]').forEach((el) => {
    el.textContent = `© ${new Date().getFullYear()} Elea.`;
  });
}
document.addEventListener('DOMContentLoaded', () => {
  applyAdminSiteValues();
  renderHomepageContent();
  applyTranslations();
  setLang(getLang());
  initNavbar();
  initReveal();
  initServiceButtons();
  initBeforeAfterTabs();
  initFloatingWhatsApp();
  initReviewModal();
  initAdminPage();
  initAdminCalendar();
  initAdminBookings();
  initBerlinNotice();
  initFooterYear();
  normalizeWhatsAppLinks();
  if (window.lucide) lucide.createIcons();
});

function initBerlinNotice() {
  // site-wide small notice that the service currently covers Berlin only
  try {
    const el = document.createElement('div');
    el.className = 'berlin-notice';
    el.textContent = 'Service area: Berlin only.';
    document.body.insertBefore(el, document.body.firstChild);
  } catch (e) { /* non-fatal */ }
}