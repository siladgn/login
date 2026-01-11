// --- VERİTABANI VE KULLANICI YÖNETİMİ ---
let storedUsers = localStorage.getItem("casinoUsers");
let users = storedUsers ? JSON.parse(storedUsers) : [
    { userid: 1, username: "admin", email: "admin@casino.com", creditNo: "0000", password: "123", balance: 50000 }
];

let currentUser = null; 

function saveData() {
    localStorage.setItem("casinoUsers", JSON.stringify(users));
}

window.addEventListener('load', function() {
    // Animasyon süresi 3.5 saniye
    setTimeout(() => {
        const intro = document.getElementById("intro-screen");
        const startScreen = document.getElementById("start-screen");
        if (intro) intro.style.opacity = "0";
        setTimeout(() => {
            if (intro) intro.style.display = "none";
            if (startScreen) startScreen.classList.remove("hidden");
        }, 1000); 
    }, 3500);

    generatePool(); 
    setupEnterKeySupport();
});

function setupEnterKeySupport() {
    const loginInputs = ["login-username", "login-password"];
    loginInputs.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.addEventListener("keypress", (e) => { if (e.key === "Enter") { e.preventDefault(); login(); } });
    });

    const regInputs = ["reg-username", "reg-email", "reg-credit", "reg-amount", "reg-password"];
    regInputs.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.addEventListener("keypress", (e) => { if (e.key === "Enter") { e.preventDefault(); registerUser(); } });
    });
}

function goToLoginScreen() {
    document.getElementById("start-screen").classList.add("hidden");
    document.getElementById("login-container").classList.remove("hidden");
}

function goBackToStart() {
    document.getElementById("login-container").classList.add("hidden");
    document.getElementById("register-container").classList.add("hidden");
    document.getElementById("start-screen").classList.remove("hidden");
    document.getElementById("login-error").innerText = "";
    document.getElementById("reg-error").innerText = "";
    document.getElementById("reg-success").innerText = "";
}

function showRegister() {
    document.getElementById("login-container").classList.add("hidden");
    document.getElementById("register-container").classList.remove("hidden");
}

function showLogin() {
    document.getElementById("register-container").classList.add("hidden");
    document.getElementById("login-container").classList.remove("hidden");
}

function registerUser() {
    const username = document.getElementById("reg-username").value;
    const email = document.getElementById("reg-email").value;
    const amountInput = document.getElementById("reg-amount").value;
    const password = document.getElementById("reg-password").value;
    const errorMsg = document.getElementById("reg-error");
    const successMsg = document.getElementById("reg-success");

    if (!username || !password || !email || !amountInput) {
        errorMsg.innerText = "Lütfen tüm alanları doldurunuz!"; return;
    }
    const initialBalance = parseInt(amountInput);
    if (isNaN(initialBalance) || initialBalance <= 0) {
        errorMsg.innerText = "Geçersiz tutar!"; return;
    }
    if (users.find(u => u.username === username)) {
        errorMsg.innerText = "Kullanıcı adı alınmış!"; return;
    }

    const newUser = { userid: Math.floor(Math.random() * 100000), username, password, email, balance: initialBalance };
    users.push(newUser);
    saveData();
    
    successMsg.innerText = "Kayıt Başarılı!";
    errorMsg.innerText = "";
    setTimeout(() => { showLogin(); document.getElementById("login-username").value = username; }, 1500);
}

function login() {
    const userInp = document.getElementById("login-username").value;
    const passInp = document.getElementById("login-password").value;
    const errorMsg = document.getElementById("login-error");
    
    const user = users.find(u => u.username === userInp);

    if (user && user.password === passInp) {
        currentUser = user;
        showGameScreen();
        errorMsg.innerText = "";
    } else {
        errorMsg.innerText = "Hatalı kullanıcı adı veya şifre!";
    }
}

function showGameScreen() {
    document.getElementById("login-container").classList.add("hidden");
    document.getElementById("start-screen").classList.add("hidden");
    document.getElementById("game-screen").classList.remove("hidden");
    
    document.getElementById("welcome-msg").innerText = currentUser.username;
    updateGlobalBalance(); 
    backToLobby(); 
}

function updateGlobalBalance() {
    if(!currentUser) return;
    document.getElementById("balance").innerText = currentUser.balance;
    saveData();
}

