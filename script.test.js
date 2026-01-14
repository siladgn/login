import { jest } from '@jest/globals';

// --- 1. GLOBAL MOCKLAR ---
// currentUser'ın başlangıçta null olmaması için global bir obje tanımlıyoruz
global.currentUser = { balance: 5000, history: [] };
global.alert = jest.fn();
global.updateUserDataInFirebase = jest.fn().mockResolvedValue(true);
global.updateGlobalBalance = jest.fn();

// DOM ortamını simüle ediyoruz
global.document = {
    getElementById: jest.fn().mockReturnValue({
        innerText: '', value: '',
        classList: { add: jest.fn(), remove: jest.fn(), toggle: jest.fn() },
        style: {},
        appendChild: jest.fn()
    }),
    querySelectorAll: jest.fn().mockReturnValue([]),
    addEventListener: jest.fn()
};

// --- 2. MODÜLLERİ IMPORT ET ---
// Not: script.js dosyanızda "export { Roulette, Deck, Hand, generatePool, weightedPool };" olmalıdır.
const { Roulette, Deck, Hand, generatePool, weightedPool } = await import('./script.js');

describe('Casino Royale Kapsamlı Oyun Mantığı Testleri', () => {
    let roulette;

    beforeEach(() => {
        // Her testten önce bakiyeyi ve oyunu sıfırlıyoruz
        global.currentUser = { balance: 5000, history: [] };
        roulette = new Roulette();
        jest.clearAllMocks();
    });

    // --- 1. RULET TESTLERİ (BAHİS VE KAZANÇ) ---
    describe('Rulet Mantığı (Roulette Class)', () => {
        test('Bahis eklendiğinde bakiyeden doğru şekilde düşmeli', () => {
            const basarili = roulette.addBet('RED', 100);
            expect(basarili).toBe(true);
            expect(global.currentUser.balance).toBe(4900);
        });

        test('Yetersiz bakiye durumunda bahis reddedilmeli', () => {
            global.currentUser.balance = 50;
            const basarili = roulette.addBet('RED', 100);
            expect(basarili).toBe(false);
            expect(global.currentUser.balance).toBe(50);
        });

        test('Doğru sayıya (Straight Up) bahis 36 kat kazandırmalı', () => {
            roulette.addBet(17, 100); 
            roulette.lastWinningNumber = 17; // Kazananı manuel set ediyoruz
            
            const result = roulette.checkAllBets();
            expect(result.totalWin).toBe(3600);
            expect(global.currentUser.balance).toBe(4900 + 3600);
        });

        test('Renk bahsi (BLACK) siyah sayı gelince 2 kat kazandırmalı', () => {
            roulette.addBet('BLACK', 200);
            roulette.lastWinningNumber = 2; // 2 Siyahtır
            
            const result = roulette.checkAllBets();
            expect(result.totalWin).toBe(400); 
        });
    });

    // --- 2. BLACKJACK TESTLERİ (PUAN VE DESTE) ---
    describe('Blackjack Mantığı (Hand & Deck)', () => {
        test('As (Ace) toplam puanı duruma göre optimize etmeli (21 kuralı)', () => {
            const hand = new Hand();
            hand.add({ rank: 'A', val: 11 });
            hand.add({ rank: '10', val: 10 });
            hand.add({ rank: 'K', val: 10 });
            // 31 değil, 11+10+10 -> 1+10+10 = 21 olmalı
            expect(hand.score()).toBe(21); 
        });

        test('Deste (Deck) dağıtıldığında kart sayısı azalmalı', () => {
            const deck = new Deck();
            expect(deck.cards.length).toBe(52);
            deck.deal();
            expect(deck.cards.length).toBe(51);
        });
    });

    // --- 3. SLOT TESTLERİ (OLASILIK) ---
    describe('Slot Mantığı', () => {
        test('generatePool ağırlıklı olasılıkları doğru yüklemeli', () => {
            generatePool();
            expect(weightedPool.length).toBeGreaterThan(0);
            
            const lemons = weightedPool.filter(x => x === "🍋").length;
            const sevens = weightedPool.filter(x => x === "7️⃣").length;
            // Limon olasılığı (45), 7'li olasılığından (5) fazla olmalı
            expect(lemons).toBeGreaterThan(sevens);
        });
    });
});