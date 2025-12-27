// --- VERİTABANI ---
let users = [
    { userid: 1, username: "admin", email: "admin@casino.com", creditNo: "0000", password: "123", balance: 50000 }
];

// --- SAYFA YÜKLENİNCE ---
window.addEventListener('load', function() {
    setTimeout(() => {
        const intro = document.getElementById("intro-screen");
        const startScreen = document.getElementById("start-screen");
        const loginScreen = document.getElementById("login-container");

        if (intro) intro.style.opacity = "0";
        setTimeout(() => {
            if (intro) intro.style.display = "none";
            if (startScreen) startScreen.classList.remove("hidden");
            else if (loginScreen) loginScreen.classList.remove("hidden");
        }, 1000); 
    }, 2500); 
});

// --- EKRAN GEÇİŞLERİ (Giriş / Kayıt) ---
function goToLoginScreen() {
    document.getElementById("start-screen").classList.add("hidden");
    document.getElementById("login-container").classList.remove("hidden");
}

function goBackToStart() {
    document.getElementById("login-container").classList.add("hidden");
    document.getElementById("register-container").classList.add("hidden");
    document.getElementById("start-screen").classList.remove("hidden");
    if(document.getElementById("login-error")) document.getElementById("login-error").innerText = "";
}

function showRegister() {
    document.getElementById("login-container").classList.add("hidden");
    document.getElementById("register-container").classList.remove("hidden");
}

function showLogin() {
    document.getElementById("register-container").classList.add("hidden");
    document.getElementById("login-container").classList.remove("hidden");
}

// --- KAYIT VE GİRİŞ İŞLEMLERİ ---
function registerUser() {
    const username = document.getElementById("reg-username").value;
    const email = document.getElementById("reg-email").value;
    const creditNo = document.getElementById("reg-credit").value;
    const password = document.getElementById("reg-password").value;
    const errorMsg = document.getElementById("reg-error");
    const successMsg = document.getElementById("reg-success");

    if (!username || !password || !email || !creditNo) {
        errorMsg.innerText = "Lütfen tüm alanları doldurunuz!";
        return;
    }

    const exists = users.find(u => u.username === username);
    if (exists) {
        errorMsg.innerText = "Bu kullanıcı adı zaten alınmış!";
        return;
    }

    const newUser = {
        userid: Math.floor(Math.random() * 10000),
        username: username,
        password: password,
        email: email,
        creditNo: creditNo,
        balance: 1000
    };
    users.push(newUser);
    successMsg.innerText = "Kayıt Başarılı! Yönlendiriliyorsunuz...";
    setTimeout(() => { showLogin(); document.getElementById("login-username").value = username; }, 2000);
}

function login() {
    const userInp = document.getElementById("login-username").value;
    const passInp = document.getElementById("login-password").value;
    const errorMsg = document.getElementById("login-error");
    const user = users.find(u => u.username === userInp);

    if (user && user.password === passInp) {
        showGameScreen(user);
    } else {
        errorMsg.innerText = "Hatalı kullanıcı adı veya şifre!";
    }
}

// --- OYUN LOBİSİ MANTIĞI (YENİ) ---

function showGameScreen(user) {
    // Giriş ekranlarını gizle
    document.getElementById("login-container").classList.add("hidden");
    const start = document.getElementById("start-screen");
    if(start) start.classList.add("hidden");
    
    // Ana Oyun Konteynerini Aç
    document.getElementById("game-screen").classList.remove("hidden");
    
    // Bilgileri Yaz
    document.getElementById("welcome-msg").innerText = user.username;
    document.getElementById("balance").innerText = user.balance;

    // Başlangıçta Lobiyi Göster, Diğerlerini Gizle
    backToLobby(); 
}

// Banner'a tıklayınca oyunu açar
function openGame(gameName) {
    // Lobiyi Gizle
    document.getElementById('lobby-view').classList.add('hidden');
    
    // Seçilen Oyunu Aç
    if (gameName === 'slot') {
        document.getElementById('view-slot').classList.remove('hidden');
    } else if (gameName === 'bj') {
        document.getElementById('view-bj').classList.remove('hidden');
    } else if (gameName === 'roulette') {
        document.getElementById('view-roulette').classList.remove('hidden');
    }
}

// Oyundan çıkıp listeye döner
function backToLobby() {
    // Tüm oyunları gizle
    document.getElementById('view-slot').classList.add('hidden');
    document.getElementById('view-bj').classList.add('hidden');
    document.getElementById('view-roulette').classList.add('hidden');
    
    // Lobiyi Aç
    document.getElementById('lobby-view').classList.remove('hidden');
}