// Simple client-side mapper: feelings -> array of verses
const FEELINGS_DB = {
  anxious: [
    {text: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.", ref: "Philippians 4:6"},
    {text: "Cast all your anxiety on him because he cares for you.", ref: "1 Peter 5:7"}
  ],
  lonely: [
    {text: "The LORD is near to the brokenhearted and saves the crushed in spirit.", ref: "Psalm 34:18"},
    {text: "I will never leave you nor forsake you.", ref: "Hebrews 13:5"}
  ],
  overwhelmed: [
    {text: "Come to me, all who labor and are heavy laden, and I will give you rest.", ref: "Matthew 11:28"},
    {text: "When you pass through the waters, I will be with you.", ref: "Isaiah 43:2"}
  ],
  joyful: [
    {text: "Rejoice in the Lord always; again I will say, Rejoice.", ref: "Philippians 4:4"},
    {text: "The joy of the Lord is your strength.", ref: "Nehemiah 8:10"}
  ],
  thankful: [
    {text: "Give thanks to the LORD, for he is good; his steadfast love endures forever.", ref: "Psalm 107:1"},
    {text: "Do not be anxious about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God.", ref: "Philippians 4:6"}
  ]
};

// Optional: If you want the whole Bible available, place a public-domain KJV JSON
// file named `bible_kjv.json` in the project root (structure: array of {book,chapter,verse,text}).
// The script will attempt to fetch it on load and allow simple text searches.
let FULL_BIBLE = null;
fetch('bible_kjv.json').then(r=>{
  if(!r.ok) throw new Error('no bible file');
  return r.json();
}).then(j=>{ FULL_BIBLE = j; console.info('Full Bible loaded:', j.length, 'verses') }).catch(()=>{/* no full bible available */});

function normalize(s){
  return (s||"").toLowerCase().trim();
}

function findMatches(input){
  input = normalize(input);
  if(!input) return null;
  // exact key match
  if(FEELINGS_DB[input]) return {key:input, verses:FEELINGS_DB[input]};
  // fuzzy: find which key appears in input
  for(const key of Object.keys(FEELINGS_DB)){
    if(input.includes(key)) return {key, verses:FEELINGS_DB[key]};
  }
  // fallback: keyword mapping
  const synonyms = {
    "sad":"lonely","depressed":"lonely","alone":"lonely",
    "stressed":"anxious","worry":"anxious","worried":"anxious",
    "grateful":"thankful","blessed":"thankful"
  };
  for(const [k,v] of Object.entries(synonyms)){
    if(input.includes(k)){
      const mapped = v;
      return {key:mapped, verses:FEELINGS_DB[mapped]};
    }
  }
  return null;
}

function pickRandom(arr){return arr[Math.floor(Math.random()*arr.length)];}

document.addEventListener('DOMContentLoaded',()=>{
  const form = document.getElementById('feel-form');
  const input = document.getElementById('feel-input');
  const result = document.getElementById('result');
  const title = document.getElementById('feeling-title');
  const verseRef = document.getElementById('verse-ref');
  const anotherBtn = document.getElementById('another-btn');
  const copyBtn = document.getElementById('copy-btn');

  let lastMatch = null;

  if(form && input){
    form.addEventListener('submit',e=>{
    e.preventDefault();
    const val = input.value;
    const match = findMatches(val);
    lastMatch = match;
    if(match){
      const verses = pickSeveral(match.verses, 3);
      showResults(match.key, verses);
    } else {
      // no match -> show gentle guidance with two verses
      const verses = [
        {text: 'Seek the LORD while he may be found; call upon him while he is near.', ref: 'Isaiah 55:6'},
        {text: 'Be still and know that I am God.', ref: 'Psalm 46:10'}
      ];
      showResults('seeking', verses);
    }
    });
  }

  if(anotherBtn){
    anotherBtn.addEventListener('click',()=>{
      if(!lastMatch) return;
      const verses = pickSeveral(lastMatch.verses, 3);
      showResults(lastMatch.key, verses);
    });
  }

  if(copyBtn){
    copyBtn.addEventListener('click',()=>{
      const items = Array.from(document.querySelectorAll('.verses-list .verse'))
        .map(v=> {
          const p = v.querySelector('p');
          const r = v.querySelector('.ref');
          return (p? p.textContent : '') + (r? (' — ' + r.textContent) : '');
        }).join('\n\n');
      navigator.clipboard?.writeText(items);
    });
  }

  function showResults(key, verses){
    result.hidden = false;
    title.textContent = capitalize(key).replace(/_/g,' ');
    const list = document.getElementById('verses-list');
    list.innerHTML = '';
    verses.forEach(v=>{
      const div = document.createElement('div');
      div.className = 'verse';
      div.innerHTML = `<p>${v.text}</p><div class="ref">${v.ref}</div>`;
      list.appendChild(div);
    });
    verseRef.textContent = verses.map(v=>v.ref).join(' | ');
    // if a result image element exists, set an image, otherwise skip (images removed)
    const images = {
      anxious: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=1200&auto=format&fit=crop',
      lonely: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=1200&auto=format&fit=crop',
      overwhelmed: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop',
      joyful: 'https://images.unsplash.com/photo-1506765515384-028b60a970df?q=80&w=1200&auto=format&fit=crop',
      thankful: 'https://images.unsplash.com/photo-1504198453319-5ce911bafcde?q=80&w=1200&auto=format&fit=crop',
      seeking: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop'
    };
    const imgEl = document.getElementById('result-image');
    if(imgEl){
      imgEl.src = images[key] || images['seeking'];
      imgEl.alt = key + ' image';
    }
  }

  // simple fallback search over loaded FULL_BIBLE if present
  function searchFullBible(query, maxResults=3){
    if(!FULL_BIBLE) return [];
    const q = normalize(query);
    const out = [];
    for(const v of FULL_BIBLE){
      if(v.text && v.text.toLowerCase().includes(q)){
        out.push({text:v.text, ref:`${v.book} ${v.chapter}:${v.verse}`});
        if(out.length>=maxResults) break;
      }
    }
    return out;
  }

  function pickSeveral(arr, n){
    const out = [];
    const copy = arr.slice();
    while(out.length < n && copy.length){
      const i = Math.floor(Math.random()*copy.length);
      out.push(copy.splice(i,1)[0]);
    }
    return out;
  }

  function capitalize(s){ return (s||'').charAt(0).toUpperCase()+ (s||'').slice(1)}
});
