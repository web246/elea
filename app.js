
const defaults = {
  phone: '+49 152 16019843',
  email: 'eleacleaning@gmail.com',
  whatsapp: '+49 152 16019843',
  instagram: 'https://instagram.com',
  instagramDisplay: '@elea.cleaning',
  whatsappNumber: '4915216019843',
  notificationEmail: 'websitesbrian585@gmail.com'
};

// Ensure legacy references to logo.jpeg load the new logo.png at runtime
document.addEventListener('DOMContentLoaded', function () {
  // Replace img src attributes
  document.querySelectorAll('img').forEach(function (img) {
    const src = img.getAttribute('src');
    if (!src) return;
    if (src.endsWith('assets/logo.jpeg') || src.endsWith('/assets/logo.jpeg') || src === 'assets/logo.jpeg') {
      img.setAttribute('src', 'assets/logo.png');
    }
  });
  // Replace favicon / apple touch icon
  document.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"]').forEach(function (link) {
    const href = link.getAttribute('href');
    if (!href) return;
    if (href.endsWith('assets/logo.jpeg') || href === 'assets/logo.jpeg') link.setAttribute('href', 'assets/logo.png');
  });
  // Replace social meta images
  document.querySelectorAll('meta[property="og:image"], meta[name="twitter:image"]').forEach(function (m) {
    const c = m.getAttribute('content');
    if (!c) return;
    if (c.endsWith('assets/logo.jpeg') || c === 'assets/logo.jpeg') m.setAttribute('content', 'assets/logo.png');
  });
  // Insert punchline under header logos if missing
  try {
    const punch = 'CLEANING & HOME ORGANIZATION';
    document.querySelectorAll('a.logo').forEach(function (el) {
      // avoid duplicating
      if (el.querySelector('.logo-punchline')) return;
      const txt = document.createElement('div');
      txt.className = 'logo-punchline';
      txt.textContent = punch;
      // place after the logo-row or image
      el.appendChild(txt);
    });
  } catch (e) { /* non-fatal */ }
  // Normalize header/footer logo images site-wide: add `logo-img`, remove inline styles, ensure png source
  try {
    document.querySelectorAll('img.site-logo').forEach(function (img) {
      img.classList.add('logo-img');
      const s = img.getAttribute('src');
      if (s && s.endsWith('logo.jpeg')) img.setAttribute('src', 'assets/logo.png');
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
      eyebrow: 'Signature Services', heading: 'Curated care for every space.', quote: 'Request a Quote',
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
      eyebrow: 'Transformations', heading: 'Before & After', note: 'Sample content — placeholder imagery to be replaced with real Elea projects.',
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
    reviews: { eyebrow: 'Reviews', heading: 'What our clients say.', leave: 'Leave a Review', empty: 'No reviews yet — be the first to share your experience.', placeholder: "Genuine client reviews available on request — we publish verified testimonials after approval. If you'd like to feature client feedback here, add them via the admin panel or link to external review platforms.", request: 'Request Testimonials' },
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
      fullName: 'Full name', phone: 'Phone', email: 'Email', postcode: 'Postcode', address: 'Address', notes: 'Additional notes',
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
      eyebrow: 'Signature-Leistungen', heading: 'Kuratierte Pflege für jeden Raum.', quote: 'Angebot anfragen',
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
      eyebrow: 'Verwandlungen', heading: 'Vor & Nachher', note: 'Beispielinhalt — Platzhalterbilder werden durch echte Elea-Projekte ersetzt.',
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
    reviews: { eyebrow: 'Bewertungen', heading: 'Was unsere Kunden sagen.', leave: 'Bewertung abgeben', empty: 'Noch keine Bewertungen — teilen Sie Ihre Erfahrung als Erste.', placeholder: 'Echte Kundenbewertungen auf Anfrage verfügbar — wir veröffentlichen verifizierte Erfahrungsberichte nach Genehmigung. Wenn Sie hier Kundenfeedback zeigen möchten, fügen Sie es über das Admin-Panel hinzu oder verlinken Sie externe Bewertungsplattformen.', request: 'Erfahrungsberichte anfragen' },
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
      fullName: 'Vollständiger Name', phone: 'Telefon', email: 'E-Mail', postcode: 'Postleitzahl', address: 'Adresse', notes: 'Zusätzliche Notizen',
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
    legalPages: { impressum: 'Impressum', datenschutz: 'Datenschutzerklärung', terms: 'AGB', cancellation: 'Buchung & Stornierung' },
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
  document.querySelectorAll('[data-lang-toggle]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.langToggle === getLang());
  });
  // Booking modal / review modal re-render on language change so injected markup translates too
  const modal = document.getElementById('booking-modal');
  if (modal && modal.classList.contains('open') && modal.bookingState) {
    renderBookingModal();
  }
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
  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('is-open');
      document.body.classList.toggle('menu-open', mobileMenu.classList.contains('is-open'));
    });
  }
  if (closeBtn && mobileMenu) {
    closeBtn.addEventListener('click', () => mobileMenu.classList.remove('is-open'));
  }
  mobileMenu?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => mobileMenu.classList.remove('is-open'));
  });

  window.addEventListener('scroll', () => {
    document.querySelector('.navbar')?.classList.toggle('scrolled', window.scrollY > 20);
  });
}

