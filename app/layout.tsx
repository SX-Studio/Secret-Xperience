import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import CookieBanner from './components/CookieBanner'
import AttributionTracker from './components/AttributionTracker'
import PageviewTracker from './components/PageviewTracker'
import PrideMode from './components/PrideMode'
import BackToTop from './components/BackToTop'
import WelcomeChoice from './components/WelcomeChoice'
import PrivacyPanic from './components/PrivacyPanic'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#080612',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://www.secretxperience.eu'),
  title: 'Escort Girls Belgium — Brussels, Antwerp, Ghent | SecretXperience',
  description: 'Verified escort girls in Belgium — Brussels, Antwerp, Ghent & more. Real photos, reviews & prices. Book independent escorts, VIP companions & private reception discreetly.',
  manifest: '/manifest.json',
  keywords: ['escort Belgium', 'escort girls Belgium', 'escort Brussels', 'escort Antwerp', 'escort Ghent', 'escorts belgique', 'escort meisjes belgie', 'VIP companions Belgium', 'private reception Belgium', 'adult services Belgium'],
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'SecretXperience' },
  openGraph: {
    type: 'website',
    locale: 'en_EU',
    url: 'https://www.secretxperience.eu',
    siteName: 'SecretXperience.eu',
    title: 'Escort Girls Belgium — Brussels, Antwerp, Ghent | SecretXperience',
    description: 'Verified escort girls in Belgium — Brussels, Antwerp, Ghent & more. Real photos, reviews & prices. Book independent escorts, VIP companions & private reception discreetly.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'SecretXperience.eu' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Escort Girls Belgium — Brussels, Antwerp, Ghent | SecretXperience',
    description: 'Verified escort girls in Belgium — Brussels, Antwerp, Ghent & more. Real photos, reviews & prices.',
    images: ['/og-image.jpg'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-96.png', type: 'image/png', sizes: '96x96' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: '/apple-touch-icon.png',
  },
  verification: {
    google: 'm10S1aWlGhdFAXgWqmAvoEUYF_2GIOYNMU_4_pGseE0',
  },
}

// Theme bootstrap — runs before paint to avoid a flash of the wrong theme.
// Default is "velvet". A stored localStorage.theme overrides.
const themeBootstrap = `
(function () {
  try {
    var stored = localStorage.theme;
    var t = (stored === 'dark' || stored === 'light' || stored === 'velvet') ? stored : 'velvet';
    document.documentElement.dataset.theme = t;
  } catch (e) {
    document.documentElement.dataset.theme = 'velvet';
  }
  try {
    if (localStorage.prideMode === 'on') document.documentElement.classList.add('pride-mode');
  } catch (e) {}
})();
`

const gtInit = `
function googleTranslateElementInit() {
  new google.translate.TranslateElement({
    pageLanguage: 'en',
    includedLanguages: 'fr,nl,de,es,it,pt,pl,ro',
    autoDisplay: false
  }, 'google_translate_element');
}
`

