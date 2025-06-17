
const wordLine = document.getElementById('wordLine');
const inputEl = document.getElementById('inputEl');
const wpmDisplay = document.getElementById('wpm');
const accuracyDisplay = document.getElementById('accuracy');
const timerDisplay = document.getElementById('timer');
const keyboardVisualizer = document.getElementById("keyboardVisualizer");

let startTime, timerInterval;
let currentWordIndex = 0;
let correctChars = 0;
let totalWordsTyped = 0;
let currentUser = "";
let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
let leaderboardVisible = false;
const HIGH_WPM_THRESHOLD = 20;

function generateText() {
  const words = "home fire code learn skill digital speed practice brain logic quick fox dog run language finger focus zone edge train jump word type repeat power drive topic".split(" ");
  let result = "";
  while (result.length < 60) {
    result += words[Math.floor(Math.random() * words.length)] + " ";
  }
  return result.trim();
}

function displayText(text) {
  wordLine.innerHTML = '';
  text.split('').forEach(char => {
    const span = document.createElement('span');
    span.textContent = char;
    if (char === " ") span.classList.add("whitespace");
    wordLine.appendChild(span);
  });
}

function startTimer() {
  startTime = new Date();
  timerInterval = setInterval(() => {
    const timePassed = Math.floor((new Date() - startTime) / 1000);
    timerDisplay.textContent = timePassed;
  }, 1000);
}

function calculateWPM() {
  const timePassed = (new Date() - startTime) / 60000;
  return Math.round((correctChars / 5) / timePassed);
}

function calculateAccuracy() {
  return totalWordsTyped === 0 ? 100 : Math.round((correctChars / totalWordsTyped) * 100);
}

function reset() {
  clearInterval(timerInterval);
  timerDisplay.textContent = 0;
  currentWordIndex = 0;
  correctChars = 0;
  totalWordsTyped = 0;
  inputEl.value = '';
  const newText = generateText();
  displayText(newText);
}

inputEl.addEventListener('input', () => {
  const input = inputEl.value;
  const spanArray = wordLine.querySelectorAll('span');

  if (currentWordIndex === 0 && input.length === 1) startTimer();

  currentWordIndex = input.length;
  totalWordsTyped++;

  spanArray.forEach((span, idx) => {
    const typed = input[idx];
    span.className = typed === span.textContent ? 'correct' : (typed ? 'incorrect' : '');
  });

  correctChars = Array.from(spanArray)
    .slice(0, input.length)
    .filter((span, i) => span.textContent === input[i])
    .length;

  wpmDisplay.textContent = calculateWPM();
  accuracyDisplay.textContent = calculateAccuracy();

  if (input.length === spanArray.length) {
    const wpm = calculateWPM();
    const accuracy = calculateAccuracy();
    saveUserScore(wpm, accuracy);
    reset();
  }
});

inputEl.addEventListener("keydown", function (e) {
  if (e.key === "Backspace") e.preventDefault();
});

window.onload = () => {
  updateLeaderboardDisplay();
  reset();
};

function getUsername() {
  const usernameInput = document.getElementById("username").value.trim();
  return usernameInput || `Guest-${Math.floor(Math.random() * 10000)}`;
}

function saveUserScore(wpm, accuracy) {
  currentUser = getUsername();

  if (wpm < HIGH_WPM_THRESHOLD) return;

  let existing = leaderboard.find(entry => entry.username === currentUser);

  if (existing) {
    existing.lastWpm = existing.wpm;
    existing.lastAccuracy = existing.accuracy;
    existing.wpm = wpm;
    existing.accuracy = accuracy;
  } else {
    leaderboard.push({
      username: currentUser,
      wpm,
      accuracy,
      lastWpm: 0,
      lastAccuracy: 0
    });
  }

  localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
  updateLeaderboardDisplay();
  showPerformanceDifference(wpm, accuracy);
}

function updateLeaderboardDisplay() {
  const list = document.getElementById("leaderboard-list");
  list.innerHTML = "";

  if (leaderboard.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.textContent = "No scores yet 💔 Be the first 🥇";
    emptyItem.style.fontStyle = "italic";
    list.appendChild(emptyItem);
    return;
  }

  const sorted = leaderboard
    .sort((a, b) => b.wpm - a.wpm)
    .slice(0, 5);

  sorted.forEach((entry, i) => {
    const li = document.createElement("li");
    li.textContent = `${i + 1}. ${entry.username} - ${entry.wpm} WPM`;
    if (entry.username === currentUser) {
      li.style.backgroundColor = "#d0f0c0";
      li.style.fontWeight = "bold";
    }
    list.appendChild(li);
  });
}

function toggleLeaderboard() {
  leaderboardVisible = !leaderboardVisible;
  const leaderboardDiv = document.getElementById("leaderboard");
  const button = document.getElementById("toggleLeaderboardBtn");

  if (leaderboardVisible) {
    leaderboardDiv.classList.add("show");
    button.textContent = "🙈 Hide Leaderboard";
  } else {
    leaderboardDiv.classList.remove("show");
    button.textContent = "👁 Show Leaderboard";
  }
}

function showPerformanceDifference(currentWpm, currentAccuracy) {
  const messageBox = document.getElementById("performance-message");
  const userData = leaderboard.find(entry => entry.username === currentUser);

  if (!userData || userData.lastWpm === undefined) return;

  const wpmDiff = currentWpm - userData.lastWpm;
  const accDiff = currentAccuracy - userData.lastAccuracy;

  const wpmText = `WPM: ${currentWpm} (${wpmDiff >= 0 ? "+" : ""}${wpmDiff})`;
  const accText = `Accuracy: ${currentAccuracy}% (${accDiff >= 0 ? "+" : ""}${accDiff}%)`;

  
  
  const wpmClass = wpmDiff >= 0 ? 'improve' : 'decline';
  const accClass = accDiff >= 0 ? 'improve' : 'decline';
  messageBox.innerHTML = `
    <span class="${wpmClass}">${wpmText}</span><br>
    <span class="${accClass}">${accText}</span>
  `;
  
  
  messageBox.style.display = "block";
}