function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('is-visible');
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
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
      const svc = link.textContent.trim();
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
    form.classList.add('hidden');
    thanks.classList.remove('hidden');
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
    details: { fullName: '', phone: '', email: '', postcode: '', address: '', notes: '' },
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
    const fields = ['fullName', 'phone', 'email', 'postcode', 'address', 'notes'];
    fields.forEach((key) => {
      const element = modal.querySelector(`#booking-${key}`);
      if (element) {
        element.value = state.details[key] || '';
        element.addEventListener('input', (e) => {
          state.details[key] = e.target.value;
        });
      }
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
    const required = ['fullName', 'phone', 'email', 'postcode', 'address'];
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
          <label>${t('booking.phone')}</label>
          <input id="booking-phone" class="elea-input" value="${state.details.phone || ''}" />
        </div>
        <div class="booking-detail-field">
          <label>${t('booking.email')}</label>
          <input id="booking-email" class="elea-input" type="email" value="${state.details.email || ''}" />
        </div>
        <div class="booking-detail-field">
          <label>${t('booking.postcode')}</label>
          <input id="booking-postcode" class="elea-input" value="${state.details.postcode || ''}" />
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
    { label: t('booking.postcode'), value: state.details.postcode },
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
  modal.bookingState.reference = generateReference();
  modal.bookingState.success = true;
  renderBookingModal();
}

function generateReference() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = 'EL-';
  for (let i = 0; i < 4; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function buildWhatsAppMessage(state) {
  return `Hello Elea, I would like to confirm my booking request.\nReference: ${state.reference}\nName: ${state.details.fullName}\nServices: ${state.selectedServices.join(', ')}\nRooms: ${state.rooms}\nCleaning Type: ${state.cleaningType}\nDate: ${state.date}\nTime: ${state.time}\nAddress: ${state.details.address}\nPostcode: ${state.details.postcode}\nPhone: ${state.details.phone}\nEmail: ${state.details.email}\nNotes: ${state.details.notes || 'None'}`;
}

function buildEmailBody(state) {
  return `Booking reference: ${state.reference}\nName: ${state.details.fullName}\nServices: ${state.selectedServices.join(', ')}\nRooms: ${state.rooms}\nCleaning Type: ${state.cleaningType}\nDate: ${state.date}\nTime: ${state.time}\nAddress: ${state.details.address}\nPostcode: ${state.details.postcode}\nPhone: ${state.details.phone}\nEmail: ${state.details.email}\nNotes: ${state.details.notes || 'None'}`;
}

function initFloatingWhatsApp() {
  const button = document.querySelector('.whatsapp-float');
  if (!button) return;
  setTimeout(() => button.classList.add('visible'), 1200);
  button.addEventListener('click', () => {
    window.open(`https://wa.me/${defaults.whatsappNumber}`, '_blank', 'noopener');
  });
}

function initAdminPage() {
  const tabs = ['bookings', 'reviews', 'settings'];
  const active = document.body.dataset.adminTab || 'bookings';

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

  document.querySelector('[data-admin-logout]')?.addEventListener('click', () => {
    localStorage.removeItem('elea-admin');
  });
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
  applyTranslations();
  setLang(getLang());
  initNavbar();
  initReveal();
  initServiceButtons();
  initBeforeAfterTabs();
  initFloatingWhatsApp();
  initReviewModal();
  initAdminPage();
  initFooterYear();
  normalizeWhatsAppLinks();
  if (window.lucide) lucide.createIcons();
});