function openGame(gameName) {
    document.getElementById('lobby-view').classList.add('hidden');
    if (gameName === 'slot') {
        document.getElementById('view-slot').classList.remove('hidden');
        updateDisplay();
    } else if (gameName === 'bj') {
        document.getElementById('view-bj').classList.remove('hidden');
    } else if (gameName === 'roulette') {
        document.getElementById('view-roulette').classList.remove('hidden');
        createWheel();
        updateRouletteUI();
        setTimeout(startTutorial, 500); // Oyunu açınca öğreticiyi başlat
    }
}

function backToLobby() {
    document.getElementById('view-slot').classList.add('hidden');
    document.getElementById('view-bj').classList.add('hidden');
    document.getElementById('view-roulette').classList.add('hidden');
    document.getElementById('lobby-view').classList.remove('hidden');
}

/* =========================================
   --- SLOT OYUN MOTORU --- 
   ========================================= */
let betAmount = 10;
let isSpinning = false;
const symbolWeights = { "🍋": 45, "🍒": 25, "🔔": 15, "💎": 10, "7️⃣": 5 };
const weightedPool = [];

function generatePool() {
    weightedPool.length = 0;
    for (let symbol in symbolWeights) {
        for (let i = 0; i < symbolWeights[symbol]; i++) {
            weightedPool.push(symbol);
        }
    }
}

function getRandomSymbol() {
    const randomIndex = Math.floor(Math.random() * weightedPool.length);
    return weightedPool[randomIndex];
}

function updateDisplay() {
    const betEl = document.getElementById("bet-val");
    if (betEl) betEl.innerText = betAmount;
    updateGlobalBalance();
}

function changeBet(amount) {
    if (isSpinning) return;
    let newBet = betAmount + amount;
    if (newBet >= 10 && newBet <= currentUser.balance) {
        betAmount = newBet;
        updateDisplay();
    }
}

function maxBet() {
    if (isSpinning) return;
    if (currentUser.balance > 0) {
        betAmount = currentUser.balance;
        updateDisplay();
    }
}

function togglePayTable() {
    const modal = document.getElementById("paytable-modal");
    if (modal) modal.classList.toggle("hidden");
}

function spin() {
    const spinBtn = document.getElementById("spin-btn");
    const winValDisplay = document.getElementById("win-val");
    const spinSound = document.getElementById("spinSound");
    const stopSound = document.getElementById("reelStopSound");

    if (isSpinning) return;
    if (currentUser.balance < betAmount) { alert("YETERSİZ BAKİYE!"); return; }

    isSpinning = true;
    currentUser.balance -= betAmount;
    updateDisplay();
    
    if (winValDisplay) winValDisplay.innerText = "0";
    if (spinBtn) spinBtn.disabled = true;

    try { if (spinSound) { spinSound.currentTime = 0; spinSound.volume = 0.5; spinSound.play().catch(e => {}); } } catch (e) {}

    const columns = document.querySelectorAll('.reel-col');
    columns.forEach((col, colIndex) => {
        const slotsInCol = col.querySelectorAll('.symbol-slot');
        slotsInCol.forEach(slot => slot.classList.add("blur-move"));

        const intervalId = setInterval(() => {
            slotsInCol.forEach(slot => { slot.innerText = getRandomSymbol(); });
        }, 80);

        setTimeout(() => {
            clearInterval(intervalId);
            try { if(stopSound) { stopSound.currentTime = 0; stopSound.play().catch(e => {}); } } catch(e) {}
            slotsInCol.forEach(slot => {
                slot.classList.remove("blur-move");
                slot.innerText = getRandomSymbol();
            });

            if (colIndex === columns.length - 1) {
                checkWin();
                isSpinning = false;
                if (spinBtn) spinBtn.disabled = false;
                if(spinSound) spinSound.pause();
            }
        }, 2000 + (colIndex * 600));
    });
}

