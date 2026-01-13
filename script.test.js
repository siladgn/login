import { jest } from '@jest/globals';

// JSDOM ortamında window zaten vardır ama 
// window.confirmCurrencyExchange ataması için boş bir obje gerekebilir
global.window = window;
global.document = window.document;
global.prompt = jest.fn(); // prompt fonksiyonunu mockla
global.confirm = jest.fn(); // confirm fonksiyonunu mockla

// Diğer mocklar...
global.updateUserDataInFirebase = jest.fn().mockResolvedValue(true);
global.updateGlobalBalance = jest.fn();

// Script.js importu
import { Roulette, Deck, Hand, generatePool, weightedPool } from './script.js';

describe('Casino Royale Oyun Mantığı Testleri', () => {
    // ... Mevcut test senaryolarınız buraya ...
    test('Hand score hesaplama testi', () => {
        const hand = new Hand();
        hand.add({ rank: '10', val: 10 });
        expect(hand.score()).toBe(10);
    });
});