// Curated translation overrides — run AFTER Google Translate to fix machine-translation
// errors. European Portuguese (pt-PT) corrections are the primary motivation: GT uses
// Brazilian Portuguese by default which differs significantly in vocabulary and tone.
const sxTranslationsScript = `
(function() {
  var D = {
    // ── Navigation & categories ───────────────────────────────────────────────
    'Escorts':          {fr:'Escortes',       nl:'Escorts',        de:'Escorts',          es:'Escorts',         it:'Escort',           pt:'Acompanhantes',    pl:'Escort',           ro:'Escorte'},
    'Companions':       {fr:'Compagnes',      nl:'Gezelschap',     de:'Begleitung',       es:'Compañeras',      it:'Accompagnatori',   pt:'Companhia',        pl:'Towarzystwo',      ro:'Însoțitori'},
    'Nightlife':        {fr:'Vie nocturne',   nl:'Nachtleven',     de:'Nachtleben',       es:'Vida nocturna',   it:'Vita notturna',    pt:'Vida Noturna',     pl:'Życie nocne',      ro:'Viața de noapte'},
    'Creators':         {fr:'Créateurs',      nl:'Makers',         de:'Kreative',         es:'Creadores',       it:'Creatori',         pt:'Criadores',        pl:'Twórcy',           ro:'Creatori'},
    'Rentals':          {fr:'Locations',      nl:'Verhuur',        de:'Vermietungen',     es:'Alquileres',      it:'Affitti',          pt:'Alugueres',        pl:'Wynajem',          ro:'Închirieri'},
    'Hotels':           {fr:'Hôtels',         nl:'Hotels',         de:'Hotels',           es:'Hoteles',         it:'Hotel',            pt:'Hotéis',           pl:'Hotele',           ro:'Hoteluri'},
    'Events':           {fr:'Événements',     nl:'Evenementen',    de:'Veranstaltungen',  es:'Eventos',         it:'Eventi',           pt:'Eventos',          pl:'Wydarzenia',       ro:'Evenimente'},
    'Shop':             {fr:'Boutique',       nl:'Winkel',         de:'Shop',             es:'Tienda',          it:'Negozio',          pt:'Loja',             pl:'Sklep',            ro:'Magazin'},
    'Discover':         {fr:'Découvrir',      nl:'Ontdekken',      de:'Entdecken',        es:'Descubrir',       it:'Scopri',           pt:'Descobrir',        pl:'Odkryj',           ro:'Descoperă'},
    // ── CTAs ─────────────────────────────────────────────────────────────────
    'Book Now':         {fr:'Réserver',       nl:'Nu Boeken',      de:'Jetzt Buchen',     es:'Reservar',        it:'Prenota Ora',      pt:'Reservar Agora',   pl:'Zarezerwuj',       ro:'Rezervați'},
    'View Profile':     {fr:'Voir le profil', nl:'Profiel Bekijken',de:'Profil Ansehen',  es:'Ver Perfil',      it:'Vedi Profilo',     pt:'Ver Perfil',       pl:'Wyświetl Profil',  ro:'Vezi Profilul'},
    'Message':          {fr:'Message',        nl:'Bericht',        de:'Nachricht',        es:'Mensaje',         it:'Messaggio',        pt:'Mensagem',         pl:'Wiadomość',        ro:'Mesaj'},
    'Send Message':     {fr:'Envoyer un message',nl:'Bericht Sturen',de:'Nachricht Senden',es:'Enviar Mensaje', it:'Invia Messaggio',  pt:'Enviar Mensagem',  pl:'Wyślij Wiadomość', ro:'Trimite Mesaj'},
    'Request Booking':  {fr:'Demander une réservation',nl:'Boeking Aanvragen',de:'Buchung Anfragen',es:'Solicitar Reserva',it:'Richiedi Prenotazione',pt:'Solicitar Reserva',pl:'Zapytaj o Rezerwację',ro:'Solicită Rezervare'},
    'Send Request':     {fr:'Envoyer la demande',nl:'Verzoek Sturen',de:'Anfrage Senden', es:'Enviar Solicitud',it:'Invia Richiesta',  pt:'Enviar Pedido',    pl:'Wyślij Prośbę',    ro:'Trimite Cererea'},
    'Contact':          {fr:'Contact',        nl:'Contact',        de:'Kontakt',          es:'Contacto',        it:'Contatto',         pt:'Contacto',         pl:'Kontakt',          ro:'Contact'},
    'List Your Services':{fr:'Proposer vos services',nl:'Uw diensten aanbieden',de:'Ihre Dienste anbieten',es:'Ofrecer servicios',it:'Offri i tuoi servizi',pt:'Anunciar Serviços',pl:'Dodaj ogłoszenie',ro:'Adaugă servicii'},
    // ── Auth ─────────────────────────────────────────────────────────────────
    'Sign In':          {fr:'Se connecter',   nl:'Inloggen',       de:'Anmelden',         es:'Iniciar sesión',  it:'Accedi',           pt:'Iniciar Sessão',   pl:'Zaloguj się',      ro:'Conectare'},
    'Log In':           {fr:'Se connecter',   nl:'Inloggen',       de:'Anmelden',         es:'Iniciar sesión',  it:'Accedi',           pt:'Iniciar Sessão',   pl:'Zaloguj się',      ro:'Conectare'},
    'Create Account':   {fr:'Créer un compte',nl:'Account aanmaken',de:'Konto erstellen', es:'Crear cuenta',    it:'Crea account',     pt:'Criar Conta',      pl:'Utwórz konto',     ro:'Creează cont'},
    'Sign Up':          {fr:"S'inscrire",     nl:'Registreren',    de:'Registrieren',     es:'Registrarse',     it:'Registrati',       pt:'Registar',         pl:'Zarejestruj się',  ro:'Înregistrare'},
    'Sign in with Google':{fr:'Connexion avec Google',nl:'Inloggen met Google',de:'Mit Google anmelden',es:'Entrar con Google',it:'Accedi con Google',pt:'Entrar com Google',pl:'Zaloguj z Google',ro:'Conectare cu Google'},
    'Log Out':          {fr:'Déconnexion',    nl:'Uitloggen',      de:'Abmelden',         es:'Cerrar sesión',   it:'Esci',             pt:'Terminar Sessão',  pl:'Wyloguj',          ro:'Deconectare'},
    'Sign Out':         {fr:'Déconnexion',    nl:'Uitloggen',      de:'Abmelden',         es:'Cerrar sesión',   it:'Esci',             pt:'Terminar Sessão',  pl:'Wyloguj',          ro:'Deconectare'},
    // ── Filters & badges ─────────────────────────────────────────────────────
    'Available Now':    {fr:'Disponible maintenant',nl:'Nu Beschikbaar',de:'Jetzt Verfügbar',es:'Disponible Ahora',it:'Disponibile Ora',pt:'Disponível Agora',pl:'Dostępny Teraz',ro:'Disponibil Acum'},
    'Available Tonight':{fr:'Disponible ce soir',nl:'Vanavond Beschikbaar',de:'Heute Abend',es:'Disponible Esta Noche',it:'Disponibile Stasera',pt:'Disponível Esta Noite',pl:'Dostępny Dziś Wieczór',ro:'Disponibil Astă Seară'},
    'Verified':         {fr:'Vérifié',        nl:'Geverifieerd',   de:'Verifiziert',      es:'Verificado',      it:'Verificato',       pt:'Verificado',       pl:'Zweryfikowany',    ro:'Verificat'},
    'Verified Only':    {fr:'Vérifiés uniquement',nl:'Alleen Geverifieerd',de:'Nur Verifiziert',es:'Solo Verificados',it:'Solo Verificati',pt:'Apenas Verificados',pl:'Tylko Zweryfikowani',ro:'Doar Verificați'},
    'New':              {fr:'Nouveau',        nl:'Nieuw',          de:'Neu',              es:'Nuevo',           it:'Nuovo',            pt:'Novo',             pl:'Nowy',             ro:'Nou'},
    'Featured':         {fr:'Mis en avant',   nl:'Uitgelicht',     de:'Empfohlen',        es:'Destacado',       it:'In evidenza',      pt:'Destaque',         pl:'Wyróżniony',       ro:'Recomandat'},
    'Discreet Mode':    {fr:'Mode discret',   nl:'Discrete Modus', de:'Diskreter Modus',  es:'Modo discreto',   it:'Modalità discreta',pt:'Modo Discreto',    pl:'Tryb dyskretny',   ro:'Mod discret'},
    'Discreet mode':    {fr:'Mode discret',   nl:'Discrete modus', de:'Diskreter Modus',  es:'Modo discreto',   it:'Modalità discreta',pt:'Modo Discreto',    pl:'Tryb dyskretny',   ro:'Mod discret'},
    // ── Dashboard & navigation ────────────────────────────────────────────────
    'Dashboard':        {fr:'Tableau de bord',nl:'Dashboard',      de:'Dashboard',        es:'Panel',           it:'Pannello',         pt:'Painel',           pl:'Panel',            ro:'Panou'},
    'My Advertisements':      {fr:'Mes annonces',   nl:'Mijn Advertenties',de:'Meine Anzeigen', es:'Mis anuncios',    it:'I miei annunci',   pt:'Os meus anúncios', pl:'Moje ogłoszenia',  ro:'Anunțurile mele'},
    'Messages':         {fr:'Messages',       nl:'Berichten',      de:'Nachrichten',      es:'Mensajes',        it:'Messaggi',         pt:'Mensagens',        pl:'Wiadomości',       ro:'Mesaje'},
    'Bookings':         {fr:'Réservations',   nl:'Boekingen',      de:'Buchungen',        es:'Reservas',        it:'Prenotazioni',     pt:'Reservas',         pl:'Rezerwacje',       ro:'Rezervări'},
    'Favorites':        {fr:'Favoris',        nl:'Favorieten',     de:'Favoriten',        es:'Favoritos',       it:'Preferiti',        pt:'Favoritos',        pl:'Ulubione',         ro:'Favorite'},
    'Settings':         {fr:'Paramètres',     nl:'Instellingen',   de:'Einstellungen',    es:'Configuración',   it:'Impostazioni',     pt:'Definições',       pl:'Ustawienia',       ro:'Setări'},
    'Profile':          {fr:'Profil',         nl:'Profiel',        de:'Profil',           es:'Perfil',          it:'Profilo',          pt:'Perfil',           pl:'Profil',           ro:'Profil'},
    // ── Search & filters ─────────────────────────────────────────────────────
    'Search':           {fr:'Rechercher',     nl:'Zoeken',         de:'Suchen',           es:'Buscar',          it:'Cerca',            pt:'Pesquisar',        pl:'Szukaj',           ro:'Caută'},
    'Filter':           {fr:'Filtrer',        nl:'Filter',         de:'Filtern',          es:'Filtrar',         it:'Filtra',           pt:'Filtrar',          pl:'Filtruj',          ro:'Filtrează'},
    'Sort by':          {fr:'Trier par',      nl:'Sorteren op',    de:'Sortieren nach',   es:'Ordenar por',     it:'Ordina per',       pt:'Ordenar por',      pl:'Sortuj według',    ro:'Sortare după'},
    'Price':            {fr:'Prix',           nl:'Prijs',          de:'Preis',            es:'Precio',          it:'Prezzo',           pt:'Preço',            pl:'Cena',             ro:'Preț'},
    'Location':         {fr:'Lieu',           nl:'Locatie',        de:'Ort',              es:'Ubicación',       it:'Posizione',        pt:'Localização',      pl:'Lokalizacja',      ro:'Locație'},
    'Category':         {fr:'Catégorie',      nl:'Categorie',      de:'Kategorie',        es:'Categoría',       it:'Categoria',        pt:'Categoria',        pl:'Kategoria',        ro:'Categorie'},
    'All':              {fr:'Tout',           nl:'Alles',          de:'Alle',             es:'Todo',            it:'Tutto',            pt:'Todos',            pl:'Wszystko',         ro:'Toate'},
    // ── Pricing labels ────────────────────────────────────────────────────────
    'per hour':         {fr:'par heure',      nl:'per uur',        de:'pro Stunde',       es:'por hora',        it:"all'ora",          pt:'por hora',         pl:'za godzinę',       ro:'pe oră'},
    'per night':        {fr:'par nuit',       nl:'per nacht',      de:'pro Nacht',        es:'por noche',       it:'a notte',          pt:'por noite',        pl:'za noc',           ro:'pe noapte'},
    'per day':          {fr:'par jour',       nl:'per dag',        de:'pro Tag',          es:'por día',         it:'al giorno',        pt:'por dia',          pl:'dziennie',         ro:'pe zi'},
    'from':             {fr:'à partir de',    nl:'vanaf',          de:'ab',               es:'desde',           it:'da',               pt:'a partir de',      pl:'od',               ro:'de la'},
    // ── Form labels ───────────────────────────────────────────────────────────
    'Password':         {fr:'Mot de passe',   nl:'Wachtwoord',     de:'Passwort',         es:'Contraseña',      it:'Password',         pt:'Palavra-passe',    pl:'Hasło',            ro:'Parolă'},
    'Email':            {fr:'E-mail',         nl:'E-mail',         de:'E-Mail',           es:'Correo electrónico',it:'Email',           pt:'E-mail',           pl:'E-mail',           ro:'E-mail'},
    'Your Name':        {fr:'Votre nom',      nl:'Uw naam',        de:'Ihr Name',         es:'Su nombre',       it:'Il tuo nome',      pt:'O seu nome',       pl:'Twoje imię',       ro:'Numele dvs.'},
    'Subscribe':        {fr:"S'abonner",      nl:'Abonneren',      de:'Abonnieren',       es:'Suscribirse',     it:'Iscriviti',        pt:'Subscrever',       pl:'Subskrybuj',       ro:'Abonați-vă'},
    // ── Actions ───────────────────────────────────────────────────────────────
    'Save':             {fr:'Sauvegarder',    nl:'Opslaan',        de:'Speichern',        es:'Guardar',         it:'Salva',            pt:'Guardar',          pl:'Zapisz',           ro:'Salvează'},
    'Save to Favorites':{fr:'Sauvegarder',    nl:'Opslaan',        de:'Speichern',        es:'Guardar',         it:'Salva',            pt:'Guardar',          pl:'Zapisz',           ro:'Salvează'},
    'Cancel':           {fr:'Annuler',        nl:'Annuleren',      de:'Abbrechen',        es:'Cancelar',        it:'Annulla',          pt:'Cancelar',         pl:'Anuluj',           ro:'Anulează'},
    'Submit':           {fr:'Envoyer',        nl:'Verzenden',      de:'Absenden',         es:'Enviar',          it:'Invia',            pt:'Submeter',         pl:'Wyślij',           ro:'Trimite'},
    'Close':            {fr:'Fermer',         nl:'Sluiten',        de:'Schließen',        es:'Cerrar',          it:'Chiudi',           pt:'Fechar',           pl:'Zamknij',          ro:'Închide'},
    'Edit':             {fr:'Modifier',       nl:'Bewerken',       de:'Bearbeiten',       es:'Editar',          it:'Modifica',         pt:'Editar',           pl:'Edytuj',           ro:'Editează'},
    'Delete':           {fr:'Supprimer',      nl:'Verwijderen',    de:'Löschen',          es:'Eliminar',        it:'Elimina',          pt:'Eliminar',         pl:'Usuń',             ro:'Șterge'},
    'Upload':           {fr:'Télécharger',    nl:'Uploaden',       de:'Hochladen',        es:'Subir',           it:'Carica',           pt:'Carregar',         pl:'Prześlij',         ro:'Încarcă'},
    // ── States ────────────────────────────────────────────────────────────────
    'Loading':          {fr:'Chargement…',    nl:'Laden…',         de:'Laden…',           es:'Cargando…',       it:'Caricamento…',     pt:'A carregar…',      pl:'Ładowanie…',       ro:'Se încarcă…'},
    'Loading...':       {fr:'Chargement…',    nl:'Laden…',         de:'Laden…',           es:'Cargando…',       it:'Caricamento…',     pt:'A carregar…',      pl:'Ładowanie…',       ro:'Se încarcă…'},
    // ── Homepage stats ────────────────────────────────────────────────────────
    'Active Advertisements':  {fr:'Annonces actives',nl:'Actieve Advertenties',de:'Aktive Anzeigen',es:'Anuncios activos',it:'Annunci attivi',pt:'Anúncios Ativos',pl:'Aktywne ogłoszenia',ro:'Anunțuri active'},
    'Verified Advertisers':{fr:'Prestataires vérifiés',nl:'Geverifieerde Aanbieders',de:'Verifizierte Anbieter',es:'Proveedores verificados',it:'Fornitori verificati',pt:'Prestadores Verificados',pl:'Zweryfikowani',ro:'Furnizori verificați'},
    'Cities Covered':   {fr:'Villes couvertes',nl:'Steden',        de:'Städte',           es:'Ciudades',        it:'Città',            pt:'Cidades Cobertas', pl:'Miasta',           ro:'Orașe acoperite'},
    'Private Gallery':  {fr:'Galerie Privée', nl:'Privé Galerij',  de:'Private Galerie',  es:'Galería Privada', it:'Galleria Privata', pt:'Galeria Privada',  pl:'Prywatna Galeria', ro:'Galerie Privată'},
    // ── Footer ────────────────────────────────────────────────────────────────
    'Privacy Policy':   {fr:'Politique de confidentialité',nl:'Privacybeleid',de:'Datenschutzrichtlinie',es:'Política de privacidad',it:'Informativa sulla privacy',pt:'Política de Privacidade',pl:'Polityka prywatności',ro:'Politica de confidențialitate'},
    'Terms of Service': {fr:"Conditions d'utilisation",nl:'Servicevoorwaarden',de:'Nutzungsbedingungen',es:'Términos de servicio',it:'Termini di servizio',pt:'Termos de Serviço',pl:'Warunki korzystania',ro:'Termeni de utilizare'},
    'Cookie Policy':    {fr:'Politique de cookies',nl:'Cookiebeleid',de:'Cookie-Richtlinie',es:'Política de cookies',it:'Politica sui cookie',pt:'Política de Cookies',pl:'Polityka cookies',ro:'Politica cookie'},
    'Contact Us':       {fr:'Nous contacter', nl:'Neem contact op', de:'Kontakt',          es:'Contáctenos',     it:'Contattaci',       pt:'Contacte-nos',     pl:'Kontakt',          ro:'Contactați-ne'},
  };

  // Walk text nodes in the body, replacing exact-match strings with curated translations.
  // Skips script/style tags and Google Translate overlay elements.
  function walk(lang) {
    var map = {};
    for (var k in D) { var v = D[k][lang]; if (v) map[k] = v; }
    var keys = Object.keys(map);
    if (!keys.length) return;

    var walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function(n) {
          var p = n.parentElement;
          if (!p) return NodeFilter.FILTER_REJECT;
          var tag = p.tagName;
          if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT' || tag === 'TEXTAREA') return NodeFilter.FILTER_REJECT;
          if (p.closest && p.closest('#google_translate_element, .goog-te-gadget, .goog-te-menu-frame, .goog-te-balloon-frame')) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );
    var node, nodes = [];
    while ((node = walker.nextNode())) nodes.push(node);
    nodes.forEach(function(n) {
      var t = n.textContent;
      var trimmed = t.trim();
      if (map[trimmed]) {
        // Preserve surrounding whitespace
        n.textContent = t.replace(trimmed, map[trimmed]);
      }
    });
  }

  // Apply immediately and again after GT has had time to run
  window.__sxT = function(lang) {
    if (!lang || lang === 'en') return;
    walk(lang);
    setTimeout(function(){ walk(lang); }, 1800);
    setTimeout(function(){ walk(lang); }, 4000);
  };

  // On page load, restore saved language translations
  document.addEventListener('DOMContentLoaded', function() {
    var saved = localStorage.getItem('sx_lang');
    if (saved && saved !== 'en') {
      // Wait for GT to run first, then override
      setTimeout(function(){ window.__sxT(saved); }, 2500);
    }
  });
})();
`

