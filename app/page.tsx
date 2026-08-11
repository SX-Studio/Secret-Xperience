'use client'
import { useEffect, useState } from 'react'
import { createClient } from './lib/supabase'
import SliderAds from './components/SliderAds/SliderAds'
import PremiumBanner from './components/PremiumBanner/PremiumBanner'
import JoyBanner from './components/JoyBanner/JoyBanner'
import LiveBanner from './components/LiveBanner/LiveBanner'
import CategoryAnimations from './components/CategoryAnimations/CategoryAnimations'
import UpcomingEventBanner from './components/UpcomingEventBanner'
import PartnersShowcase from './components/PartnersShowcase/PartnersShowcase'
import VenuesShowcase from './components/VenuesShowcase'
import OnlyFansShowcase from './components/OnlyFansShowcase/OnlyFansShowcase'
import StripchatLive from './components/StripchatLive/StripchatLive'
import HeroThemes from './components/HeroThemes/HeroThemes'
import ShopShowcase from './components/ShopShowcase/ShopShowcase'
import DesignDemos from './components/DesignDemos'

export default function Home() {
  useEffect(() => {
    const supabase = createClient()
    let currentSession: any = null

    // Detect viewer's country for geo-blocking (fire-and-forget, non-blocking)
    fetch('/api/geo').then(r => r.json()).then(({ country }) => {
      if (country) (window as any).__viewerCountry = country
    }).catch(() => {})

// ── Age Gate ──
var gate = document.getElementById('gate');
function dismissGate() {
  if (gate) gate.classList.add('gone');
  document.body.style.overflow = '';
  // Store with 30-day expiry timestamp
  localStorage.setItem('sx_age_ok', String(Date.now() + 30 * 24 * 60 * 60 * 1000));
}
// Skip gate if verified within last 30 days
var _ageOk = parseInt(localStorage.getItem('sx_age_ok') || '0');
if (_ageOk > Date.now()) {
  if (gate) gate.classList.add('gone');
} else {
  // Clear any stale/legacy value
  localStorage.removeItem('sx_age_ok');
  // Block scroll while gate is visible
  document.body.style.overflow = 'hidden';
  // Also skip if user has an active Supabase session (already logged in)
  try {
    var _sbUrl = document.querySelector('meta[name="sb-url"]')?.getAttribute('content') || '';
    var _sbKey = document.querySelector('meta[name="sb-key"]')?.getAttribute('content') || '';
    if (!_sbUrl) {
      // Fall back to env-injected values if meta tags not present
      _sbUrl = (window as any).__SB_URL__ || '';
      _sbKey = (window as any).__SB_KEY__ || '';
    }
    // Check localStorage for Supabase session token (all Supabase v2 clients store it here)
    var _hasSession = false;
    for (var _k in localStorage) {
      if (_k.startsWith('sb-') && _k.endsWith('-auth-token')) {
        try {
          var _tok = JSON.parse(localStorage.getItem(_k) || '{}');
          if (_tok && _tok.access_token) { _hasSession = true; break; }
        } catch(e) {}
      }
    }
    if (_hasSession) dismissGate();
  } catch(e) {}
}
function showRoleStep(){
  var box = gate ? gate.querySelector('.gate-box') : null;
  if (!box) { dismissGate(); return; }
  box.innerHTML = '<div style="position:absolute;top:-60px;left:50%;transform:translateX(-50%);width:200px;height:200px;background:radial-gradient(circle,rgba(197,160,90,0.15) 0%,transparent 70%);pointer-events:none;"></div>'
    + '<div style="font:600 11px/1 var(--sans);letter-spacing:0.32em;color:var(--gold);text-align:center;margin-bottom:1.25rem;text-transform:uppercase;position:relative;z-index:2;">Welcome</div>'
    + '<h2 style="font-family:var(--serif);font-size:24px;font-weight:400;text-align:center;margin:0 0 0.4rem;position:relative;z-index:2;">How would you like to explore?</h2>'
    + '<p style="text-align:center;margin:0 auto 1.5rem;color:var(--t2);font-size:13px;line-height:1.6;position:relative;z-index:2;max-width:300px;">You can switch anytime — this just tailors your experience.</p>'
    + '<div style="display:flex;flex-direction:column;gap:12px;position:relative;z-index:2;">'
    + '<button id="roleVisitor" style="display:flex;align-items:center;gap:14px;width:100%;padding:16px 18px;background:var(--bg2);border:0.5px solid var(--b2);border-radius:var(--rl);cursor:pointer;text-align:left;transition:border-color .15s,background .15s;font-family:var(--sans);">'
    +   '<i class="ti ti-eye" style="font-size:26px;color:var(--gold);flex-shrink:0;"></i>'
    +   '<span><span style="display:block;font-size:15px;font-weight:600;color:var(--t);margin-bottom:2px;">I am here to browse</span><span style="display:block;font-size:12px;color:var(--t3);">Discover companions, venues & experiences</span></span>'
    + '</button>'
    + '<button id="roleAdvertiser" style="display:flex;align-items:center;gap:14px;width:100%;padding:16px 18px;background:var(--bg2);border:0.5px solid var(--b2);border-radius:var(--rl);cursor:pointer;text-align:left;transition:border-color .15s,background .15s;font-family:var(--sans);">'
    +   '<i class="ti ti-briefcase" style="font-size:26px;color:var(--gold);flex-shrink:0;"></i>'
    +   '<span><span style="display:block;font-size:15px;font-weight:600;color:var(--t);margin-bottom:2px;">I offer a service</span><span style="display:block;font-size:12px;color:var(--t3);">List as an advertiser, venue or creator — free</span></span>'
    + '</button>'
    + '</div>';
  var hov = function(b){ b.addEventListener('mouseover',function(){b.style.borderColor='var(--gold)';b.style.background='var(--gbg)';}); b.addEventListener('mouseout',function(){b.style.borderColor='var(--b2)';b.style.background='var(--bg2)';}); };
  var bv = document.getElementById('roleVisitor');
  var bp = document.getElementById('roleAdvertiser');
  if (bv) { hov(bv); bv.addEventListener('click', function(){ try{localStorage.setItem('sx_role','visitor');}catch(e){} dismissGate(); }); }
  if (bp) { hov(bp); bp.addEventListener('click', function(){ try{localStorage.setItem('sx_role','provider');}catch(e){} dismissGate(); window.location.href='/advertise'; }); }
}
document.getElementById('gyes').addEventListener('click', function(){
  // Lock in age verification immediately, then offer role choice
  try { localStorage.setItem('sx_age_ok', String(Date.now() + 30 * 24 * 60 * 60 * 1000)); } catch(e){}
  showRoleStep();
});
document.getElementById('gno').addEventListener('click', function(){
  gate.innerHTML = '<div style="position:relative;z-index:2;background:var(--bg1);border:0.5px solid var(--b3);border-radius:var(--rxl);padding:2.5rem 2rem;max-width:360px;width:90%;text-align:center"><div style="font-family:var(--serif);font-size:22px;color:var(--t);margin-bottom:.75rem">Access Denied</div><div style="font-size:13px;color:var(--t2)">You must be 18 or older to access SecretXperience.eu.</div></div>';
});
// ── Sidebar (mobile) ──
var sidebar = document.getElementById('sidebar');
var sov = document.getElementById('sov');
var navDrawer = document.getElementById('navDrawer');
function openSidebar(){ sidebar.classList.add('open'); sov.classList.add('show'); sov.setAttribute('aria-hidden','false'); }
function closeSidebar(){ sidebar.classList.remove('open'); sov.classList.remove('show'); sov.setAttribute('aria-hidden','true'); }
function openNavDrawer(){ navDrawer.classList.add('open'); sov.classList.add('show'); sov.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; }
function closeNavDrawer(){ navDrawer.classList.remove('open'); sov.classList.remove('show'); sov.setAttribute('aria-hidden','true'); document.body.style.overflow=''; }
document.getElementById('menuBtn').addEventListener('click', function(e){ e.stopPropagation(); openNavDrawer(); });
document.getElementById('navDrawerClose').addEventListener('click', closeNavDrawer);
document.getElementById('filterToggle').addEventListener('click', function(e){ e.stopPropagation(); openSidebar(); });
document.getElementById('sideClose').addEventListener('click', closeSidebar);
// Stop clicks inside the drawer/sidebar from bubbling to the outside-click handler
navDrawer.addEventListener('click', function(e){ e.stopPropagation(); });
if(sidebar) sidebar.addEventListener('click', function(e){ e.stopPropagation(); });
// Close drawer/sidebar when tapping outside (sov is pointer-events:none, use document)
document.addEventListener('click', function(){ closeSidebar(); closeNavDrawer(); });

// ── Location city picker ──
;(function(){
  var locBtn = document.getElementById('locBtn');
  if(!locBtn) return;
  var CITIES = ['All Cities','Brussels','Antwerp','Ghent','Amsterdam','Berlin','Paris','Cologne','Rotterdam'];
  var picker: HTMLElement | null = null;
  function closePicker(){ if(picker && picker.parentNode){ picker.parentNode.removeChild(picker); picker=null; } }
  locBtn.addEventListener('click', function(e){
    e.stopPropagation();
    if(picker){ closePicker(); return; }
    picker = document.createElement('div');
    picker.style.cssText = 'position:absolute;top:calc(100% + 8px);left:0;z-index:500;background:var(--bg1);border:0.5px solid var(--b2);border-radius:var(--rl);padding:0.5rem;min-width:180px;box-shadow:0 12px 40px rgba(0,0,0,0.55);';
    CITIES.forEach(function(c){
      var item = document.createElement('button');
      item.textContent = c;
      item.style.cssText = 'display:block;width:100%;text-align:left;background:none;border:none;padding:8px 14px;font:400 13px var(--sans);color:var(--t2);cursor:pointer;border-radius:8px;transition:background 0.15s,color 0.15s;';
      item.onmouseenter = function(){ item.style.background='var(--bg2)'; item.style.color='var(--t)'; };
      item.onmouseleave = function(){ item.style.background='none'; item.style.color='var(--t2)'; };
      item.addEventListener('click', function(ev){ ev.stopPropagation();
        locBtn.innerHTML = '<i class="ti ti-map-pin" aria-hidden="true"></i> ' + (c === 'All Cities' ? 'Location' : c);
        (window as any).__activeCity = c === 'All Cities' ? null : c;
        if(typeof (window as any).activeFilters !== 'undefined'){
          const _c = (window as any).__activeCity;
          if (_c === null) { (window as any).activeFilters.cities = []; } else { (window as any).activeFilters.cities = [_c]; }
          if(typeof (window as any).fetchListings === 'function') (window as any).fetchListings((window as any).activeFilters);
        }
        closePicker();
      });
      picker!.appendChild(item);
    });
    locBtn.style.position = 'relative';
    locBtn.appendChild(picker!);
  });
  document.addEventListener('click', closePicker);
})();

// ── Hero search button ──
;(function(){
  var heroSearch = document.getElementById('heroSearch') as HTMLInputElement | null;
  var searchBtn = document.getElementById('heroSearchBtn') as HTMLButtonElement | null;
  if(searchBtn && heroSearch){
    searchBtn.addEventListener('click', function(){
      var q = heroSearch!.value.trim();
      window.location.href = q ? '/search?q=' + encodeURIComponent(q) : '/search';
    });
  }
})();

// ── Interactive pills / tabs ──
document.querySelectorAll('.cat').forEach(function(c){
  c.addEventListener('click', function(){
    document.querySelectorAll('.cat').forEach(function(x){ x.classList.remove('active'); });
    this.classList.add('active');
  });
});

// ── Category group dropdowns (catbar) ──
// Menus are moved to <body> so no parent stacking context can trap them
(function(){
  // Portal: move each menu to body so position:fixed is always root-relative
  document.querySelectorAll('.cat-group-pill').forEach(function(pill){
    var groupId = (pill as HTMLElement).dataset.group;
    if (!groupId) return;
    var menu = document.getElementById('cgm-' + groupId);
    if (menu) document.body.appendChild(menu);
  });

  function closeAllGroups(){
    document.querySelectorAll('.cat-group-menu').forEach(function(m){ m.classList.remove('open'); });
    document.querySelectorAll('.cat-group-pill').forEach(function(p){
      p.classList.remove('open');
      (p as HTMLElement).setAttribute('aria-expanded','false');
    });
  }

  document.querySelectorAll('.cat-group-pill').forEach(function(pill){
    pill.addEventListener('click', function(e){
      e.stopPropagation();
      var groupId = (pill as HTMLElement).dataset.group;
      if (!groupId) return;
      var menu = document.getElementById('cgm-' + groupId);
      var isOpen = menu && menu.classList.contains('open');
      closeAllGroups();
      if (!isOpen && menu){
        var rect = pill.getBoundingClientRect();
        (menu as HTMLElement).style.left = rect.left + 'px';
        (menu as HTMLElement).style.top = (rect.bottom + 8) + 'px';
        menu.classList.add('open');
        pill.classList.add('open');
        (pill as HTMLElement).setAttribute('aria-expanded','true');
      }
    });
  });

  document.addEventListener('click', closeAllGroups);
})();

document.querySelectorAll('.pp').forEach(function(p){
  p.addEventListener('click', function(){
    document.querySelectorAll('.pp').forEach(function(x){ x.classList.remove('active'); });
    this.classList.add('active');
  });
});

document.querySelectorAll('.tab').forEach(function(t){
  t.addEventListener('click', function(){
    document.querySelectorAll('.tab').forEach(function(x){ x.classList.remove('active'); });
    this.classList.add('active');
  });
});
document.querySelectorAll('.bni').forEach(function(b){
  b.addEventListener('click', function(){
    document.querySelectorAll('.bni').forEach(function(x){ x.classList.remove('active'); });
    this.classList.add('active');
  });
});
document.querySelectorAll('.tier').forEach(function(t){
  t.addEventListener('click', function(){
    document.querySelectorAll('.tier').forEach(function(x){ x.style.outline='none'; });
    this.style.outline = '1.5px solid var(--gold)';
  });
});

// ── Rating slider — handled by the listener below with null guard ──

// ── How It Works data ──
var howData = {
  escorts: {
    name: 'Escorts',
    desc: 'Browse verified escort profiles filtered by type — independent, private, agency, VIP/elite, touring, duo and more. Message directly or book through SecretXperience for a fully discreet experience.',
    steps: ['Browse & filter','View verified profile','Message or book','Discreet confirmation'],
    anim: function(el){
      var types=['Independent','Private','Agency','VIP','Touring'], colors=['rgba(100,80,200,.2)','rgba(184,77,114,.2)','rgba(26,143,106,.2)','rgba(197,160,90,.2)','rgba(100,140,220,.2)'], tcs=['#b0a0f8','#e07aa0','#26d4a0','var(--gold)','#7aaaee'];
      types.forEach(function(t,i){
        var d=document.createElement('div');
        d.style.cssText='position:absolute;left:'+Math.max(8,8+i*118)+'px;top:calc(50% - 55px);width:100px;border:0.5px solid rgba(255,255,255,0.1);border-radius:13px;background:var(--bg1);padding:10px 8px;text-align:center;opacity:0;animation:fadeInUp .4s forwards;animation-delay:'+(i*.1)+'s';
        d.innerHTML='<div style="width:34px;height:34px;border-radius:50%;background:'+colors[i]+';margin:0 auto 6px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;color:'+tcs[i]+'">'+t[0]+t[1]+'</div><div style="font-size:10px;font-weight:600;color:var(--t)">'+t+'</div><div style="margin-top:4px;font-size:9px;background:rgba(38,212,160,.12);color:#26d4a0;border-radius:6px;padding:1px 0">✓ Verified</div>';
        el.appendChild(d);
      });
    }
  },
  companionship: {
    name: 'Companionship',
    desc: 'Find companions for dinner dates, travel, social events and personal connection. All profiles are identity-verified. Set your preferences, book your time, and enjoy a fully discreet experience.',
    steps: ['Search companions','Check availability','Set experience type','Confirm & meet'],
    anim: function(el){
      ['Dinner Date','Travel','Social Events','Personal Time'].forEach(function(ev,i){
        var d=document.createElement('div');
        d.style.cssText='position:absolute;left:'+(8+i*152)+'px;top:calc(50% - 50px);width:136px;background:var(--bg1);border:0.5px solid rgba(255,255,255,0.1);border-radius:13px;padding:14px;text-align:center;opacity:0;animation:fadeInUp .5s forwards;animation-delay:'+(i*.12)+'s';
        d.innerHTML='<i class="ti ti-heart" style="font-size:24px;color:var(--pink)" aria-hidden="true"></i><div style="font-size:11px;font-weight:600;margin-top:7px;color:var(--t)">'+ev+'</div>';
        el.appendChild(d);
      });
    }
  },
  nightlife: {
    name: 'Nightlife',
    desc: 'Discover premium clubs, bars, private parties, and adult entertainment venues. Real-time door status, event calendars, table reservations, and guest list bookings — all in one place.',
    steps: ['Find a venue','Check the calendar','Reserve / guest list','Arrive & enjoy'],
    anim: function(el){
      el.style.background='var(--bg)';
      for(var i=0;i<18;i++){
        var d=document.createElement('div');
        var x=Math.random()*90;var s=Math.random()*5+2;
        d.style.cssText='position:absolute;left:'+x+'%;bottom:50px;width:'+s+'px;height:'+s+'px;border-radius:50%;background:var(--gold);opacity:'+(Math.random()*.5+.1)+';animation:floatBubble '+(Math.random()*2+1.5)+'s linear infinite;animation-delay:'+(Math.random()*2)+'s';
        el.appendChild(d);
      }
      var bar=document.createElement('div');
      bar.style.cssText='position:absolute;bottom:0;left:0;right:0;height:50px;background:var(--bg1);border-top:0.5px solid rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:center;gap:14px';
      ['Club Noir','The Velvet','Boudoir X'].forEach(function(n){
        var b=document.createElement('div');
        b.style.cssText='font-size:11px;font-weight:600;color:var(--gold);padding:5px 13px;border:0.5px solid var(--gbrd);border-radius:12px;background:var(--gbg)';
        b.textContent=n; bar.appendChild(b);
      });
      el.appendChild(bar);
    }
  },
  creators: {
    name: 'Creators',
    desc: 'Subscribe to exclusive adult creator content — photos, videos, live streams and custom requests. Creators set their own rates. Full privacy, direct messaging, and tip-based interactions built in.',
    steps: ['Discover creators','Subscribe or tip','Unlock content','Message directly'],
    anim: function(el){
      ['LC','NV','MX','RK'].forEach(function(c,i){
        var d=document.createElement('div');
        d.style.cssText='position:absolute;left:'+(8+i*155)+'px;top:calc(50% - 65px);width:140px;border:0.5px solid rgba(255,255,255,0.1);border-radius:13px;background:var(--bg1);overflow:hidden;opacity:0;animation:slideInL .4s forwards;animation-delay:'+(i*.12)+'s';
        d.innerHTML='<div style="height:70px;background:var(--bg2);display:flex;align-items:center;justify-content:center"><div style="width:42px;height:42px;border-radius:50%;background:rgba(100,80,200,.2);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:600;color:#b0a0f8">'+c+'</div></div><div style="padding:9px"><div style="font-size:11px;font-weight:600;color:var(--t)">Creator '+c+'</div><div style="font-size:9px;color:var(--t3);margin-top:1px">from €15/mo</div><div style="margin-top:5px;font-size:9px;background:var(--gbg);color:var(--gold);border-radius:6px;padding:2px 0;text-align:center;border:0.5px solid var(--gbrd)">Subscribe</div></div>';
        el.appendChild(d);
      });
    }
  },
  rentals: {
    name: 'Rentals',
    desc: 'Book private apartments, themed suites, or discreet villas. Verified locations with flexible hourly, nightly or weekly bookings. Full amenity listings and secure payment.',
    steps: ['Search locations','View amenities','Pick your time slot','Check in discreetly'],
    anim: function(el){
      ['Private Apt.','Themed Suite','Villa','Loft'].forEach(function(p,i){
        var d=document.createElement('div');
        d.style.cssText='position:absolute;left:'+(8+i*155)+'px;top:calc(50% - 65px);width:140px;border:0.5px solid rgba(255,255,255,0.1);border-radius:13px;overflow:hidden;background:var(--bg1);opacity:0;animation:fadeInUp .4s forwards;animation-delay:'+(i*.13)+'s';
        d.innerHTML='<div style="height:70px;background:var(--bg2);display:flex;align-items:center;justify-content:center"><i class="ti ti-home" style="font-size:28px;color:var(--t3)" aria-hidden="true"></i></div><div style="padding:9px"><div style="font-size:11px;font-weight:600;color:var(--t)">'+p+'</div><div style="font-size:9px;background:rgba(26,143,106,.15);color:#1dc9a0;border-radius:6px;padding:2px 0;text-align:center;margin-top:5px">✓ Verified</div></div>';
        el.appendChild(d);
      });
    }
  },
  hotels: {
    name: 'Hotels',
    desc: 'Discreet hotel listings with adult-friendly policies. Filter by amenities, privacy rating, and SecretXperience member discount partnerships. Instant booking with guaranteed privacy.',
    steps: ['Filter hotels','Check policies','Book your room','Member discount applied'],
    anim: function(el){
      ['Hôtel Discret','The Lounge','Velvet Rooms'].forEach(function(h,i){
        var d=document.createElement('div');
        d.style.cssText='position:absolute;left:'+(12+i*208)+'px;top:calc(50% - 55px);width:190px;border:0.5px solid rgba(255,255,255,0.1);border-radius:13px;background:var(--bg1);padding:14px;opacity:0;animation:slideInL .5s forwards;animation-delay:'+(i*.15)+'s';
        d.innerHTML='<i class="ti ti-bed" style="font-size:24px;color:var(--t3)" aria-hidden="true"></i><div style="font-family:var(--serif);font-size:14px;color:var(--t);margin-top:6px">'+h+'</div><div style="font-size:12px;color:var(--gold);margin-top:2px">★★★★★</div><div style="font-size:9px;color:var(--t3);margin-top:3px">Adult-friendly · Discreet</div>';
        el.appendChild(d);
      });
    }
  },
  events: {
    name: 'Event Spaces',
    desc: 'Private venues for adult gatherings, themed parties, and exclusive events. Capacity filters, catering options, AV support, and full event planning assistance through the platform.',
    steps: ['Choose a venue','Set your event type','Invite guests','Host the night'],
    anim: function(el){
      ['Private Party','Themed Night','Networking','Dinner Event'].forEach(function(e,i){
        var d=document.createElement('div');
        d.style.cssText='position:absolute;top:'+(12+Math.floor(i/2)*75)+'px;left:'+(8+(i%2)*310)+'px;width:290px;border:0.5px solid rgba(255,255,255,0.1);border-radius:13px;background:var(--bg1);padding:11px 13px;display:flex;align-items:center;gap:11px;opacity:0;animation:fadeInUp .4s forwards;animation-delay:'+(i*.12)+'s';
        d.innerHTML='<i class="ti ti-calendar-event" style="font-size:22px;color:var(--t3)" aria-hidden="true"></i><div><div style="font-size:12px;font-weight:600;color:var(--t)">'+e+'</div><div style="font-size:10px;color:var(--t3);margin-top:1px">Brussels · Up to 120 guests</div></div>';
        el.appendChild(d);
      });
    }
  },
  photo: {
    name: 'Photo / Video Locations',
    desc: 'Professionally equipped studios and private sets for adult photography and video production. All venues verified, legally compliant, and bookable by the hour or full day.',
    steps: ['Find a studio','Check equipment list','Book your time slot','Shoot & wrap'],
    anim: function(el){
      ['4K Camera','Ring Lights','Backdrops','Sound Booth','Private Set'].forEach(function(eq,i){
        var d=document.createElement('div');
        d.style.cssText='position:absolute;left:'+(8+i*122)+'px;top:calc(50% - 50px);width:110px;border:0.5px solid rgba(255,255,255,0.1);border-radius:13px;background:var(--bg1);padding:12px;text-align:center;opacity:0;animation:bounceSoft .6s ease-in-out forwards;animation-delay:'+(i*.12)+'s';
        d.innerHTML='<i class="ti ti-camera" style="font-size:24px;color:var(--t3)" aria-hidden="true"></i><div style="font-size:10px;font-weight:600;margin-top:6px;color:var(--t)">'+eq+'</div>';
        el.appendChild(d);
      });
    }
  },
  shop: {
    name: 'Adult Shop',
    desc: 'Browse curated adult product collections from verified sellers. Discreet shipping guaranteed. Filter by category, brand, and price. Member discounts on all partner products.',
    steps: ['Browse products','Add to cart','Discreet checkout','Delivered to you'],
    anim: function(el){
      ['Lingerie','Toys','Accessories','Wellness','Books'].forEach(function(item,i){
        var d=document.createElement('div');
        d.style.cssText='position:absolute;left:'+(8+i*122)+'px;top:calc(50% - 62px);width:110px;border:0.5px solid rgba(255,255,255,0.1);border-radius:13px;background:var(--bg1);overflow:hidden;opacity:0;animation:fadeInUp .4s forwards;animation-delay:'+(i*.1)+'s';
        d.innerHTML='<div style="height:66px;background:var(--bg2);display:flex;align-items:center;justify-content:center"><i class="ti ti-shopping-bag" style="font-size:26px;color:var(--t3)" aria-hidden="true"></i></div><div style="padding:7px 9px"><div style="font-size:10px;font-weight:600;color:var(--t)">'+item+'</div><div style="font-size:9px;color:var(--t3)">From €19</div></div>';
        el.appendChild(d);
      });
    }
  },
  memberships: {
    name: 'Memberships',
    desc: 'Upgrade to Gold or Platinum for priority placement, exclusive access, verified badges, premium filters, and member-only discounts across every category on SecretXperience.',
    steps: ['Choose your tier','Unlock features','Get discounts','Priority access'],
    anim: function(el){
      [{n:'Free',bg:'var(--bg3)',c:'var(--t2)',f:['Basic search','Public listings','Saved listings']},{n:'Gold',bg:'var(--gbg)',c:'var(--gold)',f:['Premium filters','Member discounts','Priority messaging','Verified badge']},{n:'Platinum',bg:'var(--tbg)',c:'#1dc9a0',f:['All Gold features','Top placement','Exclusive events','Dedicated support']}].forEach(function(t,i){
        var d=document.createElement('div');
        d.style.cssText='position:absolute;left:'+(10+i*207)+'px;top:12px;width:190px;border-radius:13px;background:var(--bg1);border:0.5px solid rgba(255,255,255,0.1);padding:13px;opacity:0;animation:slideInL .5s forwards;animation-delay:'+(i*.15)+'s';
        var feats=t.f.map(function(f){return'<div style="font-size:10px;color:var(--t3);padding:3px 0;border-top:0.5px solid rgba(255,255,255,0.06)">✓ '+f+'</div>'}).join('');
        d.innerHTML='<div style="background:'+t.bg+';color:'+t.c+';border-radius:7px;padding:6px 0;text-align:center;font-size:12px;font-weight:600;margin-bottom:9px;letter-spacing:.04em">'+t.n+'</div>'+feats;
        el.appendChild(d);
      });
    }
  }
};

function renderHow(key){
  var d = howData[key]; if(!d) return;
  var demo = document.getElementById('expDemo');
  demo.innerHTML = '';
  demo.style.background = 'var(--bg2)';
  d.anim(demo);
  document.getElementById('expName').textContent = d.name;
  document.getElementById('expDesc').textContent = d.desc;
  var stepsEl = document.getElementById('expSteps');
  stepsEl.innerHTML = '';
  d.steps.forEach(function(s,i){
    var div = document.createElement('div'); div.className = 'estep';
    div.innerHTML = '<div class="esn">'+(i+1)+'</div><span>'+s+'</span>';
    stepsEl.appendChild(div);
  });
}

document.querySelectorAll('.hcat').forEach(function(c){
  c.addEventListener('click', function(){
    document.querySelectorAll('.hcat').forEach(function(x){ x.classList.remove('active'); });
    this.classList.add('active');
    renderHow(this.dataset.how);
  });
});
// ── Detail panel data ──
var listingData = {
  'Sophia A.': {
    icon:'ti-user', cat:'Escort · Independent', type:'Private', name:'Sophia A.',
    rating:'4.9', city:'Brussels, BE', s1:'128', s2:'4.9', s3:'3 yrs', s4:'2.1k',
    badges:[{cls:'bv',txt:'✓ Verified'},{cls:'bp',txt:'Premium'}],
    desc:'A discreet, elegant companion based in Brussels. Available for private meetings, dinner dates, and overnight bookings. Fluent in English, French, and Dutch. All interactions are handled with the utmost professionalism.',
    tags:['Dinner date','Overnight','Travel companion','Social events','Private meetings','GFE'],
    pricing:[{dur:'1 Hour',amt:'€200',note:'Incall or outcall',feat:false},{dur:'2 Hours',amt:'€350',note:'Most popular',feat:true},{dur:'Half day',amt:'€600',note:'4 hrs · flexible',feat:false},{dur:'Overnight',amt:'€1,200',note:'10pm – 8am',feat:false}],
  },
  'Elise V.': {
    icon:'ti-user', cat:'Escort · Agency', type:'Elite', name:'Elise V.',
    rating:'5.0', city:'Antwerp, BE', s1:'214', s2:'5.0', s3:'5 yrs', s4:'4.8k',
    badges:[{cls:'bv',txt:'✓ Verified'},{cls:'be',txt:'VIP'}],
    desc:'Elite agency companion available in Antwerp and Brussels. Impeccable presentation, multilingual, and experienced in high-end corporate and private social settings. Available for travel throughout Europe.',
    tags:['VIP events','Corporate','Overnight','Travel Europe','Dinner date','Duo available'],
    pricing:[{dur:'1 Hour',amt:'€500',note:'Outcall only',feat:false},{dur:'3 Hours',amt:'€1,200',note:'Most popular',feat:true},{dur:'Half day',amt:'€1,800',note:'Up to 6 hrs',feat:false},{dur:'Full day',amt:'€3,500',note:'International',feat:false}],
  },
  'Nadia R.': {
    icon:'ti-user', cat:'Escort · Touring', type:'Touring', name:'Nadia R.',
    rating:'4.8', city:'Ghent, BE', s1:'97', s2:'4.8', s3:'2 yrs', s4:'1.4k',
    badges:[{cls:'bv',txt:'✓ Verified'}],
    desc:'Touring companion visiting Belgium regularly. Available in Ghent, Brussels, and Bruges. Warm, genuine, and easy to be with. Great for longer bookings and travel experiences.',
    tags:['Dinner date','GFE','Travel','Overnight','Social events'],
    pricing:[{dur:'1 Hour',amt:'€350',note:'Incall or outcall',feat:false},{dur:'2 Hours',amt:'€600',note:'Most popular',feat:true},{dur:'Overnight',amt:'€1,000',note:'Touring rate',feat:false},{dur:'Weekend',amt:'€2,800',note:'Travel incl.',feat:false}],
  },
  'Club Noir': {
    icon:'ti-building', cat:'Nightlife', type:'Members Club', name:'Club Noir',
    rating:'4.7', city:'Brussels, BE', s1:'342', s2:'4.7', s3:'8 yrs', s4:'18k',
    badges:[{cls:'bt',txt:'Trending'}],
    desc:'Brussels\'s most exclusive private nightclub. Strict door policy, high-end bar, themed nights every weekend. Membership and guest list available through SecretXperience.',
    tags:['Private bar','Themed nights','Guest list','VIP tables','Late license','Members only'],
    pricing:[{dur:'Entry',amt:'€50',note:'Guest list',feat:false},{dur:'VIP Table',amt:'€500',note:'Bottle included',feat:true},{dur:'Private Room',amt:'€1,200',note:'Up to 20 guests',feat:false},{dur:'Membership',amt:'€200/mo',note:'Priority entry',feat:false}],
  },
  'Luna Creative': {
    icon:'ti-camera', cat:'Creators', type:'Subscription', name:'Luna Creative',
    rating:'4.8', city:'Online', s1:'840', s2:'4.8', s3:'1 yr', s4:'12k',
    badges:[{cls:'bv',txt:'✓ Verified'}],
    desc:'Premium adult content creator with exclusive photo sets, video content, and live sessions. New content posted weekly. Direct messaging included with all tiers.',
    tags:['Photo sets','Video content','Live sessions','Custom requests','Messaging','Behind the scenes'],
    pricing:[{dur:'Basic',amt:'€9/mo',note:'Photos & video',feat:false},{dur:'Premium',amt:'€15/mo',note:'+ live sessions',feat:true},{dur:'VIP',amt:'€35/mo',note:'Custom content',feat:false},{dur:'Custom',amt:'POA',note:'One-off request',feat:false}],
  },
  'Le Boudoir Suite': {
    icon:'ti-home', cat:'Rentals', type:'Themed Suite', name:'Le Boudoir Suite',
    rating:'4.6', city:'Ghent, BE', s1:'76', s2:'4.6', s3:'4 yrs', s4:'3.2k',
    badges:[{cls:'bp',txt:'Premium'}],
    desc:'Luxuriously appointed private suite in central Ghent. Designed for adult stays with a king bed, mood lighting, jacuzzi, and fully stocked minibar. Completely discreet check-in.',
    tags:['Jacuzzi','King bed','Mood lighting','Minibar','Discreet entry','24h service'],
    pricing:[{dur:'2 Hours',amt:'€120',note:'Daytime',feat:false},{dur:'4 Hours',amt:'€200',note:'Most popular',feat:true},{dur:'Overnight',amt:'€350',note:'10pm – noon',feat:false},{dur:'Weekend',amt:'€800',note:'Fri–Sun',feat:false}],
  },
  'Studio Rouge': {
    icon:'ti-map', cat:'Photo / Video', type:'Studio', name:'Studio Rouge',
    rating:'5.0', city:'Brussels, BE', s1:'58', s2:'5.0', s3:'6 yrs', s4:'5.4k',
    badges:[{cls:'bv',txt:'✓ Verified'},{cls:'bt',txt:'Trending'}],
    desc:'Professional adult photography and video production studio in central Brussels. Fully equipped with 4K cameras, lighting rigs, multiple set configurations, and a private dressing room.',
    tags:['4K cameras','Pro lighting','Multiple sets','Dressing room','Sound system','Private entry'],
    pricing:[{dur:'2 Hours',amt:'€240',note:'1 set',feat:false},{dur:'Half day',amt:'€480',note:'2 sets',feat:true},{dur:'Full day',amt:'€800',note:'All sets',feat:false},{dur:'Overnight',amt:'€1,100',note:'Creative sessions',feat:false}],
  },
  'Noir Collection': {
    icon:'ti-shopping-bag', cat:'Adult Shop', type:'Online Store', name:'Noir Collection',
    rating:'4.7', city:'Online · BE', s1:'1.2k', s2:'4.7', s3:'3 yrs', s4:'28k',
    badges:[{cls:'bt',txt:'Trending'}],
    desc:'Curated adult boutique specialising in luxury lingerie, premium toys, and wellness products. All orders shipped in plain, discreet packaging within 48 hours across Europe.',
    tags:['Luxury lingerie','Premium toys','Wellness','Discreet shipping','EU delivery','Gift wrapping'],
    pricing:[{dur:'Standard',amt:'€19+',note:'Free ship €50+',feat:false},{dur:'Premium',amt:'€49+',note:'Priority ship',feat:true},{dur:'Gift set',amt:'€89+',note:'Curated box',feat:false},{dur:'VIP access',amt:'€15/mo',note:'Member discounts',feat:false}],
  }
};

// ── Open / Close detail panel ──
var dpOverlay = document.getElementById('detail-overlay');
var dpPanel = document.getElementById('detail-panel');
var dpSaved = false;

async function loadSimilarListings(excludeId, category) {
  var el = document.querySelector('.dp-similar')
  if (!el) return
  el.innerHTML = '<div style="color:#4c4a47;font-size:12px;padding:.5rem">Loading…</div>'
  try {
    var cat = (category || '').split(' · ')[0].trim().toLowerCase()
    var { data: sims } = await (supabase as any).from('listings')
      .select('id,title,category,subcategory,city,country,price_from,verified,premium,profile_id,rating,review_count,description,images,meet_type,featured_until')
      .eq('active', true)
      .ilike('category', cat + '%')
      .neq('id', excludeId)
      .order('rating', { ascending: false })
      .limit(3)
    if (!sims || !sims.length) {
      el.innerHTML = '<div style="color:#4c4a47;font-size:12px;padding:.5rem">No similar advertisements found.</div>'
      return
    }
    el.innerHTML = sims.map(function(l) {
      var icon = ({escorts:'ti-user',companionship:'ti-heart',nightlife:'ti-building',creators:'ti-camera',adult:'ti-flame',rentals:'ti-home',hotels:'ti-bed',events:'ti-confetti',photo:'ti-camera',shop:'ti-shopping-bag'})[l.category?.toLowerCase()] || 'ti-tag'
      var badges = []
      if (l.verified) badges.push('<span class="badge bv" style="font-size:8px">✓</span>')
      if (l.premium) badges.push('<span class="badge bp" style="font-size:8px">P</span>')
      var dStr = encodeURIComponent(JSON.stringify({
        id:l.id||'',profile_id:l.profile_id||'',icon:icon,badges:[],
        cat:l.category||'',type:l.subcategory||l.category||'',name:l.title||'',
        rating:l.rating||'—',city:(l.city||'—')+', '+(l.country||''),
        s1:String(l.review_count||0),s2:l.rating?Number(l.rating).toFixed(1):'—',s3:'—',s4:'—',
        desc:l.description||'',tags:[l.category],
        pricing:l.price_from?[{dur:'Rate',amt:'€'+l.price_from,note:l.category,feat:true}]:[{dur:'Rate',amt:'POA',note:'',feat:true}],
        price_from:l.price_from||0,featured_until:l.featured_until||null,images:l.images||[]
      }))
      return '<div class="dp-sim-card" onclick="window.location.href=\'/listings/\'+' + "(l.id||'')" + '" style="cursor:pointer">' +
        '<div class="dp-sim-img"><i class="ti '+icon+'" aria-hidden="true"></i><div class="card-badges" style="position:absolute;top:5px;left:5px">'+badges.join('')+'</div></div>' +
        '<div class="dp-sim-body"><div class="dp-sim-cat">'+(l.category||'')+(l.subcategory?' · '+l.subcategory:'')+'</div><div class="dp-sim-name">'+(l.title||'')+'</div><div class="dp-sim-price">'+(l.price_from?'From €'+l.price_from+' · ':'')+(l.city||'')+'</div></div>' +
        '</div>'
    }).join('')
  } catch(e) {
    el.innerHTML = '<div style="color:#4c4a47;font-size:12px;padding:.5rem">Could not load similar listings.</div>'
  }
}

function openDetail(data) {
  // Track recently viewed (max 10, deduplicated, newest first)
  if (data.id) { try { var rv = JSON.parse(localStorage.getItem('sx_recently_viewed') || '[]'); rv = [data.id].concat(rv.filter(function(x){return x!==data.id;})).slice(0,10); localStorage.setItem('sx_recently_viewed', JSON.stringify(rv)); } catch(e){} }
  // Store IDs on panel for CTAs
  var panel=document.getElementById('detail-panel');
  if(panel){panel.dataset.listingId=data.id||'';panel.dataset.profileId=data.profile_id||'';panel.dataset.priceFrom=String(data.price_from||0);}
  // Populate hero
  document.getElementById('dpHeroIcon').className = 'ti ' + data.icon;
  var heroEl = document.getElementById('dpHero');
  if (heroEl) {
    // Apply category gradient class
    var catClassMap = {escorts:'cat-escort',escort:'cat-escort',companionship:'cat-companion',companion:'cat-companion',nightlife:'cat-nightlife',creators:'cat-creator',creator:'cat-creator',adult:'cat-shop',rentals:'cat-rental',rental:'cat-rental',hotels:'cat-hotel',hotel:'cat-hotel',events:'cat-event',event:'cat-event',shop:'cat-shop'};
    var rawCat = (data.cat || data.type || '').toLowerCase().split(' · ')[0].trim();
    var dpCatClass = catClassMap[rawCat] || 'cat-escort';
    heroEl.className = 'dp-hero ' + dpCatClass;
    // Set monogram
    var monoEl = document.getElementById('dpHeroMonogram');
    if (monoEl) monoEl.textContent = (data.name || 'Sx').slice(0,2);
    if (data.images && data.images.length > 0) {
      // Show image inside hero as absolute positioned img
      var existingImg = heroEl.querySelector('img.dp-hero-photo');
      if (!existingImg) { existingImg = document.createElement('img'); existingImg.className='dp-hero-photo'; existingImg.style.cssText='width:100%;height:100%;object-fit:cover;position:absolute;inset:0;'; heroEl.insertBefore(existingImg, heroEl.firstChild); }
      existingImg.src = data.images[0];
      existingImg.style.display = '';
      document.getElementById('dpHeroIcon').style.display = 'none';
    } else {
      var oldImg = heroEl.querySelector('img.dp-hero-photo');
      if (oldImg) oldImg.style.display = 'none';
      document.getElementById('dpHeroIcon').style.display = '';
    }
  }
  // Gallery strip
  var galleryEl = document.getElementById('dpGallery');
  if (galleryEl) {
    if (data.images && data.images.length > 1) {
      galleryEl.style.display = 'flex';
      galleryEl.innerHTML = (data.images as string[]).map(function(img: string, i: number) {
        return '<div class="dp-thumb'+(i===0?' active':'')+'" data-src="'+img+'" onclick="(window as any).updateHeroImage(\''+img+'\')" style="flex-shrink:0;width:56px;height:56px;border-radius:8px;background-image:url(\''+img+'\');background-size:cover;background-position:center;cursor:pointer;border:2px solid '+(i===0?'rgba(197,160,90,0.8)':'rgba(255,255,255,0.15)')+'"></div>';
      }).join('');
    } else {
      galleryEl.style.display = 'none';
      galleryEl.innerHTML = '';
    }
  }
  var badgesEl = document.getElementById('dpHeroBadges');
  badgesEl.innerHTML = '';
  (data.badges||[]).forEach(function(b){
    var s = document.createElement('span');
    s.className = 'badge ' + b.cls;
    s.textContent = b.txt;
    badgesEl.appendChild(s);
  });
  // Identity
  document.getElementById('dpCat').textContent = data.cat;
  document.getElementById('dpTypePill').textContent = data.type;
  document.getElementById('dpName').textContent = data.name;
  document.getElementById('dpRating').textContent = data.rating;
  document.getElementById('dpCity').textContent = data.city;
  // Stats
  document.getElementById('dpS1').textContent = data.s1;
  document.getElementById('dpS2').textContent = data.s2;
  document.getElementById('dpS3').textContent = data.s3;
  document.getElementById('dpS4').textContent = data.s4;
  // Desc
  document.getElementById('dpDesc').textContent = data.desc;
  // Tags
  var tagsEl = document.getElementById('dpTags');
  tagsEl.innerHTML = '';
  (data.tags||[]).forEach(function(tag,i){
    var s = document.createElement('span');
    s.className = 'dp-tag' + (i < 2 ? ' highlight' : '');
    s.textContent = tag;
    tagsEl.appendChild(s);
  });
  // Pricing
  var priceEl = document.getElementById('dpPricing');
  priceEl.innerHTML = '';
  (data.pricing||[]).forEach(function(p){
    var d = document.createElement('div');
    d.className = 'dp-price-card' + (p.feat ? ' featured' : '');
    d.innerHTML = '<div class="dp-price-dur">'+p.dur+'</div><div class="dp-price-amt">'+p.amt+'</div><div class="dp-price-note">'+p.note+'</div>';
    priceEl.appendChild(d);
  });
  // Scroll to top
  document.getElementById('dpBody').scrollTop = 0;
  // Open
  dpOverlay.classList.add('open');
  dpPanel.classList.add('open');
  document.body.style.overflow = 'hidden';
  // Sync save button with favorites state
  if (data.id) {
    var dpSaveBtn = document.getElementById('dpSave');
    if (dpSaveBtn) {
      var isSaved = ((window as any).__favSet || new Set()).has(data.id);
      dpSaved = !!isSaved;
      dpSaveBtn.classList.toggle('saved', !!isSaved);
      var si = dpSaveBtn.querySelector('i');
      if (si) (si as HTMLElement).className = isSaved ? 'ti ti-heart-filled' : 'ti ti-heart';
    }
    // Track view (fire-and-forget)
    ;(supabase as any).from('listing_views').insert({ listing_id: data.id, user_id: (window as any).__userId || null }).catch(() => {})
    loadSimilarListings(data.id, data.cat || '')
    history.pushState({ listingId: data.id }, '', '/?listing=' + data.id)
    var fullPageLink = document.getElementById('dpFullPageLink')
    if (fullPageLink) fullPageLink.setAttribute('href', '/listings/' + data.id)
  }
}

function closeDetail() {
  dpOverlay.classList.remove('open');
  dpPanel.classList.remove('open');
  document.body.style.overflow = '';
  history.pushState({}, '', '/')
}

;(window as any).updateHeroImage = function(src: string) {
  var heroEl = document.getElementById('dpHero');
  if (heroEl) {
    var img = heroEl.querySelector('img.dp-hero-photo') as HTMLImageElement | null;
    if (img) { img.src = src; img.style.display = ''; }
  }
  document.querySelectorAll('.dp-thumb').forEach(function(t: any){ t.classList.remove('active'); });
  var thumbs = document.querySelectorAll('.dp-thumb');
  thumbs.forEach(function(t: any){ if(t.dataset.src===src) t.classList.add('active'); });
}

// Expose to global scope so inline onclick handlers on dynamic cards can call these
;(window as any).openDetail = openDetail
;(window as any).closeDetail = closeDetail

document.getElementById('dpClose').addEventListener('click', closeDetail);
dpOverlay.addEventListener('click', closeDetail);

// Save toggle — wired to favorites table
document.getElementById('dpSave').addEventListener('click', function(){
  var listingId = (document.getElementById('detail-panel') as HTMLElement)?.dataset?.listingId;
  if (!listingId) return;
  ;(window as any).toggleFavorite(listingId, this);
});

// Photo slider for mobile cards
;(window as any).__sliderIdx = {};
;(window as any).__slideCard = function(id: string, dir: number, e: Event) {
  e.stopPropagation();
  var card = document.querySelector('[data-lid="'+id+'"]') as HTMLElement|null;
  if (!card) return;
  var imgs: string[] = JSON.parse(card.dataset.images || '[]');
  if (imgs.length < 2) return;
  var idx = (((window as any).__sliderIdx[id] || 0) + dir + imgs.length) % imgs.length;
  (window as any).__sliderIdx[id] = idx;
  var img = document.getElementById('si-'+id) as HTMLImageElement|null;
  var ctr = document.getElementById('sc-'+id);
  var focus: any = {};
  try { focus = JSON.parse(card.dataset.focus || '{}'); } catch (e) {}
  var f = focus[imgs[idx]];
  var pos = (f && typeof f.x === 'number' && typeof f.y === 'number') ? (f.x+'% '+f.y+'%') : 'center 20%';
  if (img) { img.src = imgs[idx]; img.style.objectPosition = pos; }
  if (ctr) ctr.textContent = (idx+1)+'/'+imgs.length;
};

// Global favorites helpers
;(window as any).toggleFavorite = async function(listingId: string, btnEl: Element) {
  var userId = (window as any).__userId;
  if (!userId) { window.location.href = '/login'; return; }
  var favSet: Set<string> = (window as any).__favSet || new Set();
  (window as any).__favSet = favSet;
  var isSaved = favSet.has(listingId);
  if (isSaved) {
    await (supabase as any).from('favorites').delete().eq('user_id', userId).eq('listing_id', listingId);
    favSet.delete(listingId);
  } else {
    await (supabase as any).from('favorites').insert({ user_id: userId, listing_id: listingId });
    favSet.add(listingId);
  }
  ;(window as any).__updateCardHearts();
  // Sync detail panel save button
  var dpSaveBtn = document.getElementById('dpSave');
  var panel = document.getElementById('detail-panel');
  if (dpSaveBtn && panel?.dataset?.listingId === listingId) {
    dpSaved = favSet.has(listingId);
    dpSaveBtn.classList.toggle('saved', dpSaved);
    var si = dpSaveBtn.querySelector('i');
    if (si) (si as HTMLElement).className = dpSaved ? 'ti ti-heart-filled' : 'ti ti-heart';
  }
}

;(window as any).__updateCardHearts = function() {
  var favSet: Set<string> = (window as any).__favSet;
  if (!favSet) return;
  document.querySelectorAll('[data-fav-lid]').forEach(function(el: any) {
    var lid = el.dataset.favLid;
    var saved = favSet.has(lid);
    var i = el.querySelector('i');
    if (i) i.className = saved ? 'ti ti-heart-filled' : 'ti ti-heart';
    el.style.background = saved ? 'rgba(176,67,89,0.85)' : 'rgba(0,0,0,0.30)';
  });
}

// Keyboard close
document.addEventListener('keydown', function(e){
  if(e.key === 'Escape' && dpPanel.classList.contains('open')) closeDetail();
});

// ── Wire cards to panel ──
document.querySelectorAll('.card').forEach(function(card){
  card.addEventListener('click', function(){
    var name = this.querySelector('.card-name').textContent.trim();
    var data = listingData[name];
    if(data) openDetail(data);
  });
  card.addEventListener('keydown', function(e){
    if(e.key === 'Enter' || e.key === ' ') this.click();
  });
});

// ── Wire similar cards (re-open with fallback) ──
document.querySelectorAll('.dp-sim-card').forEach(function(sc){
  sc.addEventListener('click', function(){
    var name = this.querySelector('.dp-sim-name').textContent.trim();
    var data = listingData[name];
    if(data) openDetail(data);
  });
});

// ══ THEME CYCLE ══
window.__cycleTheme = function() {
  var order = ['velvet','dark','light'];
  var cur = document.documentElement.dataset.theme || 'velvet';
  var next = order[(order.indexOf(cur)+1)%order.length];
  document.documentElement.dataset.theme = next;
  try { localStorage.theme = next; } catch(e) {}
  var labels = {velvet:'Switched to Velvet mode',dark:'Switched to Dark mode',light:'Switched to Light mode'};
  showToast(labels[next]);
  var iconMap = {velvet:'ti-sparkles',dark:'ti-moon-stars',light:'ti-sun'};
  var iconEl = document.getElementById('themeIcon');
  if (iconEl) iconEl.className = 'ti ' + (iconMap[next] || 'ti-moon-stars');
};

// ══ TOAST ══
function showToast(msg){
  var t=document.getElementById('toast');
  document.getElementById('toastMsg').textContent=msg;
  t.classList.add('show');
  setTimeout(function(){t.classList.remove('show')},2800);
}

// ══ MODAL HELPERS ══
function openModal(id){
  document.getElementById(id).classList.add('open');
  document.body.style.overflow='hidden';
}
function closeModal(id){
  document.getElementById(id).classList.remove('open');
  // only restore scroll if no other modals open
  if(!document.querySelector('.modal-overlay.open'))
    document.body.style.overflow='';
}

// ══ AUTH MODAL ══
document.getElementById('authClose').addEventListener('click',function(){closeModal('authModal')});
document.getElementById('authModal').addEventListener('click',function(e){if(e.target===this)closeModal('authModal')});

function showAuthTab(tab){
  document.querySelectorAll('.auth-tab').forEach(function(t){t.classList.toggle('active',t.dataset.tab===tab)});
  document.getElementById('loginPanel').classList.toggle('active',tab==='login');
  document.getElementById('signupPanel').classList.toggle('active',tab==='signup');
}
document.querySelectorAll('.auth-tab').forEach(function(t){
  t.addEventListener('click',function(){showAuthTab(this.dataset.tab)});
});
document.getElementById('switchToSignup').addEventListener('click',function(){showAuthTab('signup')});
document.getElementById('switchToLogin').addEventListener('click',function(){showAuthTab('login')});

// Role picker
document.querySelectorAll('.role-card').forEach(function(rc){
  rc.addEventListener('click',function(){
    document.querySelectorAll('.role-card').forEach(function(x){x.classList.remove('selected')});
    this.classList.add('selected');
  });
});

// Password toggles
document.querySelectorAll('.pw-toggle').forEach(function(btn){
  btn.addEventListener('click',function(){
    var inp=document.getElementById(this.dataset.target);
    var showing=inp.type==='text';
    inp.type=showing?'password':'text';
    this.querySelector('i').className=showing?'ti ti-eye':'ti ti-eye-off';
  });
});

// Login submit — real Supabase auth
document.getElementById('loginSubmit').addEventListener('click',async function(){
  var btn=document.getElementById('loginSubmit') as HTMLButtonElement;
  var email=(document.getElementById('loginEmail') as HTMLInputElement).value.trim();
  var pw=(document.getElementById('loginPw') as HTMLInputElement).value.trim();
  var err=document.getElementById('loginErr');
  if(!email||!pw){if(err)err.classList.add('show');return;}
  if(err)err.classList.remove('show');
  btn.disabled=true; btn.textContent='Signing in…';
  try{
    var res=await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password:pw})});
    var json=await res.json();
    if(!res.ok){if(err){err.classList.add('show');err.textContent=json.error||'Invalid email or password.';}btn.disabled=false;btn.textContent='Sign in';return;}
    closeModal('authModal');
    window.location.href='/dashboard';
  }catch(e){
    if(err){err.classList.add('show');err.textContent='Network error — please try again.';}
    btn.disabled=false;btn.textContent='Sign in';
  }
});

