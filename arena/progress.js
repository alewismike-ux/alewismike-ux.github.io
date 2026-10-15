/* Phase Nine local arcade data. No server, accounts, or purchases. */
(function () {
  'use strict';
  const KEY = 'phase9_arcade_profile_v2';
  const games = ['aim', 'runner', 'racer'];
  const names = {aim: 'Aim Trainer', runner: 'Neon Runner', racer: 'Cyber Racer'};
  const catalog = {
    aim: [
      {id:'aim-cyan', type:'skin', label:'Ion Cyan', price:0, color:'#6feaff'},
      {id:'aim-rose', type:'skin', label:'Plasma Pink', price:70, color:'#ff73ca'},
      {id:'aim-gold', type:'skin', label:'Solar Gold', price:150, color:'#ffdf77'},
      {id:'aim-grid', type:'map', label:'Orbit Grid', price:0, color:'#122c51'},
      {id:'aim-nebula', type:'map', label:'Nebula Field', price:100, color:'#3b1b60'},
      {id:'aim-ice', type:'map', label:'Arctic Station', price:180, color:'#0c4f60'}
    ],
    runner: [
      {id:'runner-cyan', type:'skin', label:'Neon Scout', price:0, color:'#72e5ff'},
      {id:'runner-violet', type:'skin', label:'Voltage Runner', price:75, color:'#c18cff'},
      {id:'runner-orange', type:'skin', label:'Solar Sprinter', price:155, color:'#ffae6e'},
      {id:'runner-city', type:'map', label:'Midnight City', price:0, color:'#15375d'},
      {id:'runner-sunset', type:'map', label:'Synthwave Sunset', price:110, color:'#933f84'},
      {id:'runner-ice', type:'map', label:'Frozen Skyline', price:180, color:'#38799b'}
    ],
    racer: [
      {id:'racer-cyan', type:'skin', label:'Cyber Blue', price:0, color:'#6beaff'},
      {id:'racer-violet', type:'skin', label:'Royal Circuit', price:85, color:'#b18cff'},
      {id:'racer-gold', type:'skin', label:'Golden Nitro', price:160, color:'#ffd675'},
      {id:'racer-highway', type:'map', label:'Hyperway', price:0, color:'#214b6a'},
      {id:'racer-sunset', type:'map', label:'Afterglow Run', price:110, color:'#82426a'},
      {id:'racer-space', type:'map', label:'Cosmic Drift', price:190, color:'#423c92'}
    ]
  };
  const badges = [
    {id:'first', icon:'⚡',label:'First Run',desc:'Finish your first game.',check:p=>p.plays>=1},
    {id:'five',icon:'🎮',label:'Arcade Regular',desc:'Complete 5 games.',check:p=>p.plays>=5},
    {id:'twenty',icon:'🏆',label:'Veteran Pilot',desc:'Complete 20 games.',check:p=>p.plays>=20},
    {id:'three',icon:'🌌',label:'All-Rounder',desc:'Play all 3 games.',check:p=>games.every(g=>p.stats[g].plays>0)},
    {id:'aim12',icon:'🎯',label:'Steady Aim',desc:'Hit 12 targets in one round.',check:p=>p.stats.aim.best>=12},
    {id:'aim25',icon:'💠',label:'Target Master',desc:'Hit 25 targets in one round.',check:p=>p.stats.aim.best>=25},
    {id:'run200',icon:'🏃',label:'On the Move',desc:'Reach 200 in Neon Runner.',check:p=>p.stats.runner.best>=200},
    {id:'run600',icon:'🚀',label:'Neon Legend',desc:'Reach 600 in Neon Runner.',check:p=>p.stats.runner.best>=600},
    {id:'race200',icon:'🏎️',label:'Street Starter',desc:'Reach 200 in Cyber Racer.',check:p=>p.stats.racer.best>=200},
    {id:'race600',icon:'🥇',label:'Hyperway Hero',desc:'Reach 600 in Cyber Racer.',check:p=>p.stats.racer.best>=600},
    {id:'level5',icon:'⭐',label:'Rising Star',desc:'Reach level 5.',check:p=>Math.floor(p.xp/150)+1>=5},
    {id:'collector',icon:'🎨',label:'Skin Collector',desc:'Unlock 3 cosmetics.',check:p=>Object.keys(p.unlocked).filter(x=>p.unlocked[x]&&!x.endsWith('-cyan')&&!x.endsWith('-city')&&!x.endsWith('-grid')&&!x.endsWith('-highway')).length>=3}
  ];
  function dayString(){const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');}
  const challenges = {
    aim: [{label:'Hit 8 targets in one round',metric:'score',target:8},{label:'Hit 14 targets in one round',metric:'score',target:14},{label:'Hit 20 targets in one round',metric:'score',target:20}],
    runner: [{label:'Score 100 in one run',metric:'score',target:100},{label:'Collect 3 orbs in one run',metric:'collect',target:3},{label:'Score 250 in one run',metric:'score',target:250}],
    racer: [{label:'Score 120 in one race',metric:'score',target:120},{label:'Collect 3 energy cells in one race',metric:'collect',target:3},{label:'Score 300 in one race',metric:'score',target:300}]
  };
  function challengeFor(g){const day=dayString();const seed=Number(day.replace(/-/g,''));return {...challenges[g][(seed+games.indexOf(g))%3],game:g};}
  function fresh(){
    return {version:2,xp:0,credits:0,plays:0,unlocked:{},equipped:{},achievements:[],
      settings:{theme:'electric',sound:true,effects:true},
      stats:Object.fromEntries(games.map(g=>[g,{best:0,plays:0,history:[]} ])),
      daily:{date:dayString(),progress:{aim:0,runner:0,racer:0},completed:[]}};
  }
  function defaults(p){for(const g of games){for(const type of ['skin','map']){
    const item=catalog[g].find(x=>x.type===type&&x.price===0);if(item){p.unlocked[item.id]=true;
    if(!catalog[g].some(x=>x.id===p.equipped[g+'-'+type]&&x.type===type&&p.unlocked[x.id]))p.equipped[g+'-'+type]=item.id;}
  }}return p;}
  function read(){let data={};try{data=JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch{}
    const p=fresh();for(const k of ['xp','credits','plays'])if(Number.isFinite(data[k]))p[k]=Math.max(0,Math.floor(data[k]));
    if(data.stats&&typeof data.stats==='object')for(const g of games){let t=data.stats[g];if(t&&typeof t==='object'){
      p.stats[g].best=Math.max(0,Math.floor(Number(t.best)||0));p.stats[g].plays=Math.max(0,Math.floor(Number(t.plays)||0));
      if(Array.isArray(t.history))p.stats[g].history=t.history.filter(x=>Number.isFinite(x)&&x>=0).slice(0,30);
    }}
    if(data.unlocked&&typeof data.unlocked==='object')for(const item of Object.values(catalog).flat())if(data.unlocked[item.id]===true)p.unlocked[item.id]=true;
    if(data.equipped&&typeof data.equipped==='object')p.equipped={...data.equipped};
    if(Array.isArray(data.achievements))p.achievements=data.achievements.filter(id=>badges.some(x=>x.id===id));
    if(data.settings&&typeof data.settings==='object')p.settings={theme:['electric','magenta','arctic'].includes(data.settings.theme)?data.settings.theme:'electric',sound:data.settings.sound!==false,effects:data.settings.effects!==false};
    if(data.daily?.date===dayString()){
      p.daily={date:dayString(),progress:{aim:0,runner:0,racer:0},completed:[]};
      for(const g of games)p.daily.progress[g]=Math.max(0,Number(data.daily.progress?.[g])||0);
      if(Array.isArray(data.daily.completed))p.daily.completed=data.daily.completed.filter(g=>games.includes(g));
    }
    // Keep existing personal records from the first Phase Nine release.
    for(const g of games){let old=0;try{old=Math.floor(Number(localStorage.getItem('phase9_'+g+'_best'))||0)}catch{}
      if(old>p.stats[g].best)p.stats[g].best=old;
    }
    return defaults(p);
  }
  let state=read();
  function persist(){try{localStorage.setItem(KEY,JSON.stringify(state));return true}catch{return false}}
  function notify(){document.dispatchEvent(new CustomEvent('phase9:change',{detail:snapshot()}));}
  function snapshot(){return JSON.parse(JSON.stringify(state));}
  function rank(){return Math.floor(state.xp/150)+1;}
  function awardBadges(){let freshBadges=[];for(const b of badges)if(!state.achievements.includes(b.id)&&b.check(state)){
    state.achievements.push(b.id);state.credits+=15;freshBadges.push(b.label);
  }return freshBadges;}
  function record(game,points,details={}){
    if(!games.includes(game))return {ok:false};
    const score=Math.max(0,Math.floor(Number(points)||0));if(!Number.isFinite(score))return {ok:false};
    const collect=Math.max(0,Math.floor(Number(details.collect)||0));
    state.stats[game].plays++;state.plays++;state.stats[game].best=Math.max(state.stats[game].best,score);
    state.stats[game].history.unshift(score);state.stats[game].history=state.stats[game].history.slice(0,20);
    const gainedXp=Math.min(100,15+Math.floor(score/(game==='aim'?1:25)));
    const gainedCredits=Math.min(60,8+Math.floor(score/(game==='aim'?2:35)));
    state.xp+=gainedXp;state.credits+=gainedCredits;
    const daily=challengeFor(game),value=daily.metric==='collect'?collect:score;
    state.daily.progress[game]=Math.max(state.daily.progress[game],value);
    let challengeCompleted=false;
    if(state.daily.progress[game]>=daily.target&&!state.daily.completed.includes(game)){
      state.daily.completed.push(game);state.xp+=50;state.credits+=35;challengeCompleted=true;
    }
    const newBadges=awardBadges();persist();notify();
    return {ok:true,gainedXp,gainedCredits: gainedCredits+(challengeCompleted?35:0),challengeCompleted,newBadges,level:rank()};
  }
  function buy(id){const item=Object.values(catalog).flat().find(x=>x.id===id);if(!item)return {ok:false,message:'Unknown reward'};
    if(state.unlocked[id])return {ok:true,message:'Already unlocked'};
    if(state.credits<item.price)return {ok:false,message:'Not enough arcade credits'};
    state.credits-=item.price;state.unlocked[id]=true;awardBadges();persist();notify();return {ok:true,message:'Reward unlocked!'};
  }
  function equip(game,id){if(!games.includes(game))return false;const item=catalog[game].find(x=>x.id===id);if(!item||!state.unlocked[id])return false;
    state.equipped[game+'-'+item.type]=id;persist();notify();return true;
  }
  function equipItem(game,type){return catalog[game].find(x=>x.id===state.equipped[game+'-'+type])||catalog[game].find(x=>x.type===type&&x.price===0);}
  function setting(name,value){if(!['theme','sound','effects'].includes(name))return false;
    if(name==='theme'&&!['electric','magenta','arctic'].includes(value))return false;
    if(name!=='theme'&&typeof value!=='boolean')return false;
    state.settings[name]=value;persist();apply();notify();return true;
  }
  function apply(){const s=state.settings;document.documentElement.dataset.arcadeTheme=s.theme;document.documentElement.classList.toggle('arcade-lowfx',!s.effects);}
  let audio;
  function tone(freq=550,duration=.055){if(!state.settings.sound)return;try{
    const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;
    audio=audio||new Audio();if(audio.state==='suspended')audio.resume().catch(()=>{});
    const osc=audio.createOscillator(),gain=audio.createGain(),t=audio.currentTime;
    osc.type='sine';osc.frequency.value=freq;gain.gain.setValueAtTime(.045,t);gain.gain.exponentialRampToValueAtTime(.001,t+duration);
    osc.connect(gain);gain.connect(audio.destination);osc.start(t);osc.stop(t+duration);
  }catch{}}
  function reset(){try{localStorage.removeItem(KEY);for(const g of games)localStorage.removeItem('phase9_'+g+'_best')}catch{}
    state=defaults(fresh());persist();apply();notify();}
  // Save the migration and initial free cosmetics.
  persist();if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
  window.PhaseNine={games,names,catalog,badges,snapshot,rank,record,buy,equip,equipItem,setting,tone,reset,challengeFor,dayString};
})();