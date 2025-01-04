const cardGrid = document.querySelector('.card-grid');
const startButton = document.getElementById('start-button');

// Gösterge elemanları
const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');
const timerDisplay = document.getElementById('timer');
const levelDisplay = document.getElementById('level');

// Level, süre, puan ve can değişkenleri
let level = 1;
let timer = 60; // Her level için başlangıç süresi
let score = 0; // Başlangıç puanı
let lives = 3; // Başlangıç canı

// Harf listesi
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
let cards = [];

// Seçim ve eşleşme kontrolü için değişkenler
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let timerInterval = null;

// Kartları karıştırma
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

//------------------------------------------------------------ KART İŞLEMLERİ
// Kartları oluşturma
function generateCards() {
  const numOfPairs = 4 + (level - 1) * 4; // Başlangıçta 8 kart, her levelda 4 kart eklenir
  const selectedLetters = alphabet.slice(0, numOfPairs / 2); // İlk 'n' harfi seç (çift sayısı)
  cards = selectedLetters.flatMap(letter => [letter, letter]); // Çiftleri oluştur
  shuffle(cards); // Kartları karıştır
}
// Kartları ekrana yerleştiren fonksiyon
function createCards() {
  cardGrid.innerHTML = ''; // Önceki kartları temizle (yeni oyun başlatıldığında eski kartlar kaldırılır)
  // Her bir kart için işlem yap
  cards.forEach(value => {
    const card = document.createElement('div'); // Yeni bir div elementi oluştur
    card.classList.add('card', 'hidden'); // Kartın görünümünü gizlemek için 'hidden' sınıfı ekle
    card.dataset.value = value; // Kartın değerini data-attribute olarak ekle
    card.addEventListener('click', handleCardClick); // Kart tıklandığında handleCardClick fonksiyonunu çalıştır
    cardGrid.appendChild(card); // Yeni oluşturulan kartı grid'e ekle
  });
}

// Kart tıklama işlemini yöneten fonksiyon
function handleCardClick(e) {
  if (lockBoard) return; // Tahta kilitliyse (yani bir eşleşme kontrol ediliyorsa) tıklama işlemini engelle
  
  const clickedCard = e.target; // Tıklanan kartı al

  // Aynı karta veya zaten eşleşmiş karta tekrar tıklamayı engelle
  if (clickedCard === firstCard || clickedCard.classList.contains('matched')) return;

  clickedCard.classList.remove('hidden'); // Kartı göster (gizliliği kaldır)
  clickedCard.textContent = clickedCard.dataset.value; // Kartın değerini göster

  // Eğer birinci kart seçilmemişse, bu kartı birinci kart olarak kaydet
  if (!firstCard) {
    firstCard = clickedCard;
  } else {
    // İkinci kart seçildiğinde eşleşme kontrolü yapılacak
    secondCard = clickedCard;
    lockBoard = true; // Tahta kilitlenir, başka bir tıklama yapılamaz
    checkForMatch(); // Eşleşme kontrolünü yap
  }
}

// Eşleşme kontrolü
function checkForMatch() {
  const isMatch = firstCard.dataset.value === secondCard.dataset.value;

  if (isMatch) {
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    firstCard.style.pointerEvents = 'none'; // Eşleşen kartı tıklanamaz yap
    secondCard.style.pointerEvents = 'none'; // Eşleşen kartı tıklanamaz yap
    updateScore(10); // Doğru eşleşme için puan ekle
    resetBoard();

    // Biraz gecikmeyle level kontrolü yap
    setTimeout(() => {
      checkForLevelUp(); // Eşleşme sonrası level kontrolü
    }, 500); // Görünüm güncellemeleri için kısa bir bekleme
  } else {
    setTimeout(() => {
      firstCard.classList.add('hidden');
      secondCard.classList.add('hidden');
      firstCard.textContent = '';
      secondCard.textContent = '';
      updateLives(); // Yanlış eşleşme için can azalt
      resetBoard();
    }, 1000);
  }
}
//------------------------------------------------------------ EKRAN DA Kİ BİLGİLER KISMI
// Level kontrolü
function checkForLevelUp() {
  const matchedCards = document.querySelectorAll('.card.matched');
  if (matchedCards.length === cards.length) {
    clearInterval(timerInterval); // Zamanlayıcıyı durdur
    alert(`Level ${level} tamamlandı!`);
    level += 1; // Level artır
    lives += 1; // Yeni levelda bir can ekle
    levelDisplay.textContent = `Level: ${level}`; // Level göstergesini güncelle
    livesDisplay.textContent = `Canlar: ${lives}`; // Can göstergesini güncelle
    startLevel(); // Yeni seviyeyi başlat
  }
}

