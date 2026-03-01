const splash = document.getElementById('splash-screen'), instr = document.getElementById('instructions-screen'),
      app = document.getElementById('main-app'), grid = document.getElementById('stations-grid'),
      playerZone = document.getElementById('player-zone'), audio = document.getElementById('audio-player'),
      transcript = document.getElementById('transcript-box'), popup = document.getElementById('translation-popup'),
      gameZone = document.getElementById('game-zone'), gameBoard = document.getElementById('game-board'),
      feedbackArea = document.getElementById('quiz-feedback-area'), ptsVal = document.getElementById('points-val');

// PERSISTENCE (Specific to Robberies App)
let lifetimeScore = parseInt(localStorage.getItem('robberiesScore')) || 0;
let completedLessons = JSON.parse(localStorage.getItem('completedRobberiesLessons')) || [];
if(ptsVal) ptsVal.innerText = lifetimeScore;

let wordBucket = []; let currentQ = 0; let attempts = 0; let totalScore = 0; let firstCard = null;

// STATIONS (Matching the exact Colab audio output)
const stations = [
    {file:"01_AntwerpDiamond.mp3", title:"Antwerp Diamond Heist"},
    {file:"02_BakerStreet.mp3", title:"Baker Street Robbery"},
    {file:"03_BancoCentral.mp3", title:"Banco Central Burglary"},
    {file:"04_BrinksMat.mp3", title:"Brink's-Mat Robbery"},
    {file:"05_CarltonHotel.mp3", title:"Carlton Hotel Heist"},
    {file:"06_CentralBankIraq.mp3", title:"Central Bank of Iraq"},
    {file:"07_CityBonds.mp3", title:"City Bonds Robbery"},
    {file:"08_DarEsSalaam.mp3", title:"Dar Es Salaam Heist"},
    {file:"09_DunbarArmored.mp3", title:"Dunbar Armored Robbery"},
    {file:"10_GreatBrinks.mp3", title:"Great Brink's Robbery"},
    {file:"11_GreatTrain.mp3", title:"Great Train Robbery"},
    {file:"12_HarryWinston.mp3", title:"Harry Winston Heist"},
    {file:"13_HattonGarden.mp3", title:"Hatton Garden Heist"},
    {file:"14_IsabellaStewart.mp3", title:"Isabella Stewart Museum"},
    {file:"15_Knightsbridge.mp3", title:"Knightsbridge Depot"},
    {file:"16_LufthansaHeist.mp3", title:"Lufthansa Heist"},
    {file:"17_MillenniumDome.mp3", title:"Millennium Dome Raid"},
    {file:"18_NorthernBank.mp3", title:"Northern Bank Robbery"},
    {file:"19_PierreHotel.mp3", title:"Pierre Hotel Robbery"},
    {file:"20_SecuritasDepot.mp3", title:"Securitas Depot"},
    {file:"21_UnitedCalifornia.mp3", title:"United California Bank"}
];

stations.forEach((s, i) => {
    const btn = document.createElement('div'); btn.className = 'station-tile';
    if(completedLessons.includes(s.file)) btn.classList.add('completed');
    btn.innerHTML = `<b>${i + 1}</b> ${s.title}`;
    btn.onclick = () => { 
        grid.classList.add('hidden'); playerZone.classList.remove('hidden'); 
        document.getElementById('now-playing-title').innerText = s.title; 
        audio.src = s.file; wordBucket = []; 
    };
    grid.appendChild(btn);
});

document.getElementById('btn-start').onclick = () => { splash.classList.add('hidden'); instr.classList.remove('hidden'); };
document.getElementById('btn-enter').onclick = () => { instr.classList.add('hidden'); app.classList.remove('hidden'); };
document.getElementById('btn-back').onclick = () => { location.reload(); };

document.getElementById('ctrl-play').onclick = () => audio.play();
document.getElementById('ctrl-pause').onclick = () => audio.pause();
document.getElementById('ctrl-stop').onclick = () => { audio.pause(); audio.currentTime = 0; };
document.getElementById('btn-blind').onclick = () => { transcript.classList.add('hidden'); gameZone.classList.add('hidden'); audio.play(); };