// Signup submit — real Supabase auth
document.getElementById('signupSubmit').addEventListener('click',async function(){
  var btn=document.getElementById('signupSubmit') as HTMLButtonElement;
  var email=(document.getElementById('signupEmail') as HTMLInputElement).value.trim();
  var pw=(document.getElementById('signupPw') as HTMLInputElement).value.trim();
  var terms=(document.getElementById('termsCheck') as HTMLInputElement).checked;
  var role=(document.querySelector('input[name="role"]:checked') as HTMLInputElement)?.value||'user';
  var err=document.getElementById('signupErr');
  if(!email||!pw||!terms){if(err){err.classList.add('show');err.textContent=!terms?'You must agree to the terms to continue.':'Please fill in all required fields.';}return;}
  if(pw.length<6){if(err){err.classList.add('show');err.textContent='Password must be at least 6 characters.';}return;}
  if(err)err.classList.remove('show');
  btn.disabled=true;btn.textContent='Creating account…';
  try{
    var attrCookie=document.cookie.split(';').find(function(c){return c.trim().startsWith('sx_attribution=');});
    var attrVal=attrCookie?attrCookie.split('=').slice(1).join('=').trim():null;
    var res=await fetch('/api/auth/signup',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password:pw,role,attribution:attrVal?JSON.parse(decodeURIComponent(attrVal)):null})});
    var json=await res.json();
    if(!res.ok){if(err){err.classList.add('show');err.textContent=json.error||'Could not create account.';}btn.disabled=false;btn.textContent='Create account';return;}
    var succ=document.getElementById('signupSuccess');
    if(succ)succ.classList.add('show');
    btn.style.display='none';
    setTimeout(function(){closeModal('authModal');window.location.href='/dashboard';},2200);
  }catch(e){
    if(err){err.classList.add('show');err.textContent='Network error — please try again.';}
    btn.disabled=false;btn.textContent='Create account';
  }
});

// ══ NEWSLETTER ══
(function(){
  var btn = document.getElementById('nlSubmit');
  var form = document.getElementById('newsletterForm');
  var success = document.getElementById('nlSuccess');
  if (!btn) return;
  btn.addEventListener('click', function() {
    var emailEl = document.getElementById('nlEmail') as HTMLInputElement;
    var email = emailEl ? emailEl.value.trim() : '';
    if (!email || !email.includes('@')) {
      emailEl.style.borderColor = '#e05a6a';
      emailEl.placeholder = 'Please enter a valid email';
      emailEl.focus();
      return;
    }
    emailEl.style.borderColor = 'var(--b2)';
    btn.textContent = '...';
    (btn as HTMLButtonElement).disabled = true;
    fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    }).then(function(r){ return r.json(); }).then(function(){
      if (form) form.style.display = 'none';
      if (success) success.style.display = 'block';
    }).catch(function(){
      btn.textContent = 'Subscribe';
      (btn as HTMLButtonElement).disabled = false;
      showToast('Something went wrong — please try again.');
    });
  });
})();

// ══ BOOKING MODAL ══
var bookStep=0,selDate='',selTime='',selDur='2 Hours',selPrice=350;
var calYear=new Date().getFullYear(),calMonth=new Date().getMonth();
var availDays=[0,1,2,3,4,5,6]; // All days available
var currentListingId=null;
var currentListingCat='';
// These categories take online card payment. All others are meetup-request only.
var PAYABLE_CATS=['rentals','hotels','events','shop'];

function openBookModal(name,cat,listingId,basePrice){
  currentListingId=listingId||null;
  currentListingCat=(cat||'').split(' · ')[0].toLowerCase().trim();
  document.getElementById('bookListingName').textContent=name||'Sophia A.';
  document.getElementById('bookListingCat').textContent=cat||'Escort · Independent · Brussels';
  document.getElementById('sumName').textContent=name||'Sophia A.';
  selDate='';selTime='';selDur='2 Hours';
  // Dynamically price duration pills from listing's base rate
  if(basePrice&&basePrice>0){
    var mults=[1,1.6,2.5,4.5];
    var labels=['1 Hour','2 Hours','Half day','Overnight'];
    document.querySelectorAll('.dur-pill').forEach(function(dp,i){
      var p=Math.round(basePrice*mults[i]);
      dp.dataset.dur=labels[i];dp.dataset.price=String(p);
      dp.textContent=labels[i]+' — €'+p.toLocaleString();
    });
    selPrice=Math.round(basePrice*mults[1]);
  } else {
    selPrice=350;
  }
  document.getElementById('sumDur').textContent=selDur;
  document.getElementById('sumPrice').textContent='€'+selPrice.toLocaleString();
  bookStep=0;
  updateBookSteps();
  renderCal();
  openModal('bookModal');
}

document.getElementById('bookClose').addEventListener('click',function(){closeModal('bookModal')});
document.getElementById('bookModal').addEventListener('click',function(e){if(e.target===this)closeModal('bookModal')});

function updateBookSteps(){
  document.querySelectorAll('.book-step').forEach(function(s,i){
    s.classList.toggle('active',i===bookStep);
    s.classList.toggle('done',i<bookStep);
  });
  document.querySelectorAll('.book-pane').forEach(function(p,i){
    p.classList.toggle('active',i===bookStep);
  });
}

// Calendar
var MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
var DAYS_SHORT=['Mo','Tu','We','Th','Fr','Sa','Su'];

function renderCal(){
  document.getElementById('calMonthLabel').textContent=MONTHS[calMonth]+' '+calYear;
  var grid=document.getElementById('calGrid');
  grid.innerHTML='';
  var first=new Date(calYear,calMonth,1).getDay();
  var offset=(first===0)?6:first-1; // Mon-first
  var days=new Date(calYear,calMonth+1,0).getDate();
  var today=new Date();
  for(var i=0;i<offset;i++){var e=document.createElement('div');e.className='cal-day inactive';grid.appendChild(e);}
  for(var d=1;d<=days;d++){
    (function(day){
      var date=new Date(calYear,calMonth,day);
      var dow=date.getDay(); // 0=Sun
      var isPast=date<new Date(today.getFullYear(),today.getMonth(),today.getDate());
      var isAvail=availDays.includes(dow);
      var el=document.createElement('div');
      el.textContent=day;
      el.className='cal-day'+(isPast?' inactive':isAvail?' avail':'');
      var dateStr=calYear+'-'+String(calMonth+1).padStart(2,'0')+'-'+String(day).padStart(2,'0');
      if(dateStr===selDate)el.classList.add('selected');
      if(!isPast&&isAvail){
        el.addEventListener('click',function(){
          selDate=dateStr;
          document.querySelectorAll('.cal-day').forEach(function(c){c.classList.remove('selected')});
          el.classList.add('selected');
        });
      }
      grid.appendChild(el);
    })(d);
  }
}

document.getElementById('calPrev').addEventListener('click',function(){calMonth--;if(calMonth<0){calMonth=11;calYear--;}renderCal();});
document.getElementById('calNext').addEventListener('click',function(){calMonth++;if(calMonth>11){calMonth=0;calYear++;}renderCal();});

// Time slots
document.querySelectorAll('.time-slot').forEach(function(ts){
  ts.addEventListener('click',function(){
    document.querySelectorAll('.time-slot').forEach(function(x){x.classList.remove('selected')});
    this.classList.add('selected');
    selTime=this.dataset.time;
  });
});

// Duration pills
document.querySelectorAll('.dur-pill').forEach(function(dp){
  dp.addEventListener('click',function(){
    document.querySelectorAll('.dur-pill').forEach(function(x){x.classList.remove('selected')});
    this.classList.add('selected');
    selDur=this.dataset.dur;selPrice=parseInt(this.dataset.price);
    document.getElementById('sumDur').textContent=selDur;
    document.getElementById('sumPrice').textContent='€'+selPrice.toLocaleString();
  });
});

// Meet type toggle
document.getElementById('meetType').addEventListener('change',function(){
  document.getElementById('locationField').style.display=this.value.includes('Outcall')?'block':'none';
});