function checkWin() {
    const winSound = document.getElementById("winSound");
    const row2Slots = document.querySelectorAll('.reel-col .row2');
    
    if (row2Slots.length < 3) return;
    const rValues = Array.from(row2Slots).map(slot => slot.innerText);
    
    let multiplier = 0;
    if (rValues[0] === rValues[1] && rValues[1] === rValues[2]) {
        if (rValues[0] === "7️⃣") multiplier = 100;
        else if (rValues[0] === "💎") multiplier = 50;
        else if (rValues[0] === "🔔") multiplier = 20;
        else if (rValues[0] === "🍒") multiplier = 10;
        else if (rValues[0] === "🍋") multiplier = 5;
    }

    if (multiplier > 0) {
        let winAmount = betAmount * multiplier;
        currentUser.balance += winAmount;
        updateDisplay();
        document.getElementById("win-val").innerText = winAmount;
        try { if(winSound) { winSound.currentTime = 0; winSound.play().catch(e => {}); } } catch(e){}
        showWinCelebration(multiplier);
    }
}

function showWinCelebration(multiplier) {
    const overlay = document.getElementById('celebration-overlay');
    const amountSpan = document.getElementById('big-win-amount');
    const confettiContainer = document.getElementById('confetti-container');

    amountSpan.innerText = multiplier + "x";
    overlay.classList.remove('hidden-overlay');
    
    for (let i = 0; i < 50; i++) {
        const coin = document.createElement('div');
        coin.classList.add('coin-confetti');
        coin.style.left = Math.random() * 100 + 'vw';
        coin.style.animationDuration = (Math.random() * 2 + 2) + 's';
        confettiContainer.appendChild(coin);
    }

    setTimeout(() => { overlay.classList.add('hidden-overlay'); confettiContainer.innerHTML = ''; }, 4500);
}


/* =========================================
   --- BLACKJACK OYUN MOTORU (GELİŞMİŞ) --- 
   ========================================= */
const Suits = ["♥", "♦", "♣", "♠"];
const Ranks = { "A": 11, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "10": 10, "J": 10, "Q": 10, "K": 10 };

// Ses Efektleri (sounds/ klasörüne göre ayarlandı)
const bjSounds = {
    deal: new Audio('sounds/dealbj.mp3'),
    win: new Audio('sounds/winbj.wav'),
    lose: new Audio('sounds/losebj.wav'),
    blackjack: new Audio('sounds/blackjack.wav'),
    push: new Audio('sounds/pushbj.wav')
};

function playSoundBJ(name) {
    try {
        if (bjSounds[name]) {
            bjSounds[name].currentTime = 0;
            bjSounds[name].volume = 0.5;
            bjSounds[name].play().catch(() => {});
        }
    } catch(e) {}
}

class Deck {
    constructor() {
        this.cards = [];
        for (let s of Suits) for (let r in Ranks) this.cards.push({suit: s, rank: r, val: Ranks[r]});
        this.cards.sort(() => Math.random() - 0.5);
    }
    deal() { return this.cards.pop(); }
}

class Hand {
    constructor() { this.cards = []; this.result = ""; }
    add(c) { this.cards.push(c); }
    score() {
        let t = this.cards.reduce((sum, c) => sum + c.val, 0);
        let aces = this.cards.filter(c => c.rank === "A").length;
        while (t > 21 && aces > 0) { t -= 10; aces--; }
        return t;
    }
}

let bjDeck, playerHands, dealerHand, curIdx, isPlaying = false, bjCurrentBet = 0, isProcessing = false;
const wait = (ms) => new Promise(res => setTimeout(res, ms));

function drawCard(card, hide = false, anime = false) {
    if (hide) return `<div class="card ${anime?'card-anim':''}" style="background: linear-gradient(135deg, #2c3e50, #000); border: 2px solid #fff;"></div>`;
    const red = (card.suit==="♥" || card.suit==="♦") ? "red" : "";
    return `<div class="card ${red} ${anime?'card-anim':''}">
              <div style="align-self: flex-start; margin-left:5px;">${card.rank}</div>
              <div style="font-size:30px;">${card.suit}</div>
              <div style="align-self: flex-end; margin-right:5px; transform: rotate(180deg);">${card.rank}</div>
            </div>`;
}

