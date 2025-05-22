// Saat Fonksiyonları
let sPassed = 0;
let intervalID = null;
src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"


function updateClock() {
  sPassed++;
  let m = Math.floor(sPassed / 60);
  let s = sPassed % 60;
  m = m < 10 ? "0" + m : m;
  s = s < 10 ? "0" + s : s;
  document.getElementById("clock").innerText = `${m}:${s}`;
}

function startClock() {
  if (intervalID === null) {
    intervalID = setInterval(updateClock, 1000);
  }
  updateClock();
}

function stopClock() {
  clearInterval(intervalID);
  intervalID = null;
}

// Oyun Değişkenleri ve Yardımcı Fonksiyonlar
let secretNumber = Math.floor(Math.random() * 100) + 1;
let attempts = 0;
let guessList = [];
let gameOver = false;
let maxNumber = 100;

function asalMi(num) {
  if (num <= 1) return false;
  if (num <= 3) return true;
  if (num % 2 === 0 || num % 3 === 0) return false;
  for (let i = 5; i <= Math.sqrt(num); i += 6) {
    if (num % i === 0 || num % (i + 2) === 0) return false;
  }
  return true;
}

function basToplami(num) {
  let toplam = 0;
  while (num > 0) {
    toplam += num % 10;
    num = Math.floor(num / 10);
  }
  return toplam;
}

// İpucu Fonksiyonları
const hintFunctions = [
  function hint1(num) {
    if (num % 5 === 0) return "Sayı beşe bölünebiliyor."; else return null;
  },
  function hint2(num) {
    if (asalMi(num)) return "Sayı asal sayıdır."; else return null;
  },
  function hint3(num) {
    if (Number.isInteger(Math.sqrt(num))) return "Bu sayı bir TAMKARE'dir."; else return null;
  },
  function hint4(num) {
    const sum = basToplami(num);
    return `Bu sayının basamakları toplamı: ${sum}`;
  },
  function hint5(num) {
    if (num % 2 === 0) return "Sayı ÇİFT sayıdır."; else return null;
  },
  function hint6(num) {
    return `Bu sayinin binary (ikilik sistemde) gösterimi: ${num.toString(2)}`;
  },
  function hint7(num) {
    if (num === 7) return "Antalya."; else return null;
  },
  function classifiedHint(num) {
    const redacted = num.toString().split('').map((d, i) => i % 2 === 0 ? "█" : d).join('');
    return `[SIR] No: ${redacted} ███ `;
  }
];

let usedHints = [];
let availableHints = [...hintFunctions];

function resetHints() {
  availableHints = [...hintFunctions];
  usedHints = [];
}

function randomHints(num) {
  if (availableHints.length === 0) return "Başka ipucu kalmadı.";

  const unusedHints = availableHints.filter(fn => fn(num) !== null);
  const hintsToUse = unusedHints.length ? unusedHints : availableHints;

  const selectedHint = hintsToUse[Math.floor(Math.random() * hintsToUse.length)];
  const index = availableHints.indexOf(selectedHint);
  if (index !== -1) availableHints.splice(index, 1);
  usedHints.push(selectedHint);

  const hintResult = selectedHint(num);
  return hintResult !== null ? hintResult : "Başka ipucu kalmadı.";
}

// Zorluk Ayarı
function setDifficulty(level) {
  if (level === 'easy') maxNumber = 50;
  else if (level === 'medium') maxNumber = 100;
  else if (level === 'hard') maxNumber = 200;
  restartGame();
  document.getElementById('p1').textContent = `1 ile ${maxNumber} arasında bir sayı tuttum. Tahmin etmeye çalış!`;
}

// Tahmin ve Oyun Fonksiyonları
const msg = document.getElementById('message');
const hint = document.getElementById('hint');
msg.style.color = "white";
msg.style.fontSize = "16px";
msg.style.fontFamily = "monospace";

function handleGuess() {
  const guessInput = document.getElementById('guessInput');
  const guess = parseInt(guessInput.value);

  if (isNaN(guess) || guess <= 0 || guess > maxNumber) {
    msg.textContent = `Lütfen 1 ile ${maxNumber} arasında geçerli bir sayı girin!`;
    guessInput.value = "";
    guessInput.focus();
    return;
  }

  makeGuess(guess);
  guessInput.value = "";
  guessInput.focus();
}

function makeGuess(guess) {
  if (gameOver) return;

  attempts++;
  guessList.push(guess);

  hint.textContent = "İPUCU: " + randomHints(secretNumber);

  if (guess < secretNumber) {
    msg.textContent = "Daha büyük bir sayı dene!";
    markGuessedNumber(guess, false);
  } else if (guess > secretNumber) {
    msg.textContent = "Daha küçük bir sayı dene!";
    markGuessedNumber(guess, false);
  } else {
    hint.textContent = "";
    msg.textContent = `Tebrikler! ${attempts} denemede doğru tahmin ettin!`;
    markGuessedNumber(guess, true);

    confetti({
      particleCount: 700,
      spread: 1000,
      origin: { y: 0.6 }
    });
    endGame();
  }
}

function endGame() {
  document.getElementById('guessInput').disabled = true;
  document.getElementById('guessButton').disabled = true;
  gameOver = true;
  stopClock();
}

function restartGame() {
  secretNumber = Math.floor(Math.random() * maxNumber) + 1;
  startClock();
  attempts = 0;
  guessList = [];
  gameOver = false;
  resetHints();
  hint.textContent = "İPUCU: " + randomHints(secretNumber);
  document.getElementById('guessInput').disabled = false;
  document.getElementById('guessButton').disabled = false;
  document.getElementById('guessInput').value = "";
  document.getElementById('message').textContent = "Yeni oyun başladı! Tahmin etmeye başla.";
  document.getElementById('guesses').textContent = "";
  createNumberGrid();
  sPassed = 0;
}

// Grid oluşturma ve işaretleme
function createNumberGrid() {
  const grid = document.getElementById("numberGrid");
  grid.innerHTML = "";

  const columns = maxNumber <= 50 ? 10 : (maxNumber <= 100 ? 10 : 20);
  grid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
  grid.style.maxWidth = maxNumber <= 50 ? '160px' : (maxNumber <= 100 ? '320px' : '480px');

  for (let i = 1; i <= maxNumber; i++) {
    const cell = document.createElement("div");
    cell.classList.add("number-cell");
    cell.textContent = i;
    cell.id = "cell-" + i;
    cell.onclick = function () {
      makeGuess(i);
    };
    grid.appendChild(cell);
  }
}

function markGuessedNumber(number, isCorrect) {
  const cell = document.getElementById("cell-" + number);
  if (cell) {
    if (isCorrect) cell.classList.add("guessed_correct");
    else cell.classList.add("guessed_wrong");
  }
}

// Matrix efekti
const canvas = document.getElementById('matrixCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const numbers = "0123456789";
const fontSize = 16;
const columns = canvas.width / fontSize;
const drops = Array(Math.floor(columns)).fill(1);

function drawMatrix() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#00F";
  ctx.font = fontSize + "px monospace";

  for (let i = 0; i < drops.length; i++) {
    const text = numbers[Math.floor(Math.random() * numbers.length)];
    ctx.fillText(text, i * fontSize, drops[i] * fontSize);

    if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
      drops[i] = 0;
    }

    drops[i]++;
  }
}

setInterval(drawMatrix, 50);

window.onload = function () {
  startClock();
  resetHints();
  hint.textContent = "İPUCU: " + randomHints(secretNumber);
  createNumberGrid();
};
