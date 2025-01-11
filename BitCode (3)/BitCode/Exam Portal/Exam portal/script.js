let timerElement = document.getElementById("timer");
let startButton = document.getElementById("start-button");
let stopButton = document.getElementById("stop-button");
let resetButton = document.getElementById("reset-button");

let timerInterval = null;
let startTime = 900; // 10 minutes in seconds
let currentTime = startTime;

function formatTime(time) {
	let minutes = Math.floor(time / 60);
	let seconds = time % 60;
	return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

function startTimer() {
	timerInterval = setInterval(() => {
		currentTime--;
		timerElement.textContent = formatTime(currentTime);
		if (currentTime <= 0) {
			stopTimer();
		}
	}, 1000);
	startButton.disabled = true;
	stopButton.disabled = false;
}

function stopTimer() {
	clearInterval(timerInterval);
	timerInterval = null;
	startButton.disabled = false;
	stopButton.disabled = true;
}

function resetTimer() {
	currentTime = startTime;
	timerElement.textContent = formatTime(currentTime);
	stopTimer();
}

startButton.addEventListener("click", startTimer);
stopButton.addEventListener("click", stopTimer);
resetButton.addEventListener("click", resetTimer);