function updateBJUI(final = false, isNewPlayerCard = false, isNewDealerCard = false) {
    document.getElementById('dealer-cards').innerHTML = dealerHand.cards.map((c, i) => 
        drawCard(c, i === 1 && !final, isNewDealerCard && i === dealerHand.cards.length - 1)).join('');
    document.getElementById('dealer-score').innerText = final ? dealerHand.score() : "?";

    document.getElementById('player-area').innerHTML = playerHands.map((h, i) => {
        let labelClass = h.result.includes("KAZANDIN") || h.result.includes("BLACKJACK") ? "win-label" : 
                         h.result.includes("KAYBETTİN") || h.result.includes("PATLADI") ? "lose-label" : 
                         h.result.includes("BERABERE") ? "push-label" : "";
        const resultHTML = h.result ? `<div class="result-label ${labelClass}">${h.result}</div>` : "";
        const activeClass = (i === curIdx && isPlaying && !final) ? "active-hand" : "";

        const cardsHTML = h.cards.map((c, idx) => 
            drawCard(c, false, i === curIdx && idx === h.cards.length-1 && isNewPlayerCard)
        ).join('');

        return `<div class="hand-container ${activeClass}">
            ${resultHTML}
            <div style="font-size:12px; font-weight:bold; color:#ccc; margin-bottom:5px;">EL ${i+1}</div>
            <div class="cards-row">${cardsHTML}</div>
            <div class="score" style="color:white; font-weight:bold; margin-top:5px;">SKOR: ${h.score()}</div>
        </div>`;
    }).join('');

    document.getElementById('bj-bet-ui').style.display = isPlaying ? 'none' : 'flex';
    document.getElementById('bj-game-ui').style.display = isPlaying ? 'flex' : 'none';
    
    const btns = document.querySelectorAll('#bj-game-ui button');
    btns.forEach(b => b.disabled = isProcessing);

    if(isPlaying && !final && !isProcessing) {
        const h = playerHands[curIdx];
        const canSplit = (h.cards.length === 2 && h.cards[0].val === h.cards[1].val && currentUser.balance >= bjCurrentBet);
        const canDouble = (h.cards.length === 2 && currentUser.balance >= bjCurrentBet);

        const btnSplit = document.getElementById('btn-split');
        if(btnSplit) btnSplit.style.display = canSplit ? 'block' : 'none';

        const btnDouble = document.getElementById('btn-double');
        if(btnDouble) btnDouble.style.display = canDouble ? 'block' : 'none';
    }
    updateGlobalBalance();
}

async function startBlackjack() {
    if (isProcessing) return;
    let betValue = parseInt(document.getElementById('bj-bet-input').value);
    
    if(isNaN(betValue) || betValue <= 0) { alert("Geçersiz Tutar!"); return; }
    if(currentUser.balance < betValue) { alert("YETERSİZ BAKİYE!"); return; }

    isProcessing = true;
    currentUser.balance -= betValue;
    bjCurrentBet = betValue;
    isPlaying = true;
    
    bjDeck = new Deck(); dealerHand = new Hand(); playerHands = [new Hand()]; curIdx = 0;
    document.getElementById('bj-msg-box').innerText = "Kartlar Dağıtılıyor...";
    updateBJUI();

    playerHands[0].add(bjDeck.deal()); playSoundBJ('deal'); updateBJUI(false, true); await wait(450);
    dealerHand.add(bjDeck.deal()); playSoundBJ('deal'); updateBJUI(false, false, true); await wait(450);
    playerHands[0].add(bjDeck.deal()); playSoundBJ('deal'); updateBJUI(false, true); await wait(450);
    dealerHand.add(bjDeck.deal()); playSoundBJ('deal'); updateBJUI(false, false, true); await wait(450);

    isProcessing = false;
    document.getElementById('bj-msg-box').innerText = "Hamlenizi yapın!";
    updateBJUI();
    
    if(playerHands[0].score() === 21) setTimeout(standBlackjack, 500);
}

async function hitBlackjack() {
    if (isProcessing || !isPlaying) return;
    isProcessing = true;
    playerHands[curIdx].add(bjDeck.deal());
    playSoundBJ('deal');
    updateBJUI(false, true);
    await wait(500);

    if (playerHands[curIdx].score() >= 21) {
        await standBlackjack();
    } else {
        isProcessing = false;
        updateBJUI();
    }
}

async function standBlackjack() {
    if (!isPlaying) return;
    isProcessing = true;
    if (curIdx < playerHands.length - 1) { 
        curIdx++; 
        isProcessing = false; 
        updateBJUI();
    } else {
        await dealerTurn();
    }
}

