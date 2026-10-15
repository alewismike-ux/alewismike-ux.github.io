/* Phase Nine expansion: solo campaign, personal cups, profile and launcher. */
(function(){
'use strict';
const api=window.PhaseNine;if(!api)return;
const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const label={aim:'Aim Trainer',runner:'Neon Runner',racer:'Cyber Racer'};
const href=(g,m='classic')=>`${g}/?mode=${encodeURIComponent(m)}`;
const availableMode=(g,m)=>api.modes[g].some(x=>x.id===m);
function inject(){
 const hub=document.querySelector('#arcade-hub .hub-grid');if(!hub)return;
 const area=document.createElement('div');area.className='next-features';area.innerHTML=`
 <section class="hub-card wide next-profile" id="player-profile" aria-labelledby="prof-title"><div class="hub-card-head"><div><h3 id="prof-title">Player Identity</h3><p>Pick a nickname, avatar and banner — saved privately in this browser.</p></div><span class="hub-tag">CUSTOMIZATION</span></div>
 <div class="identity-layout"><div class="identity-card" id="identity-card"><span class="identity-avatar" id="identity-avatar" aria-hidden="true">🚀</span><strong id="identity-name">PILOT</strong><small id="identity-level">LEVEL 1 • NEW CHALLENGER</small></div>
 <form id="identity-form" class="identity-fields"><label>Display nickname <input id="identity-input" maxlength="18" autocomplete="off" placeholder="PILOT" aria-describedby="identity-note"/></label><label>Avatar<select id="identity-icon"></select></label><label>Banner<select id="identity-banner"></select></label><button type="submit" class="hub-action primary">Save player style</button><small id="identity-note">Use a nickname, not your real name or contact information. This is not a public profile.</small><p id="identity-status" class="hub-toast" aria-live="polite"></p></form></div></section>
 <section class="hub-card wide" id="game-library" aria-labelledby="library-title"><div class="hub-card-head"><div><h3 id="library-title">Game Library & Modes</h3><p>Nine playable variations across the three original games.</p></div><span class="hub-tag">PLAY INSTANTLY</span></div><div class="next-modes" id="mode-library"></div></section>
 <section class="hub-card wide" id="solo-cups" aria-labelledby="cups-title"><div class="hub-card-head"><div><h3 id="cups-title">Solo Cup Challenges</h3><p>Beat each week's target and track your personal record. Not online multiplayer.</p></div><span class="hub-tag" id="cup-week">WEEKLY</span></div><div class="next-modes" id="cup-list"></div></section>
 <section class="hub-card wide" id="story-missions" aria-labelledby="story-title"><div class="hub-card-head"><div><h3 id="story-title">The Signal — Story Campaign</h3><p>Six connected missions. Complete one chapter to unlock the next.</p></div><span class="hub-tag" id="story-progress">0 / 6 CLEARED</span></div><div class="next-story" id="story-list"></div></section>`;
 hub.append(area);
 const modal=document.createElement('dialog');modal.id='arcade-launcher';modal.className='arcade-launcher';modal.innerHTML=`<button type="button" class="launcher-close" aria-label="Close game launcher">×</button><span class="hub-eyebrow">Phase Nine / Arcade Launcher</span><h2>READY, PLAYER?</h2><p>Choose your next mission. Your level, XP and credits are kept on this device.</p><div id="launcher-games" class="launcher-games"></div><div class="launcher-foot"><button id="launcher-full" class="hub-action" type="button">⛶ Fullscreen launcher</button><button class="hub-action" type="button" data-launch-close>Close</button></div><p class="hub-notice">Tip: Press L to open the launcher, or Escape to close. On phones you can add this website to your home screen through your browser menu.</p>`;
 document.body.append(modal);
 const launcherBtn=document.createElement('button');launcherBtn.className='launch-floating';launcherBtn.id='launch-floating';launcherBtn.type='button';launcherBtn.textContent='🎮 PLAY GAMES';launcherBtn.setAttribute('aria-label','Open Phase Nine game launcher');document.body.append(launcherBtn);
 document.getElementById('identity-icon').innerHTML=api.avatars.map(a=>`<option value="${a.id}">${a.icon} ${a.label}</option>`).join('');
 document.getElementById('identity-banner').innerHTML=api.banners.map(b=>`<option value="${b.id}">${b.label}</option>`).join('');
 const form=document.getElementById('identity-form');form.addEventListener('submit',e=>{e.preventDefault();api.profile({name:document.getElementById('identity-input').value,avatar:document.getElementById('identity-icon').value,banner:document.getElementById('identity-banner').value});document.getElementById('identity-status').textContent='Saved! Your player style is active.';});
 function open(){if(!modal.open)modal.showModal();}
 function close(){if(modal.open)modal.close();}
 launcherBtn.addEventListener('click',open);modal.querySelector('.launcher-close').addEventListener('click',close);modal.querySelector('[data-launch-close]').addEventListener('click',close);
 modal.addEventListener('click',e=>{if(e.target===modal)close()});
 modal.querySelector('#launcher-full').addEventListener('click',()=>{if(!document.fullscreenElement)modal.requestFullscreen?.().catch(()=>{});else document.exitFullscreen?.().catch(()=>{});});
 document.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='l'&&!e.ctrlKey&&!e.altKey&&!e.metaKey&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)&&!modal.open){e.preventDefault();open();}});
 document.addEventListener('phase9:change',render);
 render();
}
function render(){const p=api.snapshot(),root=document.getElementById('player-profile');if(!root)return;
 const avatar=api.avatars.find(a=>a.id===p.profile.avatar)||api.avatars[0];
 const banner=api.banners.find(a=>a.id===p.profile.banner)||api.banners[0];
 const identity=document.getElementById('identity-card');identity.style.setProperty('--identity-color',banner.color);
 document.getElementById('identity-avatar').textContent=avatar.icon;
 document.getElementById('identity-name').textContent=p.profile.name;
 document.getElementById('identity-level').textContent='LEVEL '+api.rank()+' • '+(api.rank()>=10?'ARCADE LEGEND':api.rank()>=5?'RISING HERO':'NEW CHALLENGER');
 if(document.activeElement!==document.getElementById('identity-input'))document.getElementById('identity-input').value=p.profile.name;
 document.getElementById('identity-icon').value=p.profile.avatar;
 document.getElementById('identity-banner').value=p.profile.banner;
 const modeHtml=api.games.map(g=>`<div class="next-game"><b>${safe(label[g])}</b><div class="next-options">${api.modes[g].map(m=>`<a class="hub-action" href="${href(g,m.id)}"><span>${safe(m.name)}</span><small>${safe(m.desc)}</small><em>PLAY ↗</em></a>`).join('')}</div></div>`).join('');
 document.getElementById('mode-library').innerHTML=modeHtml;
 document.getElementById('cup-week').textContent='WEEK OF '+api.weekString();
 document.getElementById('cup-list').innerHTML=api.games.map(g=>{const cup=api.weeklyCup(g),best=p.weekly.bests[g],done=p.weekly.claimed.includes(g);return `<div class="next-game next-cup"><b>${safe(label[g])} ${done?'🏆':''}</b><p>Weekly goal: <strong>${cup.target} points</strong></p><p>Your record this week: <strong>${best}</strong></p><div class="meter"><span style="width:${Math.min(100,best/cup.target*100)}%"></span></div><small>${done?'✓ Weekly reward claimed':`First clear earns +${cup.xp} XP and +${cup.credits} credits`}</small><a class="hub-action primary" href="${href(g)}">Try Solo Cup ↗</a></div>`}).join('');
 document.getElementById('story-progress').textContent=p.story.completed.length+' / '+api.missions.length+' CLEARED';
 const next=api.activeMission();
 document.getElementById('story-list').innerHTML=api.missions.map((m,i)=>{const completed=p.story.completed.includes(m.id),unlocked=completed||m.id===next?.id;return `<div class="story-chapter ${completed?'cleared':unlocked?'active':'locked'}"><span class="story-number">${String(i+1).padStart(2,'0')}</span><div><b>${safe(m.title)}</b><p>${safe(m.description)}</p><small>+${m.xp} XP • +${m.credits} credits</small></div><div>${completed?'<span class="hub-tag">✓ CLEARED</span>':unlocked?`<a class="hub-action primary" href="${href(m.game,m.mode)}">Play Chapter ↗</a>`:'<span class="hub-tag">🔒 LOCKED</span>'}</div></div>`}).join('');
 document.getElementById('launcher-games').innerHTML=api.games.map(g=>`<a class="launcher-game" href="${href(g)}"><strong>${safe(label[g])}</strong><span>Best ${p.stats[g].best} • ${p.stats[g].plays} rounds</span><b>PLAY NOW ↗</b></a>`).join('');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',inject,{once:true});else inject();
})();