const langPickerScript = `
(function() {
  var LANGS = [
    { code: 'en', flag: '🇬🇧', label: 'English' },
    { code: 'fr', flag: '🇫🇷', label: 'Français' },
    { code: 'nl', flag: '🇳🇱', label: 'Nederlands' },
    { code: 'de', flag: '🇩🇪', label: 'Deutsch' },
    { code: 'es', flag: '🇪🇸', label: 'Español' },
    { code: 'it', flag: '🇮🇹', label: 'Italiano' },
    { code: 'pt', flag: '🇵🇹', label: 'Português' },
    { code: 'pl', flag: '🇵🇱', label: 'Polski' },
    { code: 'ro', flag: '🇷🇴', label: 'Română' }
  ];

  var currentLang = localStorage.getItem('sx_lang') || 'en';

  function applyLang(code) {
    currentLang = code;
    localStorage.setItem('sx_lang', code);
    var btn = document.getElementById('langPickerBtn');
    var langObj = LANGS.find(function(l){ return l.code === code; }) || LANGS[0];
    if (btn) btn.innerHTML = langObj.flag + ' <span style="font-size:11px;font-weight:600;letter-spacing:.04em">' + langObj.code.toUpperCase() + '</span> <i class="ti ti-chevron-down" style="font-size:10px;opacity:0.6"></i>';
    if (code === 'en') {
      // Clear the googtrans cookie on all domain variants and reload — the only
      // reliable way to fully revert Google Translate back to the source language.
      var host = location.hostname;
      var bare = host.replace(/^www\./, '');
      ['/', '/'].forEach(function(path) {
        document.cookie = 'googtrans=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=' + path + ';';
        document.cookie = 'googtrans=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=' + path + ';domain=' + host + ';';
        document.cookie = 'googtrans=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=' + path + ';domain=.' + bare + ';';
      });
      location.reload();
    } else {
      // Trigger Google Translate combo — retry until the GT widget has loaded
      var attempt = 0;
      function tryTranslate() {
        var combo = document.querySelector('.goog-te-combo');
        if (combo) {
          combo.value = code;
          combo.dispatchEvent(new Event('change'));
          // After GT runs, apply curated overrides
          if (window.__sxT) window.__sxT(code);
        } else if (attempt < 15) {
          attempt++;
          setTimeout(tryTranslate, 300);
        }
      }
      tryTranslate();
    }
  }

  function buildPicker() {
    var navMount = document.getElementById('langPickerNavMount');
    var wrap = navMount || document.getElementById('langPickerWrap');
    if (!wrap) return;
    var inNav = !!navMount;

    var btn = document.createElement('button');
    btn.id = 'langPickerBtn';
    btn.setAttribute('aria-label', 'Select language');
    var initLang = LANGS.find(function(l){ return l.code === currentLang; }) || LANGS[0];
    btn.innerHTML = initLang.flag + ' <span style="font-size:11px;font-weight:600;letter-spacing:.04em">' + initLang.code.toUpperCase() + '</span> <i class="ti ti-chevron-down" style="font-size:10px;opacity:0.6"></i>';
    btn.style.cssText = 'display:inline-flex;align-items:center;gap:5px;height:34px;padding:0 10px;background:var(--bg2,rgba(255,255,255,0.06));border:0.5px solid var(--b2,rgba(255,255,255,0.1));border-radius:10px;cursor:pointer;color:var(--t,#ece8e1);font-family:inherit;font-size:13px;transition:border-color .2s;white-space:nowrap;';

    var dropdown = document.createElement('div');
    dropdown.id = 'langDropdown';
    dropdown.style.cssText = 'display:none;position:absolute;' + (inNav ? 'top:calc(100% + 8px)' : 'bottom:calc(100% + 8px)') + ';right:0;background:var(--bg1,#100e1a);border:0.5px solid var(--b2,rgba(255,255,255,0.12));border-radius:12px;padding:6px;min-width:170px;box-shadow:0 16px 48px rgba(0,0,0,0.7);z-index:10000;';

    LANGS.forEach(function(lang) {
      var item = document.createElement('button');
      item.style.cssText = 'display:flex;align-items:center;gap:9px;width:100%;background:none;border:none;padding:8px 10px;border-radius:8px;cursor:pointer;color:var(--t2,rgba(236,232,225,0.65));font:400 13px inherit;transition:background .15s,color .15s;text-align:left;';
      item.innerHTML = '<span style="font-size:16px">' + lang.flag + '</span><span style="flex:1">' + lang.label + '</span>' + (lang.code === currentLang ? '<i class="ti ti-check" style="font-size:12px;color:var(--gold,#c5a05a)"></i>' : '');
      item.onmouseenter = function(){ item.style.background='var(--bg2,rgba(255,255,255,0.05))'; item.style.color='var(--t,#ece8e1)'; };
      item.onmouseleave = function(){ item.style.background='none'; item.style.color='var(--t2,rgba(236,232,225,0.65))'; };
      item.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdown.style.display = 'none';
        dropdown.querySelectorAll('i.ti-check').forEach(function(el){ el.remove(); });
        item.innerHTML = '<span style="font-size:16px">' + lang.flag + '</span><span style="flex:1">' + lang.label + '</span><i class="ti ti-check" style="font-size:12px;color:var(--gold,#c5a05a)"></i>';
        applyLang(lang.code);
      });
      dropdown.appendChild(item);
    });

    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      var open = dropdown.style.display !== 'none';
      dropdown.style.display = open ? 'none' : 'block';
    });
    document.addEventListener('click', function() { dropdown.style.display = 'none'; });

    if (!inNav) {
      wrap.style.cssText = 'position:fixed;bottom:100px;right:24px;z-index:9997;';
    }
    wrap.appendChild(btn);
    wrap.appendChild(dropdown);

    // Restore saved language after GT loads
    if (currentLang !== 'en') {
      setTimeout(function(){ applyLang(currentLang); }, 1200);
      // Extra curated-translation pass after GT settles
      setTimeout(function(){ if (window.__sxT) window.__sxT(currentLang); }, 3000);
    }
  }

  var built = false;
  function tryBuild(attempt) {
    if (built) return;
    if (document.getElementById('langPickerNavMount') || document.getElementById('langPickerWrap')) {
      built = true;
      buildPicker();
      return;
    }
    if (attempt < 40) setTimeout(function(){ tryBuild(attempt + 1); }, 150);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ tryBuild(0); });
  } else {
    tryBuild(0);
  }
})();
`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="velvet">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css"
        />
        <Script id="theme-bootstrap" strategy="beforeInteractive">
          {themeBootstrap}
        </Script>
        {/* Hide Google Translate banner/toolbar so it doesn't push layout */}
        <style>{`
          .goog-te-banner-frame, .goog-te-ftab-float, #goog-gt-tt { display:none!important; }
          body { top:0!important; }
          .goog-te-combo { display:none!important; }
        `}</style>
      </head>
      <body>
        {children}
        {/* Hidden GT mount point */}
        <div id="google_translate_element" style={{ display: 'none', visibility: 'hidden', position: 'absolute' }} />
        {/* Language picker floating button */}
        <div id="langPickerWrap" />
        <Script id="gt-init" strategy="afterInteractive">{gtInit}</Script>
        <Script
          src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />
        <Script id="sx-translations" strategy="afterInteractive">{sxTranslationsScript}</Script>
        <Script id="lang-picker" strategy="afterInteractive">{langPickerScript}</Script>
        <WelcomeChoice />
        <PrivacyPanic />
        <CookieBanner />
        <AttributionTracker />
        <PageviewTracker />
        <PrideMode />
        <BackToTop />
      </body>
    </html>
  )
}