async function doubleDownBlackjack() {
    if (isProcessing) return;
    if(currentUser.balance < bjCurrentBet) { alert("Bakiyeniz yetersiz!"); return; }
    isProcessing = true;
    currentUser.balance -= bjCurrentBet; 
    bjCurrentBet *= 2;
    playerHands[curIdx].add(bjDeck.deal());
    playSoundBJ('deal');
    updateBJUI(false, true);
    await wait(500);
    await standBlackjack();
}

async function splitHandBlackjack() {
    if (isProcessing) return;
    if(currentUser.balance < bjCurrentBet) { alert("Bakiyeniz yetersiz!"); return; }
    isProcessing = true;
    currentUser.balance -= bjCurrentBet;
    
    let currentHand = playerHands[curIdx];
    let splitCard = currentHand.cards.pop();
    let newHand = new Hand();
    newHand.add(splitCard);
    playerHands.push(newHand);
    
    currentHand.add(bjDeck.deal()); playSoundBJ('deal'); updateBJUI(); await wait(400);
    newHand.add(bjDeck.deal()); playSoundBJ('deal'); updateBJUI(); await wait(400);
    isProcessing = false;
    updateBJUI();
}

async function dealerTurn() {
    isPlaying = false;
    updateBJUI(true); await wait(800);
    
    const allBust = playerHands.every(h => h.score() > 21);
    
    if (!allBust) {
        while(dealerHand.score() < 17) {
            dealerHand.add(bjDeck.deal());
            playSoundBJ('deal');
            updateBJUI(true, false, true); await wait(800);
        }
    }
    finishBlackjack();
}

function finishBlackjack() {
    let d = dealerHand.score();
    let soundToPlay = "lose";

    playerHands.forEach((h) => {
        let p = h.score();
        let winAmount = 0;

        if(p > 21) { h.result = "PATLADI (BUST)"; }
        else if(h.cards.length === 2 && p === 21) { 
            h.result = "BLACKJACK!"; 
            winAmount = bjCurrentBet * 2.5; 
            soundToPlay = "blackjack";
        }
        else if(d > 21 || p > d) { 
            h.result = "KAZANDIN!"; 
            winAmount = bjCurrentBet * 2; 
            if(soundToPlay !== "blackjack") soundToPlay = "win";
        }
        else if(d > p) { h.result = "KAYBETTİN"; }
        else { 
            h.result = "BERABERE"; 
            winAmount = bjCurrentBet; 
            if(soundToPlay === "lose") soundToPlay = "push";
        }

        if(winAmount > 0) {
            currentUser.balance += winAmount;
        }
    });

    document.getElementById('bj-msg-box').innerText = "Tur Bitti!";
    playSoundBJ(soundToPlay);
    updateBJUI(true);
    isProcessing = false;
}

/* =========================================
   --- RULET OYUN MOTORU --- 
   ========================================= */
const WHEEL_NUMBERS = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 
    10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];
const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
const SLICE_ANGLE = 360 / 37; 

// Rulet Sesi Fonksiyonu (Düzeltildi)
function playSoundRoulette(name) {
    let soundEl;
    if (name === 'bet') soundEl = document.getElementById('rouletteBetSound');
    else if (name === 'spin') soundEl = document.getElementById('rouletteSpinSound');
    else if (name === 'win') soundEl = document.getElementById('rouletteWinSound');

    if (soundEl) {
        soundEl.currentTime = 0;
        soundEl.volume = 0.5;
        soundEl.play().catch(e => console.log("Rulet sesi hatası:", e));
    }
}

class Roulette {
    constructor() {
        this.currentBets = [];
    }

    addBet(selection, amount) {
        if (amount > currentUser.balance) {
            alert("Bakiye yetersiz!");
            return false;
        }
        currentUser.balance -= amount;
        this.currentBets.push({ selection: selection, amount: amount });
        return true;
    }

    spinLogic() {
        this.lastWinningNumber = Math.floor(Math.random() * 37);
        return this.lastWinningNumber;
    }