// Puan güncelleme
function updateScore(points) {
  score += points;
  scoreDisplay.textContent = `Puan: ${score}`;
}

// Can güncelleme
function updateLives() {
  lives -= 1;
  livesDisplay.textContent = `Canlar: ${lives}`;
  if (lives === 0) endGame(); // Canlar bitince oyun biter
}

// Zamanlayıcı başlatma
function startTimer() {
  clearInterval(timerInterval); // Önceki zamanlayıcıyı temizle
  timerInterval = setInterval(() => {
    timer -= 1;
    timerDisplay.textContent = `Süre: ${timer} sn`;
    if (timer === 0) {
      clearInterval(timerInterval);
      endGame();
    }
  }, 1000);
}
//------------------------------------------------------------------------------------------------------------ZAMAN JOKERİ
let jokerUsed = false; // Başlangıçta joker kullanılmadı
function useTimeJoker() {
  if (!jokerUsed) {
    timer += 20; // Süreyi 20 saniye artır
    timerDisplay.textContent = `Süre: ${timer} sn`;
    jokerUsed = true; // Joker kullanıldı
    document.getElementById('time-joker').disabled = true; // Butonu devre dışı bırak
  }
}
document.getElementById('time-joker').addEventListener('click', useTimeJoker);
//------------------------------------------------------------------------------------------------------------GÖSTERME JOKERİ
let showCardsJokerUsed = false; // Kartları göster jokeri için durum
function useShowCardsJoker() {
  if (showCardsJokerUsed) return; // Joker zaten kullanıldıysa işlem yapma
  showCardsJokerUsed = true;

  firstCard = null;
  secondCard = null;

  const showCardsButton = document.getElementById('show-cards-joker');
  showCardsButton.disabled = true; // Joker butonunu devre dışı bırak

  const allCards = document.querySelectorAll('.card');
  allCards.forEach(card => {
    card.classList.remove('hidden');
    card.textContent = card.dataset.value;
    card.style.pointerEvents = 'none';
  });

  // 5 saniye sonra kartları yeniden kapat
  setTimeout(() => {
    allCards.forEach(card => {
      if (!card.classList.contains('matched')) {
        card.classList.add('hidden');
        card.textContent = '';
        card.style.pointerEvents = 'auto';
      }
    });
  }, 5000);
}
document.getElementById('show-cards-joker').addEventListener('click', useShowCardsJoker);
//------------------------------------------------------------------------------------------------------------EŞLEŞTİRME JOKERİ
let autoMatchJokerUsed = false; // Eşleştirme jokeri için durum
// Eşleştirme jokerini kullanan fonksiyon
function useAutoMatchJoker() {
  if (autoMatchJokerUsed) return; // Joker zaten kullanıldıysa işlem yapma (tekrar kullanım engellenir)
  autoMatchJokerUsed = true; 

  const autoMatchButton = document.getElementById('auto-match-joker'); // Joker butonunu al
  autoMatchButton.disabled = true; // Joker butonunu devre dışı bırak (butona tekrar tıklanamaz)

  // Eşleşmemiş kartları al
  const unmatchedCards = Array.from(document.querySelectorAll('.card:not(.matched)'));
  
  // Eşleşmemiş kartları gruplandır (aynı değere sahip kartlar bir arada)
  const unmatchedPairs = unmatchedCards.reduce((pairs, card) => {
    const value = card.dataset.value; // Kartın değerini al
    pairs[value] = pairs[value] || []; // Aynı değere sahip kartları bir araya getir
    pairs[value].push(card);
    return pairs;
  }, {});

  // Eşleşebilecek çiftleri seç (her değerden iki kart olmalı)
  const pairKeys = Object.keys(unmatchedPairs).filter(key => unmatchedPairs[key].length === 2);
  
  // Eğer eşleşebilecek çift varsa, rastgele bir çift seç
  if (pairKeys.length > 0) {
    const randomKey = pairKeys[Math.floor(Math.random() * pairKeys.length)]; // Rastgele bir anahtar seç
    const [card1, card2] = unmatchedPairs[randomKey]; // Seçilen çifte ait kartları al

    // Kartları göster
    card1.classList.remove('hidden');
    card2.classList.remove('hidden');
    card1.textContent = card1.dataset.value;
    card2.textContent = card2.dataset.value;

    // Kartları eşleştir ve işaretle
    setTimeout(() => {
      card1.classList.add('matched');
      card2.classList.add('matched');
      card1.style.pointerEvents = 'none'; // Kartları tıklanamaz yap
      card2.style.pointerEvents = 'none'; // Kartları tıklanamaz yap

      // Puan ekle ve level kontrolü yap
      updateScore(10); // Joker ile eşleşen kartlar için puan ekle
      checkForLevelUp(); // Eşleştirme sonrası level kontrolü yap
    }, 1000); // 1 saniye beklemeden sonra eşleşen kartları işaretle
  }
}