// Step navigation
document.getElementById('bookNext0').addEventListener('click',function(){
  if(!selDate){showToast('Please select a date first');return;}
  bookStep=1;updateBookSteps();
});
document.getElementById('bookBack1').addEventListener('click',function(){bookStep=0;updateBookSteps();});
document.getElementById('bookNext1').addEventListener('click',function(){
  if(!selTime){showToast('Please select a time');return;}
  bookStep=2;updateBookSteps();
  document.getElementById('sumDate').textContent=selDate;
  document.getElementById('sumTime').textContent=selTime;
});
document.getElementById('bookBack2').addEventListener('click',function(){bookStep=1;updateBookSteps();});
document.getElementById('bookNext2').addEventListener('click',function(){bookStep=3;updateBookSteps();});
document.getElementById('bookBack3').addEventListener('click',function(){bookStep=2;updateBookSteps();});
document.getElementById('bookSubmit').addEventListener('click',async function(){
  var btn=this;
  if(currentListingId){
    btn.textContent='Processing…';btn.disabled=true;
    try{
      var notes=document.getElementById('bookNotes')?.value||'';
      var meetType=document.getElementById('meetType')?.value||'Incall';
      var location=document.getElementById('locationInput')?.value||'';
      var isPayable=PAYABLE_CATS.includes(currentListingCat);
      var apiUrl=isPayable?'/api/checkout':'/api/bookings/request';
      var res=await fetch(apiUrl,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({listing_id:currentListingId,date:selDate,time:selTime,duration:selDur,price:isPayable?selPrice:0,notes:notes,meet_type:meetType,location:location})});
      var json=await res.json();
      if(isPayable){
        if(json.url){window.location.href=json.url;}
        else if(res.status===401){showToast('Please sign in to make a booking');setTimeout(function(){window.location.href='/login?next=/'},1500);btn.textContent='Confirm Booking';btn.disabled=false;}
        else{showToast(json.error||'Checkout failed');btn.textContent='Confirm Booking';btn.disabled=false;}
      } else {
        if(res.status===401){showToast('Please sign in to send a request');setTimeout(function(){window.location.href='/login?next=/'},1500);btn.textContent='Confirm Booking';btn.disabled=false;return;}
        if(!res.ok){showToast(json.error||'Something went wrong');btn.textContent='Confirm Booking';btn.disabled=false;return;}
        document.getElementById('bookSuccess').classList.add('show');
        btn.style.display='none';
        document.getElementById('bookBack3').style.display='none';
        setTimeout(function(){
          closeModal('bookModal');
          document.getElementById('bookSuccess').classList.remove('show');
          document.getElementById('bookSubmit').style.display='';
          document.getElementById('bookBack3').style.display='';
          bookStep=0;selDate='';selTime='';updateBookSteps();
          showToast('Request sent — the advertiser will confirm shortly');
        },2500);
      }
    }catch(err){showToast('Network error — please try again');btn.textContent='Confirm Booking';btn.disabled=false;}
  } else {
    document.getElementById('bookSuccess').classList.add('show');
    btn.style.display='none';
    document.getElementById('bookBack3').style.display='none';
    setTimeout(function(){
      closeModal('bookModal');
      document.getElementById('bookSuccess').classList.remove('show');
      document.getElementById('bookSubmit').style.display='';
      document.getElementById('bookBack3').style.display='';
      bookStep=0;selDate='';selTime='';updateBookSteps();
      showToast('Request sent — the advertiser will confirm shortly');
    },2500);
  }
});

// ── Wire share button in detail panel ──
document.querySelector('.dp-cta-share').addEventListener('click', function(){
  var panel = document.getElementById('detail-panel')
  var lid = panel ? panel.dataset.listingId : null
  if (lid) {
    var url = window.location.origin + '/listings/' + lid
    navigator.clipboard.writeText(url).then(function(){
      showToast('Link copied to clipboard')
    }).catch(function(){
      showToast('Link: ' + url)
    })
  }
})

// ── Wire booking CTA in detail panel ──
document.querySelector('.dp-cta-book').addEventListener('click',function(){
  var name=document.getElementById('dpName').textContent;
  var cat=document.getElementById('dpCat').textContent;
  var panel=document.getElementById('detail-panel');
  var lid=panel?panel.dataset.listingId:null;
  var priceFrom=parseInt(panel&&panel.dataset.priceFrom||'0')||0;
  closeDetail();
  setTimeout(function(){openBookModal(name,cat+' · '+document.getElementById('dpCity').textContent,lid,priceFrom);},200);
});

document.querySelector('.dp-cta-msg').addEventListener('click',function(){
  var panel=document.getElementById('detail-panel');
  var pid=panel?panel.dataset.profileId:null;
  var lid=panel?panel.dataset.listingId:null;
  var title=document.getElementById('dpName').textContent;
  closeDetail();
  if(pid){
    if(!currentSession){ window.location.href='/login?next=/'; return; }
    setTimeout(function(){window.location.href='/messages?provider_id='+pid+(lid?'&listing_id='+lid:'')+'&listing_title='+encodeURIComponent(title);},200);
  } else {
    setTimeout(function(){openModal('msgModal');},200);
  }
});

// ══ MESSAGING ══
document.getElementById('msgClose').addEventListener('click',function(){closeModal('msgModal')});
document.getElementById('msgModal').addEventListener('click',function(e){if(e.target===this)closeModal('msgModal')});

var threadData={
  sophia:{av:'SA',avStyle:'background:rgba(100,80,200,.2);color:#b0a0f8',name:'Sophia A.',sub:'Online now · Escort · Private',msgs:[
    {me:false,text:'Hi! Thanks for reaching out through SecretXperience. Happy to answer any questions you have.',time:'14:02'},
    {me:true,text:"Hi Sophia, I saw your profile — I'm interested in booking you for Thursday evening.",time:'14:05'},
    {me:false,text:"Thursday works for me! I'm available from 18:00. What duration are you thinking?",time:'14:06'},
    {me:true,text:'Probably 2–3 hours, starting around 19:00. Is outcall possible?',time:'14:08'},
    {me:false,text:"Yes, outcall is fine. I'm in Brussels — where would you like to meet?",time:'14:09'},
    {me:true,text:'Hotel Amigo in the centre. Does that work?',time:'14:11'},
    {me:false,text:'Perfect, I know it well. Looking forward to Thursday! Use the booking button above when you\'re ready to confirm.',time:'14:12'},
  ]},
  luna:{av:'LC',avStyle:'background:rgba(26,143,106,.15);color:#1dc9a0',name:'Luna Creative',sub:'Creator · Subscription',msgs:[
    {me:false,text:'Hi! Your custom content request is ready. Check your subscription portal to access it.',time:'11:30'},
    {me:true,text:'Amazing, thank you! Really happy with it.',time:'11:45'},
    {me:false,text:'Glad you enjoyed it! Let me know if you\'d like anything else.',time:'11:46'},
  ]},
  elise:{av:'EV',avStyle:'background:rgba(197,160,90,.15);color:var(--gold)',name:'Elise V.',sub:'Escort · Elite · Antwerp',msgs:[
    {me:false,text:'Hello, thank you for your interest. What dates are you considering?',time:'Yesterday 16:00'},
    {me:true,text:'I\'m flexible, probably next weekend if you\'re available.',time:'Yesterday 16:12'},
    {me:false,text:'Next weekend works. Saturday or Sunday?',time:'Yesterday 17:00'},
  ]},
  support:{av:'SX',avStyle:'background:var(--gbg);color:var(--gold)',name:'SecretXperience Support',sub:'Response time: ~2 hours',msgs:[
    {me:false,text:'Welcome to SecretXperience.eu! How can we help you today?',time:'3 days ago'},
  ]}
};
var activeThread='sophia';

function loadThread(key){
  activeThread=key;
  var d=threadData[key];
  if(!d)return;
  document.getElementById('chatAv').textContent=d.av;
  document.getElementById('chatAv').style.cssText='width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:600;flex-shrink:0;font-family:var(--serif);'+d.avStyle;
  document.getElementById('chatName').textContent=d.name;
  document.querySelector('#chatArea .mhs').innerHTML='<span class="msg-online"></span> '+d.sub;
  var body=document.getElementById('chatBody');
  body.innerHTML='<div class="msg-date-sep">Today</div>';
  d.msgs.forEach(function(m){
    var div=document.createElement('div');
    div.className='msg-bubble '+(m.me?'me':'them');
    div.innerHTML=m.text+'<div class="msg-bubble-time">'+m.time+'</div>';
    body.appendChild(div);
  });
  body.scrollTop=body.scrollHeight;
  document.querySelectorAll('.msg-thread').forEach(function(t){t.classList.toggle('active',t.dataset.thread===key)});
  // clear unread badge
  var th=document.querySelector('.msg-thread[data-thread="'+key+'"]');
  if(th){var badge=th.querySelector('.msg-unread');if(badge)badge.remove();}
}

document.querySelectorAll('.msg-thread').forEach(function(t){
  t.addEventListener('click',function(){loadThread(this.dataset.thread)});
});

// Send message
function sendMsg(){
  var inp=document.getElementById('msgInput');
  var text=inp.value.trim();
  if(!text)return;
  var body=document.getElementById('chatBody');
  var div=document.createElement('div');div.className='msg-bubble me';
  var now=new Date();
  div.innerHTML=text+'<div class="msg-bubble-time">'+now.getHours()+':'+String(now.getMinutes()).padStart(2,'0')+'</div>';
  body.appendChild(div);
  inp.value='';inp.style.height='auto';
  body.scrollTop=body.scrollHeight;
  // push to thread data
  if(threadData[activeThread]) threadData[activeThread].msgs.push({me:true,text:text,time:'now'});
  // mock reply
  setTimeout(function(){
    var replies=['Got it, thanks!','I\'ll get back to you shortly.','That works for me.','Let me check my schedule.','Sure, happy to arrange that.'];
    var reply=replies[Math.floor(Math.random()*replies.length)];
    var rd=document.createElement('div');rd.className='msg-bubble them';
    rd.innerHTML=reply+'<div class="msg-bubble-time">now</div>';
    body.appendChild(rd);body.scrollTop=body.scrollHeight;
  },1200+Math.random()*800);
}
document.getElementById('msgSend').addEventListener('click',sendMsg);
document.getElementById('msgInput').addEventListener('keydown',function(e){
  if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMsg();}
  this.style.height='auto';this.style.height=Math.min(this.scrollHeight,100)+'px';
});

// Quick replies
document.querySelectorAll('.msg-quick').forEach(function(qb){
  qb.addEventListener('click',function(){
    document.getElementById('msgInput').value=this.textContent;
    document.getElementById('msgInput').focus();
  });
});

// Nav login button -> open auth

// ── Backend modal (wire to nav or keyboard shortcut) ──
document.getElementById('backendClose').addEventListener('click',function(){closeModal('backendModal')});
document.getElementById('backendModal').addEventListener('click',function(e){if(e.target===this)closeModal('backendModal')});
document.getElementById('closeBackend').addEventListener('click',function(){closeModal('backendModal')});

// Press B to open backend panel (dev shortcut)
document.addEventListener('keydown',function(e){
  if(e.key==='b'&&e.altKey){e.preventDefault();openModal('backendModal');}
  if(e.key==='Escape'){
    ['authModal','bookModal','msgModal','backendModal'].forEach(function(id){
      if(document.getElementById(id).classList.contains('open'))closeModal(id);
    });
    if(dpPanel.classList.contains('open'))closeDetail();
    if(document.getElementById('navDrawer').classList.contains('open'))closeNavDrawer();
  }
});