    checkAllBets() {
        const result = this.lastWinningNumber;
        let totalWin = 0;

        this.currentBets.forEach(bet => {
            let winMultiplier = 0;
            const guess = bet.selection;

            if (typeof guess === 'number' && guess === result) {
                winMultiplier = 36;
            }
            else if (result !== 0 && typeof guess === 'string') {
                const isRed = RED_NUMBERS.includes(result);
                const isEven = result % 2 === 0;

                if ((guess === 'RED' && isRed) || (guess === 'BLACK' && !isRed) || (guess === 'EVEN' && isEven) || (guess === 'ODD' && !isEven)) {
                    winMultiplier = 2;
                }
                else if ((guess === '1ST12' && result >= 1 && result <= 12) || (guess === '2ND12' && result >= 13 && result <= 24) || (guess === '3RD12' && result >= 25 && result <= 36)) {
                    winMultiplier = 3;
                }
            }
            totalWin += (bet.amount * winMultiplier);
        });

        currentUser.balance += totalWin;
        updateGlobalBalance();
        return { totalWin: totalWin, resultNum: result };
    }

    clearBets() { this.currentBets = []; }
}

const myGame = new Roulette();
let currentRotation = 0;
let activeChipMultiplier = 1;

function selectChip(multiplier) {
    activeChipMultiplier = multiplier;
    document.querySelectorAll('.chip-select').forEach(el => el.classList.remove('selected-chip'));
    document.querySelector(`.chip-${multiplier}`).classList.add('selected-chip');
}

function placeBetOnTable(selection, btnElement) {
    const baseUnit = parseInt(document.getElementById('baseUnitInput').value);
    if(isNaN(baseUnit) || baseUnit < 1) { alert("Geçerli birim fiyat girin."); return; }
    const betAmount = baseUnit * activeChipMultiplier;

    if (myGame.addBet(selection, betAmount)) {
        addVisualChip(btnElement, activeChipMultiplier);
        updateRouletteUI();
        playSoundRoulette('bet'); // Bahis sesi
    }
}

function addVisualChip(targetBtn, multiplier) {
    const chip = document.createElement('div');
    chip.className = `placed-chip chip-${multiplier}`;
    chip.innerText = multiplier + 'x';
    const randomX = Math.floor(Math.random() * 40) + 10;
    const randomY = Math.floor(Math.random() * 40) + 10;
    chip.style.left = randomX + '%';
    chip.style.top = randomY + '%';
    targetBtn.appendChild(chip);
}

function clearTableBets() {
    currentUser.balance += myGame.currentBets.reduce((a, b) => a + b.amount, 0);
    myGame.clearBets();
    document.querySelectorAll('.placed-chip').forEach(el => el.remove());
    updateRouletteUI();
}

function updateRouletteUI() {
    updateGlobalBalance();
    document.getElementById('balanceDisplay').innerText = currentUser.balance;
    const totalBet = myGame.currentBets.reduce((sum, bet) => sum + bet.amount, 0);
    document.getElementById('totalBetDisplay').innerText = totalBet;
}

function startRouletteGame() {
    if (myGame.currentBets.length === 0) { alert("Lütfen bahis yapın!"); return; }
    const spinBtn = document.getElementById('spinButton');
    const wheel = document.getElementById('rouletteWheel');
    const overlay = document.getElementById('winnerOverlay');
    const winnerText = document.getElementById('winnerText');

    spinBtn.disabled = true;
    overlay.classList.add('hidden');

    playSoundRoulette('spin'); // Çevirme sesi

    const winningNum = myGame.spinLogic();
    const winIndex = WHEEL_NUMBERS.indexOf(winningNum);
    const pieceAngle = 360 / 37;
    const winningAngle = winIndex * pieceAngle + (pieceAngle / 2);
    const targetRotationInCircle = (360 - winningAngle);
    const currentMod = currentRotation % 360;
    let distance = (targetRotationInCircle - currentMod + 360) % 360;
    const extraSpins = 360 * 5;
    const newTotalRotation = currentRotation + extraSpins + distance;

    wheel.style.transform = `rotate(${newTotalRotation}deg)`;
    currentRotation = newTotalRotation;

    setTimeout(() => {
        playSoundRoulette('win'); // Sonuç sesi
        
        const resultData = myGame.checkAllBets();
        let color = '#388e3c';
        if(RED_NUMBERS.includes(resultData.resultNum)) color = '#d32f2f';
        else if(resultData.resultNum !== 0) color = '#212121';
        
        winnerText.style.backgroundColor = color;
        winnerText.innerText = resultData.resultNum;
        overlay.classList.remove('hidden');
        
        const statusMsg = document.getElementById('statusMessage');
        if (resultData.totalWin > 0) statusMsg.innerHTML = `KAZANDINIZ! <b style="color:#f1c40f">${resultData.totalWin}</b> Puan`;
        else statusMsg.innerText = "Kaybettiniz.";

        myGame.clearBets();
        document.querySelectorAll('.placed-chip').forEach(el => el.remove());
        updateRouletteUI();
        spinBtn.disabled = false;
    }, 4000);
}