// --- ALARM SYSTEM BUTTONS ---
document.getElementById('btn-read').onclick = () => {
    if (typeof lessonData === 'undefined') { alert("🚨 FATAL ERROR: Your data.js file did not load!"); return; }
    let fn = decodeURIComponent(audio.src.split('/').pop()); 
    if(!lessonData[fn]) { alert("🚨 ERROR: Could not find text data for " + fn); return; }
    
    const data = lessonData[fn][0];
    transcript.classList.remove('hidden'); gameZone.classList.add('hidden'); transcript.innerHTML = "";
    data.text.split(" ").forEach(w => {
        const span = document.createElement('span'); 
        const clean = w.toLowerCase().replace(/[^a-z0-9ğüşöçı]/gi, "");
        span.innerText = w + " "; span.className = "clickable-word";
        span.onclick = (e) => {
            const tr = data.dict[clean];
            if(tr) {
                if (!wordBucket.some(p => p.en === clean)) wordBucket.push({en: clean, tr: tr});
                popup.innerText = tr; popup.style.left = `${e.clientX}px`; popup.style.top = `${e.clientY - 50}px`;
                popup.classList.remove('hidden'); setTimeout(() => popup.classList.add('hidden'), 2000);
            }
        };
        transcript.appendChild(span);
    });
    audio.play();
};

document.getElementById('btn-game').onclick = () => {
    if (typeof lessonData === 'undefined') { alert("🚨 ERROR: data.js is missing or broken!"); return; }
    let fn = decodeURIComponent(audio.src.split('/').pop()); 
    if(!lessonData[fn]) { alert("🚨 ERROR: Could not find match data for " + fn); return; }

    const lesson = lessonData[fn][0];
    transcript.classList.add('hidden'); gameZone.classList.remove('hidden'); feedbackArea.innerHTML = "";
    gameBoard.innerHTML = ""; firstCard = null; gameBoard.style.display = "grid";
    let set = [...wordBucket];
    for (let k in lesson.dict) { if (set.length >= 8) break; if (!set.some(p => p.en === k)) set.push({en: k, tr: lesson.dict[k]}); }
    let deck = [];
    set.forEach(p => { deck.push({text: p.en, match: p.tr}); deck.push({text: p.tr, match: p.en}); });
    deck.sort(() => Math.random() - 0.5);
    deck.forEach(card => {
        const div = document.createElement('div'); div.className = 'game-card'; div.innerText = card.text;
        div.onclick = () => {
            if (div.classList.contains('correct') || div.classList.contains('selected')) return;
            if (firstCard) {
                if (firstCard.innerText === card.match) {
                    div.classList.add('correct'); firstCard.classList.add('correct'); firstCard = null;
                } else {
                    div.classList.add('wrong'); setTimeout(() => { div.classList.remove('wrong'); firstCard.classList.remove('selected'); firstCard = null; }, 500);
                }
            } else { firstCard = div; div.classList.add('selected'); }
        };
        gameBoard.appendChild(div);
    });
};

document.getElementById('btn-bowling').onclick = () => {
    if (typeof lessonData === 'undefined') { alert("🚨 ERROR: data.js is missing or broken!"); return; }
    let fn = decodeURIComponent(audio.src.split('/').pop()); 
    if(!lessonData[fn]) { alert("🚨 ERROR: Could not find quiz data for " + fn); return; }
    
    const lesson = lessonData[fn][0];
    transcript.classList.add('hidden'); gameZone.classList.remove('hidden'); gameBoard.style.display = "none";
    currentQ = 0; totalScore = 0; attempts = 0;
    runQuiz(lesson);
};

