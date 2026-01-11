// script.js dosyasından sınıfları ve fonksiyonları alıyoruz
const { Roulette, Deck, Hand, generatePool, weightedPool } = require('./script.js');

// --- GLOBAL MOCKLAR (Test ortamı için sahte veri) ---
// Kodun içinde currentUser.balance kullanıldığı için bunu taklit ediyoruz.
global.currentUser = { balance: 5000 };
global.alert = jest.fn(); // alert fonksiyonunu susturuyoruz
global.document = {
    getElementById: jest.fn().mockReturnValue({ innerText: '' }) // Basit DOM taklidi
};
global.updateGlobalBalance = jest.fn(); // UI güncellemesini boşa çıkarıyoruz

describe('Casino Royale Oyun Mantığı Testleri', () => {

    // --- 1. BLACKJACK TESTLERİ ---
    describe('Blackjack Mantığı (Hand Class)', () => {
        let hand;

        beforeEach(() => {
            hand = new Hand();
        });

        test('Sayı kartlarının toplamı doğru hesaplanmalı', () => {
            hand.add({ rank: '5', val: 5 });
            hand.add({ rank: '10', val: 10 });
            expect(hand.score()).toBe(15);
        });

        test('Resimli kartlar (K, Q, J) 10 sayılmalı', () => {
            hand.add({ rank: 'K', val: 10 });
            hand.add({ rank: 'Q', val: 10 });
            expect(hand.score()).toBe(20);
        });

        test('As (Ace) kartı duruma göre 1 veya 11 sayılmalı (Soft/Hard Hand)', () => {
            // Durum A: As + 10 = 21 (Blackjack) -> As 11 sayılır
            hand.add({ rank: 'A', val: 11 });
            hand.add({ rank: 'K', val: 10 });
            expect(hand.score()).toBe(21);

            // Durum B: As + 10 + 10 = 21 (As 11 olursa 31 olur, patlar. O yüzden 1 sayılmalı)
            let hand2 = new Hand();
            hand2.add({ rank: 'A', val: 11 });
            hand2.add({ rank: 'K', val: 10 });
            hand2.add({ rank: 'Q', val: 10 });
            expect(hand2.score()).toBe(21); // 1 + 10 + 10
        });
    });

    describe('Blackjack Destesi (Deck Class)', () => {
        test('Deste oluşturulduğunda 52 kart olmalı', () => {
            const deck = new Deck();
            expect(deck.cards.length).toBe(52);
        });

        test('Kart dağıtıldığında deste azalmalı', () => {
            const deck = new Deck();
            deck.deal();
            expect(deck.cards.length).toBe(51);
        });
    });

    // --- 2. RULET TESTLERİ ---
    describe('Rulet Mantığı (Roulette Class)', () => {
        let roulette;

        beforeEach(() => {
            roulette = new Roulette();
            global.currentUser.balance = 5000; // Bakiyeyi sıfırla
        });

        test('Bahis eklendiğinde bakiyeden düşmeli', () => {
            const betAmount = 100;
            const basarili = roulette.addBet('RED', betAmount);
            
            expect(basarili).toBe(true);
            expect(global.currentUser.balance).toBe(4900); // 5000 - 100
            expect(roulette.currentBets.length).toBe(1);
        });

        test('Yetersiz bakiyede bahis reddedilmeli', () => {
            global.currentUser.balance = 50;
            const basarili = roulette.addBet('RED', 100);
            
            expect(basarili).toBe(false);
            expect(global.currentUser.balance).toBe(50); // Değişmemeli
        });

        test('Doğru sayıya (Straight Up) bahis 36 katını kazandırmalı', () => {
            roulette.addBet(15, 100); // 15 numaraya 100 TL
            
            // Hile yapıp sonucu 15 olarak ayarlıyoruz (Mocking logic)
            roulette.spinLogic = jest.fn().mockReturnValue(15);
            
            const result = roulette.checkAllBets();
            
            // 100 x 36 = 3600 TL Kazanç
            expect(result.totalWin).toBe(3600);
            expect(result.resultNum).toBe(15);
        });

        test('Kırmızı (RED) bahsi doğru çalışmalı', () => {
            roulette.addBet('RED', 100);
            
            // 1 Kırmızıdır (RED_NUMBERS içinde var)
            roulette.spinLogic = jest.fn().mockReturnValue(1);
            
            const result = roulette.checkAllBets();
            
            // 100 x 2 = 200 TL Kazanç
            expect(result.totalWin).toBe(200);
        });

        test('Siyah (BLACK) bahsi kırmızı gelirse kaybetmeli', () => {
            roulette.addBet('BLACK', 100);
            
            // 1 Kırmızıdır
            roulette.spinLogic = jest.fn().mockReturnValue(1);
            
            const result = roulette.checkAllBets();
            
            expect(result.totalWin).toBe(0);
        });
    });

    // --- 3. SLOT TESTLERİ ---
    describe('Slot Mantığı', () => {
        test('generatePool fonksiyonu havuzu doğru ağırlıklarla doldurmalı', () => {
            generatePool();
            
            // Havuz boş olmamalı
            expect(weightedPool.length).toBeGreaterThan(0);
            
            // Limon (🍋) sayısı 7'li (7️⃣) sayısından fazla olmalı (Ağırlık mantığı)
            const lemons = weightedPool.filter(x => x === "🍋").length;
            const sevens = weightedPool.filter(x => x === "7️⃣").length;
            
            expect(lemons).toBeGreaterThan(sevens);
        });
    });
});