document.getElementById('auto-match-joker').addEventListener('click', useAutoMatchJoker);
//------------------------------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------------------------OYUN İŞLEMLERİ
function endGame() {
  clearInterval(timerInterval);
  if(lives == 0){
    alert(`Canlarınız Bitti!! Toplam puanınız: ${score}`);
  }else if(timer == 0){
    alert(`Süreniz bitti!! Toplam puanınız: ${score}`);
  }else{
    alert(`Oyun bitti! Toplam puanınız: ${score}`);
  }
  cardGrid.innerHTML = ''; // Kartları temizle
  // Joker butonlarını devre dışı bırak (oyun bittiğinde jokerler kullanılamaz)
  const timeJokerButton = document.getElementById('time-joker');
  const showCardsButton = document.getElementById('show-cards-joker');
  const autoMatchButton = document.getElementById('auto-match-joker');
  timeJokerButton.disabled = true;
  showCardsButton.disabled = true;
  autoMatchButton.disabled = true;
}
// Seçim sıfırlama
function resetBoard() {
  [firstCard, secondCard] = [null, null]; // İlk ve ikinci kartları sıfırlar
  lockBoard = false; // Kartları yeniden seçilebilir hale getirir
}
// Level başlatma
function startLevel() {
  generateCards(); // Kartları oluştur
  createCards(); // Kartları ekrana yerleştir
  timer = 60; // Süreyi sıfırla
  timerDisplay.textContent = `Süre: ${timer} sn`;
  startTimer(); // Zamanlayıcıyı başlat

  jokerUsed = false; // Süre uzatma jokerini sıfırla
  showCardsJokerUsed = false; // Kart gösterme jokerini sıfırla
  autoMatchJokerUsed = false; // Eşleştirme jokerini sıfırla

  const timeJokerButton = document.getElementById('time-joker');
  const showCardsButton = document.getElementById('show-cards-joker');
  const autoMatchButton = document.getElementById('auto-match-joker');
  timeJokerButton.disabled = true;
  showCardsButton.disabled = true;
  autoMatchButton.disabled = true;

  const allCards = document.querySelectorAll('.card');
  allCards.forEach(card => {
    card.classList.remove('hidden');
    card.textContent = card.dataset.value;
    card.style.pointerEvents = 'none';
  });

  // 5 saniye sonra kartları kapat ve jokerleri etkinleştir
  setTimeout(() => {
    allCards.forEach(card => {
      card.classList.add('hidden');
      card.textContent = '';
      card.style.pointerEvents = 'auto';
    });

    timeJokerButton.disabled = false;
    showCardsButton.disabled = false;
    autoMatchButton.disabled = false;
  }, 5000);
}
// Oyunu başlatma
function startGame() {
  level = 1;
  score = 0;
  lives = 3;
  timer = 60;
  firstCard = null;
  secondCard = null;
  lockBoard = false;
  levelDisplay.textContent = `Level: ${level}`;
  scoreDisplay.textContent = `Puan: ${score}`;
  livesDisplay.textContent = `Canlar: ${lives}`;
  timerDisplay.textContent = `Süre: ${timer} sn`;
  startLevel(); // İlk seviyeyi başlat
}
// Buton tıklama olayı
startButton.addEventListener('click', startGame);
//-------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------KURALLAR KISMI
const rulesModal = document.getElementById('rules-modal');
const showRulesButton = document.getElementById('show-rules');
const closeRulesButton = document.getElementById('close-rules');

// Modalı göster
showRulesButton.addEventListener('click', () => {
  rulesModal.classList.remove('hidden');
});

// Modalı kapat
closeRulesButton.addEventListener('click', () => {
  rulesModal.classList.add('hidden');
});

// Modal dışına tıklayınca kapatma
window.addEventListener('click', (event) => {
  if (event.target === rulesModal) {
    rulesModal.classList.add('hidden');
  }
});
//------------------------------------------------------------------------------------------------------------