// --- QUIZ LOGIC ---
function runQuiz(lesson) {
    if (currentQ >= 7) { finishQuiz(); return; }
    const qData = lesson.questions[currentQ];
    const storyNum = parseInt(decodeURIComponent(audio.src.split('/').pop()).substring(0,2));
    
    feedbackArea.innerHTML = `
        <div id="quiz-container">
            <div class="score-badge">SCORE: ${totalScore} | Q: ${currentQ+1}/7</div>
            <button id="btn-hear-q" class="mode-btn neon-green">👂 LISTEN TO QUESTION</button>
            <div id="mic-box" class="hidden" style="margin-top:20px;">
                <button id="btn-speak" class="mic-btn">🎤</button>
                <p id="mic-status" style="color:#666; font-weight:bold;">Ready...</p>
            </div>
            <div id="res-area"></div>
        </div>`;

    document.getElementById('btn-hear-q').onclick = () => {
        const utter = new SpeechSynthesisUtterance(qData.q);
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
            if (storyNum % 2 !== 0) {
                utter.voice = voices.find(v => v.name.includes("Male") || v.name.includes("David")) || voices[0];
            } else {
                utter.voice = voices.find(v => v.name.includes("Female") || v.name.includes("Zira") || v.name.includes("Google US English")) || voices[0];
            }
        }
        utter.onend = () => { document.getElementById('mic-box').classList.remove('hidden'); };
        window.speechSynthesis.speak(utter);
    };

    document.getElementById('btn-speak').onclick = function() {
        const btn = this; const status = document.getElementById('mic-status');
        if (window.currentRec) { window.currentRec.abort(); }
        window.currentRec = new (window.webkitSpeechRecognition || window.SpeechRecognition)();
        window.currentRec.lang = 'en-US';
        window.currentRec.interimResults = false;
        window.currentRec.onstart = () => { btn.classList.add('active'); status.innerText = "Listening..."; };
        window.currentRec.onresult = (e) => {
            document.getElementById('mic-box').classList.add('hidden'); 
            const res = e.results[0][0].transcript.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
            const ans = qData.a_en.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
            if (res === ans) {
                let pts = (attempts === 0) ? 20 : 15; totalScore += pts;
                showResult(true, pts === 20 ? "STRIKE! (+20)" : "SPARE! (+15)", qData, lesson);
            } else {
                attempts++;
                if (attempts === 1) { showResult(false, "MISS! TRY AGAIN", qData, lesson, true); }
                else { showResult(false, "MISS! (0 pts)", qData, lesson, false); }
            }
        };
        window.currentRec.onerror = () => { btn.classList.remove('active'); status.innerText = "Error. Try again."; };
        window.currentRec.start();
    };
}

function showResult(isCorrect, msg, qData, lesson, canRetry = false) {
    const area = document.getElementById('res-area');
    area.innerHTML = `<h1 style="color:${isCorrect?'#39ff14':'#f44'}; font-size: 50px;">${msg}</h1>`;
    if (isCorrect || !canRetry) {
        area.innerHTML += `
            <p class="quiz-q-text">Q: ${qData.q}</p>
            <p class="quiz-a-text">EN: ${qData.a_en}</p>
            <p style="color:#888; font-size:30px; font-weight: bold;">TR: ${qData.a_tr}</p>
            <button id="btn-nxt" class="action-btn-large" style="margin-top:30px;">NEXT QUESTION ⮕</button>`;
        document.getElementById('btn-nxt').onclick = () => { currentQ++; attempts = 0; runQuiz(lesson); };
    } else {
        area.innerHTML += `<button id="btn-retry" class="action-btn-large" style="margin-top:30px;">RETRY FOR SPARE</button>`;
        document.getElementById('btn-retry').onclick = () => {
            area.innerHTML = ""; document.getElementById('mic-box').classList.remove('hidden');
            document.getElementById('btn-speak').classList.remove('active');
            document.getElementById('mic-status').innerText = "Ready for Spare...";
        };
    }
}

function finishQuiz() {
    lifetimeScore += totalScore; localStorage.setItem('robberiesScore', lifetimeScore);
    const fn = decodeURIComponent(audio.src.split('/').pop());
    if(!completedLessons.includes(fn)) {
        completedLessons.push(fn); localStorage.setItem('completedRobberiesLessons', JSON.stringify(completedLessons));
    }
    feedbackArea.innerHTML = `<h1 style="color:#ccff00; font-size: 60px;">FINISHED!</h1><h2 style="font-size: 40px;">QUIZ SCORE: ${totalScore}</h2><button onclick="location.reload()" class="action-btn-large">SAVE & RETURN</button>`;
}