function createWheel() {
    const wheel = document.getElementById('rouletteWheel');
    wheel.innerHTML = ''; 
    const textRadius = 125; 
    WHEEL_NUMBERS.forEach((num, index) => {
        const slice = document.createElement('div');
        slice.className = 'number-text';
        const theta = index * SLICE_ANGLE + (SLICE_ANGLE / 2);
        slice.style.transform = `rotate(${theta}deg) translateY(-${textRadius}px)`;
        const span = document.createElement('span');
        span.innerText = num;
        span.className = 'number-span';
        slice.appendChild(span);
        wheel.appendChild(slice);
    });
    let gradient = 'conic-gradient(';
    WHEEL_NUMBERS.forEach((num, index) => {
        let color = '#388e3c';
        if (RED_NUMBERS.includes(num)) color = '#d32f2f';
        else if (num !== 0) color = '#212121';
        gradient += `${color} ${index * SLICE_ANGLE}deg ${(index + 1) * SLICE_ANGLE}deg, `;
    });
    wheel.style.background = gradient.slice(0, -2) + ')';
}

function startTutorial() {
    const driver = window.driver.js.driver;
    const driverObj = driver({
        showProgress: true,
        allowClose: true,
        nextBtnText: 'İleri >',
        prevBtnText: '< Geri',
        doneBtnText: 'Oyuna Başla!',
        steps: [
            { element: '.roulette-game-area', popover: { title: 'Casino Royale\'e Hoşgeldiniz!', description: 'Rulet oyununun nasıl oynandığını öğrenmek için kısa bir tura ne dersiniz?', side: "left", align: 'start' } },
            { element: '#tutorial-step-1', popover: { title: '1. Adım: Birim Fiyat', description: 'Buraya temel bahis miktarınızı girin. Örneğin 10 yazarsanız, x1 çipi 10 puan değerinde olur.', side: "bottom", align: 'start' } },
            { element: '#tutorial-step-2', popover: { title: '2. Adım: Çip Katlayıcı', description: 'Risk almak ister misiniz? Buradan x2, x5 veya x100 gibi katlayıcıları seçebilirsiniz.', side: "bottom", align: 'start' } },
            { element: '#tutorial-step-3', popover: { title: '3. Adım: Bahis Masası', description: 'Seçtiğiniz çipleri masadaki sayıların üzerine tıklayarak yerleştirin. İstediğiniz kadar sayıya oynayabilirsiniz!', side: "left", align: 'start' } },
            { element: '#spinButton', popover: { title: '4. Adım: Çevir!', description: 'Bahislerinizi koyduktan sonra bu butona basın ve şansınızı deneyin. Bol şans!', side: "top", align: 'center' } },
            { element: '#tutorial-step-3', popover: { title: '📜 Oyun Kuralları ve Kazançlar', description: `<ul style="margin: 0; padding-left: 20px; text-align: left;"><li style="margin-bottom:5px;"><b>Tek Sayı (Örn: 5):</b> Bahsin 36 Katı (x36)</li><li style="margin-bottom:5px;"><b>12'li Gruplar (1st 12):</b> Bahsin 3 Katı (x3)</li><li style="margin-bottom:5px;"><b>Renk / Tek-Çift:</b> Bahsin 2 Katı (x2)</li></ul><p style="margin-top:10px; font-size:12px; font-style:italic;">Dikkat: Yeşil 0 gelirse dış bahisler (Renk, Tek/Çift) kaybeder!</p>`, side: "left", align: 'center' } }
        ]
    });
    driverObj.drive();
}