// Load first thread on open
document.getElementById('msgModal').addEventListener('transitionend',function(){
  if(this.classList.contains('open'))loadThread('sophia');
});

    // Sign out handler
    document.querySelectorAll('[data-action="logout"]').forEach(function(btn) {
      btn.addEventListener('click', async function() {
        await supabase.auth.signOut()
        window.location.href = '/login'
      })
    })

    // ── Auth-aware nav ──
    ;(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      currentSession = session
      const loginBtn = document.getElementById('loginBtn') as HTMLButtonElement | null
      const signupBtn = document.getElementById('signupBtn') as HTMLButtonElement | null
      const listServiceBtn = document.getElementById('listServiceBtn') as HTMLButtonElement | null
      const profileMenuWrap = document.getElementById('profileMenuWrap') as HTMLElement | null
      const profileAvatar = document.getElementById('profileAvatar') as HTMLElement | null
      const profileDisplayName = document.getElementById('profileDisplayName') as HTMLElement | null
      const ddName = document.getElementById('ddName') as HTMLElement | null
      const ddEmail = document.getElementById('ddEmail') as HTMLElement | null
      const profileBtn = document.getElementById('profileBtn') as HTMLButtonElement | null
      const profileDropdown = document.getElementById('profileDropdown') as HTMLElement | null
      const profileChevron = document.getElementById('profileChevron') as HTMLElement | null

      // Profile dropdown toggle
      if (profileBtn && profileDropdown) {
        profileBtn.addEventListener('click', function(e) {
          e.stopPropagation()
          const open = profileDropdown.style.display === 'block'
          profileDropdown.style.display = open ? 'none' : 'block'
          profileBtn.setAttribute('aria-expanded', String(!open))
          if (profileChevron) profileChevron.style.transform = open ? '' : 'rotate(180deg)'
        })
        document.addEventListener('click', function() {
          profileDropdown.style.display = 'none'
          profileBtn.setAttribute('aria-expanded', 'false')
          if (profileChevron) profileChevron.style.transform = ''
        })
      }

      if (session) {
        // Logged-in users always bypass the age gate
        dismissGate()
        const { data: profile } = await supabase.from('profiles').select('full_name, username, role, email').eq('id', session.user.id).single()
        const name = profile?.full_name || profile?.username || 'Account'
        const initials = name.split(' ').map((w: string) => w[0]).join('').slice(0,2).toUpperCase()

        // Hide logged-out buttons, show logged-in elements
        if (loginBtn) loginBtn.style.display = 'none'
        if (signupBtn) signupBtn.style.display = 'none'
        if (listServiceBtn) listServiceBtn.style.display = 'flex'
        if (profileMenuWrap) { profileMenuWrap.style.display = 'flex'; profileMenuWrap.style.alignItems = 'center'; profileMenuWrap.style.gap = '8px' }

        // Populate avatar + dropdown header
        if (profileAvatar) profileAvatar.textContent = initials
        if (profileDisplayName) profileDisplayName.textContent = name
        if (ddName) ddName.textContent = name
        if (ddEmail) ddEmail.textContent = profile?.email || session.user.email || ''

        // Set "My Profile" link to dashboard
        const myProfileLink = document.getElementById('ddMyProfileLink') as HTMLAnchorElement | null
        if (myProfileLink) myProfileLink.href = '/dashboard'

        // Admin: show Admin bar + swap nav button
        if (profile?.role === 'admin') {
          const adminBar = document.getElementById('adminBar')
          if (adminBar) adminBar.style.display = ''
          if (listServiceBtn) { listServiceBtn.innerHTML = '<i class="ti ti-settings" aria-hidden="true"></i> Admin'; listServiceBtn.onclick = () => { window.location.href = '/admin' } }
        }

        // Expose user identity for global helpers
        ;(window as any).__userId = session.user.id

        // Load favorites into global Set
        ;(async () => {
          const { data: favData } = await (supabase as any).from('favorites').select('listing_id').eq('user_id', session.user.id)
          const favSet = new Set<string>((favData || []).map((f: any) => f.listing_id))
          ;(window as any).__favSet = favSet
          ;(window as any).__updateCardHearts?.()
        })()

        // Load unread message count
        const { count: unreadCount } = await (supabase as any)
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .eq('receiver_id', session.user.id)
          .eq('read', false)
        const badge = document.getElementById('navMsgBadge')
        const ddBadge = document.getElementById('ddMsgBadge')
        if (unreadCount && unreadCount > 0) {
          const label = unreadCount > 9 ? '9+' : String(unreadCount)
          if (badge) { badge.textContent = label; badge.style.display = 'inline' }
          if (ddBadge) { ddBadge.style.display = 'inline-block' }
        }

        // ── Notification bell ──
        ;(async () => {
          const notifBtn      = document.getElementById('notifBtn')
          const notifDropdown = document.getElementById('notifDropdown') as HTMLElement | null
          const notifBadge    = document.getElementById('notifBadge') as HTMLElement | null
          const notifList     = document.getElementById('notifList') as HTMLElement | null
          const notifMarkAll  = document.getElementById('notifMarkAll')
          if (!notifBtn || !notifDropdown) return

          async function loadNotifications() {
            const res  = await fetch('/api/notifications')
            const json = await res.json()
            const items: any[] = json.notifications || []
            const unread = items.filter((n: any) => !n.read).length
            if (notifBadge) notifBadge.style.display = unread > 0 ? 'block' : 'none'
            if (!notifList) return
            if (items.length === 0) {
              notifList.innerHTML = '<div style="padding:20px 16px;text-align:center;font-size:13px;color:var(--t3);font-family:var(--sans);">No notifications yet</div>'
              return
            }
            notifList.innerHTML = items.map((n: any) => `
              <div data-nid="${n.id}" style="padding:12px 16px;border-bottom:0.5px solid var(--b);cursor:pointer;opacity:${n.read ? '0.55' : '1'};transition:background .15s;" onmouseover="this.style.background='var(--bg2)'" onmouseout="this.style.background=''">
                <div style="display:flex;align-items:flex-start;gap:10px;">
                  <div style="width:8px;height:8px;border-radius:50%;background:${n.read ? 'transparent' : '#c5a05a'};margin-top:5px;flex-shrink:0;"></div>
                  <div style="flex:1;min-width:0;">
                    <div style="font-size:13px;font-weight:${n.read ? '400' : '500'};color:var(--t);font-family:var(--sans);margin-bottom:3px;">${n.title}</div>
                    ${n.body ? `<div style="font-size:12px;color:var(--t3);font-family:var(--sans);font-weight:300;line-height:1.5;">${n.body}</div>` : ''}
                    <div style="font-size:11px;color:var(--t3);margin-top:4px;font-family:var(--sans);">${new Date(n.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</div>
                  </div>
                </div>
              </div>
            `).join('')
            notifList.querySelectorAll('[data-nid]').forEach(el => {
              el.addEventListener('click', async () => {
                const nid = (el as HTMLElement).dataset.nid
                const n   = items.find((x: any) => x.id === nid)
                await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: nid }) })
                if (n?.link) window.location.href = n.link
                else loadNotifications()
              })
            })
          }

          notifBtn.addEventListener('click', async (e) => {
            e.stopPropagation()
            const open = notifDropdown.style.display !== 'none'
            notifDropdown.style.display = open ? 'none' : 'block'
            if (!open) await loadNotifications()
          })
          document.addEventListener('click', () => { if (notifDropdown) notifDropdown.style.display = 'none' })
          notifDropdown.addEventListener('click', e => e.stopPropagation())
          notifMarkAll?.addEventListener('click', async (e) => {
            e.stopPropagation()
            await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
            await loadNotifications()
          })

          // Initial badge check
          await loadNotifications()
        })()

        // Populate nav drawer — logged-in state
        const ndUser = document.getElementById('navDrawerUser')
        const ndAvatar = document.getElementById('navDrawerAvatar')
        const ndName = document.getElementById('navDrawerName')
        const ndEmail = document.getElementById('navDrawerEmail')
        if (ndUser) ndUser.style.display = 'block'
        if (ndAvatar) ndAvatar.textContent = initials
        if (ndName) ndName.textContent = name
        if (ndEmail) ndEmail.textContent = profile?.email || session.user.email || ''
        const ndShowLoggedIn = ['ndDashboard','ndVerify','ndTokens','ndCreate','ndMessages','navDrawerLogout']
        ndShowLoggedIn.forEach(id => { const el = document.getElementById(id); if (el) el.style.display = '' })
      } else {
        if (loginBtn) loginBtn.onclick = () => { window.location.href = '/login' }
        if (signupBtn) signupBtn.onclick = () => { window.location.href = '/advertise' }

        // Mobile-only auth button — show when logged out (CSS reveals it on phones)
        const mobileLoginBtn = document.getElementById('mobileLoginBtn')
        if (mobileLoginBtn) {
          mobileLoginBtn.classList.add('show')
          // Route advertisers straight to /advertise based on their earlier role choice
          try {
            if (localStorage.getItem('sx_role') === 'provider') {
              ;(mobileLoginBtn as HTMLAnchorElement).href = '/advertise'
              mobileLoginBtn.innerHTML = '<i class="ti ti-briefcase" style="font-size:14px;"></i> List service'
            }
          } catch (e) {}
        }

        // Populate nav drawer — logged-out state
        const ndShowLoggedOut = ['ndLogin','ndSignup']
        ndShowLoggedOut.forEach(id => { const el = document.getElementById(id); if (el) el.style.display = '' })
      }

      // ── Mobile bottom nav ──
      const bnis = document.querySelectorAll('.bni')
      bnis.forEach(function(btn, i) {
        if (i === 0) {
          // Home
          btn.addEventListener('click', function() { window.location.href = '/' })
        } else if (i === 1) {
          // Search page
          btn.addEventListener('click', function() { window.location.href = '/search' })
        } else if (i === 2) {
          // Discover
          btn.addEventListener('click', function() { window.location.href = '/discover' })
        } else if (i === 3) {
          // Messages
          btn.addEventListener('click', function() { window.location.href = '/messages' })
        } else if (i === 4) {
          // Account / Sign in
          if (!session) {
            const icon = btn.querySelector('i')
            const label = btn.querySelector('span')
            if (icon) icon.className = 'ti ti-login'
            if (label) label.textContent = 'Sign in'
          }
          btn.addEventListener('click', function() { window.location.href = session ? '/dashboard' : '/login' })
        }
      })
    })()

    // ── Real listings from Supabase ──
    const activeFilters: any = {
      category: 'all', verified: false, premium: false, trending: false,
      minRating: 0, priceMax: null,
      cities: [] as string[],
      meetTypes: [] as string[],
      escortTypes: ['women'] as string[],
      orientations: [] as string[],
      services: [] as string[],
      languages: [] as string[],
      hairs: [] as string[],
      builds: [] as string[],
    }
    ;(window as any).activeFilters = activeFilters
    let currentPage = 0
    const PAGE_SIZE = 100
    let totalListings: any[] = []
    let liveProviderIds = new Set<string>()

    const getCategoryIcon = (cat: string) => {
      const icons: any = {
        escorts: 'ti-user', companionship: 'ti-heart', nightlife: 'ti-building',
        creators: 'ti-camera', adult: 'ti-flame', rentals: 'ti-home',
        hotels: 'ti-bed', events: 'ti-confetti', photo: 'ti-camera',
        affiliate: 'ti-link', memberships: 'ti-crown', experiences: 'ti-sparkles', shop: 'ti-shopping-bag'
      }
      return icons[cat] || 'ti-tag'
    }

    const renderCards = (listings: any[]) => {
      const container = document.getElementById('listingCards')
      if (!container) return
      const countEl = document.querySelector('.res-count')
      if (listings.length === 0) {
        container.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:4rem 2rem;display:flex;flex-direction:column;align-items:center;gap:1.25rem">
          <div style="width:64px;height:64px;border-radius:50%;background:rgba(197,160,90,0.08);border:0.5px solid rgba(197,160,90,0.2);display:flex;align-items:center;justify-content:center;font-size:26px">✦</div>
          <div style="font-family:'Cormorant Garamond',serif;font-size:22px;color:#ece8e1">Be among the first</div>
          <div style="font-size:13px;color:#6a6560;max-width:320px;line-height:1.6">SecretXperience is just launching. Be an early advertiser and reach clients from day one.</div>
          <button onclick="window.location.href='/listings/create'" style="margin-top:0.5rem;padding:12px 28px;background:linear-gradient(135deg,#c5a05a,#a0803d);border:none;border-radius:10px;color:#080808;font-weight:600;font-size:13px;cursor:pointer;font-family:inherit;letter-spacing:0.04em">List your service →</button>
        </div>`
        if (countEl) countEl.textContent = '0 listings'
        return
      }
      container.innerHTML = listings.map((l: any) => {
        const badges: any[] = []
        const isFeatured = l.featured_until && new Date(l.featured_until) > new Date()
        const isLive = liveProviderIds.has(l.profile_id || '')
        if (isFeatured) badges.unshift({cls:'bf',txt:'✦ Featured'})
        if (l.verified) badges.push({cls:'bv',txt:'✓ Verified'})
        if (l.premium) badges.push({cls:'bp',txt:'Premium'})
        if (l.trending) badges.push({cls:'bt',txt:'Trending'})
        const pricing: any[] = []
        if (l.price_from) pricing.push({dur:'Standard rate',amt:'€'+l.price_from+(l.price_to?'–€'+l.price_to:''),note:l.subcategory||l.category,feat:true})
        else pricing.push({dur:'Contact for rates',amt:'POA',note:'',feat:true})
        const d = {
          id: l.id||'', profile_id: l.profile_id||'',
          icon: '${getCategoryIcon(l.category)}',
          badges, cat: (l.category||'')+(l.subcategory?' · '+l.subcategory:''),
          type: l.subcategory||l.category||'', name: l.title||'',
          rating: l.rating||'—', city: (l.city||'—')+', '+(l.country||''),
          s1: l.review_count||'0', s2: l.rating?l.rating.toFixed(1):'—', s3:'—', s4:'—',
          desc: l.description||'', tags: l.subcategory?[l.subcategory,l.category]:[l.category],
          pricing
        }
        const dStr = JSON.stringify(d).replace(/\\/g,'\\\\').replace(/`/g,'\\`')
        const catClassMap: any = {escorts:'cat-escort',companionship:'cat-companion',nightlife:'cat-nightlife',creators:'cat-creator',creator:'cat-creator',adult:'cat-shop',rentals:'cat-rental',hotels:'cat-hotel',events:'cat-event',shop:'cat-shop'}
        const catClass = catClassMap[(l.category||'').toLowerCase()] || 'cat-escort'
        const monogram = (l.title || 'Xx').slice(0,2)
        const imgsJson = JSON.stringify(l.images || []).replace(/"/g, '&quot;')
        const focusJson = JSON.stringify(l.image_focus || {}).replace(/"/g, '&quot;')
        const firstFocus = (l.image_focus && l.images && l.images[0] && l.image_focus[l.images[0]]) ? `${l.image_focus[l.images[0]].x}% ${l.image_focus[l.images[0]].y}%` : 'center 20%'
        const hasSlider = l.images && l.images.length > 1
        return `<div class="card" role="listitem" tabindex="0"
          data-lid="${l.id||''}" data-pid="${l.profile_id||''}" data-images="${imgsJson}" data-focus="${focusJson}"
          onclick="window.location.href='/listings/${l.id||''}'"
          style="cursor:pointer">
          <div class="card-hero ${catClass}" style="height:220px;position:relative;overflow:hidden;">
            ${l.images && l.images.length > 0 ? `<img id="si-${l.id}" src="${l.images[0]}" loading="lazy" decoding="async" style="width:100%;height:100%;object-fit:cover;object-position:${firstFocus};position:absolute;inset:0;" alt="${(l.title || '').replace(/"/g, '&quot;')}" />` : `<span style="font-family:var(--serif);font-size:72px;font-style:italic;font-weight:400;color:rgba(197,160,90,0.30);line-height:1;position:absolute;bottom:0.25rem;left:1rem;">${monogram}</span>`}
            <div style="position:absolute;inset:0;background:linear-gradient(0deg,rgba(8,8,8,0.65) 0%,transparent 45%);pointer-events:none;"></div>
            ${hasSlider ? `
            <button class="slide-btn slide-prev" onclick="(window.__slideCard||function(){})('${l.id}',-1,event)" aria-label="Previous photo"><i class="ti ti-chevron-left"></i></button>
            <button class="slide-btn slide-next" onclick="(window.__slideCard||function(){})('${l.id}',1,event)" aria-label="Next photo"><i class="ti ti-chevron-right"></i></button>
            <span id="sc-${l.id}" class="slide-ctr">1/${l.images.length}</span>
            ` : ''}
            <div data-fav-lid="${l.id}" onclick="event.stopPropagation();(window.toggleFavorite||function(){})(\'${l.id}\',this)" style="position:absolute;top:0.5rem;right:0.5rem;width:30px;height:30px;border-radius:50%;background:rgba(0,0,0,0.35);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:3;cursor:pointer;transition:background .2s;"><i class="ti ti-heart" style="color:#fff;font-size:14px;"></i></div>
            <div class="card-badges" style="position:absolute;top:0.5rem;left:0.5rem;z-index:3;display:flex;flex-direction:column;gap:4px;flex-wrap:wrap;">
              ${isLive ? '<a href="/livestreams" onclick="event.stopPropagation()" style="display:inline-flex;align-items:center;gap:4px;background:rgba(239,68,68,0.2);border:0.5px solid rgba(239,68,68,0.55);color:#ef4444;padding:3px 8px;border-radius:6px;font:800 9px \'Poppins\',sans-serif;letter-spacing:0.1em;backdrop-filter:blur(6px);text-decoration:none"><span style="width:5px;height:5px;border-radius:50%;background:#ef4444;box-shadow:0 0 6px #ef4444;display:inline-block;animation:livepulse 1.2s infinite"></span>LIVE NOW</a>' : ''}
              ${isFeatured ? '<span class="badge bf">✦</span>' : ''}
              ${l.verified ? '<span class="badge bv">✓</span>' : ''}
            </div>
          </div>
          <div class="card-body">
            <div class="card-name-row">
              <span class="card-name">${l.title}</span>
              ${['escorts','companionship','massage','domination'].includes((l.category||'').toLowerCase())
                ? (l.age ? `<span class="card-age">${l.age}</span>` : '')
                : (l.price_from ? `<span class="card-price">€${l.price_from}</span>` : '')}
            </div>
            <div class="card-loc"><i class="ti ti-map-pin" aria-hidden="true"></i> ${l.city || '—'}</div>
          </div>
        </div>`
      }).join('')
      if (countEl) countEl.textContent = listings.length + ' listings found'
    }

    const fetchListings = async (filters: any) => {
      ;(window as any).fetchListings = fetchListings
      // Join profiles to get blocked_countries for geo-filtering
      let query = (supabase as any).from('listings').select('*, profiles!profile_id(blocked_countries)').eq('active', true)
      if (filters.category && filters.category !== 'all') query = query.eq('category', filters.category)
      if (filters.cities && filters.cities.length > 0) query = query.in('city', filters.cities)
      if (filters.meetTypes && filters.meetTypes.length > 0) query = query.in('meet_type', filters.meetTypes)
      if (filters.verified) query = query.eq('verified', true)
      if (filters.premium) query = query.eq('premium', true)
      if (filters.trending) query = query.eq('trending', true)
      if (filters.minRating > 0) query = query.gte('rating', filters.minRating)
      if (filters.priceMax) query = query.lte('price_from', filters.priceMax)
      // Gender/type is single-select. Default (Women) HIDES gay/trans/men/couples/
      // non-binary from the homepage — those only appear when explicitly chosen.
      {
        const sel = ((filters.escortTypes && filters.escortTypes[0]) || 'women').toLowerCase()
        const HIDE_ON_HOME = '{type:men,type:trans,"type:trans woman","type:trans man",type:couple,type:nonbinary,type:non-binary}'
        if (sel === 'all') {
          // no type filter — show everything
        } else if (sel === 'women') {
          query = query.not('tags', 'ov', HIDE_ON_HOME)
        } else if (sel === 'trans woman') {
          query = query.overlaps('tags', ['type:trans woman', 'type:trans'])
        } else if (sel === 'trans man') {
          query = query.overlaps('tags', ['type:trans man'])
        } else {
          query = query.overlaps('tags', ['type:' + sel])
        }
      }
      if (filters.orientations && filters.orientations.length > 0) query = query.overlaps('tags', filters.orientations.map((o: string) => 'orientation:' + o.toLowerCase()))
      if (filters.hairs && filters.hairs.length > 0) query = query.overlaps('tags', filters.hairs)
      if (filters.builds && filters.builds.length > 0) query = query.overlaps('tags', filters.builds)
      if (filters.services && filters.services.length > 0) {
        for (const svc of filters.services) { query = query.contains('tags', [svc]) }
      }
      if (filters.languages && filters.languages.length > 0) {
        for (const lang of filters.languages) { query = query.contains('tags', [lang]) }
      }
      query = query.order('featured_until', { ascending: false, nullsFirst: false })
      const sort = (filters.sort || 'relevance')
      if (sort === 'rating') query = query.order('rating', { ascending: false })
      else if (sort === 'price_asc') query = query.order('price_from', { ascending: true, nullsFirst: false })
      else if (sort === 'price_desc') query = query.order('price_from', { ascending: false, nullsFirst: false })
      else query = query.order('created_at', { ascending: false })
      const [{ data }, { data: liveData }] = await Promise.all([
        query,
        (supabase as any).from('live_streams').select('provider_id').eq('status', 'live'),
      ])
      liveProviderIds = new Set((liveData || []).map((r: any) => r.provider_id))
      // Geo-filter: hide listings where the advertiser blocked the viewer's country
      const viewerCountry: string = (window as any).__viewerCountry || ''
      const visibleListings = (data || []).filter((l: any) => {
        if (!viewerCountry) return true
        const blocked: string[] = l.profiles?.blocked_countries || []
        return !blocked.includes(viewerCountry)
      })
      ;(window as any).__sxCacheListings?.(visibleListings)
      totalListings = visibleListings
      currentPage = 0
      renderCards(totalListings.slice(0, PAGE_SIZE))
      const loadMoreBtn = document.getElementById('loadMoreBtn')
      if (loadMoreBtn) {
        loadMoreBtn.style.display = totalListings.length > PAGE_SIZE ? 'block' : 'none'
      }
      // Update featured banner with top featured advertisement
      const topFeatured = (data || []).find((l: any) => l.featured_until && new Date(l.featured_until) > new Date())
      const banner = document.getElementById('featuredBanner')
      if (banner) {
        if (topFeatured) {
          const titleEl = document.getElementById('featuredBannerTitle')
          const subEl = document.getElementById('featuredBannerSub')
          const btn = document.getElementById('featuredBannerBtn')
          if (titleEl) titleEl.textContent = topFeatured.title || '—'
          if (subEl) subEl.textContent = [(topFeatured.category || ''), topFeatured.verified ? 'Verified' : '', topFeatured.city || ''].filter(Boolean).join(' · ')
          if (btn) btn.onclick = function() {
            if (topFeatured.id) window.location.href = '/listings/' + topFeatured.id
          }
          banner.style.display = ''
        } else {
          banner.style.display = 'none'
        }
      }
      // Populate editorial hero card
      const heroSource = topFeatured || (data && data[0])
      if (heroSource) {
        const hName = document.getElementById('heroCardName')
        const hSub = document.getElementById('heroCardSub')
        const hPrice = document.getElementById('heroCardPrice')
        const hRating = document.getElementById('heroCardRating')
        const hMonogram = document.getElementById('heroMonogram')
        if (hName) hName.textContent = heroSource.title || '—'
        if (hSub) hSub.textContent = [(heroSource.category || ''), (heroSource.subcategory || ''), (heroSource.city || '')].filter(Boolean).join(' · ')
        if (hPrice) hPrice.textContent = heroSource.price_from ? '€' + heroSource.price_from + '/hr' : 'POA'
        if (hRating) hRating.textContent = heroSource.rating ? '★ ' + Number(heroSource.rating).toFixed(1) : '★ —'
        if (hMonogram) hMonogram.textContent = (heroSource.title || 'Sx').slice(0, 2)
        const hImg = document.getElementById('heroCardImg') as HTMLImageElement | null
        const hGrad = document.getElementById('heroCardGradient') as HTMLElement | null
        if (hImg && heroSource.images && heroSource.images.length > 0) {
          hImg.src = heroSource.images[0]
          hImg.style.display = 'block'
          if (hMonogram) hMonogram.style.display = 'none'
          if (hGrad) hGrad.style.display = 'block'
        }
        const hCard = document.getElementById('heroFeaturedCard')
        if (hCard && heroSource.id) hCard.onclick = () => { window.location.href = '/listings/' + heroSource.id }
      }
    }

    // ── Recently Viewed row ──
    const loadRecentlyViewed = async () => {
      try {
        const rvIds: string[] = JSON.parse(localStorage.getItem('sx_recently_viewed') || '[]')
        if (!rvIds.length) return
        const { data: rvListings } = await (supabase as any).from('listings').select('*').in('id', rvIds).eq('active', true).limit(8)
        if (!rvListings || !rvListings.length) return
        const section = document.getElementById('recentViewedSection')
        const container = document.getElementById('recentViewedCards')
        if (!section || !container) return
        container.innerHTML = rvListings.map((l: any) => {
          const dataStr = encodeURIComponent(JSON.stringify({
            id:l.id||'',profile_id:l.profile_id||'',icon:getCategoryIcon(l.category),badges:[],
            cat:l.category||'',type:l.subcategory||l.category||'',name:l.title||'',
            rating:l.rating||'—',city:(l.city||'—')+', '+(l.country||''),
            s1:String(l.review_count||0),s2:l.rating?l.rating.toFixed(1):'—',s3:'—',s4:'—',
            desc:l.description||'',tags:[l.category],
            pricing:l.price_from?[{dur:'Rate',amt:'€'+l.price_from,note:l.category,feat:true}]:[{dur:'Rate',amt:'POA',note:'',feat:true}],
            price_from:l.price_from||0,featured_until:l.featured_until||null
          }))
          return `<div onclick="window.location.href='/listings/${l.id||''}'" style="flex-shrink:0;width:140px;cursor:pointer;background:rgba(255,255,255,0.03);border:0.5px solid rgba(255,255,255,0.07);border-radius:10px;padding:.75rem;transition:border-color .15s" onmouseover="this.style.borderColor='rgba(197,160,90,0.3)'" onmouseout="this.style.borderColor='rgba(255,255,255,0.07)'">
            <div style="width:32px;height:32px;border-radius:8px;background:rgba(197,160,90,0.08);display:flex;align-items:center;justify-content:center;font-size:14px;margin-bottom:.5rem"><i class="ti ${getCategoryIcon(l.category)}"></i></div>
            <div style="font-size:12px;color:#ece8e1;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:2px">${l.title||''}</div>
            <div style="font-size:11px;color:#4c4a47">${l.price_from?'€'+l.price_from:'POA'}</div>
          </div>`
        }).join('')
        section.style.display = 'block'
      } catch(e) {}
    }
    loadRecentlyViewed()

    const loadStats = async () => {
      try {
        const [
          { count: listingCount },
          { count: userCount },
          { count: advertiserCount },
          { data: activeRows },
        ] = await Promise.all([
          (supabase as any).from('listings').select('id', { count: 'exact', head: true }).eq('active', true),
          (supabase as any).from('profiles').select('id', { count: 'exact', head: true }),
          (supabase as any).from('profiles').select('id', { count: 'exact', head: true }).in('role', ['provider','venue','creator']),
          (supabase as any).from('listings').select('profile_id, city').eq('active', true),
        ])
        const el = (id: string) => document.getElementById(id)
        const countStr = (listingCount || 0).toLocaleString()
        if (el('statListings')) el('statListings')!.textContent = countStr
        if (el('statListingsAdmin')) el('statListingsAdmin')!.textContent = countStr
        if (el('statAdvertisers')) el('statAdvertisers')!.textContent = (advertiserCount || 0).toLocaleString()
        if (el('statUsers')) el('statUsers')!.textContent = (userCount || 0).toLocaleString()
        if (el('statRevenue')) el('statRevenue')!.textContent = '—'

        // Live social proof — distinct active advertisers + cities from live listings
        const rows = (activeRows || []) as Array<{ profile_id: string | null; city: string | null }>
        const liveListings = listingCount || rows.length
        const liveCities = new Set(rows.map(r => (r.city || '').trim().toLowerCase()).filter(Boolean)).size
        if (el('statCitiesHero')) el('statCitiesHero')!.textContent = String(liveCities || 0)
        if (el('statListingsPill')) el('statListingsPill')!.textContent = (liveListings || 0).toLocaleString()
        if (el('statCitiesPill')) el('statCitiesPill')!.textContent = String(liveCities || 0)
        // Hide the live pill entirely if there's nothing live yet (avoid "0 listings")
        const pill = el('liveNowPill')
        if (pill) pill.style.display = liveListings > 0 ? 'inline-flex' : 'none'
      } catch(e) {}
    }
    loadStats()

    ;(window as any).__loadMore = function() {
      currentPage++
      const start = currentPage * PAGE_SIZE
      const slice = totalListings.slice(0, start + PAGE_SIZE)
      renderCards(slice)
      const loadMoreBtn = document.getElementById('loadMoreBtn')
      if (loadMoreBtn) {
        loadMoreBtn.style.display = slice.length < totalListings.length ? 'block' : 'none'
      }
      // Scroll to show new cards
      document.getElementById('listingCards')?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }

    // Wire category bar — navigate to dedicated category pages
    document.querySelectorAll('.cat').forEach(function(cat) {
      cat.addEventListener('click', function() {
        const catVal = (cat as HTMLElement).dataset.cat || 'all'
        if (catVal === 'all') {
          activeFilters.category = 'all'
          fetchListings(activeFilters)
          return
        }
        // Navigate to the dedicated category page
        window.location.href = '/' + catVal
      })
    })

    // Wire filter checkboxes
    document.getElementById('fv')?.addEventListener('change', function(e) {
      activeFilters.verified = (e.target as HTMLInputElement).checked
      fetchListings(activeFilters)
    })
    document.getElementById('fp')?.addEventListener('change', function(e) {
      activeFilters.premium = (e.target as HTMLInputElement).checked
      fetchListings(activeFilters)
    })
    document.getElementById('ft')?.addEventListener('change', function(e) {
      activeFilters.trending = (e.target as HTMLInputElement).checked
      fetchListings(activeFilters)
    })

    // Wire rating slider
    document.getElementById('rsl')?.addEventListener('input', function(e) {
      const val = parseFloat((e.target as HTMLInputElement).value)
      activeFilters.minRating = val
      const rval = document.getElementById('rval')
      if (rval) rval.textContent = val === 0 ? 'Any' : val.toFixed(1)
      fetchListings(activeFilters)
    })

    // Wire price pills
    document.querySelectorAll('.pp').forEach(function(pill) {
      pill.addEventListener('click', function() {
        document.querySelectorAll('.pp').forEach(p => p.classList.remove('active'))
        pill.classList.add('active')
        const text = pill.textContent || ''
        if (text === '€0–100') activeFilters.priceMax = 100
        else if (text === '€100–300') activeFilters.priceMax = 300
        else if (text === '€300–500') activeFilters.priceMax = 500
        else if (text === '€500+') activeFilters.priceMax = 99999
        else activeFilters.priceMax = null
        fetchListings(activeFilters)
      })
    })

    // Wire escort type buttons (single-select). Default is Women; gay/trans/men/
    // couples/non-binary stay hidden on the homepage until explicitly chosen here.
    document.querySelectorAll('[data-etype]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        const val = (btn as HTMLElement).dataset.etype || 'women'
        document.querySelectorAll('[data-etype]').forEach(b => b.classList.remove('active'))
        btn.classList.add('active')
        activeFilters.escortTypes = [val]
        fetchListings(activeFilters)
      })
    })

    // Wire orientation buttons (multi-select)
    document.querySelectorAll('[data-ori]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        const val = (btn as HTMLElement).dataset.ori || ''
        if (val === 'all') {
          activeFilters.orientations = []
          document.querySelectorAll('[data-ori]').forEach(b => b.classList.remove('active'))
          btn.classList.add('active')
        } else {
          document.querySelector('[data-ori="all"]')?.classList.remove('active')
          if (activeFilters.orientations.includes(val)) {
            activeFilters.orientations = activeFilters.orientations.filter((v: string) => v !== val)
            btn.classList.remove('active')
            if (activeFilters.orientations.length === 0) document.querySelector('[data-ori="all"]')?.classList.add('active')
          } else {
            activeFilters.orientations.push(val)
            btn.classList.add('active')
          }
        }
        fetchListings(activeFilters)
      })
    })

    // Wire meet type buttons (multi-select)
    document.querySelectorAll('[data-meet]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        const val = (btn as HTMLElement).dataset.meet || ''
        if (val === 'all') {
          activeFilters.meetTypes = []
          document.querySelectorAll('[data-meet]').forEach(b => b.classList.remove('active'))
          btn.classList.add('active')
        } else {
          document.querySelector('[data-meet="all"]')?.classList.remove('active')
          if (activeFilters.meetTypes.includes(val)) {
            activeFilters.meetTypes = activeFilters.meetTypes.filter((v: string) => v !== val)
            btn.classList.remove('active')
            if (activeFilters.meetTypes.length === 0) document.querySelector('[data-meet="all"]')?.classList.add('active')
          } else {
            activeFilters.meetTypes.push(val)
            btn.classList.add('active')
          }
        }
        fetchListings(activeFilters)
      })
    })

    // Wire city filter buttons (multi-select)
    document.querySelectorAll('[data-city-f]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        const val = (btn as HTMLElement).dataset.cityF || 'all'
        if (val === 'all') {
          activeFilters.cities = []
          document.querySelectorAll('[data-city-f]').forEach(b => b.classList.remove('active'))
          btn.classList.add('active')
        } else {
          document.querySelector('[data-city-f="all"]')?.classList.remove('active')
          if (activeFilters.cities.includes(val)) {
            activeFilters.cities = activeFilters.cities.filter((v: string) => v !== val)
            btn.classList.remove('active')
            if (activeFilters.cities.length === 0) document.querySelector('[data-city-f="all"]')?.classList.add('active')
          } else {
            activeFilters.cities.push(val)
            btn.classList.add('active')
          }
        }
        fetchListings(activeFilters)
      })
    })

    // Wire services (multi-select toggle)
    document.querySelectorAll('[data-svc]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        const svc = (btn as HTMLElement).dataset.svc || ''
        if (activeFilters.services.includes(svc)) {
          activeFilters.services = activeFilters.services.filter((s: string) => s !== svc)
          btn.classList.remove('active')
        } else {
          activeFilters.services.push(svc)
          btn.classList.add('active')
        }
        fetchListings(activeFilters)
      })
    })

    // Wire languages (multi-select toggle)
    document.querySelectorAll('[data-lang]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        const lang = (btn as HTMLElement).dataset.lang || ''
        if (activeFilters.languages.includes(lang)) {
          activeFilters.languages = activeFilters.languages.filter((l: string) => l !== lang)
          btn.classList.remove('active')
        } else {
          activeFilters.languages.push(lang)
          btn.classList.add('active')
        }
        fetchListings(activeFilters)
      })
    })

    // Wire hair color (multi-select toggle)
    document.querySelectorAll('[data-hair]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        const val = (btn as HTMLElement).dataset.hair || ''
        if (activeFilters.hairs.includes(val)) {
          activeFilters.hairs = activeFilters.hairs.filter((v: string) => v !== val)
          btn.classList.remove('active')
        } else {
          activeFilters.hairs.push(val)
          btn.classList.add('active')
        }
        fetchListings(activeFilters)
      })
    })

    // Wire build (multi-select toggle)
    document.querySelectorAll('[data-build]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        const val = (btn as HTMLElement).dataset.build || ''
        if (activeFilters.builds.includes(val)) {
          activeFilters.builds = activeFilters.builds.filter((v: string) => v !== val)
          btn.classList.remove('active')
        } else {
          activeFilters.builds.push(val)
          btn.classList.add('active')
        }
        fetchListings(activeFilters)
      })
    })

    // Wire reset button
    document.getElementById('resetFilters')?.addEventListener('click', function() {
      activeFilters.escortTypes = ['women']; activeFilters.orientations = []
      activeFilters.meetTypes = []; activeFilters.cities = []
      activeFilters.hairs = []; activeFilters.builds = []
      activeFilters.verified = false; activeFilters.premium = false; activeFilters.trending = false
      activeFilters.priceMax = null; activeFilters.minRating = 0
      activeFilters.services = []; activeFilters.languages = []
      document.querySelectorAll('[data-etype]').forEach(b => b.classList.remove('active'))
      document.querySelector('[data-etype="women"]')?.classList.add('active')
      document.querySelectorAll('[data-ori]').forEach(b => b.classList.remove('active'))
      document.querySelector('[data-ori="all"]')?.classList.add('active')
      document.querySelectorAll('[data-meet]').forEach(b => b.classList.remove('active'))
      document.querySelector('[data-meet="all"]')?.classList.add('active')
      document.querySelectorAll('[data-city-f]').forEach(b => b.classList.remove('active'))
      document.querySelector('[data-city-f="all"]')?.classList.add('active')
      document.querySelectorAll('[data-svc],[data-lang],[data-hair],[data-build]').forEach(b => b.classList.remove('active'))
      document.querySelectorAll('.pp').forEach(b => b.classList.remove('active'))
      document.querySelector('.pp')?.classList.add('active')
      const rsl = document.getElementById('rsl') as HTMLInputElement; if (rsl) rsl.value = '0'
      const rval = document.getElementById('rval'); if (rval) rval.textContent = 'Any'
      const fv = document.getElementById('fv') as HTMLInputElement; if (fv) fv.checked = false
      const fp = document.getElementById('fp') as HTMLInputElement; if (fp) fp.checked = false
      const ft = document.getElementById('ft') as HTMLInputElement; if (ft) ft.checked = false
      fetchListings(activeFilters)
    })

    document.getElementById('sortSel')?.addEventListener('change', function() {
      const val = (this as HTMLSelectElement).value
      if (val.includes('Rating')) activeFilters.sort = 'rating'
      else if (val.includes('Price ↑')) activeFilters.sort = 'price_asc'
      else if (val.includes('Price ↓')) activeFilters.sort = 'price_desc'
      else activeFilters.sort = 'relevance'
      fetchListings(activeFilters)
    })

    // ── Search bar ──
    let allListings: any[] = []
    // Cache must be wired before initial fetchListings call so search has data
    ;(window as any).__sxCacheListings = (data: any[]) => { allListings = data }

    // Strip OAuth error params (e.g. ?error=access_denied) before they show in the URL bar
    if (window.location.search) {
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.has('error') || urlParams.has('error_code') || urlParams.has('error_description')) {
        history.replaceState({}, '', window.location.pathname)
      }
    }

    // Refresh live badge when streams start/stop.
    // Remove any stale channel of the same name first — otherwise StrictMode's
    // double-mount (dev) re-runs .channel('hp_live_badge') against an already
    // subscribed instance and .on() throws "callbacks after subscribe()".
    try {
      ;(supabase as any).getChannels?.()
        .filter((c: any) => c.topic === 'realtime:hp_live_badge')
        .forEach((c: any) => (supabase as any).removeChannel(c))
    } catch { /* getChannels not available — ignore */ }
    const liveBadgeCh = (supabase as any).channel('hp_live_badge')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'live_streams' }, async () => {
        const { data: ld } = await (supabase as any).from('live_streams').select('provider_id').eq('status', 'live')
        liveProviderIds = new Set((ld || []).map((r: any) => r.provider_id))
        if (totalListings.length > 0) renderCards(totalListings.slice(0, Math.max(PAGE_SIZE, currentPage * PAGE_SIZE)))
      })
      .subscribe()
    ;(window as any).__sxLiveBadgeCh = liveBadgeCh

    // Initial load
    fetchListings(activeFilters).then(async () => {
      // Deep-link: /?listing=UUID → auto-open detail panel for that listing
      const urlParams = new URLSearchParams(window.location.search)
      const deepId = urlParams.get('listing')
      if (deepId) {
        window.location.replace('/listings/' + deepId)
      }
    })

    // ── Nav logo → home ──
    const navLogo = document.querySelector('.nav-logo') as HTMLElement | null
    if (navLogo) { navLogo.style.cursor = 'pointer'; navLogo.addEventListener('click', () => { window.location.href = '/' }) }

    // Tear down the live-badge realtime channel on unmount so a remount
    // (StrictMode in dev, route changes in prod) starts from a clean slate.
    return () => {
      try { if (liveBadgeCh) (supabase as any).removeChannel(liveBadgeCh) } catch { /* ignore */ }
    }
  }, [])


  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([
        {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'SecretXperience',
          url: 'https://www.secretxperience.eu',
          description: 'Premium adult services marketplace across Europe — escorts, companions, nightlife, creators, rentals, hotels, events and more.',
          potentialAction: {
            '@type': 'SearchAction',
            target: { '@type': 'EntryPoint', urlTemplate: 'https://www.secretxperience.eu/search?q={search_term_string}' },
            'query-input': 'required name=search_term_string'
          }
        },
        {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'SecretXperience',
          url: 'https://www.secretxperience.eu',
          logo: 'https://www.secretxperience.eu/icon-192.png',
          description: 'Premium verified adult services marketplace serving Belgium, Netherlands, Germany, France and the EU.',
          areaServed: ['BE', 'NL', 'DE', 'FR', 'LU', 'CH'],
          sameAs: []
        }
      ]) }} />
      <div dangerouslySetInnerHTML={{ __html: `<script>(function(){try{var exp=parseInt(localStorage.getItem('sx_age_ok')||'0');var ok=exp>Date.now();if(!ok){for(var k in localStorage){if(k.startsWith('sb-')&&k.endsWith('-auth-token')){try{if(JSON.parse(localStorage.getItem(k)||'{}').access_token){ok=true;localStorage.setItem('sx_age_ok',String(Date.now()+30*24*60*60*1000));break;}}catch(e){}}}}if(ok){var s=document.createElement('style');s.textContent='#gate{display:none!important}';document.head.appendChild(s);}}catch(e){}})();<\/script>
<!-- ══ AGE GATE ══ -->
<div id="gate" role="dialog" aria-modal="true" aria-label="Age verification" style="background:rgba(4,4,4,0.93);backdrop-filter:blur(14px);">
  <div class="gate-box" style="max-width:400px;padding:2.5rem 2rem;background:var(--grad-velvet);border:0.5px solid var(--b3);border-radius:var(--rxl);box-shadow:var(--shadow-modal);position:relative;overflow:hidden;animation:gateIn .4s var(--ease-out) both;">
    <div style="position:absolute;top:-60px;left:50%;transform:translateX(-50%);width:200px;height:200px;background:radial-gradient(circle,rgba(197,160,90,0.15) 0%,transparent 70%);pointer-events:none;"></div>
    <div style="font:600 11px/1 var(--sans);letter-spacing:0.32em;color:var(--gold);text-align:center;margin-bottom:1.5rem;text-transform:uppercase;position:relative;z-index:2;">SECRETXPERIENCE</div>
    <i class="ti ti-shield-lock" style="font-size:44px;color:var(--gold);filter:drop-shadow(0 0 18px rgba(197,160,90,0.35));display:block;text-align:center;margin-bottom:1rem;position:relative;z-index:2;" aria-hidden="true"></i>
    <h2 style="font-family:var(--serif);font-size:26px;font-weight:400;text-align:center;margin:0 0 0.5rem;position:relative;z-index:2;">SecretXperience is an adult website.</h2>
    <p class="t-body-sm" style="max-width:320px;text-align:center;margin:0 auto 1rem;color:var(--t2);font-size:13px;line-height:1.65;position:relative;z-index:2;">By continuing to browse, you declare that you are <strong style="color:var(--t)">18 years of age or older</strong> and you consent to the use of cookies and agree to our <a href="/terms" style="color:var(--gold)">Terms of Use</a>.</p>
    <p class="t-body-sm" style="max-width:320px;text-align:center;margin:0 auto 1.5rem;color:var(--t3);font-size:12px;line-height:1.65;position:relative;z-index:2;">SecretXperience uses cookies for functional and analytical purposes. Via the settings button you can set your own preferences.</p>
    <div class="gate-btns" style="position:relative;z-index:2;">
      <button class="g-yes" id="gyes" style="width:100%;padding:14px 20px;background:var(--grad-gold);border:none;border-radius:var(--r);color:#080808;font-weight:600;font-size:14px;cursor:pointer;font-family:var(--sans);letter-spacing:0.04em;margin-bottom:0.75rem;">I am 18+ — Enter Site</button>
      <button class="g-no" id="gno" style="width:100%;padding:10px 20px;background:transparent;border:0.5px solid var(--b2);border-radius:var(--r);color:var(--t2);font-size:12px;cursor:pointer;font-family:var(--sans);">I am under 18 — Exit</button>
    </div>
    <div class="gate-legal" style="position:relative;z-index:2;">
      By entering you confirm you are 18 or older and agree to our <a href="/terms">Terms of Use</a>, <a href="/privacy">Privacy Policy</a>, and <a href="/cookies">Cookie Policy</a>.
    </div>
  </div>
</div>

<!-- ══ SIDEBAR OVERLAY ══ -->
<div class="sov" id="sov" aria-hidden="true"></div>

<!-- ══ APP ══ -->
<div id="app">

  <!-- NAV -->
  <nav role="navigation" aria-label="Main navigation" style="display:flex;align-items:center;justify-content:space-between;padding:0 1.5rem;height:64px;position:sticky;top:0;z-index:200;background:rgba(8,6,18,0.92);backdrop-filter:blur(18px);border-bottom:0.5px solid var(--b);">
    <div class="nav-logo">Secret<em style="font-style:italic;font-weight:300">Xperience</em></div>
    <div class="nav-right">
      <button class="nb" id="locBtn" aria-label="Location"><i class="ti ti-map-pin" aria-hidden="true"></i> Brussels</button>
      <button onclick="__cycleTheme()" aria-label="Toggle theme" style="width:34px;height:34px;background:var(--bg2);border:0.5px solid var(--b2);border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--t2);font-size:16px;flex-shrink:0;"><i class="ti ti-moon-stars" id="themeIcon"></i></button>
      <!-- logged-out -->
      <a href="/discover" class="nb" style="text-decoration:none;display:flex;align-items:center;gap:5px;color:var(--gold);font-weight:500;" title="Swipe to discover"><i class="ti ti-sparkles" aria-hidden="true"></i> Discover</a>
      <a href="/livestreams" class="nb" style="text-decoration:none;display:flex;align-items:center;gap:5px;color:#ef4444;font-weight:600;" title="Our performers live now"><i class="ti ti-broadcast" aria-hidden="true"></i> Live Shows <span style="width:5px;height:5px;border-radius:50%;background:#ef4444;display:inline-block;animation:liveblink 1.2s ease-in-out infinite;margin-left:1px;"></span></a>
      <a href="/live" class="nb" style="text-decoration:none;display:flex;align-items:center;gap:5px;color:var(--t2);font-weight:500;" title="Cam models"><i class="ti ti-live-photo" aria-hidden="true"></i> Cams</a>
      <a href="/events" class="nb" style="text-decoration:none;display:flex;align-items:center;gap:6px;"><i class="ti ti-calendar-event" aria-hidden="true"></i> Events</a>
      <button class="nb" id="loginBtn">Log in</button>
      <button class="nb pri" id="signupBtn" onclick="window.location.href='/advertise'">List your service</button>
      <!-- logged-in: List service + profile avatar -->
      <button class="nb pri" id="listServiceBtn" style="display:none" onclick="window.location.href='/listings/create'"><i class="ti ti-plus" aria-hidden="true"></i> List service</button>
      <div id="profileMenuWrap" style="display:none;position:relative;align-items:center;gap:8px;">
        <!-- Notification bell -->
        <div style="position:relative;">
          <button id="notifBtn" aria-label="Notifications" style="width:34px;height:34px;background:var(--bg2);border:0.5px solid var(--b2);border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--t2);font-size:16px;position:relative;flex-shrink:0;transition:border-color .2s;">
            <i class="ti ti-bell"></i>
            <span id="notifBadge" style="display:none;position:absolute;top:3px;right:3px;width:8px;height:8px;border-radius:50%;background:#c5a05a;box-shadow:0 0 6px rgba(197,160,90,0.7);"></span>
          </button>
          <div id="notifDropdown" style="display:none;position:absolute;top:calc(100% + 8px);right:0;min-width:300px;max-width:340px;background:var(--bg1);border:0.5px solid var(--b2);border-radius:var(--rl);box-shadow:var(--shadow-modal);z-index:9999;overflow:hidden;">
            <div style="padding:12px 16px;border-bottom:0.5px solid var(--b);display:flex;align-items:center;justify-content:space-between;">
              <span style="font-family:var(--serif);font-size:15px;color:var(--t);">Notifications</span>
              <button id="notifMarkAll" style="font-size:11px;color:var(--gold);background:none;border:none;cursor:pointer;font-family:var(--sans);letter-spacing:0.04em;">Mark all read</button>
            </div>
            <div id="notifList" style="max-height:340px;overflow-y:auto;padding:6px 0;">
              <div style="padding:20px 16px;text-align:center;font-size:13px;color:var(--t3);font-family:var(--sans);">Loading…</div>
            </div>
          </div>
        </div>
        <button id="profileBtn" aria-label="Account menu" aria-haspopup="true" aria-expanded="false" style="display:flex;align-items:center;gap:6px;background:var(--bg2);border:0.5px solid var(--b2);border-radius:20px;padding:4px 10px 4px 4px;cursor:pointer;color:var(--t);">
          <div id="profileAvatar" style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,var(--gold),var(--goldd));display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#0a0a0a;flex-shrink:0;">A</div>
          <span id="profileDisplayName" style="font-size:13px;font-weight:500;max-width:90px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">Account</span>
          <i class="ti ti-chevron-down" id="profileChevron" style="font-size:11px;color:var(--t3);transition:transform .2s;"></i>
        </button>
        <div id="profileDropdown" style="display:none;position:absolute;top:calc(100% + 8px);right:0;min-width:220px;background:var(--bg1);border:0.5px solid var(--b2);border-radius:var(--rl);box-shadow:var(--shadow-modal);z-index:9999;overflow:hidden;">
          <div style="padding:14px 16px 12px;border-bottom:0.5px solid var(--b);">
            <div id="ddName" style="font-family:var(--serif);font-size:15px;font-weight:500;color:var(--t);">Account</div>
            <div id="ddEmail" style="font-size:12px;color:var(--t3);margin-top:2px;"></div>
          </div>
          <div style="padding:6px 0;">
            <a id="ddMyProfileLink" href="/dashboard" style="display:flex;align-items:center;gap:10px;padding:10px 16px;color:var(--t);font-size:13px;text-decoration:none;" onmouseover="this.style.background='var(--bg2)'" onmouseout="this.style.background=''"><i class="ti ti-user-circle" style="font-size:16px;color:var(--t3);width:18px;text-align:center;"></i> My Profile</a>
            <a href="/dashboard" style="display:flex;align-items:center;gap:10px;padding:10px 16px;color:var(--t);font-size:13px;text-decoration:none;" onmouseover="this.style.background='var(--bg2)'" onmouseout="this.style.background=''"><i class="ti ti-layout-dashboard" style="font-size:16px;color:var(--t3);width:18px;text-align:center;"></i> Dashboard</a>
            <a href="/messages" style="display:flex;align-items:center;gap:10px;padding:10px 16px;color:var(--t);font-size:13px;text-decoration:none;" onmouseover="this.style.background='var(--bg2)'" onmouseout="this.style.background=''"><i class="ti ti-message" style="font-size:16px;color:var(--t3);width:18px;text-align:center;"></i> Messages <span id="ddMsgBadge" style="display:none;margin-left:auto;width:8px;height:8px;border-radius:50%;background:#c5a05a;box-shadow:0 0 6px rgba(197,160,90,0.7);animation:ddDotPulse 1.8s ease-in-out infinite;flex-shrink:0;"></span></a>
            <a href="/tokens" style="display:flex;align-items:center;gap:10px;padding:10px 16px;color:var(--t);font-size:13px;text-decoration:none;" onmouseover="this.style.background='var(--bg2)'" onmouseout="this.style.background=''"><i class="ti ti-coins" style="font-size:16px;color:var(--t3);width:18px;text-align:center;"></i> Tokens &amp; Wallet</a>
            <a href="/listings/create" style="display:flex;align-items:center;gap:10px;padding:10px 16px;color:var(--t);font-size:13px;text-decoration:none;" onmouseover="this.style.background='var(--bg2)'" onmouseout="this.style.background=''"><i class="ti ti-plus" style="font-size:16px;color:var(--t3);width:18px;text-align:center;"></i> List a service</a>
          </div>
          <div style="border-top:0.5px solid var(--b);padding:6px 0;">
            <button data-action="logout" style="display:flex;align-items:center;gap:10px;padding:10px 16px;color:var(--wine);font-size:13px;background:none;border:none;cursor:pointer;width:100%;text-align:left;" onmouseover="this.style.background='var(--bg2)'" onmouseout="this.style.background=''"><i class="ti ti-logout" style="font-size:16px;width:18px;text-align:center;"></i> Log out</button>
          </div>
        </div>
      </div>
      <!-- Mobile-only auth button (logged-out): always visible on phones -->
      <a href="/login" id="mobileLoginBtn" class="mobile-auth-btn" style="display:none;align-items:center;gap:5px;text-decoration:none;background:linear-gradient(135deg,var(--gold),var(--goldd));color:#0a0a0a;font-weight:600;font-size:13px;padding:7px 14px;border-radius:20px;white-space:nowrap;"><i class="ti ti-user" style="font-size:14px;"></i> Sign in</a>
      <button class="nb nav-menu-btn" id="menuBtn" aria-label="Open menu"><i class="ti ti-menu-2"></i></button>
    </div>
  </nav>

  <!-- CATEGORY BAR -->
  <div class="catbar" role="navigation" aria-label="Categories" id="catBar">
    <!-- All -->
    <div class="cat active" data-cat="all">All</div>

    <!-- COMPANIONS group: Escorts + incall personal services -->
    <div class="cat-group">
      <button class="cat-group-pill" data-group="companions" aria-haspopup="true" aria-expanded="false">
        Companions <i class="ti ti-chevron-down cg-chev"></i>
      </button>
      <div class="cat-group-menu" id="cgm-companions" role="menu">
        <span class="cat-group-label">Outcall</span>
        <a class="cat-group-item" href="/escorts" role="menuitem">
          Escorts
          <span class="cat-group-item-sub">Advertiser travels to you</span>
        </a>
        <a class="cat-group-item" href="/private-reception" role="menuitem" style="color:var(--gold);font-size:11px;text-transform:uppercase;letter-spacing:0.1em;padding:6px 14px 4px;font-weight:600;">
          Incall · Private Reception →
        </a>
        <a class="cat-group-item" href="/private-reception?cat=companionship" role="menuitem">Companionship</a>
        <a class="cat-group-item" href="/private-reception?cat=massage" role="menuitem">Massage</a>
        <a class="cat-group-item" href="/private-reception?cat=domination" role="menuitem">Domination</a>
        <a class="cat-group-item" href="/private-reception?cat=experiences" role="menuitem">Experiences</a>
      </div>
    </div>

    <!-- VENUES group -->
    <div class="cat-group">
      <button class="cat-group-pill" data-group="venues" aria-haspopup="true" aria-expanded="false">
        Venues <i class="ti ti-chevron-down cg-chev"></i>
      </button>
      <div class="cat-group-menu" id="cgm-venues" role="menu">
        <a class="cat-group-item" href="/nightlife" role="menuitem">Nightlife</a>
        <a class="cat-group-item" href="/rentals" role="menuitem">Rentals</a>
        <a class="cat-group-item" href="/hotels" role="menuitem">Hotels</a>
      </div>
    </div>

    <!-- Standalone categories -->
    <div class="cat" data-cat="creators">Creators</div>
    <div class="cat" data-cat="events">Events</div>
    <div class="cat" data-cat="shop">Adult Shop</div>
  </div>

  <!-- ══ EDITORIAL HERO ══ -->
  <!-- Visitor-selectable hero styles render here (HeroThemes) -->
  <div id="heroThemesMount"></div>

  <section id="editorialHero" style="width:100%;background:var(--grad-candle);border-top:0.5px solid var(--b);border-bottom:0.5px solid var(--b);padding:4rem 1.5rem;">
    <div style="max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1.5fr 1fr;gap:2rem;align-items:center;">
      <!-- LEFT: text -->
      <div>
        <p class="t-eyebrow-gold" style="margin-bottom:1rem;">EU · DISCREET · VERIFIED</p>
        <h1 style="font-family:var(--serif);font-size:56px;font-weight:500;line-height:1.04;letter-spacing:-0.005em;margin:0 0 1.25rem;">
          Where the night begins<br>
          <em style="font-style:italic;background:var(--grad-gold);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;color:transparent;">with someone discreet</em>
        </h1>
        <p class="t-body" style="color:var(--t2);max-width:480px;margin-bottom:1.5rem;">A members-only marketplace for escorts, companions, nightlife, creators, rentals, and the after-hours.</p>
        <div style="position:relative;max-width:480px;margin-bottom:1.5rem;">
          <i class="ti ti-search" style="position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--t3);font-size:16px;"></i>
          <input type="text" id="heroSearch" placeholder="Search listings, companions, venues…" style="width:100%;height:52px;padding:0 90px 0 42px;background:var(--bg2);border:0.5px solid var(--gbrd);border-radius:20px;color:var(--t);font:400 14px var(--sans);outline:none;" onkeydown="if(event.key==='Enter'){var q=this.value.trim();if(q){window.location.href='/search?q='+encodeURIComponent(q)}else{window.location.href='/search'}}" />
          <button id="heroSearchBtn" style="position:absolute;right:6px;top:50%;transform:translateY(-50%);height:40px;padding:0 16px;background:var(--grad-gold);border:none;border-radius:16px;color:#000;font:600 13px var(--sans);cursor:pointer;letter-spacing:0.04em;">Search</button>
        </div>
        <div id="liveNowPill" style="display:inline-flex;align-items:center;gap:8px;margin-bottom:1.25rem;padding:7px 14px;background:rgba(38,212,160,0.08);border:0.5px solid rgba(38,212,160,0.3);border-radius:999px;font:500 12.5px var(--sans);color:var(--t);">
          <span style="position:relative;display:inline-flex;width:8px;height:8px;"><span style="position:absolute;inset:0;border-radius:50%;background:#26d4a0;animation:sxPulse 1.8s ease-out infinite;"></span><span style="position:relative;width:8px;height:8px;border-radius:50%;background:#26d4a0;"></span></span>
          <span><strong id="statListingsPill" style="color:#26d4a0;">—</strong> listings live now across <strong id="statCitiesPill" style="color:#26d4a0;">—</strong> cities in Belgium, Netherlands &amp; Germany</span>
        </div>
        <div class="hero-stats" style="display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;">
          <div><div id="statListings" style="font-family:var(--serif);font-size:28px;color:var(--gold);">40+</div><div class="t-meta" style="color:var(--t3);">LISTINGS</div></div>
          <div><div id="statCitiesHero" style="font-family:var(--serif);font-size:28px;color:var(--gold);">—</div><div class="t-meta" style="color:var(--t3);">CITIES</div></div>
          <div><div style="font-family:var(--serif);font-size:28px;color:var(--gold);">8</div><div class="t-meta" style="color:var(--t3);">CATEGORIES</div></div>
          <div><div style="font-family:var(--serif);font-size:28px;color:var(--gold);">4.8 ★</div><div class="t-meta" style="color:var(--t3);">AVG RATING</div></div>
        </div>
      </div>
      <!-- RIGHT: featured advertisement card -->
      <div class="hero-hero-col" id="heroFeaturedCard" style="width:100%;max-width:320px;border-radius:var(--rl);border:0.5px solid var(--b2);box-shadow:var(--shadow-card-h);overflow:hidden;cursor:pointer;" onclick="document.getElementById('heroFeaturedCard').style.transform='translateY(-3px)'">
        <div class="cat-escort" style="height:240px;position:relative;display:flex;align-items:flex-end;padding:1.25rem;">
          <img id="heroCardImg" src="" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:none;" />
          <div style="position:absolute;inset:0;background:linear-gradient(to top, rgba(8,6,14,0.75) 0%, transparent 55%);pointer-events:none;" id="heroCardGradient" style="display:none;"></div>
          <div style="position:absolute;top:0.75rem;right:0.75rem;width:32px;height:32px;border-radius:50%;background:rgba(0,0,0,0.30);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;"><i class="ti ti-heart-filled" style="color:var(--pink);font-size:15px;"></i></div>
          <span style="font-family:var(--serif);font-size:96px;font-style:italic;font-weight:400;color:rgba(197,160,90,0.30);line-height:1;position:absolute;bottom:0.5rem;left:1.25rem;" id="heroMonogram">Sa</span>
        </div>
        <div style="background:var(--bg1);padding:1rem 1.25rem;">
          <div class="t-card-title" id="heroCardName">Sophia A.</div>
          <div class="t-body-sm" style="color:var(--t2);margin:0.25rem 0 0.75rem;" id="heroCardSub">Escort · Independent · Brussels</div>
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="font-family:var(--serif);font-size:18px;color:var(--gold);" id="heroCardPrice">€280/hr</span>
            <span class="t-body-sm" style="color:var(--t2);" id="heroCardRating">★ 4.9</span>
          </div>
        </div>
      </div>
    </div>
    <style>
    @media(max-width:960px){#editorialHero>div{grid-template-columns:1fr 1fr!important}}
    @media(max-width:640px){
      #editorialHero{padding:2.5rem 1rem!important}
      #editorialHero>div{grid-template-columns:1fr!important;gap:1rem}
      #editorialHero .hero-promo-col{display:none!important}
      #editorialHero h1{font-size:clamp(28px,8vw,48px)!important}
      #editorialHero .hero-stats{grid-template-columns:repeat(2,1fr)!important;gap:.75rem!important}
      #editorialHero .hero-hero-col{display:none!important}
      #editorialHero input[type=text]{font-size:16px!important}
    }
    @media(max-width:400px){
      #editorialHero{padding:2rem .75rem!important}
      #editorialHero h1{font-size:clamp(26px,7.5vw,36px)!important}
    }
    </style>
  </section>

  <!-- ══ NAV DRAWER ══ -->
  <div class="nav-drawer" id="navDrawer" aria-label="Navigation menu" role="dialog">
    <div class="nav-drawer-hd">
      <span style="font-family:var(--serif);font-size:16px;color:var(--t);">Secret<em style="color:var(--gold);font-style:italic">Xperience</em></span>
      <button class="nav-drawer-close" id="navDrawerClose" aria-label="Close menu"><i class="ti ti-x"></i></button>
    </div>
    <div class="nav-drawer-user" id="navDrawerUser" style="display:none">
      <div style="display:flex;align-items:center;gap:10px;">
        <div id="navDrawerAvatar" style="width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,var(--gold),var(--goldd));display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:#0a0a0a;flex-shrink:0;">A</div>
        <div>
          <div id="navDrawerName" style="font-size:14px;font-weight:500;color:var(--t)">Account</div>
          <div id="navDrawerEmail" style="font-size:12px;color:var(--t2);margin-top:1px"></div>
        </div>
      </div>
    </div>
    <nav class="nav-drawer-links" id="navDrawerLinks">
      <!-- logged-in links (hidden by default, shown by JS) -->
      <a href="/dashboard" class="nav-drawer-link" id="ndDashboard" style="display:none"><i class="ti ti-layout-dashboard"></i> Dashboard</a>
      <a href="/verify" class="nav-drawer-link" id="ndVerify" style="display:none"><i class="ti ti-id-badge"></i> Verify Identity</a>
      <a href="/tokens" class="nav-drawer-link" id="ndTokens" style="display:none"><i class="ti ti-coins"></i> Buy Tokens</a>
      <a href="/listings/create" class="nav-drawer-link" id="ndCreate" style="display:none"><i class="ti ti-plus"></i> List a Service</a>
      <a href="/messages" class="nav-drawer-link" id="ndMessages" style="display:none"><i class="ti ti-message"></i> Messages</a>
      <!-- logged-out links (hidden by default, shown by JS) -->
      <a href="/login" class="nav-drawer-link" id="ndLogin" style="display:none"><i class="ti ti-login"></i> Log In</a>
      <a href="/advertise" class="nav-drawer-link" id="ndSignup" style="display:none"><i class="ti ti-user-plus"></i> Sign Up</a>
      <!-- always-visible: quick actions -->
      <a href="/search" class="nav-drawer-link"><i class="ti ti-search"></i> Search</a>
      <a href="/discover" class="nav-drawer-link" style="color:var(--gold)"><i class="ti ti-sparkles"></i> ✦ Discover</a>
      <a href="/livestreams" class="nav-drawer-link" style="color:#ef4444"><i class="ti ti-broadcast"></i> <span style="display:inline-flex;align-items:center;gap:5px">Live Shows <span style="width:6px;height:6px;border-radius:50%;background:#ef4444;display:inline-block;animation:liveblink 1.2s ease-in-out infinite" /></span></a>
      <a href="/live" class="nav-drawer-link" style="color:var(--t2)"><i class="ti ti-live-photo"></i> Cam Models</a>
      <!-- ── CATEGORY GROUPS ── -->
      <div class="nd-group-hd">Companions</div>
      <a href="/escorts" class="nd-sub-link"><i class="ti ti-heart-handshake"></i> Escorts <span style="font-size:10px;color:var(--t3);margin-left:4px;">(outcall)</span></a>
      <a href="/private-reception" class="nd-sub-link" style="color:var(--gold)"><i class="ti ti-home"></i> Private Reception <span style="font-size:10px;color:var(--t3);margin-left:4px;">(incall)</span></a>
      <a href="/private-reception?cat=massage" class="nd-sub-link" style="padding-left:40px;font-size:12px"><i class="ti ti-hand-stop"></i> Massage</a>
      <a href="/private-reception?cat=domination" class="nd-sub-link" style="padding-left:40px;font-size:12px"><i class="ti ti-crown"></i> Domination</a>
      <a href="/private-reception?cat=experiences" class="nd-sub-link" style="padding-left:40px;font-size:12px"><i class="ti ti-sparkles"></i> Experiences</a>
      <div class="nd-group-hd">Venues</div>
      <a href="/nightlife" class="nd-sub-link"><i class="ti ti-glass-cocktail"></i> Nightlife</a>
      <a href="/venues" class="nd-sub-link"><i class="ti ti-building-store"></i> All Venues</a>
      <a href="/swingers" class="nd-sub-link"><i class="ti ti-key"></i> Swinger &amp; Parenclubs</a>
      <a href="/fetish" class="nd-sub-link"><i class="ti ti-chain"></i> Fetish &amp; Domina</a>
      <a href="/pride" class="nd-sub-link"><i class="ti ti-rainbow"></i> Pride · LGBTQ+</a>
      <a href="/rentals" class="nd-sub-link"><i class="ti ti-building"></i> Rentals</a>
      <a href="/hotels" class="nd-sub-link"><i class="ti ti-bed"></i> Hotels</a>
      <div class="nd-group-hd">More</div>
      <a href="/creators" class="nd-sub-link"><i class="ti ti-camera"></i> Creators</a>
      <a href="/events" class="nd-sub-link"><i class="ti ti-calendar-event"></i> Events</a>
      <a href="/jobs" class="nd-sub-link"><i class="ti ti-briefcase"></i> Jobs &amp; Vacancies</a>
      <a href="/shop" class="nd-sub-link"><i class="ti ti-shopping-bag"></i> Adult Shop</a>
      <div class="nd-group-hd">Information</div>
      <a href="/regulations" class="nd-sub-link"><i class="ti ti-scale"></i> Regulation &amp; Rights</a>
      <a href="/medical" class="nd-sub-link"><i class="ti ti-heart-rate-monitor"></i> Medical Resources</a>
    </nav>
    <div class="nav-drawer-footer" id="navDrawerLogout" style="display:none">
      <button data-action="logout" class="nav-drawer-link" style="color:var(--wine);padding:0"><i class="ti ti-logout" style="color:var(--wine)"></i> Log Out</button>
    </div>
  </div>

` }} />
      <CategoryAnimations />

      {/* Curated partners — SDC card (left) + banner grid (right) */}
      <div
        style={{
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '1.25rem',
          maxWidth: 1400, margin: '2.75rem auto 0.5rem', padding: '0 1rem',
        }}
      >
        {/* SDC.com partner card */}
        <a
          href="https://www.sdc.com/swingers-nederland.html"
          target="_blank"
          rel="noopener noreferrer nofollow sponsored"
          title="SDC.com — Swingers Date Club"
          aria-label="SDC.com — Swingers Date Club (opens in a new tab)"
          style={{ flex: '0 0 210px', display: 'flex', textDecoration: 'none' }}
        >
          <div
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
              background: 'linear-gradient(160deg, rgba(30,22,14,0.96), rgba(14,10,16,0.96))',
              border: '0.5px solid rgba(197,160,90,0.45)', borderRadius: 18, padding: '20px 18px',
              boxShadow: '0 18px 50px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ font: '600 10px/1 Poppins, sans-serif', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(197,160,90,0.8)' }}>
              Curated Partner
            </div>
            <img
              src="/promos/sdc-logo.png"
              alt="SDC.com"
              width={150}
              height={150}
              style={{ width: 150, height: 150, objectFit: 'contain', filter: 'drop-shadow(0 6px 18px rgba(0,0,0,0.45))' }}
            />
            <span
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap',
                background: 'linear-gradient(135deg,#e7c87f,#c5a05a 55%,#a0803d)', color: '#1a1206',
                font: '700 12px/1 Poppins, sans-serif', letterSpacing: '0.03em', padding: '11px 18px',
                borderRadius: 11, boxShadow: '0 8px 24px rgba(197,160,90,0.28)',
              }}
            >
              Visit SDC.com <span aria-hidden="true">&rarr;</span>
            </span>
          </div>
        </a>

        {/* Banner grid column */}
        <div style={{ flex: '1 1 640px', minWidth: 0 }}>
          <div style={{ textAlign: 'center', marginBottom: '1.1rem' }}>
            <div style={{ font: '600 11px/1 Poppins, sans-serif', letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(197,160,90,0.8)' }}>
              Curated Partners
            </div>
          </div>
          <div
            style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem',
            }}
          >
        {/* MariskaX partner card */}
        <a
          href="https://mariskax.com/"
          target="_blank"
          rel="noopener noreferrer nofollow sponsored"
          title="MariskaX.com — international porn production studio"
          aria-label="MariskaX.com — international porn production studio (opens in a new tab)"
          style={{ display: 'flex', minWidth: 0, textDecoration: 'none' }}
        >
          <div
            style={{
              flex: 1, minHeight: 158, position: 'relative', overflow: 'hidden',
              display: 'flex', alignItems: 'center',
              border: '0.5px solid rgba(210,150,80,0.4)', borderRadius: 18, padding: '20px 26px',
              boxShadow: '0 14px 44px rgba(0,0,0,0.38)',
            }}
          >
            <img
              src="/promos/mariskax-bg.webp"
              alt="MariskaX.com — international porn production studio"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
            />
            <div
              aria-hidden="true"
              style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(to top, rgba(18,10,6,0.8) 0%, rgba(18,10,6,0.32) 40%, rgba(18,10,6,0) 62%)' }}
            />
            <div style={{ position: 'relative', zIndex: 2, alignSelf: 'flex-end', width: '100%' }}>
              <span
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap',
                  background: 'linear-gradient(135deg,#e0a94f,#c0316e 60%,#8f1f52)', color: '#fff',
                  font: '700 13px/1 Poppins, sans-serif', letterSpacing: '0.03em', padding: '12px 20px',
                  borderRadius: 11, boxShadow: '0 8px 24px rgba(192,49,110,0.32)',
                }}
              >
                MariskaX.com <span aria-hidden="true">&rarr;</span>
              </span>
            </div>
          </div>
        </a>

        {/* Sex Vakanties partner card */}
        <a
          href="https://www.sexvakanties.be/"
          target="_blank"
          rel="noopener noreferrer nofollow sponsored"
          title="Sex Vakanties"
          aria-label="Sex Vakanties — sex holidays from dating to swingers holiday (opens in a new tab)"
          style={{ display: 'flex', minWidth: 0, textDecoration: 'none' }}
        >
          <div
            style={{
              flex: 1, minHeight: 158, position: 'relative', overflow: 'hidden',
              display: 'flex', alignItems: 'center', gap: '1.25rem',
              border: '0.5px solid rgba(236,111,43,0.35)', borderRadius: 18, padding: '20px 26px',
              boxShadow: '0 14px 44px rgba(0,0,0,0.38)',
            }}
          >
            <img
              src="/promos/sexvakanties-hero.jpg"
              alt="Sex Holiday — beautiful sex holidays, sex trips and sex weekends"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
            />
            <div
              aria-hidden="true"
              style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(to top, rgba(20,10,6,0.72) 0%, rgba(20,10,6,0.28) 34%, rgba(20,10,6,0) 58%)' }}
            />
            <div style={{ position: 'relative', zIndex: 2, alignSelf: 'flex-end', width: '100%' }}>
              <span
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap',
                  background: 'linear-gradient(135deg,#ff9d4d,#ec6f2b 55%,#c9541b)', color: '#1a0e04',
                  font: '700 13px/1 Poppins, sans-serif', letterSpacing: '0.03em', padding: '12px 20px',
                  borderRadius: 11, boxShadow: '0 8px 24px rgba(236,111,43,0.32)',
                }}
              >
                Sex Vakanties <span aria-hidden="true">&rarr;</span>
              </span>
            </div>
          </div>
        </a>

        {/* X Reservations partner card */}
        <a
          href="https://xreservations.com/"
          target="_blank"
          rel="noopener noreferrer nofollow sponsored"
          title="X Reservations"
          aria-label="X Reservations (opens in a new tab)"
          style={{ display: 'flex', minWidth: 0, textDecoration: 'none' }}
        >
          <div
            style={{
              flex: 1, minHeight: 158, position: 'relative', overflow: 'hidden',
              display: 'flex', alignItems: 'center',
              border: '0.5px solid rgba(224,36,44,0.4)', borderRadius: 18, padding: '20px 26px',
              boxShadow: '0 14px 44px rgba(0,0,0,0.38)',
            }}
          >
            <img
              src="/promos/xreservations-hero.jpg"
              alt="X Reservations"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
            />
            <div
              aria-hidden="true"
              style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(to top, rgba(50,16,10,0.72) 0%, rgba(50,16,10,0.26) 36%, rgba(50,16,10,0) 60%)' }}
            />
            <div style={{ position: 'relative', zIndex: 2, alignSelf: 'flex-end', width: '100%' }}>
              <span
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap',
                  background: 'linear-gradient(135deg,#f04a4f,#d0202a 55%,#a5161d)', color: '#fff',
                  font: '700 13px/1 Poppins, sans-serif', letterSpacing: '0.03em', padding: '12px 20px',
                  borderRadius: 11, boxShadow: '0 8px 24px rgba(208,32,42,0.3)',
                }}
              >
                X Reservations <span aria-hidden="true">&rarr;</span>
              </span>
            </div>
          </div>
        </a>

        {/* UpNext Group partner card */}
        <a
          href="https://www.upnextgroup.com/"
          target="_blank"
          rel="noopener noreferrer nofollow sponsored"
          title="UpNext Group"
          aria-label="UpNext Group — better memories, better travel (opens in a new tab)"
          style={{ display: 'flex', minWidth: 0, textDecoration: 'none' }}
        >
          <div
            style={{
              flex: 1, minHeight: 158, position: 'relative', overflow: 'hidden',
              display: 'flex', alignItems: 'center',
              border: '0.5px solid rgba(31,134,208,0.45)', borderRadius: 18, padding: '20px 26px',
              boxShadow: '0 14px 44px rgba(0,0,0,0.38)',
            }}
          >
            <img
              src="/promos/upnext-hero.jpg"
              alt="UpNext Group — better memories, better travel"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
            />
            <div
              aria-hidden="true"
              style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(to top, rgba(8,40,68,0.66) 0%, rgba(8,40,68,0.2) 38%, rgba(8,40,68,0) 62%)' }}
            />
            <div style={{ position: 'relative', zIndex: 2, alignSelf: 'flex-end', width: '100%' }}>
              <span
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap',
                  background: '#ffffff', color: '#146fb8',
                  font: '700 13px/1 Poppins, sans-serif', letterSpacing: '0.03em', padding: '12px 20px',
                  borderRadius: 11, boxShadow: '0 8px 24px rgba(8,40,68,0.28)',
                }}
              >
                UpNext Group <span aria-hidden="true">&rarr;</span>
              </span>
            </div>
          </div>
        </a>

        {/* Best Porn Sites partner card */}
        <a
          href="https://thepornlinks.com/"
          target="_blank"
          rel="noopener noreferrer nofollow sponsored"
          title="Best Porn Sites"
          aria-label="Best Porn Sites — curated adult directory (opens in a new tab)"
          style={{ display: 'flex', minWidth: 0, textDecoration: 'none' }}
        >
          <div
            style={{
              flex: 1, minHeight: 158, position: 'relative', overflow: 'hidden',
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
              background: '#ffffff',
              border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: 18,
              boxShadow: '0 14px 44px rgba(0,0,0,0.38)',
            }}
          >
            <img
              src="/promos/pornlinks-hero.jpg"
              alt="PORNLINKS"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', zIndex: 0 }}
            />
            <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10, width: '100%', padding: '14px 24px 16px' }}>
              <div style={{ font: '400 15px/1.3 "Cormorant Garamond", Georgia, serif', color: '#3a3a42' }}>
                The web&rsquo;s best adult sites &mdash; a hand-picked directory
              </div>
              <span
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap',
                  background: 'linear-gradient(135deg,#e7c87f,#c5a05a 55%,#a0803d)', color: '#1a1206',
                  font: '700 13px/1 Poppins, sans-serif', letterSpacing: '0.03em', padding: '12px 18px',
                  borderRadius: 11, boxShadow: '0 8px 24px rgba(197,160,90,0.28)',
                }}
              >
                Best Porn Sites <span aria-hidden="true">&rarr;</span>
              </span>
            </div>
          </div>
        </a>

        {/* Adultvisor partner card */}
        <a
          href="https://adultvisor.com/"
          target="_blank"
          rel="noopener noreferrer nofollow sponsored"
          title="Adultvisor"
          aria-label="Adultvisor — adult site reviews & directory (opens in a new tab)"
          style={{ display: 'flex', minWidth: 0, textDecoration: 'none' }}
        >
          <div
            style={{
              flex: 1, minHeight: 158, position: 'relative', overflow: 'hidden',
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
              background: '#a5121a',
              border: '0.5px solid rgba(207,26,32,0.5)', borderRadius: 18,
              boxShadow: '0 14px 44px rgba(0,0,0,0.38)',
            }}
          >
            <img
              src="/promos/adultvisor-hero.jpg"
              alt=""
              aria-hidden="true"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center top', zIndex: 0 }}
            />
            <div
              aria-hidden="true"
              style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(to top, rgba(45,3,5,0.9) 0%, rgba(45,3,5,0.55) 30%, rgba(45,3,5,0.08) 55%, rgba(45,3,5,0) 68%)' }}
            />
            <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10, width: '100%', padding: '14px 24px 16px' }}>
              <div style={{ font: '400 15px/1.3 "Cormorant Garamond", Georgia, serif', color: '#ffe9e7' }}>
                Adult site reviews &amp; directory
              </div>
              <span
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap',
                  background: 'linear-gradient(135deg,#ff5b47,#d21a20 55%,#a5121a)', color: '#fff',
                  font: '700 13px/1 Poppins, sans-serif', letterSpacing: '0.03em', padding: '12px 18px',
                  borderRadius: 11, boxShadow: '0 8px 24px rgba(207,26,32,0.32)',
                }}
              >
                Adultvisor <span aria-hidden="true">&rarr;</span>
              </span>
            </div>
          </div>
        </a>

        {/* EuroSexScene partner card */}
        <a
          href="https://eurosexscene.com/city-guides/"
          target="_blank"
          rel="noopener noreferrer nofollow sponsored"
          title="EuroSexScene"
          aria-label="EuroSexScene — European city sex guides (opens in a new tab)"
          style={{ display: 'flex', minWidth: 0, textDecoration: 'none' }}
        >
          <div
            style={{
              flex: 1, minHeight: 158, position: 'relative', overflow: 'hidden',
              display: 'flex', flexDirection: 'column',
              background: 'linear-gradient(180deg,#ffffff,#f0eef2)',
              border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: 18,
              boxShadow: '0 14px 44px rgba(0,0,0,0.38)',
            }}
          >
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 24px 4px' }}>
              <span style={{ font: '800 34px/1 Arial, Helvetica, sans-serif', letterSpacing: '-0.5px' }}>
                <span style={{ color: '#d81f26' }}>Euro</span><span style={{ color: '#1c1c22' }}>Sex</span><span style={{ color: '#d81f26' }}>Scene</span>
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10, width: '100%', padding: '0 24px 16px' }}>
              <div style={{ font: '400 15px/1.3 "Cormorant Garamond", Georgia, serif', color: '#4a4750' }}>
                European city sex guides &amp; directory
              </div>
              <span
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap',
                  background: 'linear-gradient(135deg,#ef3a41,#d81f26 55%,#b3161c)', color: '#fff',
                  font: '700 13px/1 Poppins, sans-serif', letterSpacing: '0.03em', padding: '12px 18px',
                  borderRadius: 11, boxShadow: '0 8px 24px rgba(216,31,38,0.3)',
                }}
              >
                City Guides <span aria-hidden="true">&rarr;</span>
              </span>
            </div>
          </div>
        </a>
          </div>
        </div>
      </div>

      <div dangerouslySetInnerHTML={{ __html: `
  <div class="layout">

    <!-- ══ SIDEBAR ══ -->
    <aside class="sidebar" id="sidebar" aria-label="Filters">
      <div class="sidebar-hd">
        <div class="sidebar-title">Filters</div>
        <button class="sidebar-close" id="sideClose" aria-label="Close filters"><i class="ti ti-x"></i></button>
      </div>

      <div class="fsec">
        <div class="flbl">Escort Type</div>
        <div class="etype-list">
          <button class="etype active" data-etype="women">Women</button>
          <button class="etype" data-etype="men">Men / Gigolo</button>
          <button class="etype" data-etype="trans woman">Trans Woman</button>
          <button class="etype" data-etype="trans man">Trans Man</button>
          <button class="etype" data-etype="non-binary">Non-Binary</button>
          <button class="etype" data-etype="couples">Couples</button>
          <button class="etype" data-etype="fetish">Fetish</button>
          <button class="etype" data-etype="all">All</button>
        </div>
      </div>

      <div class="fsec">
        <div class="flbl">Orientation</div>
        <div class="etype-list">
          <button class="etype" data-ori="straight">Straight</button>
          <button class="etype" data-ori="gay">Gay</button>
          <button class="etype" data-ori="bisexual">Bisexual</button>
          <button class="etype" data-ori="for all">For All</button>
          <button class="etype active" data-ori="all">All</button>
        </div>
      </div>

      <div class="fsec">
        <div class="flbl">Meet Type</div>
        <div class="etype-list">
          <button class="etype" data-meet="incall">Incall</button>
          <button class="etype" data-meet="outcall">Outcall</button>
          <button class="etype" data-meet="both">Both</button>
          <button class="etype active" data-meet="all">All</button>
        </div>
      </div>

      <div class="fsec">
        <div class="flbl">City</div>
        <div class="etype-list">
          <button class="etype" data-city-f="Brussels">Brussels</button>
          <button class="etype" data-city-f="Antwerp">Antwerp</button>
          <button class="etype" data-city-f="Ghent">Ghent</button>
          <button class="etype" data-city-f="Liège">Liège</button>
          <button class="etype" data-city-f="Bruges">Bruges</button>
          <button class="etype" data-city-f="Amsterdam">Amsterdam</button>
          <button class="etype" data-city-f="Rotterdam">Rotterdam</button>
          <button class="etype active" data-city-f="all">All cities</button>
        </div>
      </div>

      <div class="fsec">
        <div class="flbl">Features</div>
        <div class="frow"><input type="checkbox" id="fv"/><label for="fv">Verified only</label></div>
        <div class="frow"><input type="checkbox" id="fp"/><label for="fp">Premium listings</label></div>
        <div class="frow"><input type="checkbox" id="ft"/><label for="ft">Trending now</label></div>
      </div>

      <div class="fsec">
        <div class="flbl">Price (€/hr)</div>
        <div class="ppills">
          <div class="pp active">Any</div>
          <div class="pp">€0–100</div>
          <div class="pp">€100–300</div>
          <div class="pp">€300–500</div>
          <div class="pp">€500+</div>
        </div>
      </div>

      <div class="fsec">
        <div class="flbl">Services</div>
        <div class="etype-list" style="flex-wrap:wrap;gap:5px">
          <button class="etype" data-svc="GFE">GFE</button>
          <button class="etype" data-svc="BDSM">BDSM</button>
          <button class="etype" data-svc="Tantric">Tantric</button>
          <button class="etype" data-svc="Roleplay">Roleplay</button>
          <button class="etype" data-svc="Dinner Date">Dinner Date</button>
          <button class="etype" data-svc="Travel Companion">Travel</button>
          <button class="etype" data-svc="Duo">Duo</button>
          <button class="etype" data-svc="Couples">Couples</button>
          <button class="etype" data-svc="Overnight">Overnight</button>
          <button class="etype" data-svc="Domination">Domination</button>
          <button class="etype" data-svc="Foot Fetish">Foot Fetish</button>
          <button class="etype" data-svc="Toys">Toys</button>
          <button class="etype" data-svc="Safe Sex">Safe Sex</button>
        </div>
      </div>

      <div class="fsec">
        <div class="flbl">Languages</div>
        <div class="etype-list" style="flex-wrap:wrap;gap:5px">
          <button class="etype" data-lang="english">English</button>
          <button class="etype" data-lang="french">French</button>
          <button class="etype" data-lang="dutch">Dutch</button>
          <button class="etype" data-lang="german">German</button>
          <button class="etype" data-lang="spanish">Spanish</button>
          <button class="etype" data-lang="arabic">Arabic</button>
          <button class="etype" data-lang="russian">Russian</button>
        </div>
      </div>

      <div class="fsec">
        <div class="flbl">Hair Color</div>
        <div class="etype-list" style="flex-wrap:wrap;gap:5px">
          <button class="etype" data-hair="blonde">Blonde</button>
          <button class="etype" data-hair="brunette">Brunette</button>
          <button class="etype" data-hair="redhead">Redhead</button>
          <button class="etype" data-hair="black">Black</button>
          <button class="etype" data-hair="auburn">Auburn</button>
          <button class="etype" data-hair="dark">Dark</button>
        </div>
      </div>

      <div class="fsec">
        <div class="flbl">Build</div>
        <div class="etype-list" style="flex-wrap:wrap;gap:5px">
          <button class="etype" data-build="slim">Slim</button>
          <button class="etype" data-build="athletic">Athletic</button>
          <button class="etype" data-build="curvy">Curvy</button>
          <button class="etype" data-build="petite">Petite</button>
          <button class="etype" data-build="bbw">BBW</button>
          <button class="etype" data-build="average">Average</button>
        </div>
      </div>

      <div class="fsec">
        <div class="flbl">Minimum Rating</div>
        <input type="range" class="rslider" min="0" max="5" step="0.5" value="0" id="rsl" aria-label="Minimum rating"/>
        <div style="font-size:11px;color:var(--t3);margin-top:4px">
          <i class="ti ti-star-filled" style="color:var(--gold);font-size:12px" aria-hidden="true"></i>
          <span id="rval">Any</span> rating
        </div>
      </div>

      <div class="fsec">
        <button id="resetFilters" style="width:100%;padding:10px;background:transparent;border:0.5px solid rgba(255,255,255,0.1);border-radius:8px;color:rgba(255,255,255,0.4);font-size:12px;cursor:pointer;font-family:inherit;letter-spacing:0.06em;text-transform:uppercase">Reset all filters</button>
      </div>
    </aside>

    <!-- ══ MAIN ══ -->
    <main class="main" id="mainContent">

      <!-- Admin bar (hidden until auth confirms admin role) -->
      <div class="admin-bar" id="adminBar" style="display:none" role="region" aria-label="Admin overview">
        <div class="admin-top">
          <div class="admin-label">
            <i class="ti ti-shield-check" aria-hidden="true" style="color:var(--gold)"></i>
            Admin Overview
            <span class="admin-badge">Super Admin</span>
          </div>
          <div class="live-dot"><span></span> Live · Brussels</div>
        </div>
        <div class="admin-stats">
          <div class="astat"><div class="astat-v" id="statListingsAdmin">—</div><div class="astat-l">Active advertisements</div></div>
          <div class="astat"><div class="astat-v" id="statAdvertisers">—</div><div class="astat-l">Advertisers</div></div>
          <div class="astat"><div class="astat-v" id="statUsers">—</div><div class="astat-l">Registered users</div></div>
          <div class="astat"><div class="astat-v" id="statRevenue">—</div><div class="astat-l">Revenue this month</div></div>
        </div>
      </div>

      <!-- Live now banner mount point -->
      <div id="liveBannerMount"></div>

      <!-- Featured -->
      <div class="featured" id="featuredBanner" style="display:none">
        <div class="ft-left">
          <div class="ft-tag">✦ Featured advertisement</div>
          <div class="ft-title" id="featuredBannerTitle">—</div>
          <div class="ft-sub" id="featuredBannerSub">—</div>
        </div>
        <button class="ft-btn" id="featuredBannerBtn">View advertisement <i class="ti ti-arrow-right" aria-hidden="true"></i></button>
      </div>

      <!-- Upcoming event banner mount point -->
      <div id="upcomingEventMount"></div>

      <!-- Homepage Premium banner mount point -->
      <div id="homepagePremiumMount"></div>

      <!-- Enjoy with Joy featured-advertiser banner mount point -->
      <div id="joyBannerMount"></div>

      <!-- Slider Ads mount point -->
      <div id="sliderAdsMount"></div>

      <!-- Tabs -->
      <div class="tabs" role="tablist">
        <div class="tab active" role="tab" style="font-family:var(--serif);font-size:15px;">All listings</div>
        <div class="tab" role="tab" style="font-family:var(--serif);font-size:15px;">Near me</div>
        <div class="tab" role="tab" style="font-family:var(--serif);font-size:15px;">New</div>
        <div class="tab" role="tab" style="font-family:var(--serif);font-size:15px;">Top rated</div>
        <div class="tab" role="tab" style="font-family:var(--serif);font-size:15px;">My saves</div>
      </div>

      <!-- Health, Safety & Legal notice bar -->
      <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:14px;">
        <a href="/medical" style="display:flex;align-items:center;gap:10px;background:rgba(38,212,160,0.07);border:0.5px solid rgba(38,212,160,0.2);border-radius:10px;padding:10px 16px;text-decoration:none;transition:background .2s;" onmouseover="this.style.background='rgba(38,212,160,0.12)'" onmouseout="this.style.background='rgba(38,212,160,0.07)'">
          <i class="ti ti-heart-rate-monitor" style="color:#26d4a0;font-size:18px;flex-shrink:0;" aria-hidden="true"></i>
          <span style="font-size:13px;color:rgba(236,232,225,0.8);font-family:var(--sans);">Health &amp; safety matter. Read our <span style="color:#26d4a0;font-weight:500;">Medical Information &amp; Resources</span> — sexual health, safe sex &amp; support contacts.</span>
          <i class="ti ti-arrow-right" style="color:#26d4a0;font-size:14px;margin-left:auto;flex-shrink:0;" aria-hidden="true"></i>
        </a>
        <a href="/regulations" style="display:flex;align-items:center;gap:10px;background:rgba(197,160,90,0.06);border:0.5px solid rgba(197,160,90,0.18);border-radius:10px;padding:10px 16px;text-decoration:none;transition:background .2s;" onmouseover="this.style.background='rgba(197,160,90,0.11)'" onmouseout="this.style.background='rgba(197,160,90,0.06)'">
          <i class="ti ti-scale" style="color:#c5a05a;font-size:18px;flex-shrink:0;" aria-hidden="true"></i>
          <span style="font-size:13px;color:rgba(236,232,225,0.8);font-family:var(--sans);">Know your rights. Our <span style="color:#c5a05a;font-weight:500;">Regulation &amp; Legal Rights</span> page covers EU/BE/NL/DE sex work law and advertiser protections.</span>
          <i class="ti ti-arrow-right" style="color:#c5a05a;font-size:14px;margin-left:auto;flex-shrink:0;" aria-hidden="true"></i>
        </a>
      </div>

      <!-- Filter toggle (mobile) -->
      <button class="filter-toggle" id="filterToggle" aria-label="Open filters">
        <i class="ti ti-adjustments-horizontal" aria-hidden="true"></i> Filters &amp; sort
      </button>

      <div class="res-row">
        <div class="res-count">248 advertisements found</div>
        <select class="sort-sel" id="sortSel" aria-label="Sort listings">
          <option>Sort: Relevance</option>
          <option>Sort: Rating ↓</option>
          <option>Sort: Price ↑</option>
          <option>Sort: Price ↓</option>
          <option>Sort: Newest</option>
        </select>
      </div>

      <!-- Recently Viewed -->
      <div id="recentViewedSection" style="display:none;margin-bottom:1.5rem">
        <div style="font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#4c4a47;font-weight:600;margin-bottom:.75rem">Recently viewed</div>
        <div id="recentViewedCards" style="display:flex;gap:.75rem;overflow-x:auto;padding-bottom:.5rem;scrollbar-width:thin"></div>
      </div>

      <!-- Listing Cards -->
      <div class="cards" id="listingCards" role="list">

        <div class="card" role="listitem" tabindex="0">
          <div class="card-hero cat-escort" style="height:180px;position:relative;display:flex;align-items:flex-end;padding:1rem;">
            <div style="position:absolute;top:0.6rem;right:0.6rem;width:32px;height:32px;border-radius:50%;background:rgba(0,0,0,0.30);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:2;cursor:pointer;transition:background .2s;"><i class="ti ti-heart" style="color:#fff;font-size:15px;"></i></div>
            <div class="card-badges" style="position:relative;z-index:2;"><span class="badge bv">✓ Verified</span><span class="badge bp">Premium</span></div>
            <span style="font-family:var(--serif);font-size:72px;font-style:italic;font-weight:400;color:rgba(197,160,90,0.30);line-height:1;position:absolute;bottom:0.25rem;left:1rem;">So</span>
          </div>
          <div class="card-body">
            <div class="card-cat">Escort · Independent</div>
            <div class="card-name">Sophia A.</div>
            <span class="card-sub">Private</span>
            <div class="card-meta"><span class="card-price">€200/hr</span><span class="card-rating"><i class="ti ti-star-filled" aria-hidden="true"></i> 4.9</span></div>
            <div class="card-loc"><i class="ti ti-map-pin" aria-hidden="true"></i> Brussels</div>
          </div>
        </div>

        <div class="card" role="listitem" tabindex="0">
          <div class="card-hero cat-escort" style="height:180px;position:relative;display:flex;align-items:flex-end;padding:1rem;">
            <div style="position:absolute;top:0.6rem;right:0.6rem;width:32px;height:32px;border-radius:50%;background:rgba(0,0,0,0.30);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:2;cursor:pointer;transition:background .2s;"><i class="ti ti-heart" style="color:#fff;font-size:15px;"></i></div>
            <div class="card-badges" style="position:relative;z-index:2;"><span class="badge bv">✓ Verified</span><span class="badge be">VIP</span></div>
            <span style="font-family:var(--serif);font-size:72px;font-style:italic;font-weight:400;color:rgba(197,160,90,0.30);line-height:1;position:absolute;bottom:0.25rem;left:1rem;">El</span>
          </div>
          <div class="card-body">
            <div class="card-cat">Escort · Agency</div>
            <div class="card-name">Elise V.</div>
            <span class="card-sub">Elite</span>
            <div class="card-meta"><span class="card-price">€500/hr</span><span class="card-rating"><i class="ti ti-star-filled" aria-hidden="true"></i> 5.0</span></div>
            <div class="card-loc"><i class="ti ti-map-pin" aria-hidden="true"></i> Antwerp</div>
          </div>
        </div>

        <div class="card" role="listitem" tabindex="0">
          <div class="card-hero cat-escort" style="height:180px;position:relative;display:flex;align-items:flex-end;padding:1rem;">
            <div style="position:absolute;top:0.6rem;right:0.6rem;width:32px;height:32px;border-radius:50%;background:rgba(0,0,0,0.30);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:2;cursor:pointer;transition:background .2s;"><i class="ti ti-heart" style="color:#fff;font-size:15px;"></i></div>
            <div class="card-badges" style="position:relative;z-index:2;"><span class="badge bv">✓ Verified</span></div>
            <span style="font-family:var(--serif);font-size:72px;font-style:italic;font-weight:400;color:rgba(197,160,90,0.30);line-height:1;position:absolute;bottom:0.25rem;left:1rem;">Na</span>
          </div>
          <div class="card-body">
            <div class="card-cat">Escort · Touring</div>
            <div class="card-name">Nadia R.</div>
            <span class="card-sub">Touring</span>
            <div class="card-meta"><span class="card-price">€350/hr</span><span class="card-rating"><i class="ti ti-star-filled" aria-hidden="true"></i> 4.8</span></div>
            <div class="card-loc"><i class="ti ti-map-pin" aria-hidden="true"></i> Ghent</div>
          </div>
        </div>

        <div class="card" role="listitem" tabindex="0">
          <div class="card-hero cat-nightlife" style="height:180px;position:relative;display:flex;align-items:flex-end;padding:1rem;">
            <div style="position:absolute;top:0.6rem;right:0.6rem;width:32px;height:32px;border-radius:50%;background:rgba(0,0,0,0.30);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:2;cursor:pointer;transition:background .2s;"><i class="ti ti-heart" style="color:#fff;font-size:15px;"></i></div>
            <div class="card-badges" style="position:relative;z-index:2;"><span class="badge bt">Trending</span></div>
            <span style="font-family:var(--serif);font-size:72px;font-style:italic;font-weight:400;color:rgba(197,160,90,0.30);line-height:1;position:absolute;bottom:0.25rem;left:1rem;">Cl</span>
          </div>
          <div class="card-body">
            <div class="card-cat">Nightlife</div>
            <div class="card-name">Club Noir</div>
            <div class="card-meta"><span class="card-price">€50 entry</span><span class="card-rating"><i class="ti ti-star-filled" aria-hidden="true"></i> 4.7</span></div>
            <div class="card-loc"><i class="ti ti-map-pin" aria-hidden="true"></i> Brussels</div>
          </div>
        </div>

        <div class="card" role="listitem" tabindex="0">
          <div class="card-hero cat-creator" style="height:180px;position:relative;display:flex;align-items:flex-end;padding:1rem;">
            <div style="position:absolute;top:0.6rem;right:0.6rem;width:32px;height:32px;border-radius:50%;background:rgba(0,0,0,0.30);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:2;cursor:pointer;transition:background .2s;"><i class="ti ti-heart" style="color:#fff;font-size:15px;"></i></div>
            <div class="card-badges" style="position:relative;z-index:2;"><span class="badge bv">✓ Verified</span></div>
            <span style="font-family:var(--serif);font-size:72px;font-style:italic;font-weight:400;color:rgba(197,160,90,0.30);line-height:1;position:absolute;bottom:0.25rem;left:1rem;">Lu</span>
          </div>
          <div class="card-body">
            <div class="card-cat">Creators</div>
            <div class="card-name">Luna Creative</div>
            <div class="card-meta"><span class="card-price">€15/mo</span><span class="card-rating"><i class="ti ti-star-filled" aria-hidden="true"></i> 4.8</span></div>
            <div class="card-loc"><i class="ti ti-map-pin" aria-hidden="true"></i> Online</div>
          </div>
        </div>

        <div class="card" role="listitem" tabindex="0">
          <div class="card-hero cat-rental" style="height:180px;position:relative;display:flex;align-items:flex-end;padding:1rem;">
            <div style="position:absolute;top:0.6rem;right:0.6rem;width:32px;height:32px;border-radius:50%;background:rgba(0,0,0,0.30);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:2;cursor:pointer;transition:background .2s;"><i class="ti ti-heart" style="color:#fff;font-size:15px;"></i></div>
            <div class="card-badges" style="position:relative;z-index:2;"><span class="badge bp">Premium</span></div>
            <span style="font-family:var(--serif);font-size:72px;font-style:italic;font-weight:400;color:rgba(197,160,90,0.30);line-height:1;position:absolute;bottom:0.25rem;left:1rem;">Le</span>
          </div>
          <div class="card-body">
            <div class="card-cat">Rentals</div>
            <div class="card-name">Le Boudoir Suite</div>
            <div class="card-meta"><span class="card-price">€350/night</span><span class="card-rating"><i class="ti ti-star-filled" aria-hidden="true"></i> 4.6</span></div>
            <div class="card-loc"><i class="ti ti-map-pin" aria-hidden="true"></i> Ghent</div>
          </div>
        </div>

        <div class="card" role="listitem" tabindex="0">
          <div class="card-hero cat-creator" style="height:180px;position:relative;display:flex;align-items:flex-end;padding:1rem;">
            <div style="position:absolute;top:0.6rem;right:0.6rem;width:32px;height:32px;border-radius:50%;background:rgba(0,0,0,0.30);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:2;cursor:pointer;transition:background .2s;"><i class="ti ti-heart" style="color:#fff;font-size:15px;"></i></div>
            <div class="card-badges" style="position:relative;z-index:2;"><span class="badge bv">✓ Verified</span><span class="badge bt">Trending</span></div>
            <span style="font-family:var(--serif);font-size:72px;font-style:italic;font-weight:400;color:rgba(197,160,90,0.30);line-height:1;position:absolute;bottom:0.25rem;left:1rem;">St</span>
          </div>
          <div class="card-body">
            <div class="card-cat">Photo / Video</div>
            <div class="card-name">Studio Rouge</div>
            <div class="card-meta"><span class="card-price">€120/hr</span><span class="card-rating"><i class="ti ti-star-filled" aria-hidden="true"></i> 5.0</span></div>
            <div class="card-loc"><i class="ti ti-map-pin" aria-hidden="true"></i> Brussels</div>
          </div>
        </div>

        <div class="card" role="listitem" tabindex="0">
          <div class="card-hero cat-shop" style="height:180px;position:relative;display:flex;align-items:flex-end;padding:1rem;">
            <div style="position:absolute;top:0.6rem;right:0.6rem;width:32px;height:32px;border-radius:50%;background:rgba(0,0,0,0.30);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:2;cursor:pointer;transition:background .2s;"><i class="ti ti-heart" style="color:#fff;font-size:15px;"></i></div>
            <div class="card-badges" style="position:relative;z-index:2;"><span class="badge bt">Trending</span></div>
            <span style="font-family:var(--serif);font-size:72px;font-style:italic;font-weight:400;color:rgba(197,160,90,0.30);line-height:1;position:absolute;bottom:0.25rem;left:1rem;">No</span>
          </div>
          <div class="card-body">
            <div class="card-cat">Adult Shop</div>
            <div class="card-name">Noir Collection</div>
            <div class="card-meta"><span class="card-price">From €19</span><span class="card-rating"><i class="ti ti-star-filled" aria-hidden="true"></i> 4.7</span></div>
            <div class="card-loc"><i class="ti ti-map-pin" aria-hidden="true"></i> Online · BE</div>
          </div>
        </div>

      </div>

      <div style="text-align:center;padding:1.5rem 0">
        <button id="loadMoreBtn" style="display:none;padding:10px 28px;background:transparent;border:0.5px solid rgba(197,160,90,0.4);border-radius:10px;color:#c5a05a;font-size:13px;cursor:pointer;font-family:inherit;letter-spacing:0.06em" onclick="window.__loadMore()">Load more listings</button>
      </div>

    </main>
  </div>

  <!-- ══ SPONSORED FEATURE — Victoria Secret Garden ══ -->
  <div style="background:var(--bg1);padding:2.5rem 1.5rem 0;">
    <div style="max-width:1200px;margin:0 auto;">
      <p style="font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--t3);margin:0 0 10px;">✦ Sponsored Feature</p>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:18px;align-items:stretch;">
      <a href="https://mariskax.com/" target="_blank" rel="noopener noreferrer nofollow sponsored" aria-label="MariskaX.com — international porn production studio" style="display:block;position:relative;overflow:hidden;border-radius:20px;border:1px solid rgba(210,150,80,0.5);min-height:300px;box-shadow:0 14px 44px rgba(0,0,0,0.55);text-decoration:none;transition:transform .15s,border-color .2s;" onmouseover="this.style.transform='translateY(-3px)';this.style.borderColor='rgba(224,169,79,0.9)'" onmouseout="this.style.transform='';this.style.borderColor='rgba(210,150,80,0.5)'">
        <img src="/promos/mariskax-bg.webp" alt="" aria-hidden="true" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;" />
        <div style="position:absolute;inset:0;background:linear-gradient(to top, rgba(10,6,4,0.88) 0%, rgba(10,6,4,0.4) 42%, rgba(10,6,4,0.12) 72%, rgba(10,6,4,0.35) 100%);"></div>
        <div style="position:relative;min-height:300px;padding:clamp(1.75rem,4vw,3rem);display:flex;flex-direction:column;justify-content:flex-end;align-items:flex-start;gap:16px;">
          <img src="/promos/mariskax-logo.png" alt="MariskaX.com" style="width:min(80%,320px);height:auto;display:block;filter:drop-shadow(0 3px 14px rgba(0,0,0,0.9));" />
          <div style="font-size:12px;color:rgba(255,255,255,0.8);line-height:1.5;letter-spacing:0.06em;text-transform:uppercase;text-shadow:0 1px 8px rgba(0,0,0,0.9);">International porn production studio</div>
          <span style="display:inline-block;padding:12px 28px;background:linear-gradient(90deg,#e0a94f,#c0316e);border-radius:10px;color:#fff;font:600 13.5px var(--sans);letter-spacing:0.03em;">Visit MariskaX.com →</span>
        </div>
      </a>
      <a href="https://victoriasecretgarden.be/" target="_blank" rel="noopener noreferrer nofollow sponsored" aria-label="Victoria Secret Garden — escort agency Brussels" style="display:block;position:relative;overflow:hidden;border-radius:20px;border:1px solid rgba(232,90,140,0.45);min-height:300px;box-shadow:0 14px 44px rgba(0,0,0,0.55);text-decoration:none;transition:transform .15s,border-color .2s;" onmouseover="this.style.transform='translateY(-3px)';this.style.borderColor='rgba(255,130,175,0.85)'" onmouseout="this.style.transform='';this.style.borderColor='rgba(232,90,140,0.45)'">
        <img src="/promos/vsg-bg.webp" alt="" aria-hidden="true" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 30%;" />
        <div style="position:absolute;inset:0;background:linear-gradient(to right, rgba(12,8,10,0.82) 0%, rgba(12,8,10,0.35) 45%, rgba(12,8,10,0.15) 70%, rgba(12,8,10,0.55) 100%);"></div>
        <div style="position:relative;padding:clamp(1.75rem,4vw,3rem);max-width:520px;display:flex;flex-direction:column;align-items:flex-start;gap:16px;">
          <span style="display:inline-block;background:#fff;border-radius:14px;padding:12px 20px;box-shadow:0 8px 26px rgba(0,0,0,0.4);">
            <img src="/promos/vsg-logo.png" alt="Victoria Secret Garden" style="height:56px;width:auto;display:block;" />
          </span>
          <div style="font-family:var(--serif);font-size:clamp(20px,3vw,28px);color:#fff;line-height:1.2;text-shadow:0 2px 12px rgba(0,0,0,0.8);">Brussels&apos; most <em style="font-style:italic;color:#ff9ec4;">exclusive escort agency</em></div>
          <div style="font-size:13px;color:rgba(255,255,255,0.75);line-height:1.6;text-shadow:0 1px 8px rgba(0,0,0,0.8);">High-class companions, hotel &amp; home visits, dinner dates — discreet en stijlvol.</div>
          <span style="display:inline-block;padding:12px 28px;background:linear-gradient(90deg,#ff5c8a,#e0356e);border-radius:10px;color:#fff;font:600 13.5px var(--sans);letter-spacing:0.03em;">Bezoek Victoria Secret Garden →</span>
        </div>
      </a>
      </div>
    </div>
  </div>

  <!-- ══ LIVE CAMS PROMO BANNER (Stripchat) + IdaJonesy live card ══ -->
  <div style="padding:2.5rem 1.5rem 0;display:flex;justify-content:center;align-items:stretch;gap:16px;flex-wrap:wrap;background:var(--bg1);">
    <a href="https://nl.stripchat.com/Martyca_Beee" data-sc="Martyca_Beee" target="_blank" rel="noopener noreferrer nofollow" aria-label="Martyca_Beee live chat on Stripchat" style="display:block;width:200px;height:200px;flex-shrink:0;border:0.5px solid rgba(220,60,80,0.45);border-radius:16px;overflow:hidden;position:relative;box-shadow:0 10px 34px rgba(0,0,0,0.5);transition:border-color .2s,transform .15s;order:1;" onmouseover="this.style.borderColor='rgba(240,90,110,0.85)';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='rgba(220,60,80,0.45)';this.style.transform=''">
      <img src="/promos/martyca-beee.jpg" alt="Martyca_Beee" style="width:100%;height:100%;object-fit:cover;display:block;" />
      <span class="sc-badge" style="position:absolute;top:10px;left:10px;display:inline-flex;align-items:center;gap:5px;padding:4px 10px;background:rgba(200,16,46,0.92);border-radius:20px;color:#fff;font:700 9.5px var(--sans);letter-spacing:0.1em;"><span style="width:6px;height:6px;border-radius:50%;background:#fff;display:inline-block;animation:livePulse 1.6s ease-in-out infinite;"></span> LIVE</span>
    </a>
    <a href="https://nl.stripchat.com/IdaJonesy" data-sc="IdaJonesy" target="_blank" rel="noopener noreferrer nofollow" aria-label="IdaJonesy live chat on Stripchat" style="display:block;width:200px;height:200px;flex-shrink:0;border:0.5px solid rgba(220,60,80,0.45);border-radius:16px;overflow:hidden;position:relative;box-shadow:0 10px 34px rgba(0,0,0,0.5);transition:border-color .2s,transform .15s;order:2;" onmouseover="this.style.borderColor='rgba(240,90,110,0.85)';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='rgba(220,60,80,0.45)';this.style.transform=''">
      <img src="/promos/idajonesy.jpg" alt="IdaJonesy" style="width:100%;height:100%;object-fit:cover;display:block;" />
      <span class="sc-badge" style="position:absolute;top:10px;left:10px;display:inline-flex;align-items:center;gap:5px;padding:4px 10px;background:rgba(200,16,46,0.92);border-radius:20px;color:#fff;font:700 9.5px var(--sans);letter-spacing:0.1em;"><span style="width:6px;height:6px;border-radius:50%;background:#fff;display:inline-block;animation:livePulse 1.6s ease-in-out infinite;"></span> LIVE</span>
    </a>
    <a href="https://nl.stripchat.com/Onlyxlicious_sc" data-sc="Onlyxlicious_sc" target="_blank" rel="noopener noreferrer nofollow" aria-label="Onlyxlicious live chat on Stripchat" style="display:block;width:200px;height:200px;flex-shrink:0;border:0.5px solid rgba(220,60,80,0.45);border-radius:16px;overflow:hidden;position:relative;box-shadow:0 10px 34px rgba(0,0,0,0.5);transition:border-color .2s,transform .15s;order:3;" onmouseover="this.style.borderColor='rgba(240,90,110,0.85)';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='rgba(220,60,80,0.45)';this.style.transform=''">
      <img src="/promos/onlyxlicious.jpg" alt="Onlyxlicious" style="width:100%;height:100%;object-fit:cover;display:block;" />
      <span class="sc-badge" style="position:absolute;top:10px;left:10px;display:inline-flex;align-items:center;gap:5px;padding:4px 10px;background:rgba(200,16,46,0.92);border-radius:20px;color:#fff;font:700 9.5px var(--sans);letter-spacing:0.1em;"><span style="width:6px;height:6px;border-radius:50%;background:#fff;display:inline-block;animation:livePulse 1.6s ease-in-out infinite;"></span> LIVE</span>
    </a>
    <a href="https://nl.stripchat.com/Jenny-Mystery-X" data-sc="Jenny-Mystery-X" target="_blank" rel="noopener noreferrer nofollow" aria-label="Jenny Mystery live chat on Stripchat" style="display:block;width:200px;height:200px;flex-shrink:0;border:0.5px solid rgba(220,60,80,0.45);border-radius:16px;overflow:hidden;position:relative;box-shadow:0 10px 34px rgba(0,0,0,0.5);transition:border-color .2s,transform .15s;order:4;" onmouseover="this.style.borderColor='rgba(240,90,110,0.85)';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='rgba(220,60,80,0.45)';this.style.transform=''">
      <img src="/promos/jennymystery.jpg" alt="Jenny Mystery" style="width:100%;height:100%;object-fit:cover;display:block;" />
      <span class="sc-badge" style="position:absolute;top:10px;left:10px;display:inline-flex;align-items:center;gap:5px;padding:4px 10px;background:rgba(200,16,46,0.92);border-radius:20px;color:#fff;font:700 9.5px var(--sans);letter-spacing:0.1em;"><span style="width:6px;height:6px;border-radius:50%;background:#fff;display:inline-block;animation:livePulse 1.6s ease-in-out infinite;"></span> LIVE</span>
    </a>
    <a href="https://nl.stripchat.com/VlaamseYaira" data-sc="VlaamseYaira" target="_blank" rel="noopener noreferrer nofollow" aria-label="Vlaamse Yaira live chat on Stripchat" style="display:block;width:200px;height:200px;flex-shrink:0;border:0.5px solid rgba(220,60,80,0.45);border-radius:16px;overflow:hidden;position:relative;box-shadow:0 10px 34px rgba(0,0,0,0.5);transition:border-color .2s,transform .15s;order:5;" onmouseover="this.style.borderColor='rgba(240,90,110,0.85)';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='rgba(220,60,80,0.45)';this.style.transform=''">
      <img src="/promos/vlaamseyaira.jpg" alt="Vlaamse Yaira" style="width:100%;height:100%;object-fit:cover;display:block;" />
      <span class="sc-badge" style="position:absolute;top:10px;left:10px;display:inline-flex;align-items:center;gap:5px;padding:4px 10px;background:rgba(200,16,46,0.92);border-radius:20px;color:#fff;font:700 9.5px var(--sans);letter-spacing:0.1em;"><span style="width:6px;height:6px;border-radius:50%;background:#fff;display:inline-block;animation:livePulse 1.6s ease-in-out infinite;"></span> LIVE</span>
    </a>
    <a href="/live" aria-label="Live Cams — watch now" style="display:flex;align-items:center;gap:24px;width:100%;max-width:600px;height:200px;padding:0 32px;background:linear-gradient(120deg,#1a0a0d 0%,#3d0d14 55%,#6e1020 100%);border:0.5px solid rgba(220,60,80,0.45);border-radius:16px;text-decoration:none;overflow:hidden;position:relative;box-shadow:0 10px 34px rgba(0,0,0,0.5);transition:border-color .2s,transform .15s;" onmouseover="this.style.borderColor='rgba(240,90,110,0.85)';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='rgba(220,60,80,0.45)';this.style.transform=''">
      <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 85% 20%,rgba(240,80,100,0.22) 0%,transparent 60%);pointer-events:none;"></div>
      <img src="/promos/stripchat-logo.png" alt="Stripchat" style="width:184px;max-width:38%;height:auto;border-radius:10px;flex-shrink:0;position:relative;box-shadow:0 4px 18px rgba(0,0,0,0.45);" />
      <div style="position:relative;min-width:0;">
        <div style="display:inline-flex;align-items:center;gap:7px;font:600 10px var(--sans);letter-spacing:0.16em;text-transform:uppercase;color:#ff8c9c;margin-bottom:8px;"><span style="width:8px;height:8px;border-radius:50%;background:#ff4560;box-shadow:0 0 8px rgba(255,69,96,0.8);display:inline-block;animation:livePulse 1.6s ease-in-out infinite;"></span> Live now</div>
        <div style="font-family:var(--serif);font-size:clamp(20px,3.5vw,26px);color:#fff;line-height:1.2;margin-bottom:6px;">Live <em style="font-style:italic;color:#ff8c9c;">Cams</em></div>
        <div style="font-size:12.5px;color:rgba(255,255,255,0.65);line-height:1.5;margin-bottom:10px;">Watch models live, right now — free to enter.</div>
        <span style="display:inline-block;padding:8px 18px;background:#fff;border-radius:8px;color:#8b0f1e;font:700 12px var(--sans);letter-spacing:0.04em;">Watch live →</span>
      </div>
    </a>
  </div>
  <style>@keyframes livePulse{0%,100%{opacity:1}50%{opacity:0.35}}</style>

  <!-- ══ CREATOR PLATFORMS GUIDE FRAME + F2F card ══ -->
  <div style="padding:1.5rem 1.5rem 0;display:flex;justify-content:center;align-items:stretch;gap:16px;flex-wrap:wrap;background:var(--bg1);">
    <a href="/creator-platforms" aria-label="20+ Best Platforms to Make Money for Creators" style="display:flex;align-items:center;justify-content:space-between;gap:20px;width:100%;max-width:600px;padding:26px 32px;background:linear-gradient(120deg,#14101a 0%,#1a1420 60%,#241a14 100%);border:0.5px solid rgba(197,160,90,0.4);border-radius:16px;text-decoration:none;position:relative;overflow:hidden;box-shadow:0 10px 34px rgba(0,0,0,0.45);transition:border-color .2s,transform .15s;" onmouseover="this.style.borderColor='rgba(197,160,90,0.8)';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='rgba(197,160,90,0.4)';this.style.transform=''">
      <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 90% 10%,rgba(197,160,90,0.14) 0%,transparent 55%);pointer-events:none;"></div>
      <div style="position:relative;min-width:0;">
        <div style="font:600 10px var(--sans);letter-spacing:0.16em;text-transform:uppercase;color:rgba(197,160,90,0.75);margin-bottom:8px;">✦ Creator Economy Guide</div>
        <div style="font-family:var(--serif);font-size:clamp(18px,3vw,23px);color:var(--t);line-height:1.25;margin-bottom:6px;">20+ Best Platforms to <em style="font-style:italic;color:var(--gold);">Make Money</em> for Creators</div>
        <div style="font-size:12px;color:var(--t3);line-height:1.5;">OnlyFans alternatives, low-commission platforms &amp; site builders — compared.</div>
      </div>
      <span style="flex-shrink:0;display:inline-flex;align-items:center;gap:6px;padding:10px 18px;border:0.5px solid rgba(197,160,90,0.5);border-radius:10px;color:var(--gold);font:600 12px var(--sans);letter-spacing:0.04em;white-space:nowrap;position:relative;">Read the guide →</span>
    </a>
    <a href="https://f2f.com/" target="_blank" rel="noopener noreferrer nofollow" aria-label="F2F — the premium social media network" style="display:block;width:220px;min-height:120px;flex-shrink:0;border:0.5px solid rgba(139,92,246,0.45);border-radius:16px;overflow:hidden;position:relative;box-shadow:0 10px 34px rgba(0,0,0,0.45);transition:border-color .2s,transform .15s;" onmouseover="this.style.borderColor='rgba(167,139,250,0.85)';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='rgba(139,92,246,0.45)';this.style.transform=''">
      <img src="/promos/f2f.jpg" alt="F2F — friends2follow" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:left center;" />
      <span style="position:absolute;left:0;right:0;bottom:0;padding:22px 10px 8px;background:linear-gradient(to top,rgba(10,8,18,0.9),transparent);color:#fff;font:600 11.5px var(--sans);text-align:center;letter-spacing:0.05em;">F2F.com ↗</span>
    </a>
    <a href="https://4based.com/login" target="_blank" rel="noopener noreferrer nofollow" aria-label="4based creator platform" style="display:block;width:220px;min-height:120px;flex-shrink:0;border:0.5px solid rgba(234,88,54,0.45);border-radius:16px;overflow:hidden;position:relative;box-shadow:0 10px 34px rgba(0,0,0,0.45);transition:border-color .2s,transform .15s;" onmouseover="this.style.borderColor='rgba(240,120,80,0.85)';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='rgba(234,88,54,0.45)';this.style.transform=''">
      <img src="/promos/4based.jpg" alt="4based" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:right center;" />
      <span style="position:absolute;left:0;right:0;bottom:0;padding:22px 10px 8px;background:linear-gradient(to top,rgba(10,8,10,0.9),transparent);color:#fff;font:600 11.5px var(--sans);text-align:center;letter-spacing:0.05em;">4based.com ↗</span>
    </a>
    <a href="https://creatorhub.fansly.com/" target="_blank" rel="noopener noreferrer nofollow" aria-label="Fansly Creator Hub" style="display:block;width:220px;min-height:120px;flex-shrink:0;border:0.5px solid rgba(45,136,255,0.45);border-radius:16px;overflow:hidden;position:relative;box-shadow:0 10px 34px rgba(0,0,0,0.45);transition:border-color .2s,transform .15s;" onmouseover="this.style.borderColor='rgba(90,170,255,0.85)';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='rgba(45,136,255,0.45)';this.style.transform=''">
      <img src="/promos/fansly-creatorhub.jpg" alt="Fansly Creator Hub" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:left center;" />
      <span style="position:absolute;left:0;right:0;bottom:0;padding:22px 10px 8px;background:linear-gradient(to top,rgba(8,10,16,0.9),transparent);color:#fff;font:600 11.5px var(--sans);text-align:center;letter-spacing:0.05em;">Fansly Creator Hub ↗</span>
    </a>
  </div>

  <!-- ══ ONLYFANS CREATORS (React portal — OnlyFansShowcase) ══ -->
  <div id="onlyfansShowcaseMount"></div>

  <!-- ══ CREATOR LINKS (All My Links) ══ -->
  <section aria-label="Creator links" style="background:var(--bg1);border-top:0.5px solid var(--b);padding:3rem 1.5rem 2.5rem;">
    <div style="max-width:1200px;margin:0 auto;">
      <p style="font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:rgba(197,160,90,0.55);margin:0 0 8px;">✦ Creator Links</p>
      <h2 style="font-family:var(--serif);font-size:clamp(22px,3vw,32px);font-weight:400;color:var(--t);line-height:1.15;margin:0 0 8px;">All <em style="color:#c5a05a;font-style:italic;">My Links</em></h2>
      <p style="font-size:13px;color:var(--t2);max-width:520px;line-height:1.7;margin:0 0 1.5rem;">One link, everything they do — follow these creators across all their platforms.</p>
      <div style="display:flex;flex-wrap:wrap;gap:14px;">
        <a href="https://allmylinks.com/cassie-redstarr" target="_blank" rel="noopener noreferrer nofollow" title="Cassie Redstarr — all links" style="display:block;width:200px;height:200px;border-radius:14px;overflow:hidden;position:relative;border:0.5px solid rgba(197,160,90,0.4);box-shadow:0 8px 28px rgba(0,0,0,0.45);flex-shrink:0;transition:transform .15s,border-color .2s;" onmouseover="this.style.transform='translateY(-3px)';this.style.borderColor='rgba(197,160,90,0.8)'" onmouseout="this.style.transform='';this.style.borderColor='rgba(197,160,90,0.4)'">
          <img src="/promos/cassie-redstarr.jpg" alt="Cassie Redstarr" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block;" />
          <span style="position:absolute;top:10px;left:10px;padding:4px 10px;background:rgba(197,160,90,0.92);border-radius:20px;color:#0a0a0a;font:700 9.5px var(--sans);letter-spacing:0.08em;">ALL LINKS</span>
        </a>
        <a href="https://link.me/teknoshadows" target="_blank" rel="noopener noreferrer nofollow" title="Teknoshadows — all links" style="display:block;width:200px;height:200px;border-radius:14px;overflow:hidden;position:relative;border:0.5px solid rgba(197,160,90,0.4);box-shadow:0 8px 28px rgba(0,0,0,0.45);flex-shrink:0;transition:transform .15s,border-color .2s;" onmouseover="this.style.transform='translateY(-3px)';this.style.borderColor='rgba(197,160,90,0.8)'" onmouseout="this.style.transform='';this.style.borderColor='rgba(197,160,90,0.4)'">
          <img src="/promos/teknoshadows.jpg" alt="Teknoshadows" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block;" />
          <span style="position:absolute;top:10px;left:10px;padding:4px 10px;background:rgba(197,160,90,0.92);border-radius:20px;color:#0a0a0a;font:700 9.5px var(--sans);letter-spacing:0.08em;">ALL LINKS</span>
        </a>
      </div>
    </div>
  </section>

  <!-- ══ BOUTIQUES / SHOP THE LOOK (React portal — ShopShowcase) ══ -->
  <div id="shopShowcaseMount"></div>

  <!-- ══ MEDICAL & REGULATIONS INFO BANNERS ══ -->
  <div style="background:var(--bg1);border-top:0.5px solid var(--b);padding:2.5rem 1.5rem;display:flex;justify-content:center;align-items:stretch;gap:16px;flex-wrap:wrap;">
    <a href="/medical" aria-label="Medical information" style="display:flex;align-items:center;gap:24px;width:100%;max-width:600px;height:200px;padding:0 32px;background:linear-gradient(120deg,#0a1410 0%,#0d2018 55%,#123528 100%);border:0.5px solid rgba(62,207,142,0.4);border-radius:16px;text-decoration:none;overflow:hidden;position:relative;box-shadow:0 10px 34px rgba(0,0,0,0.5);transition:border-color .2s,transform .15s;" onmouseover="this.style.borderColor='rgba(90,230,170,0.8)';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='rgba(62,207,142,0.4)';this.style.transform=''">
      <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 85% 20%,rgba(62,207,142,0.16) 0%,transparent 60%);pointer-events:none;"></div>
      <div style="width:88px;height:88px;border-radius:50%;background:rgba(62,207,142,0.12);border:1px solid rgba(62,207,142,0.4);display:flex;align-items:center;justify-content:center;flex-shrink:0;position:relative;"><i class="ti ti-heart-rate-monitor" style="font-size:42px;color:#3ecf8e;"></i></div>
      <div style="position:relative;min-width:0;">
        <div style="font:600 10px var(--sans);letter-spacing:0.16em;text-transform:uppercase;color:rgba(62,207,142,0.85);margin-bottom:8px;">Health &amp; Safety</div>
        <div style="font-family:var(--serif);font-size:clamp(20px,3.2vw,26px);color:#fff;line-height:1.2;margin-bottom:6px;">Medical <em style="font-style:italic;color:#3ecf8e;">Information</em></div>
        <div style="font-size:12.5px;color:rgba(255,255,255,0.6);line-height:1.55;margin-bottom:12px;">STI testing, prevention, PrEP and anonymous health resources in Belgium, the Netherlands &amp; Germany.</div>
        <span style="display:inline-block;padding:8px 18px;border:0.5px solid rgba(62,207,142,0.55);border-radius:8px;color:#3ecf8e;font:600 12px var(--sans);letter-spacing:0.04em;">Read more →</span>
      </div>
    </a>
    <a href="/regulations" aria-label="Regulation and rights" style="display:flex;align-items:center;gap:24px;width:100%;max-width:600px;height:200px;padding:0 32px;background:linear-gradient(120deg,#0a0e18 0%,#0e1526 55%,#16204a 100%);border:0.5px solid rgba(90,140,220,0.4);border-radius:16px;text-decoration:none;overflow:hidden;position:relative;box-shadow:0 10px 34px rgba(0,0,0,0.5);transition:border-color .2s,transform .15s;" onmouseover="this.style.borderColor='rgba(130,175,255,0.8)';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='rgba(90,140,220,0.4)';this.style.transform=''">
      <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 85% 20%,rgba(90,140,220,0.18) 0%,transparent 60%);pointer-events:none;"></div>
      <div style="width:88px;height:88px;border-radius:50%;background:rgba(90,140,220,0.12);border:1px solid rgba(90,140,220,0.4);display:flex;align-items:center;justify-content:center;flex-shrink:0;position:relative;"><i class="ti ti-scale" style="font-size:42px;color:#7aa5e8;"></i></div>
      <div style="position:relative;min-width:0;">
        <div style="font:600 10px var(--sans);letter-spacing:0.16em;text-transform:uppercase;color:rgba(122,165,232,0.9);margin-bottom:8px;">Know your rights</div>
        <div style="font-family:var(--serif);font-size:clamp(20px,3.2vw,26px);color:#fff;line-height:1.2;margin-bottom:6px;">Regulation &amp; <em style="font-style:italic;color:#7aa5e8;">Rights</em></div>
        <div style="font-size:12.5px;color:rgba(255,255,255,0.6);line-height:1.55;margin-bottom:12px;">Sex work laws per country, your legal rights, taxes and support organisations across the EU.</div>
        <span style="display:inline-block;padding:8px 18px;border:0.5px solid rgba(122,165,232,0.55);border-radius:8px;color:#7aa5e8;font:600 12px var(--sans);letter-spacing:0.04em;">Read more →</span>
      </div>
    </a>
  </div>

  <!-- ══ VENUES BELGIUM (React portal — VenuesShowcase teaser) ══ -->
  <div id="venuesMount"></div>

  <!-- ══ PARTNERS & LINKS (React portal — PartnersShowcase) ══ -->
  <div id="partnersShowcaseMount"></div>

  <!-- ══ FOOTER ══ -->
  <footer style="background:var(--bg1);border-top:0.5px solid var(--b);padding:4rem 1.5rem 2rem;">
    <div style="max-width:1200px;margin:0 auto;">
      <div style="margin-bottom:2.5rem;">
        <div style="font-family:var(--serif);font-size:22px;color:var(--gold);letter-spacing:.02em;filter:drop-shadow(0 0 12px rgba(197,160,90,0.30));margin-bottom:0.75rem;">Secret<em style="font-style:italic;font-weight:300">Xperience</em></div>
        <p class="t-body" style="color:var(--t2);max-width:360px;">Discreet, verified, premium adult experiences across Europe.</p>
      </div>
      <div class="footer-grid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:2rem;margin-bottom:2.5rem;">
        <div class="footer-col">
          <div class="footer-col-title">About</div>
          <a href="/about">Our story</a>
          <a href="/how-it-works">How it works</a>
          <a href="/trust-safety">Trust &amp; safety</a>
          <a href="/press">Press</a>
        </div>
        <div class="footer-col">
          <div class="footer-col-title">Browse</div>
          <a href="/escorts">Escorts</a>
          <a href="/private-reception?cat=companionship">Companionship</a>
          <a href="/nightlife">Nightlife</a>
          <a href="/venues">Venues</a>
          <a href="/swingers">Swinger &amp; Parenclubs</a>
          <a href="/fetish">Fetish &amp; Domina</a>
          <a href="/pride">Pride · LGBTQ+</a>
          <a href="/events">Events</a>
          <a href="/jobs">Jobs &amp; Vacancies</a>
          <a href="/creators">Creators</a>
          <a href="/rentals">Rentals</a>
          <a href="/livestreams">Live Shows</a>
          <a href="/live">Live Cams</a>
        </div>
        <div class="footer-col">
          <div class="footer-col-title">Resources</div>
          <a href="/regulations">Regulation &amp; Rights</a>
          <a href="/medical">Medical Information</a>
          <a href="/partners">Partners &amp; Links</a>
          <a href="/advertise">List a service</a>
          <a href="/contact">Contact support</a>
        </div>
        <div class="footer-col">
          <div class="footer-col-title">Legal</div>
          <a href="/terms">Terms of Use</a>
          <a href="/privacy">Privacy Policy</a>
          <a href="/cookies">Cookie Policy</a>
          <a href="/dmca">DMCA</a>
          <a href="/2257">18 U.S.C. § 2257</a>
        </div>
      </div>
      <!-- ── Newsletter signup ── -->
      <div style="border-top:0.5px solid var(--b);padding-top:2rem;margin-bottom:2rem;">
        <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:1.5rem;">
          <div>
            <div style="font-family:var(--serif);font-size:18px;color:var(--t);margin-bottom:0.35rem;">Stay in the loop</div>
            <p style="font-size:13px;color:var(--t3);margin:0;">New listings, exclusive offers, and private events — delivered discreetly.</p>
          </div>
          <div id="newsletterForm" style="display:flex;gap:0.5rem;flex-wrap:wrap;align-items:center;">
            <input type="email" id="nlEmail" placeholder="your@email.com" style="height:38px;padding:0 14px;background:var(--bg2);border:0.5px solid var(--b2);border-radius:10px;color:var(--t);font-family:inherit;font-size:13px;outline:none;min-width:220px;"/>
            <button id="nlSubmit" style="height:38px;padding:0 18px;background:var(--grad-gold);border:none;border-radius:10px;color:#080808;font-weight:600;font-size:13px;cursor:pointer;font-family:inherit;letter-spacing:0.03em;white-space:nowrap;">Subscribe</button>
          </div>
          <div id="nlSuccess" style="display:none;font-size:13px;color:#26d4a0;"><i class="ti ti-circle-check"></i> You're on the list — thank you!</div>
        </div>
      </div>
      <div class="footer-bottom" style="border-top:0.5px solid var(--b);padding-top:1.5rem;display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:1rem;">
        <div class="footer-legal t-meta" style="color:var(--t3);">© 2026 SecretXperience.eu — All rights reserved. Adults only (18+). All listed advertisers are independent contractors.</div>
        <div style="display:flex;align-items:center;gap:1rem;">
          <span class="t-meta" style="color:var(--t3);">EN · FR · NL · DE</span>
          <span class="t-meta" style="color:var(--t3);">💳 VISA · MC · AMEX · CRYPTO</span>
        </div>
      </div>
    </div>
  </footer>

  <!-- ══ AUTH MODAL ══ -->
  <div class="modal-overlay" id="authModal" role="dialog" aria-modal="true" aria-label="Sign in or create account">
    <div class="modal">
      <button class="modal-close" id="authClose" aria-label="Close"><i class="ti ti-x"></i></button>
      <div class="auth-tabs">
        <div class="auth-tab active" data-tab="login">Log in</div>
        <div class="auth-tab" data-tab="signup">Create account</div>
      </div>

      <!-- LOGIN -->
      <div class="auth-panel active" id="loginPanel">
        <div class="auth-body">
          <div class="modal-logo">Secret<span>Xperience</span>.eu</div>
          <div class="social-btns">
            <button class="social-btn"><i class="ti ti-brand-google"></i> Continue with Google</button>
            <button class="social-btn"><i class="ti ti-brand-apple"></i> Continue with Apple</button>
          </div>
          <div class="divider">or continue with email</div>
          <div class="modal-err" id="loginErr">Invalid email or password. Please try again.</div>
          <div class="field"><label>Email address</label><input type="email" id="loginEmail" placeholder="you@example.com"/></div>
          <div class="field"><label>Password</label>
            <div class="pw-wrap">
              <input type="password" id="loginPw" placeholder="Your password"/>
              <button class="pw-toggle" data-target="loginPw" aria-label="Show password"><i class="ti ti-eye"></i></button>
            </div>
          </div>
          <div style="text-align:right;margin-bottom:.85rem"><a style="font-size:12px;color:var(--gold);cursor:pointer">Forgot password?</a></div>
          <button class="modal-btn" id="loginSubmit">Log in to SecretXperience</button>
          <div class="modal-switch">No account? <a id="switchToSignup">Create one for free</a></div>
        </div>
      </div>

      <!-- SIGNUP -->
      <div class="auth-panel" id="signupPanel">
        <div class="auth-body">
          <div class="modal-logo">Secret<span>Xperience</span>.eu</div>
          <div class="social-btns">
            <button class="social-btn"><i class="ti ti-brand-google"></i> Sign up with Google</button>
            <button class="social-btn"><i class="ti ti-brand-apple"></i> Sign up with Apple</button>
          </div>
          <div class="divider">or create account with email</div>
          <div class="modal-err" id="signupErr">Please fill in all required fields.</div>
          <div style="margin-bottom:1rem">
            <div class="flbl" style="margin-bottom:.5rem">I am a</div>
            <div class="role-pick">
              <div class="role-card selected" data-role="user"><i class="ti ti-user"></i><span>User / Client</span></div>
              <div class="role-card" data-role="provider"><i class="ti ti-briefcase"></i><span>Service Advertiser</span></div>
              <div class="role-card" data-role="venue"><i class="ti ti-building"></i><span>Venue / Hotel</span></div>
              <div class="role-card" data-role="creator"><i class="ti ti-camera"></i><span>Content Creator</span></div>
            </div>
          </div>
          <div class="field-row">
            <div class="field"><label>First name</label><input type="text" id="signupFirst" placeholder="First name"/></div>
            <div class="field"><label>Last name</label><input type="text" id="signupLast" placeholder="Last name"/></div>
          </div>
          <div class="field"><label>Email address</label><input type="email" id="signupEmail" placeholder="you@example.com"/></div>
          <div class="field"><label>Password</label>
            <div class="pw-wrap">
              <input type="password" id="signupPw" placeholder="Min. 6 characters" minlength="6"/>
              <button class="pw-toggle" data-target="signupPw" aria-label="Show password"><i class="ti ti-eye"></i></button>
            </div>
            <div class="field-hint">Use at least 8 characters with a mix of letters and numbers.</div>
          </div>
          <div class="field"><label>Country</label>
            <select>
              <option>Belgium</option><option>Netherlands</option><option>France</option>
              <option>Germany</option><option>Luxembourg</option><option>Switzerland</option>
              <option>United Kingdom</option><option>Austria</option>
              <option>Other</option>
            </select>
          </div>
          <div class="terms-row">
            <input type="checkbox" id="termsCheck"/>
            <label for="termsCheck">I am 18+ and agree to the <a href="/terms">Terms of Use</a>, <a href="/privacy">Privacy Policy</a>, and confirm all content I post is legal and consensual.</label>
          </div>
          <button class="modal-btn" id="signupSubmit">Create my account</button>
          <div class="modal-switch">Already have an account? <a id="switchToLogin">Log in</a></div>
          <div class="modal-success" id="signupSuccess">
            <i class="ti ti-circle-check"></i>
            <h3>Account created!</h3>
            <p>Welcome to SecretXperience.eu. Check your email for a verification link before you can log in.</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ══ BOOKING MODAL ══ -->
  <div class="modal-overlay" id="bookModal" role="dialog" aria-modal="true" aria-label="Request booking">
    <div class="modal">
      <button class="modal-close" id="bookClose" aria-label="Close"><i class="ti ti-x"></i></button>
      <div class="book-body">
        <div class="modal-logo">Secret<span>Xperience</span>.eu · Booking</div>

        <!-- Listing preview -->
        <div class="book-listing-row">
          <div class="book-listing-av"><i class="ti ti-user" id="bookListingIcon"></i></div>
          <div class="book-listing-info">
            <div class="bln" id="bookListingName">Sophia A.</div>
            <div class="blc" id="bookListingCat">Escort · Independent · Brussels</div>
          </div>
        </div>

        <!-- Step indicators -->
        <div class="book-steps">
          <div class="book-step active" data-step="0">Date</div>
          <div class="book-step" data-step="1">Time &amp; duration</div>
          <div class="book-step" data-step="2">Details</div>
          <div class="book-step" data-step="3">Confirm</div>
        </div>

        <!-- Step 0: Date picker -->
        <div class="book-pane active" id="bookPane0">
          <div class="flbl" style="margin-bottom:.75rem">Select a date</div>
          <div class="cal-nav">
            <button class="cal-nav-btn" id="calPrev"><i class="ti ti-chevron-left"></i></button>
            <div class="cal-month" id="calMonthLabel"></div>
            <button class="cal-nav-btn" id="calNext"><i class="ti ti-chevron-right"></i></button>
          </div>
          <div class="cal-header">
            <div class="cal-day-name">Mo</div><div class="cal-day-name">Tu</div>
            <div class="cal-day-name">We</div><div class="cal-day-name">Th</div>
            <div class="cal-day-name">Fr</div><div class="cal-day-name">Sa</div>
            <div class="cal-day-name">Su</div>
          </div>
          <div class="cal-grid" id="calGrid"></div>
          <button class="modal-btn" id="bookNext0" style="margin-top:1rem">Continue</button>
        </div>

        <!-- Step 1: Time & duration -->
        <div class="book-pane" id="bookPane1">
          <div class="flbl" style="margin-bottom:.6rem">Available times</div>
          <div class="time-slots" id="timeSlots">
            <div class="time-slot" data-time="14:00">14:00</div>
            <div class="time-slot" data-time="15:00">15:00</div>
            <div class="time-slot" data-time="16:00">16:00</div>
            <div class="time-slot" data-time="18:00">18:00</div>
            <div class="time-slot" data-time="19:00">19:00</div>
            <div class="time-slot" data-time="20:00">20:00</div>
            <div class="time-slot" data-time="21:00">21:00</div>
            <div class="time-slot" data-time="22:00">22:00</div>
          </div>
          <div class="flbl" style="margin:.75rem 0 .6rem">Duration</div>
          <div class="duration-pills" id="durPills">
            <div class="dur-pill" data-dur="1 Hour" data-price="200">1 Hour — €200</div>
            <div class="dur-pill selected" data-dur="2 Hours" data-price="350">2 Hours — €350</div>
            <div class="dur-pill" data-dur="Half day" data-price="600">Half day — €600</div>
            <div class="dur-pill" data-dur="Overnight" data-price="1200">Overnight — €1,200</div>
          </div>
          <div style="display:flex;gap:8px">
            <button class="modal-btn secondary" id="bookBack1">Back</button>
            <button class="modal-btn" id="bookNext1">Continue</button>
          </div>
        </div>

        <!-- Step 2: Details -->
        <div class="book-pane" id="bookPane2">
          <div class="field">
            <label>Meeting type</label>
            <select id="meetType">
              <option>Incall (at advertiser's location)</option>
              <option>Outcall (advertiser comes to you)</option>
            </select>
          </div>
          <div class="field" id="locationField">
            <label>Your location / hotel name</label>
            <input type="text" placeholder="e.g. Hotel Amigo, Brussels"/>
          </div>
          <div class="field">
            <label>Special requests or notes <span style="color:var(--t3);font-weight:400">(optional)</span></label>
            <textarea placeholder="Any preferences or requirements you'd like to share…"></textarea>
          </div>
          <div style="display:flex;gap:8px">
            <button class="modal-btn secondary" id="bookBack2">Back</button>
            <button class="modal-btn" id="bookNext2">Continue</button>
          </div>
        </div>

        <!-- Step 3: Confirm -->
        <div class="book-pane" id="bookPane3">
          <div class="book-summary">
            <div class="book-sum-row"><span class="lbl">Listing</span><span class="val" id="sumName">Sophia A.</span></div>
            <div class="book-sum-row"><span class="lbl">Date</span><span class="val" id="sumDate">—</span></div>
            <div class="book-sum-row"><span class="lbl">Time</span><span class="val" id="sumTime">—</span></div>
            <div class="book-sum-row"><span class="lbl">Duration</span><span class="val" id="sumDur">2 Hours</span></div>
            <div class="book-sum-row total"><span class="lbl">Total</span><span class="val" id="sumPrice">€350</span></div>
          </div>
          <div class="field">
            <label>Payment method</label>
            <select>
              <option>Credit / Debit card</option>
              <option>Bank transfer</option>
              <option>Crypto (BTC / ETH / USDT)</option>
            </select>
          </div>
          <div style="font-size:11px;color:var(--t3);line-height:1.7;margin-bottom:1rem">Your booking request is sent to the advertiser for approval. No payment is charged until they confirm. All transactions are encrypted and discreet.</div>
          <div style="display:flex;gap:8px">
            <button class="modal-btn secondary" id="bookBack3">Back</button>
            <button class="modal-btn" id="bookSubmit">Send booking request</button>
          </div>
          <div class="modal-success" id="bookSuccess">
            <i class="ti ti-calendar-check"></i>
            <h3>Booking request sent!</h3>
            <p>Your request has been sent to the advertiser. You'll receive a confirmation message once they accept — usually within 30 minutes.</p>
          </div>
        </div>

      </div>
    </div>
  </div>

  <!-- ══ MESSAGING MODAL ══ -->
  <div class="modal-overlay" id="msgModal" role="dialog" aria-modal="true" aria-label="Messages">
    <div class="modal">
      <button class="modal-close" id="msgClose" aria-label="Close"><i class="ti ti-x"></i></button>

      <!-- Thread list + chat side by side on desktop -->
      <div style="display:flex;height:100%;flex:1;overflow:hidden;min-height:0">

        <!-- Thread list -->
        <div style="width:220px;border-right:0.5px solid var(--b);display:flex;flex-direction:column;flex-shrink:0" id="threadPanel">
          <div style="padding:.85rem 1rem;border-bottom:0.5px solid var(--b);font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--t3);font-weight:600">Messages</div>
          <div class="msg-thread-list" style="flex:1">
            <div class="msg-thread active" data-thread="sophia">
              <div class="msg-thread-av" style="background:rgba(100,80,200,.2);color:#b0a0f8">SA</div>
              <div class="msg-thread-info">
                <div class="msg-thread-name">Sophia A.</div>
                <div class="msg-thread-preview">Looking forward to Thursday!</div>
              </div>
              <div class="msg-thread-meta">
                <div class="msg-thread-time">2m</div>
                <div class="msg-unread">2</div>
              </div>
            </div>
            <div class="msg-thread" data-thread="luna">
              <div class="msg-thread-av" style="background:rgba(26,143,106,.15);color:#1dc9a0">LC</div>
              <div class="msg-thread-info">
                <div class="msg-thread-name">Luna Creative</div>
                <div class="msg-thread-preview">Custom content is ready ✓</div>
              </div>
              <div class="msg-thread-meta"><div class="msg-thread-time">1h</div></div>
            </div>
            <div class="msg-thread" data-thread="elise">
              <div class="msg-thread-av" style="background:rgba(197,160,90,.15);color:var(--gold)">EV</div>
              <div class="msg-thread-info">
                <div class="msg-thread-name">Elise V.</div>
                <div class="msg-thread-preview">What dates work for you?</div>
              </div>
              <div class="msg-thread-meta"><div class="msg-thread-time">Yesterday</div></div>
            </div>
            <div class="msg-thread" data-thread="support">
              <div class="msg-thread-av" style="background:var(--gbg);color:var(--gold)">SX</div>
              <div class="msg-thread-info">
                <div class="msg-thread-name">SecretXperience Support</div>
                <div class="msg-thread-preview">How can we help you today?</div>
              </div>
              <div class="msg-thread-meta"><div class="msg-thread-time">3d</div></div>
            </div>
          </div>
        </div>

        <!-- Chat area -->
        <div class="msg-chat" id="chatArea">
          <!-- Chat header -->
          <div class="msg-header">
            <div class="msg-header-av" id="chatAv">SA</div>
            <div class="msg-header-info">
              <div class="mhn" id="chatName">Sophia A.</div>
              <div class="mhs"><span class="msg-online"></span> Online now · Escort · Private</div>
            </div>
            <div style="margin-left:auto;display:flex;gap:6px">
              <button class="dp-action" aria-label="Book"><i class="ti ti-calendar-plus"></i></button>
              <button class="dp-action" aria-label="View profile"><i class="ti ti-user"></i></button>
            </div>
          </div>

          <!-- Messages -->
          <div class="msg-chat-body" id="chatBody">
            <div class="msg-date-sep">Today</div>
            <div class="msg-bubble them">Hi! Thanks for reaching out through SecretXperience. Happy to answer any questions you have.<div class="msg-bubble-time">14:02</div></div>
            <div class="msg-bubble me">Hi Sophia, I saw your profile — I'm interested in booking you for Thursday evening.<div class="msg-bubble-time">14:05</div></div>
            <div class="msg-bubble them">Thursday works for me! I'm available from 18:00. What duration are you thinking?<div class="msg-bubble-time">14:06</div></div>
            <div class="msg-bubble me">Probably 2–3 hours, starting around 19:00. Is outcall possible?<div class="msg-bubble-time">14:08</div></div>
            <div class="msg-bubble them">Yes, outcall is fine. I'm in Brussels — where would you like to meet? A hotel or private address works for me.<div class="msg-bubble-time">14:09</div></div>
            <div class="msg-bubble me">Hotel Amigo in the centre. Does that work?<div class="msg-bubble-time">14:11</div></div>
            <div class="msg-bubble them">Perfect, I know it well. Looking forward to Thursday! Use the booking button above when you're ready to confirm.<div class="msg-bubble-time">14:12</div></div>
          </div>

          <!-- Quick replies -->
          <div class="msg-quick-btns">
            <button class="msg-quick">Send booking request</button>
            <button class="msg-quick">What are your rates?</button>
            <button class="msg-quick">Are you available this week?</button>
            <button class="msg-quick">Confirm meeting details</button>
          </div>

          <!-- Input -->
          <div class="msg-input-bar">
            <button class="msg-attach-btn" aria-label="Attach file"><i class="ti ti-paperclip"></i></button>
            <textarea class="msg-input" id="msgInput" rows="1" placeholder="Type a message…" aria-label="Message input"></textarea>
            <button class="msg-send-btn" id="msgSend" aria-label="Send message"><i class="ti ti-send"></i></button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ══ BACKEND PANEL ══ -->
  <div class="modal-overlay" id="backendModal" role="dialog" aria-modal="true" aria-label="Backend architecture">
    <div class="modal">
      <button class="modal-close" id="backendClose" aria-label="Close"><i class="ti ti-x"></i></button>
      <div class="backend-body">
        <div class="modal-logo">Secret<span>Xperience</span>.eu · Backend Architecture</div>

        <div class="backend-section">
          <div class="backend-section-title">Recommended tech stack</div>
          <div class="backend-desc">A modern, scalable, privacy-first stack built for adult platforms — handling auth, payments, file storage, real-time messaging, and compliance in one cohesive system.</div>
          <div class="stack-grid">
            <div class="stack-card highlight"><div class="stack-card-label">Frontend</div><div class="stack-card-name">Next.js 14</div><div class="stack-card-note">App router, SSR, SEO-ready</div></div>
            <div class="stack-card highlight"><div class="stack-card-label">Backend / DB</div><div class="stack-card-name">Supabase</div><div class="stack-card-note">Postgres, Auth, Realtime, Storage</div></div>
            <div class="stack-card highlight"><div class="stack-card-label">Payments</div><div class="stack-card-name">Stripe</div><div class="stack-card-note">Cards, crypto via Strike, payouts</div></div>
            <div class="stack-card highlight"><div class="stack-card-label">Hosting</div><div class="stack-card-name">Vercel</div><div class="stack-card-note">Edge network, EU region</div></div>
            <div class="stack-card"><div class="stack-card-label">Email</div><div class="stack-card-name">Resend</div><div class="stack-card-note">Transactional, templates</div></div>
            <div class="stack-card"><div class="stack-card-label">Search</div><div class="stack-card-name">Algolia</div><div class="stack-card-note">Instant listing search &amp; filters</div></div>
            <div class="stack-card"><div class="stack-card-label">Media</div><div class="stack-card-name">Cloudflare R2</div><div class="stack-card-note">Profile images, video, docs</div></div>
            <div class="stack-card"><div class="stack-card-label">Age verify</div><div class="stack-card-name">AgeID / Yoti</div><div class="stack-card-note">EU-compliant ID verification</div></div>
            <div class="stack-card"><div class="stack-card-label">Analytics</div><div class="stack-card-name">Plausible</div><div class="stack-card-note">Privacy-first, GDPR-compliant</div></div>
            <div class="stack-card"><div class="stack-card-label">Moderation</div><div class="stack-card-name">Hive AI</div><div class="stack-card-note">Adult content classification</div></div>
            <div class="stack-card"><div class="stack-card-label">Realtime</div><div class="stack-card-name">Supabase Channels</div><div class="stack-card-note">Messaging, presence, notifications</div></div>
            <div class="stack-card"><div class="stack-card-label">Maps</div><div class="stack-card-name">Mapbox</div><div class="stack-card-note">Listing locations, privacy blur</div></div>
          </div>
        </div>

        <div class="backend-section">
          <div class="backend-section-title">Database schema (core tables)</div>
          <div class="stack-grid">
            <div class="stack-card"><div class="stack-card-label">Table</div><div class="stack-card-name">users</div><div class="stack-card-note">id, role, email, tier, verified, created_at</div></div>
            <div class="stack-card"><div class="stack-card-label">Table</div><div class="stack-card-name">listings</div><div class="stack-card-note">id, user_id, category, type, price_range, location, status</div></div>
            <div class="stack-card"><div class="stack-card-label">Table</div><div class="stack-card-name">bookings</div><div class="stack-card-note">id, client_id, listing_id, date, duration, status, amount</div></div>
            <div class="stack-card"><div class="stack-card-label">Table</div><div class="stack-card-name">messages</div><div class="stack-card-note">id, thread_id, sender_id, body, read_at, created_at</div></div>
            <div class="stack-card"><div class="stack-card-label">Table</div><div class="stack-card-name">reviews</div><div class="stack-card-note">id, listing_id, author_id, rating, body, verified</div></div>
            <div class="stack-card"><div class="stack-card-label">Table</div><div class="stack-card-name">memberships</div><div class="stack-card-note">id, user_id, tier, stripe_sub_id, expires_at</div></div>
          </div>
        </div>

        <div class="backend-section">
          <div class="backend-section-title">Compliance &amp; legal (EU / Belgium)</div>
          <div class="backend-desc">Operating an adult platform in Belgium and the EU requires specific legal and technical measures. Here's what needs to be in place before go-live:</div>
          <div class="stack-grid">
            <div class="stack-card"><div class="stack-card-label">Required</div><div class="stack-card-name">Age verification</div><div class="stack-card-note">EU DSA Article 28 — robust age verification for adult content</div></div>
            <div class="stack-card"><div class="stack-card-label">Required</div><div class="stack-card-name">GDPR compliance</div><div class="stack-card-note">Data processing agreements, right to erasure, DPA registration</div></div>
            <div class="stack-card"><div class="stack-card-label">Required</div><div class="stack-card-name">2257 record-keeping</div><div class="stack-card-note">US / international: keep producer records if hosting US-origin content</div></div>
            <div class="stack-card"><div class="stack-card-label">Required</div><div class="stack-card-name">Payment processor</div><div class="stack-card-note">Adult-friendly processor: Stripe (with approval), CCBill, Segpay</div></div>
            <div class="stack-card"><div class="stack-card-label">Advised</div><div class="stack-card-name">Legal entity</div><div class="stack-card-note">BV (Belgium) or BV/VOF. Register with CBE. VAT registration required.</div></div>
            <div class="stack-card"><div class="stack-card-label">Advised</div><div class="stack-card-name">Terms of Service</div><div class="stack-card-note">Explicit consent, advertiser liability limits, DMCA takedown policy</div></div>
          </div>
        </div>

        <div class="backend-section">
          <div class="backend-section-title">Launch roadmap</div>
          <div class="roadmap">
            <div class="rm-row now"><div class="rm-phase">Now</div><div class="rm-items"><span class="rm-item">UI / frontend</span><span class="rm-item">Auth flow</span><span class="rm-item">Listing detail</span><span class="rm-item">Booking UI</span><span class="rm-item">Messaging UI</span></div></div>
            <div class="rm-row next"><div class="rm-phase">Week 1–2</div><div class="rm-items"><span class="rm-item">Supabase setup</span><span class="rm-item">Auth integration</span><span class="rm-item">DB schema</span><span class="rm-item">Listing CRUD</span><span class="rm-item">Image upload</span></div></div>
            <div class="rm-row"><div class="rm-phase">Week 3–4</div><div class="rm-items"><span class="rm-item">Realtime chat</span><span class="rm-item">Booking system</span><span class="rm-item">Stripe payments</span><span class="rm-item">Email notifications</span><span class="rm-item">Admin panel</span></div></div>
            <div class="rm-row"><div class="rm-phase">Week 5–6</div><div class="rm-items"><span class="rm-item">Age verification</span><span class="rm-item">Content moderation</span><span class="rm-item">Reviews</span><span class="rm-item">Search / Algolia</span><span class="rm-item">Membership billing</span></div></div>
            <div class="rm-row"><div class="rm-phase">Go-live</div><div class="rm-items"><span class="rm-item">Legal review</span><span class="rm-item">GDPR DPA</span><span class="rm-item">Domain setup</span><span class="rm-item">CDN</span><span class="rm-item">Soft launch</span></div></div>
          </div>
        </div>

        <div class="backend-section">
          <div class="backend-section-title">Estimated monthly running costs (MVP)</div>
          <table class="cost-table">
            <tr><th>Service</th><th>Plan</th><th>Cost/mo</th></tr>
            <tr><td>Supabase</td><td>Pro</td><td>€25</td></tr>
            <tr><td>Vercel</td><td>Pro</td><td>€20</td></tr>
            <tr><td>Cloudflare R2</td><td>Pay-as-you-go</td><td>~€10</td></tr>
            <tr><td>Resend</td><td>Starter</td><td>€0–20</td></tr>
            <tr><td>Algolia</td><td>Starter</td><td>€0–50</td></tr>
            <tr><td>Hive AI moderation</td><td>Usage</td><td>~€30</td></tr>
            <tr><td>AgeID verification</td><td>Per-verify</td><td>~€50</td></tr>
            <tr><td>Domain + SSL</td><td>Annual</td><td>~€5</td></tr>
            <tr class="total-row"><td colspan="2"><strong>Total MVP</strong></td><td><strong>~€160–210/mo</strong></td></tr>
          </table>
        </div>

        <button class="modal-btn" id="closeBackend">Got it — let's build it</button>
      </div>
    </div>
  </div>

  <!-- Toast notification -->
  <div class="toast" id="toast"><i class="ti ti-check"></i> <span id="toastMsg">Done</span></div>

  <!-- ══ LISTING DETAIL PANEL ══ -->
  <div id="detail-overlay" aria-hidden="true"></div>
  <div id="detail-panel" role="dialog" aria-modal="true" aria-label="Listing detail">

    <!-- Panel header -->
    <div class="dp-header" style="display:flex;align-items:center;gap:0.5rem;">
      <button class="dp-back" id="dpClose" style="display:flex;align-items:center;gap:6px;"><i class="ti ti-arrow-left" aria-hidden="true"></i> Back</button>
      <div class="dp-actions" style="margin-left:auto;display:flex;gap:6px;">
        <button class="dp-action" id="dpShare" aria-label="Share listing"><i class="ti ti-share"></i></button>
        <button class="dp-action" id="dpSave" aria-label="Save advertisement"><i class="ti ti-heart"></i></button>
        <button class="dp-action" id="dpReport" aria-label="Report advertisement"><i class="ti ti-flag"></i></button>
      </div>
    </div>

    <!-- Scrollable body -->
    <div class="dp-body" id="dpBody">

      <!-- Hero -->
      <div class="dp-hero cat-escort" id="dpHero" style="height:280px;position:relative;display:flex;align-items:flex-end;padding:1.25rem;">
        <i class="ti ti-user" id="dpHeroIcon" aria-hidden="true" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:48px;color:rgba(255,255,255,0.15);"></i>
        <div class="dp-hero-grad"></div>
        <div class="dp-hero-badges" id="dpHeroBadges" style="position:relative;z-index:2;display:flex;gap:4px;flex-wrap:wrap;"></div>
        <span id="dpHeroMonogram" style="font-family:var(--serif);font-size:96px;font-style:italic;font-weight:400;color:rgba(197,160,90,0.25);line-height:1;position:absolute;bottom:0.75rem;left:1.25rem;z-index:1;">Sx</span>
      </div>
      <div id="dpGallery" style="display:none;flex-direction:row;gap:6px;padding:8px 14px;overflow-x:auto;scrollbar-width:thin;background:rgba(0,0,0,0.4)"></div>

      <!-- Identity -->
      <div class="dp-identity">
        <div class="dp-cat-row">
          <div class="dp-cat" id="dpCat">Escort · Independent</div>
          <div class="dp-type-pill" id="dpTypePill">Private</div>
        </div>
        <div class="dp-name" id="dpName">Sophia A.</div>
        <div style="display:flex;gap:12px;align-items:center;margin-bottom:4px;">
          <a id="dpProfileLink" href="#" onclick="event.preventDefault();var pid=document.getElementById('detail-panel').dataset.profileId;if(pid)window.location.href='/profile/'+pid;" style="display:inline-block;font-size:11px;color:#c5a05a;text-decoration:none;opacity:0.8;letter-spacing:0.05em">View profile →</a>
          <a id="dpFullPageLink" href="#" style="display:inline-block;font-size:11px;color:rgba(255,255,255,0.4);text-decoration:none;letter-spacing:0.05em">Full page ↗</a>
        </div>
        <div class="dp-meta-row">
          <span class="dp-meta-item gold"><i class="ti ti-star-filled"></i> <span id="dpRating">4.9</span> (128 reviews)</span>
          <span class="dp-meta-item"><i class="ti ti-map-pin"></i> <span id="dpCity">Brussels, BE</span></span>
          <span class="dp-meta-item"><i class="ti ti-circle-check" style="color:#26d4a0"></i> ID Verified</span>
          <span class="dp-meta-item"><i class="ti ti-clock"></i> Replies within 30 min</span>
        </div>
      </div>

      <!-- Quick stats -->
      <div class="dp-stats" style="display:grid;grid-template-columns:repeat(4,1fr);gap:0.75rem;padding:1rem 1.25rem;">
        <div class="dp-stat" style="background:var(--bg2);border-radius:var(--r);padding:0.75rem;text-align:center;"><div class="dp-stat-v" id="dpS1" style="font-family:var(--serif);font-size:20px;color:var(--gold);">128</div><div class="dp-stat-l" style="font-size:11px;color:var(--t3);margin-top:2px;">Reviews</div></div>
        <div class="dp-stat" style="background:var(--bg2);border-radius:var(--r);padding:0.75rem;text-align:center;"><div class="dp-stat-v" id="dpS2" style="font-family:var(--serif);font-size:20px;color:var(--gold);">4.9</div><div class="dp-stat-l" style="font-size:11px;color:var(--t3);margin-top:2px;">Rating</div></div>
        <div class="dp-stat" style="background:var(--bg2);border-radius:var(--r);padding:0.75rem;text-align:center;"><div class="dp-stat-v" id="dpS3" style="font-family:var(--serif);font-size:20px;color:var(--gold);">3 yrs</div><div class="dp-stat-l" style="font-size:11px;color:var(--t3);margin-top:2px;">On platform</div></div>
        <div class="dp-stat" style="background:var(--bg2);border-radius:var(--r);padding:0.75rem;text-align:center;"><div class="dp-stat-v" id="dpS4" style="font-family:var(--serif);font-size:20px;color:var(--gold);">2.1k</div><div class="dp-stat-l" style="font-size:11px;color:var(--t3);margin-top:2px;">Profile views</div></div>
      </div>

      <!-- About -->
      <div class="dp-section">
        <div class="dp-section-title">About</div>
        <div class="dp-desc" id="dpDesc">A discreet, elegant companion based in Brussels. Available for private meetings, dinner dates, and overnight bookings. Fluent in English, French, and Dutch. All interactions are confidential and handled with the utmost professionalism.</div>
      </div>

      <!-- Services -->
      <div class="dp-section">
        <div class="dp-section-title">Services offered</div>
        <div class="dp-tags" id="dpTags">
          <span class="dp-tag highlight">Dinner date</span>
          <span class="dp-tag highlight">Overnight</span>
          <span class="dp-tag">Travel companion</span>
          <span class="dp-tag">Social events</span>
          <span class="dp-tag">Private meetings</span>
          <span class="dp-tag">GFE</span>
          <span class="dp-tag">Role play</span>
          <span class="dp-tag">Massage</span>
        </div>
      </div>

      <!-- Pricing -->
      <div class="dp-section">
        <div class="dp-section-title">Pricing</div>
        <div class="dp-price-cards" id="dpPricing">
          <div class="dp-price-card">
            <div class="dp-price-dur">1 Hour</div>
            <div class="dp-price-amt">€200</div>
            <div class="dp-price-note">Incall or outcall</div>
          </div>
          <div class="dp-price-card featured">
            <div class="dp-price-dur">2 Hours</div>
            <div class="dp-price-amt">€350</div>
            <div class="dp-price-note">Most popular</div>
          </div>
          <div class="dp-price-card">
            <div class="dp-price-dur">Half day</div>
            <div class="dp-price-amt">€600</div>
            <div class="dp-price-note">4 hrs · flexible</div>
          </div>
          <div class="dp-price-card">
            <div class="dp-price-dur">Overnight</div>
            <div class="dp-price-amt">€1,200</div>
            <div class="dp-price-note">10pm – 8am</div>
          </div>
        </div>
      </div>

      <!-- Availability -->
      <div class="dp-section">
        <div class="dp-section-title">Availability this week</div>
        <div class="dp-avail-grid">
          <div class="dp-avail-item avail"><div class="dp-avail-day">Mon</div><div class="dp-avail-time">14:00–22:00</div></div>
          <div class="dp-avail-item"><div class="dp-avail-day">Tue</div><div class="dp-avail-time">Unavailable</div></div>
          <div class="dp-avail-item avail"><div class="dp-avail-day">Wed</div><div class="dp-avail-time">18:00–02:00</div></div>
          <div class="dp-avail-item avail"><div class="dp-avail-day">Thu</div><div class="dp-avail-time">All day</div></div>
          <div class="dp-avail-item avail"><div class="dp-avail-day">Fri</div><div class="dp-avail-time">18:00–04:00</div></div>
          <div class="dp-avail-item avail"><div class="dp-avail-day">Sat</div><div class="dp-avail-time">All day</div></div>
          <div class="dp-avail-item"><div class="dp-avail-day">Sun</div><div class="dp-avail-time">Unavailable</div></div>
        </div>
      </div>

      <!-- Reviews -->
      <div class="dp-section">
        <div class="dp-section-title">Reviews <span style="color:var(--t3);font-weight:400;letter-spacing:0">(128)</span></div>
        <div class="dp-reviews">
          <div class="dp-review">
            <div class="dp-review-top">
              <span class="dp-review-author">M.R. · Gold Member</span>
              <span class="dp-review-stars">★★★★★</span>
            </div>
            <div class="dp-review-date" style="margin-bottom:.35rem">2 days ago</div>
            <div class="dp-review-text">Absolutely exceptional. Punctual, elegant, and completely discreet. Exactly as described — highly recommend for anyone seeking genuine companionship.</div>
          </div>
          <div class="dp-review">
            <div class="dp-review-top">
              <span class="dp-review-author">T.K. · Verified User</span>
              <span class="dp-review-stars">★★★★★</span>
            </div>
            <div class="dp-review-date" style="margin-bottom:.35rem">1 week ago</div>
            <div class="dp-review-text">Made my business trip to Brussels far more enjoyable. Great conversation, beautiful presence, total discretion. Will book again.</div>
          </div>
          <div class="dp-review">
            <div class="dp-review-top">
              <span class="dp-review-author">A.L. · Platinum Member</span>
              <span class="dp-review-stars">★★★★☆</span>
            </div>
            <div class="dp-review-date" style="margin-bottom:.35rem">2 weeks ago</div>
            <div class="dp-review-text">Very professional, responded quickly and was flexible with scheduling. The experience was exactly what I was looking for.</div>
          </div>
        </div>
      </div>

      <!-- Similar listings -->
      <div class="dp-section" style="border-bottom:none">
        <div class="dp-section-title">Similar listings</div>
        <div class="dp-similar">
          <div class="dp-sim-card">
            <div class="dp-sim-img"><i class="ti ti-user" aria-hidden="true"></i><div class="card-badges" style="position:absolute;top:5px;left:5px"><span class="badge bv" style="font-size:8px">✓</span></div></div>
            <div class="dp-sim-body"><div class="dp-sim-cat">Escort · Private</div><div class="dp-sim-name">Elena M.</div><div class="dp-sim-price">From €180/hr · Antwerp</div></div>
          </div>
          <div class="dp-sim-card">
            <div class="dp-sim-img"><i class="ti ti-user" aria-hidden="true"></i><div class="card-badges" style="position:absolute;top:5px;left:5px"><span class="badge be" style="font-size:8px">VIP</span></div></div>
            <div class="dp-sim-body"><div class="dp-sim-cat">Escort · Elite</div><div class="dp-sim-name">Chloe D.</div><div class="dp-sim-price">From €450/hr · Brussels</div></div>
          </div>
          <div class="dp-sim-card">
            <div class="dp-sim-img"><i class="ti ti-user" aria-hidden="true"></i><div class="card-badges" style="position:absolute;top:5px;left:5px"><span class="badge bv" style="font-size:8px">✓</span></div></div>
            <div class="dp-sim-body"><div class="dp-sim-cat">Companionship</div><div class="dp-sim-name">Isabelle V.</div><div class="dp-sim-price">From €150/hr · Ghent</div></div>
          </div>
        </div>
      </div>

    </div><!-- /dp-body -->

    <!-- Sticky CTA -->
    <div class="dp-cta" style="background:linear-gradient(0deg, var(--bg1) 60%, transparent 100%);">
      <button class="dp-cta-share" title="Copy link" aria-label="Copy advertisement link" style="flex-shrink:0;width:40px;height:40px;border-radius:10px;border:0.5px solid rgba(255,255,255,0.12);background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#8c8880;font-size:16px">
        <i class="ti ti-share" aria-hidden="true"></i>
      </button>
      <button class="dp-cta-msg"><i class="ti ti-message-circle" aria-hidden="true"></i> Send message</button>
      <button class="dp-cta-book"><i class="ti ti-calendar-plus" aria-hidden="true"></i> Request booking</button>
    </div>

  </div><!-- /detail-panel -->

  <!-- ══ MOBILE BOTTOM NAV ══ -->
  <nav class="bnav" aria-label="Mobile navigation">
    <div class="bnav-items">
      <button class="bni active" aria-label="Home"><i class="ti ti-home"></i><span>Home</span></button>
      <button class="bni" aria-label="Search" onclick="window.location.href='/search'"><i class="ti ti-search"></i><span>Search</span></button>
      <button class="bni" aria-label="Discover" onclick="window.location.href='/discover'"><i class="ti ti-sparkles"></i><span>Discover</span></button>
      <button class="bni" id="navMsgBtn" aria-label="Messages"><i class="ti ti-message-circle"></i><span>Messages</span><span id="navMsgBadge" style="display:none;background:#c5a05a;color:#080808;font-size:9px;font-weight:700;padding:1px 5px;border-radius:8px;margin-left:4px;vertical-align:middle"></span></button>
      <button class="bni" aria-label="Profile"><i class="ti ti-user-circle"></i><span>Profile</span></button>
    </div>
  </nav>

</div><!-- #app -->` }} />
      {/* Live-now ticker — portal into #liveBannerMount, renders only when an advertiser is broadcasting */}
      <LiveBanner />
      {/* Upcoming event banner — portal into #upcomingEventMount */}
      <UpcomingEventBanner />
      {/* Homepage Premium banner — portal into #homepagePremiumMount, renders only when sold */}
      <PremiumBanner placement="homepage" portalTo="homepagePremiumMount" />
      {/* Enjoy with Joy featured-advertiser banner — portal into #joyBannerMount; double-click opens full profile, links to enjoywithjoy.be */}
      <JoyBanner portalTo="joyBannerMount" />
      {/* GSAP slider ads — rendered as React portal anchored after #featuredBanner */}
      <SliderAds />
      {/* OnlyFans creator directory — portal into #onlyfansShowcaseMount above the partners band */}
      <OnlyFansShowcase portalTo="onlyfansShowcaseMount" />
      {/* Partner boutiques — portal between OnlyFans creators and Partners & Links */}
      <ShopShowcase variant="compact" portalTo="shopShowcaseMount" />
      {/* Visitor-selectable hero styles — 🎨 picker, persists in localStorage */}
      <HeroThemes />
      {/* Live-status checker for the Stripchat profile cards (green line when live) */}
      <StripchatLive />
      {/* Venues Belgium teaser — portal into #venuesMount */}
      <VenuesShowcase variant="teaser" portalTo="venuesMount" />
      {/* Partners & Links band — portal into #partnersShowcaseMount above the footer */}
      <PartnersShowcase />
      <DesignDemos />
    </>
  )
}
