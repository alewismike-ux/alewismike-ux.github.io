/* Phase Nine shared homepage dashboard and per-game cosmetic picker. */
(function(){
'use strict';
const api=window.PhaseNine;if(!api)return;
const games=api.games,names=api.names;
function safe(t){return String(t).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));}
function fmt(x){return Math.floor(Number(x)||0).toLocaleString();}
function notice(msg){const box=document.getElementById('hub-toast');if(box)box.textContent=msg;}
function mountHub(){
 const hub=document.getElementById('arcade-hub');if(!hub)return;
 hub.innerHTML=`<div class="hub-wrap">
 <span class="hub-eyebrow">Phase Nine / Player HQ</span><h2 class="hub-headline">YOUR ARCADE. <span style="color:var(--arcade-accent)">YOUR LEGACY.</span></h2>
 <p class="hub-sub">Play the games, set personal records, earn XP and free credits, unlock skins and maps, and complete a fresh set of daily challenges. Your progress stays in this browser.</p>
 <div class="hub-grid">
 <section class="hub-card wide" aria-labelledby="progress-title"><div class="hub-card-head"><div><h3 id="progress-title">Player Progress</h3><p>One shared arcade profile across all three games.</p></div><span class="hub-tag" id="player-rank">LEVEL 1</span></div><div class="hub-numbers"><div class="hub-number"><b id="player-level">1</b><span>Player level</span></div><div class="hub-number"><b id="player-credits">0</b><span>Arcade credits</span></div><div class="hub-number"><b id="player-played">0</b><span>Games played</span></div></div><div class="meter" aria-label="Level progress"><span id="xp-bar"></span></div><p id="xp-label">0 / 150 XP toward next level</p></section>
 <section class="hub-card" id="leaderboards" aria-labelledby="leaderboard-title"><div class="hub-card-head"><div><h3 id="leaderboard-title">Personal Leaderboards</h3><p>Your five best rounds in this browser.</p></div><span class="hub-tag">LOCAL ONLY</span></div><div class="hub-stack" id="score-boards"></div></section>
 <section class="hub-card" id="daily-challenges" aria-labelledby="daily-title"><div class="hub-card-head"><div><h3 id="daily-title">Daily Challenges</h3><p>Complete objectives to claim +50 XP and +35 credits each.</p></div><span class="hub-tag" id="challenge-date">TODAY</span></div><div class="hub-stack" id="challenge-list"></div></section>
 <section class="hub-card wide" id="rewards" aria-labelledby="rewards-title"><div class="hub-card-head"><div><h3 id="rewards-title">Skins & Maps Reward Shop</h3><p>Spend credits earned by playing. Unlocks are cosmetic, with no real-money purchases.</p></div><span class="hub-tag" id="shop-wallet">0 CREDITS</span></div><div class="shop-controls"><label for="shop-game"><span class="hub-tag">SELECT GAME</span><select id="shop-game"><option value="aim">Aim Trainer</option><option value="runner">Neon Runner</option><option value="racer">Cyber Racer</option></select></label><span class="hub-notice">Unlocked rewards can be equipped here or from the game screen. New skins and maps affect the actual game visuals.</span></div><div class="shop-grid" id="shop-items" style="margin-top:17px"></div><p class="hub-toast" id="hub-toast" role="status" aria-live="polite"></p></section>
 <section class="hub-card wide" id="achievements" aria-labelledby="achievements-title"><div class="hub-card-head"><div><h3 id="achievements-title">Achievements</h3><p>Earn badges by playing, hitting milestones and exploring different games. Each new badge grants 15 credits.</p></div><span id="badge-count" class="hub-tag">0 / 12</span></div><div class="award-grid" id="badges"></div></section>
 <section class="hub-card wide" id="settings" aria-labelledby="settings-title"><div class="hub-card-head"><div><h3 id="settings-title">Settings</h3><p>Customize your arcade experience across all three games.</p></div><span class="hub-tag">THIS DEVICE</span></div><div class="setting-row"><span><b>Sound effects</b><small>Simple feedback tones during games.</small></span><input type="checkbox" id="setting-sound" aria-label="Enable game sound effects"></div><div class="setting-row"><span><b>Visual effects</b><small>Enable or reduce nonessential animations.</small></span><input type="checkbox" id="setting-effects" aria-label="Enable visual effects"></div><div class="setting-row"><span><b>Interface color</b><small>Choose an electric, magenta or arctic theme.</small></span><select id="setting-theme" style="max-width:170px"><option value="electric">Electric blue</option><option value="magenta">Magenta pink</option><option value="arctic">Arctic mint</option></select></div><div class="setting-row"><span><b>Clear arcade progress</b><small>Deletes local records, earned rewards and achievements on this browser only.</small></span><button class="hub-action" id="reset-arcade" type="button">Reset Progress</button></div><p class="hub-notice">No accounts, payment details, or global leaderboards. Private progress may be lost if browser storage is cleared or another device is used.</p></section>
 </div></div>`;
 hub.querySelector('#shop-game').addEventListener('change',renderShop);
 hub.addEventListener('click',ev=>{const el=ev.target.closest('[data-shop-action]');if(!el)return;
   const game=hub.querySelector('#shop-game').value,id=el.dataset.item;
   if(el.dataset.shopAction==='buy'){
     const result=api.buy(id);notice(result.message);
   }else if(el.dataset.shopAction==='equip'){
     notice(api.equip(game,id)?'Equipped! It will appear in your game.':'Unlock this reward first.');
   }renderShop();
 });
 hub.querySelector('#setting-sound').addEventListener('change',ev=>api.setting('sound',ev.target.checked));
 hub.querySelector('#setting-effects').addEventListener('change',ev=>api.setting('effects',ev.target.checked));
 hub.querySelector('#setting-theme').addEventListener('change',ev=>api.setting('theme',ev.target.value));
 hub.querySelector('#reset-arcade').addEventListener('click',()=>{if(confirm('Clear all personal bests, XP, credits and unlocked rewards from this browser? This cannot be undone.')){api.reset();notice('Progress cleared on this device.');}});
 document.addEventListener('phase9:change',renderHub);
 renderHub();
}
function renderShop(){const root=document.getElementById('shop-items');if(!root)return;
 const game=document.getElementById('shop-game').value,p=api.snapshot();
 document.getElementById('shop-wallet').textContent=fmt(p.credits)+' CREDITS';
 root.innerHTML=api.catalog[game].map(it=>{const owned=p.unlocked[it.id],equipped=p.equipped[game+'-'+it.type]===it.id;
 const btn=equipped?'Equipped ✓':owned?'Equip':`Unlock · ${it.price} credits`;
 return `<div class="shop-item"><div class="shop-color" style="--chip:${it.color}" aria-hidden="true"></div><small>${it.type==='skin'?'CHARACTER / TARGET SKIN':'PLAYABLE MAP'}</small><b>${safe(it.label)}</b><small>${it.price===0?'Free starter reward':owned?'Unlocked':`${it.price} credits`}</small><button type="button" class="hub-action ${owned?'':'primary'}" data-shop-action="${owned?'equip':'buy'}" data-item="${safe(it.id)}" ${equipped?'disabled':''}>${btn}</button></div>`;
 }).join('');
}
function renderHub(){if(!document.getElementById('arcade-hub'))return;
 const p=api.snapshot();const level=api.rank();
 document.getElementById('player-level').textContent=level;
 document.getElementById('player-rank').textContent='LEVEL '+level;
 document.getElementById('player-credits').textContent=fmt(p.credits);
 document.getElementById('player-played').textContent=fmt(p.plays);
 document.getElementById('xp-bar').style.width=((p.xp%150)/150*100)+'%';
 document.getElementById('xp-label').textContent=fmt(p.xp%150)+' / 150 XP toward Level '+(level+1)+' · Total '+fmt(p.xp)+' XP';
 document.getElementById('score-boards').innerHTML=games.map(g=>{
 const sorted=p.stats[g].history.slice().sort((a,b)=>b-a).slice(0,5);
 const values=sorted.length?sorted.map((n,i)=>`<small>${i+1}. ${fmt(n)}</small>`).join(' · '):'<small>No completed rounds yet</small>';
 return `<div class="score-row"><div><b>${safe(names[g])}</b><div style="font-size:.77rem;color:#b9cbeb">Best: ${fmt(p.stats[g].best)} · ${values}</div></div><a href="${g}/">Play ↗</a></div>`;
 }).join('');
 document.getElementById('challenge-date').textContent=p.daily.date;
 document.getElementById('challenge-list').innerHTML=games.map(g=>{
  const c=api.challengeFor(g),value=p.daily.progress[g],done=p.daily.completed.includes(g);
  return `<div class="challenge ${done?'done':''}"><b>${safe(names[g])} ${done?'✓':''}</b><small>${safe(c.label)}</small><div class="meter" style="margin:2px 0"><span style="width:${Math.min(100,value/c.target*100)}%"></span></div><small>${fmt(Math.min(value,c.target))} / ${c.target} · ${done?'Reward claimed!':'Earn +50 XP and +35 credits'}</small><a class="hub-action" href="${g}/">${done?'Play again':'Play challenge'} ↗</a></div>`;
 }).join('');
 document.getElementById('badges').innerHTML=api.badges.map(b=>{const owned=p.achievements.includes(b.id);return `<div class="award ${owned?'':'locked'}"><span class="emoji" aria-hidden="true">${b.icon}</span><b>${safe(b.label)} ${owned?'✓':'🔒'}</b><small>${safe(b.desc)}</small></div>`}).join('');
 document.getElementById('badge-count').textContent=p.achievements.length+' / '+api.badges.length+' UNLOCKED';
 for(const key of ['sound','effects'])document.getElementById('setting-'+key).checked=p.settings[key];
 document.getElementById('setting-theme').value=p.settings.theme;
 renderShop();
}
function mountGame(game){const anchor=document.querySelector('.frame');if(!anchor||!games.includes(game))return;
 const box=document.createElement('section');box.className='game-rewards';box.innerHTML=`<h2>🎨 Equip Your Rewards</h2><p>Win games to earn XP and free arcade credits. Choose an unlocked skin and map here, or visit the Reward Shop to unlock more.</p>
 <div class="reward-line"><label>Equipped skin<select id="game-skin"></select></label><label>Equipped map<select id="game-map"></select></label><a href="../#rewards">Browse Reward Shop ↗</a></div>
 <div class="game-info" id="game-credit">LEVEL 1 · 0 CREDITS</div><p class="game-feedback" id="game-feedback" role="status" aria-live="polite"></p>`;
 anchor.insertAdjacentElement('afterend',box);
 function update(){const p=api.snapshot();for(const type of ['skin','map']){
 const select=box.querySelector('#game-'+type);
 select.innerHTML=api.catalog[game].filter(it=>it.type===type).map(it=>`<option value="${it.id}" ${!p.unlocked[it.id]?'disabled':''}>${safe(it.label)} ${p.unlocked[it.id]?'':'🔒 '+it.price+' credits'}</option>`).join('');
 select.value=p.equipped[game+'-'+type];
 }
 box.querySelector('#game-credit').textContent='LEVEL '+api.rank()+' · '+fmt(p.credits)+' FREE CREDITS · '+fmt(p.xp)+' XP';
 }
 for(const type of ['skin','map'])box.querySelector('#game-'+type).addEventListener('change',ev=>{
  if(api.equip(game,ev.target.value)){
   box.querySelector('#game-feedback').textContent='Equipped! Your '+type+' changes are active.';
   document.dispatchEvent(new CustomEvent('phase9:cosmetic'));
  }
 });
 document.addEventListener('phase9:change',update);update();
 window.PhaseNineGameReward=function(score,detail){
   const reward=api.record(game,score,detail);
   box.querySelector('#game-feedback').textContent=`Round finished! +${reward.gainedXp} XP · +${reward.gainedCredits} arcade credits${reward.challengeCompleted?' · Daily challenge completed!':''}${reward.newBadges.length?' · Badge: '+reward.newBadges.join(', '):''}`;
   api.tone(720,.13);return reward;
 };
}
window.PhaseNineArcade={mountHub,mountGame};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{if(document.getElementById('arcade-hub'))mountHub();},{once:true});
else if(document.getElementById('arcade-hub'))mountHub();
})();