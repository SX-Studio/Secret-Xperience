// Self-contained styling for the Controlekamer surfaces, scoped under `.ck` so it never
// leaks into the rest of the app. Palette mirrors the SX × Content24 architecture blueprint.

export const CK_CSS = `
@import url("https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap");
.ck{
  --ground:#0b0912; --panel:#16121f; --panel2:#201b30;
  --ink:#ece7f5; --muted:#a49db8; --faint:#6f6885;
  --line:rgba(255,255,255,.10); --line2:rgba(255,255,255,.06);
  --sx:#d5ad61; --sx-bg:rgba(213,173,97,.13); --sx-brd:rgba(213,173,97,.44);
  --c24:#4fd6c4; --c24-bg:rgba(79,214,196,.13); --c24-brd:rgba(79,214,196,.42);
  --core:#9c81f0; --core-bg:rgba(139,108,240,.16); --core-brd:rgba(139,108,240,.48);
  --infra:#9aa3b4; --infra-bg:rgba(154,163,180,.11); --infra-brd:rgba(154,163,180,.30);
  --google:#e8a13a; --google-bg:rgba(232,161,58,.12); --google-brd:rgba(232,161,58,.40);
  --pay:#5fbf7a; --pay-bg:rgba(95,191,122,.12); --pay-brd:rgba(95,191,122,.40);
  --ok:#5fbf7a; --bad:#e2607a;
  color:var(--ink);
  font-family:"IBM Plex Sans",system-ui,-apple-system,sans-serif;
  -webkit-font-smoothing:antialiased;
}
.ck *{box-sizing:border-box}
.ck-serif{font-family:"Cormorant Garamond",Georgia,serif;font-weight:600;letter-spacing:.005em}
.ck-eyebrow{font-family:"IBM Plex Mono",ui-monospace,monospace;font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:var(--faint)}
.ck-ic{width:1.15em;height:1.15em;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}

/* ---- gate ---- */
.ck-gate{min-height:100dvh;background:
  radial-gradient(1100px 620px at 82% -8%, rgba(213,173,97,.10), transparent 60%),
  radial-gradient(900px 560px at 8% 110%, rgba(79,214,196,.08), transparent 60%),
  var(--ground);
  display:flex;align-items:center;justify-content:center;padding:24px}
.ck-gate-card{width:min(940px,100%);background:var(--panel);border:1px solid var(--line);border-radius:22px;
  overflow:hidden;display:grid;grid-template-columns:1.15fr .85fr;box-shadow:0 30px 80px -40px rgba(0,0,0,.8)}
.ck-gate-side{padding:clamp(26px,4vw,44px);border-right:1px solid var(--line2);
  background:linear-gradient(180deg, rgba(213,173,97,.05), transparent 40%)}
.ck-gate-title{font-size:clamp(38px,6vw,58px);line-height:1;margin:.18em 0 .3em;color:var(--sx)}
.ck-lede{color:var(--muted);font-size:15px;max-width:42ch;margin:0 0 22px}
.ck-steps{list-style:none;padding:0;margin:0 0 24px;display:grid;gap:12px}
.ck-steps li{display:flex;align-items:center;gap:12px;color:var(--ink);font-size:14px}
.ck-steps li span{flex:none;width:26px;height:26px;border-radius:50%;display:grid;place-items:center;
  background:var(--core-bg);border:1px solid var(--core-brd);color:var(--core);font:600 12px/1 "IBM Plex Mono",monospace}
.ck-shield{display:flex;align-items:center;gap:10px;font-size:12.5px;color:var(--faint);
  border-top:1px solid var(--line2);padding-top:16px}
.ck-gate-qr{padding:clamp(26px,4vw,44px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;text-align:center}
.ck-qr-box{width:240px;height:240px;background:#fff;border-radius:16px;padding:12px;display:grid;place-items:center;
  box-shadow:0 12px 40px -18px rgba(0,0,0,.7)}
.ck-qr-box svg{width:100%;height:100%;display:block}
.ck-skeleton{background:linear-gradient(110deg,#1c1830 8%,#272138 18%,#1c1830 33%);background-size:220% 100%;animation:ck-sh 1.4s linear infinite}
@keyframes ck-sh{to{background-position:-220% 0}}
.ck-code-label{margin-top:14px;font-family:"IBM Plex Mono",monospace;font-size:10.5px;letter-spacing:.22em;text-transform:uppercase;color:var(--faint)}
.ck-code{font-family:"IBM Plex Mono",monospace;font-size:28px;letter-spacing:.34em;font-weight:600;color:var(--sx);padding-left:.34em}
.ck-hint{color:var(--muted);font-size:13px;margin-top:4px}
.ck-dots{display:flex;gap:6px;margin-top:2px}
.ck-dots i{width:7px;height:7px;border-radius:50%;background:var(--core);opacity:.35;animation:ck-b 1.1s infinite}
.ck-dots i:nth-child(2){animation-delay:.18s}.ck-dots i:nth-child(3){animation-delay:.36s}
@keyframes ck-b{0%,100%{opacity:.3;transform:translateY(0)}50%{opacity:1;transform:translateY(-3px)}}
.ck-linkbtn{margin-top:12px;background:none;border:none;color:var(--faint);font:500 12px/1 "IBM Plex Mono",monospace;cursor:pointer;text-decoration:underline;text-underline-offset:3px}
.ck-linkbtn:hover{color:var(--ink)}
.ck-state{display:flex;flex-direction:column;align-items:center;gap:12px;color:var(--muted);font-size:15px;min-height:240px;justify-content:center}
.ck-state-ic{width:44px;height:44px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round;color:var(--faint)}
.ck-ok .ck-state-ic{color:var(--ok)} .ck-bad .ck-state-ic{color:var(--bad)}
.ck-btn{background:var(--sx-bg);border:1px solid var(--sx-brd);color:var(--sx);border-radius:999px;padding:9px 20px;font:600 13px/1 "IBM Plex Sans",sans-serif;cursor:pointer;transition:filter .15s}
.ck-btn:hover{filter:brightness(1.15)}
.ck-btn:disabled{opacity:.55;cursor:default}
.ck-otp{display:flex;flex-direction:column;align-items:center;gap:10px;min-height:240px;justify-content:center}
.ck-otp-input{width:200px;text-align:center;background:var(--panel2);border:1px solid var(--line);border-radius:12px;color:var(--ink);
  font:600 26px/1 "IBM Plex Mono",monospace;letter-spacing:.3em;padding:14px 10px 14px 20px;outline:none;transition:border-color .15s}
.ck-otp-input:focus{border-color:var(--core-brd)}
.ck-otp-err{color:var(--bad);font-size:12.5px}

/* ---- control room ---- */
.ck-room{min-height:100dvh;background:
  radial-gradient(1200px 700px at 88% -10%, rgba(213,173,97,.07), transparent 60%),
  radial-gradient(1000px 620px at -5% 108%, rgba(79,214,196,.06), transparent 60%),
  var(--ground)}
.ck-wrap{max-width:1180px;margin:0 auto;padding:clamp(20px,3.5vw,42px) clamp(16px,3vw,28px) 80px}
.ck-top{display:flex;justify-content:space-between;align-items:flex-start;gap:18px;flex-wrap:wrap;margin-bottom:8px}
.ck-h1{font-size:clamp(34px,5.4vw,54px);line-height:1;margin:.16em 0 .12em}
.ck-h1 .a{color:var(--sx)} .ck-h1 .b{color:var(--c24);font-style:italic}
.ck-sub{color:var(--muted);font-size:14px;max-width:60ch}
.ck-top-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.ck-pill{display:inline-flex;align-items:center;gap:8px;background:var(--panel);border:1px solid var(--line);border-radius:999px;padding:8px 14px;font:500 12.5px/1 "IBM Plex Mono",monospace;color:var(--muted)}
.ck-lock{background:var(--core-bg);border:1px solid var(--core-brd);color:var(--core);border-radius:999px;padding:9px 16px;font:600 12.5px/1 "IBM Plex Sans",sans-serif;cursor:pointer;display:inline-flex;gap:7px;align-items:center;transition:filter .15s}
.ck-lock:hover{filter:brightness(1.15)}

.ck-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin:26px 0 34px}
.ck-stat{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:16px 18px}
.ck-stat .n{font-family:"Cormorant Garamond",serif;font-weight:600;font-size:34px;line-height:1;color:var(--ink)}
.ck-stat .l{font-family:"IBM Plex Mono",monospace;font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--faint);margin-top:6px}
.ck-stat.alert .n{color:var(--sx)}

.ck-section-h{display:flex;align-items:center;gap:10px;margin:30px 0 14px}
.ck-section-h h2{font-family:"Cormorant Garamond",serif;font-weight:600;font-size:24px;margin:0;color:var(--ink)}
.ck-section-h .tag{font-family:"IBM Plex Mono",monospace;font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--faint)}

.ck-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px}
.ck-card{background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:18px 18px 8px;position:relative;overflow:hidden}
.ck-card::before{content:"";position:absolute;inset:0 auto 0 0;width:3px;background:var(--accent, var(--infra))}
.ck-card.sx{--accent:var(--sx)} .ck-card.c24{--accent:var(--c24)} .ck-card.core{--accent:var(--core)}
.ck-card.infra{--accent:var(--infra)} .ck-card.google{--accent:var(--google)} .ck-card.pay{--accent:var(--pay)}
.ck-card-h{display:flex;align-items:baseline;gap:8px;margin-bottom:4px}
.ck-card-h h3{font-family:"IBM Plex Mono",monospace;font-weight:600;font-size:14px;margin:0;color:var(--ink)}
.ck-card-blurb{color:var(--muted);font-size:12.5px;margin:0 0 12px;line-height:1.5}
.ck-links{list-style:none;padding:0;margin:0}
.ck-links li{border-top:1px solid var(--line2)}
.ck-links a{display:flex;align-items:center;gap:12px;padding:11px 4px;text-decoration:none;color:var(--ink);transition:padding-left .15s}
.ck-links a:hover{padding-left:8px}
.ck-links a:hover .arr{opacity:1;transform:translateX(0)}
.ck-ln{flex:1;min-width:0}
.ck-ln .t{font-size:13.5px;font-weight:500;display:flex;align-items:center;gap:8px}
.ck-ln .d{font-size:11.5px;color:var(--faint);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ck-arr{opacity:.4;transform:translateX(-3px);transition:.15s;flex:none;color:var(--faint)}
.ck-links a:hover .ck-arr{opacity:1;transform:translateX(0);color:var(--accent, var(--infra))}
.ck-cfg{font-family:"IBM Plex Mono",monospace;font-size:9px;letter-spacing:.08em;text-transform:uppercase;color:var(--sx);background:var(--sx-bg);border:1px solid var(--sx-brd);border-radius:5px;padding:1px 5px}

.ck-foot{margin-top:44px;padding-top:20px;border-top:1px solid var(--line2);color:var(--faint);font-family:"IBM Plex Mono",monospace;font-size:11.5px;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap}

/* ---- approve (phone) ---- */
.ck-appr{min-height:100dvh;background:var(--ground);display:flex;align-items:center;justify-content:center;padding:20px}
.ck-appr-card{width:min(440px,100%);background:var(--panel);border:1px solid var(--line);border-radius:20px;padding:26px 22px;box-shadow:0 24px 70px -36px rgba(0,0,0,.85)}
.ck-appr h1{font-family:"Cormorant Garamond",serif;font-weight:600;font-size:30px;margin:.2em 0 .1em;color:var(--sx)}
.ck-appr .ck-lede{margin-bottom:18px}
.ck-appr-code{text-align:center;margin:20px 0}
.ck-appr-code .l{font-family:"IBM Plex Mono",monospace;font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:var(--faint)}
.ck-appr-code .c{font-family:"IBM Plex Mono",monospace;font-size:34px;letter-spacing:.32em;font-weight:600;color:var(--ink);padding-left:.32em;margin-top:4px}
.ck-meta{background:var(--panel2);border:1px solid var(--line2);border-radius:12px;padding:12px 14px;margin:16px 0;font-size:12.5px;color:var(--muted);display:grid;gap:6px}
.ck-meta div{display:flex;justify-content:space-between;gap:12px}
.ck-meta b{color:var(--ink);font-weight:500;font-family:"IBM Plex Mono",monospace;font-size:12px;text-align:right;word-break:break-word}
.ck-appr-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:20px}
.ck-approve{background:var(--pay-bg);border:1px solid var(--pay-brd);color:var(--pay);border-radius:12px;padding:14px;font:600 14px/1 "IBM Plex Sans",sans-serif;cursor:pointer;transition:filter .15s}
.ck-deny{background:rgba(226,96,122,.10);border:1px solid rgba(226,96,122,.4);color:var(--bad);border-radius:12px;padding:14px;font:600 14px/1 "IBM Plex Sans",sans-serif;cursor:pointer;transition:filter .15s}
.ck-approve:hover,.ck-deny:hover{filter:brightness(1.18)}
.ck-approve:disabled,.ck-deny:disabled{opacity:.5;cursor:default;filter:none}
.ck-appr-result{text-align:center;padding:20px 0;font-size:15px;color:var(--muted)}
.ck-appr-result .big{font-family:"Cormorant Garamond",serif;font-size:30px;margin-bottom:6px}
.ck-appr-result.ok .big{color:var(--ok)} .ck-appr-result.bad .big{color:var(--bad)}
.ck-warn{font-size:11.5px;color:var(--faint);text-align:center;margin-top:14px;line-height:1.5}
.ck-authlink{display:inline-block;margin-top:8px;color:var(--sx);text-decoration:underline;text-underline-offset:3px;font-size:14px}

@media (max-width:720px){
  .ck-gate-card{grid-template-columns:1fr}
  .ck-gate-side{border-right:none;border-bottom:1px solid var(--line2)}
}
`
