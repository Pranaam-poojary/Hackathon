// Integrated Key Blocker Class
class KeyBlocker {
    constructor() {
        this.blockedKeys = [
            'Escape', 
            'ControlLeft', 'ControlRight', 
            'ShiftLeft', 'ShiftRight', 
            'AltLeft', 'AltRight', 
            'MetaLeft', 'MetaRight', 
            'Tab'
        ];
        this.boundBlockKeys = this.blockKeys.bind(this);
    }

    blockKeys(event) {
        if (this.blockedKeys.includes(event.code)) {
            // Show warning for blocked key
            examWarningSystem.showKeyBlockWarning(event.code);
            
            event.preventDefault();
            event.stopPropagation();
            return false;
        }
    }

    enableBlocking() {
        document.addEventListener('keydown', this.boundBlockKeys, true);
    }

    disableBlocking() {
        document.removeEventListener('keydown', this.boundBlockKeys, true);
    }
}

// Integrated Screen Recorder Class
class ScreenRecorder {
    constructor() {
        this.stream = null;
        this.recorder = null;
        this.chunks = [];
    }

    async startRecording() {
        try {
            this.stream = await navigator.mediaDevices.getDisplayMedia({
                video: { 
                    displaySurface: 'browser',
                    preferCurrentTab: true
                },
                audio: true
            });

            this.recorder = new MediaRecorder(this.stream, {
                mimeType: 'video/webm'
            });

            this.recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.chunks.push(event.data);
                }
            };

            this.recorder.onstop = this.saveRecording.bind(this);
            this.recorder.start();

            this.stream.getVideoTracks()[0].onended = () => {
                this.stopRecording();
            };

            return true;
        } catch (err) {
            console.error('Screen recording error:', err);
            this.showErrorDialog('Screen recording permission is required to start the exam.');
            return false;
        }
    }

    stopRecording() {
        if (this.recorder && this.recorder.state !== 'inactive') {
            this.recorder.stop();
        }
        
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
    }

    saveRecording() {
        const blob = new Blob(this.chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `exam_recording_${new Date().toISOString()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
        this.chunks = [];
    }

    showErrorDialog(message) {
        alert(message);
    }
}

const questions = [
    {
        question: "What is the capital of France?",
        options: ["Berlin", "Paris", "Rome", "Madrid"],
        answer: 1
    },
    {
        question: "What is the highest mountain in the world?",
        options: ["K2", "Kangchenjunga", "Lhotse", "Mount Everest"],
        answer: 3
    },
    {
        question: "What is the currency of the United States?",
        options: ["Dollar", "Euro", "Pound", "Yen"],
        answer: 0
    },
    {
        question: "What is the capital of India?",
        options: ["Mumbai", "Delhi", "Kolkata", "Chennai"],
        answer: 1
    },
    {
        question: "What is the largest planet in our solar system?",
        options: ["Mars", "Jupiter", "Saturn", "Neptune"],
        answer: 1
    },
    {
        question: "What is the smallest country in the world?",
        options: ["Monaco", "Nauru", "Tuvalu", "Vatican City"],
        answer: 3
    },
    {
        question: "What is the name of the first woman to fly solo across the Atlantic Ocean?",
        options: ["Amelia Earhart", "Bessie Coleman", "Harriet Quimby", "Ruth Elder"],
        answer: 0
    },
    {
        question: "What is the chemical symbol for gold?",
        options: ["Ag", "Au", "Fe", "Hg"],
        answer: 1
    },
    {
        question: "What is the name of the largest ocean on Earth?",
        options: ["Atlantic Ocean", "Indian Ocean", "Pacific Ocean", "Arctic Ocean"],
        answer: 2
    },
    {
        question: "What is the name of the tallest building in the world?",
        options: ["Burj Khalifa", "Shanghai Tower", "Abraj Al-Bait Clock Tower", "One World Trade Center"],
        answer: 0
    },
    {
        question: "What is the name of the first person to walk on the moon?",
        options: ["Buzz Aldrin", "Neil Armstrong", "Michael Collins", "Edwin Aldrin"],
        answer: 1
    },
    {
        question: "What is the name of the longest river in the world?",
        options: ["Amazon River", "Nile River", "Yangtze River", "Mississippi River"],
        answer: 1
    },
    {
        question: "What is the name of the largest desert in the world?",
        options: ["Sahara Desert", "Antarctica", "Arabian Desert", "Gobi Desert"],
        answer: 1
    },
    {
        question: "What is the name of the smallest continent in the world?",
        options: ["Australia", "Asia", "Africa", "Europe"],
        answer: 0
    },
    {
        question: "What is the name of the largest country in the world by land area?",
        options: ["USA", "China", "Canada", "Russia"],
        answer: 3
    }
];

let currentQuestion = 0;
let selectedOption = null;
let timerInterval;
let timeRemaining = 30;
let userAnswers = [];

const questionElement = document.querySelector(".question");
const optionsElement = document.querySelector(".options");
const timerElement = document.querySelector(".timer");
const submitButton = document.getElementById("submit-button");
const nextButton = document.getElementById("next-button");
const resultContainer = document.querySelector(".result-container");
const scoreElement = document.getElementById("score");
const downloadButton = document.getElementById("download-button");
const resultsList = document.getElementById("results-list");
const finalSubmitButton = document.getElementById("final-submit-button");
const startButton = document.getElementById("start-button");
const backButton = document.getElementById("back-button");
const agreeCheckbox = document.getElementById("agree-checkbox");
const examContainer = document.getElementById("exam-container");

agreeCheckbox.addEventListener("change", () => {
    startButton.disabled = !agreeCheckbox.checked;
});

let webcamStream;
let audioStream;

startButton.addEventListener("click", () => {
    checkAndRequestPermissions();
});

function checkAndRequestPermissions() {
    Promise.all([
        navigator.permissions.query({ name: 'microphone' }),
        navigator.permissions.query({ name: 'camera' })
    ]).then(([micPermission, camPermission]) => {
        if (micPermission.state === 'granted' && camPermission.state === 'granted') {
            startMediaStreams();
        } else {
            requestPermissions();
        }
    }).catch(err => {
        console.error("Error checking permissions:", err);
        showErrorDialog("An error occurred while checking permissions. Please try again.");
    });
}

function requestPermissions() {
    navigator.mediaDevices.getUserMedia({ audio: true, video: true })
        .then(stream => {
            webcamStream = stream;
            audioStream = stream;
            showConfirmationDialog();
        })
        .catch(err => {
            console.error("Error accessing the microphone or camera:", err);
            handleMediaError(err);
        });
}

function startMediaStreams() {
    navigator.mediaDevices.getUserMedia({ audio: true, video: true })
        .then(stream => {
            webcamStream = stream;
            audioStream = stream;
            showConfirmationDialog();
        })
        .catch(err => {
            console.error("Error accessing the microphone or camera:", err);
            handleMediaError(err);
        });
}

function handleMediaError(err) {
    if (err.name === "NotAllowedError") {
        showPermissionDeniedDialog();
    } else if (err.name === "NotFoundError") {
        showErrorDialog("No microphone or camera found. Please check your device and try again.");
    } else {
        showErrorDialog("An error occurred while accessing your microphone or camera. Please try again.");
    }
}

function showErrorDialog(message) {
    const errorDialog = document.createElement("div");
    errorDialog.className = "dialog";
    errorDialog.id = "error-dialog";
    errorDialog.innerHTML = `
                <p>${message}</p>
                <button id="error-ok-button">OK</button>
            `;
    document.body.appendChild(errorDialog);

    document.getElementById("error-ok-button").addEventListener("click", () => {
        document.body.removeChild(errorDialog);
    });
}

function showPermissionDeniedDialog() {
    const deniedDialog = document.createElement("div");
    deniedDialog.style.position = "fixed";
    deniedDialog.style.top = "50%";
    deniedDialog.style.left = "50%";
    deniedDialog.style.transform = "translate(-50%, -50%)";
    deniedDialog.style.backgroundColor = "#fff";
    deniedDialog.style.padding = "20px";
    deniedDialog.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.2)";
    deniedDialog.style.zIndex = "1000";
    deniedDialog.innerHTML = `
                <p style="color: red;">Warning: Microphone and/or camera access is not granted.</p>
                <p>The exam requires both microphone and camera access. Please enable them in your browser settings and try again.</p>
                <button id="denied-ok-button">OK</button>
            `;
    document.body.appendChild(deniedDialog);

    document.getElementById("denied-ok-button").addEventListener("click", () => {
        document.body.removeChild(deniedDialog);
    });
}

function showConfirmationDialog() {
    const confirmationDialog = document.createElement("div");
    confirmationDialog.className = "dialog";
    confirmationDialog.id = "confirmation-dialog";
    confirmationDialog.innerHTML = `
                <p>Microphone and camera access granted. Are you sure you want to start the test?</p>
                <button id="yes-button">Yes</button>
                <button id="no-button">No</button>
            `;
    document.body.appendChild(confirmationDialog);

    document.getElementById("yes-button").addEventListener("click", () => {
        document.body.removeChild(confirmationDialog);
        document.querySelector(".container").style.display = "none";
        document.getElementById("calibration-container").style.display = "block";
        startCalibration(audioStream.getAudioTracks()[0]);
    });

    document.getElementById("no-button").addEventListener("click", () => {
        document.body.removeChild(confirmationDialog);
        if (webcamStream) {
            webcamStream.getTracks().forEach(track => track.stop());
            webcamStream = null;
            audioStream = null;
        }
    });
}

backButton.addEventListener("click", () => {
    if (confirm("Are you sure you want to go back?")) {
        alert("The exam will be terminated.");
        window.close();
    }
});

function loadQuestion() {
    const questionData = questions[currentQuestion];
    questionElement.textContent = questionData.question;
    optionsElement.innerHTML = "";
    selectedOption = null;

    questionData.options.forEach((option, index) => {
        const optionElement = document.createElement("div");
        optionElement.classList.add("option");
        optionElement.textContent = option;
        optionElement.addEventListener("click", () => selectOption(index));
        optionsElement.appendChild(optionElement);
    });

    startTimer();
    nextButton.style.display = "none";
    submitButton.style.display = "block";
}

function selectOption(index) {
    if (selectedOption !== null) {
        optionsElement.children[selectedOption].classList.remove("selected");
    }
    selectedOption = index;
    optionsElement.children[selectedOption].classList.add("selected");
}

let noiseViolationCount = 0;
const MAX_NOISE_VIOLATIONS = 3;

function startTimer() {
    clearInterval(timerInterval);
    timeRemaining = 30;
    updateTimerDisplay();
    timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();
        if (timeRemaining === 0) {
            clearInterval(timerInterval);
            submitAnswer();
        }
    }, 1000);
}

function updateTimerDisplay() {
    timerElement.textContent = `Time Remaining: ${timeRemaining}s`;
}

function nextQuestion() {
    currentQuestion++;
    if (currentQuestion < questions.length) {
        loadQuestion();
        enableOptions(); // Re-enable options when next question is loaded
    } else {
        showResults();
    }
}

function submitAnswer() {
    clearInterval(timerInterval);
    if (selectedOption === null) {
        userAnswers[currentQuestion] = -1; // -1 indicates no answer
    } else {
        userAnswers[currentQuestion] = selectedOption;
    }

    disableOptions();
    submitButton.style.display = "none";
    nextButton.style.display = "block";
}

function disableOptions() {
    optionsElement.querySelectorAll(".option").forEach(option => {
        option.removeEventListener("click", selectOption);
        option.style.pointerEvents = "none";
    });
}

function enableOptions() {
    optionsElement.querySelectorAll(".option").forEach(option => {
        option.style.pointerEvents = "auto";
    });
}

function showResults() {
    let score = 0;
    userAnswers.forEach((answer, index) => {
        if (answer === questions[index].answer) {
            score++;
        }
    });
    scoreElement.textContent = `${score}/${questions.length}`;

    resultsList.innerHTML = "";
    questions.forEach((q, index) => {
        const resultItem = document.createElement("li");
        const userAnswer = userAnswers[index] === -1 ? "No answer" : q.options[userAnswers[index]];
        resultItem.innerHTML = `
                    <strong>Question ${index + 1}:</strong> ${q.question}<br>
                    Your answer: ${userAnswer}<br>
                    Correct answer: ${q.options[q.answer]}<br>
                    ${userAnswers[index] === q.answer ? '<span style="color: green;">Correct</span>' : '<span style="color: red;">Incorrect</span>'}
                `;
        resultsList.appendChild(resultItem);
    });

    resultContainer.style.display = "block";
}

downloadButton.addEventListener("click", () => {
    const resultsText = `Your score: ${scoreElement.textContent}\n\n` +
        questions.map((q, index) => {
            const userAnswer = userAnswers[index] === -1 ? "No answer" : q.options[userAnswers[index]];
            return `Question ${index + 1}: ${q.question}\nYour answer: ${userAnswer}\nCorrect answer: ${q.options[q.answer]}\n${userAnswers[index] === q.answer ? 'Correct' : 'Incorrect'}`;
        }).join("\n\n");

    const blob = new Blob([resultsText], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "exam_results.txt";
    link.click();
    window.URL.revokeObjectURL(url);
});

// Modify the final submit button event listener
finalSubmitButton.addEventListener("click", () => {
    // Prepare exam data
    const examResultData = {
        studentId: localStorage.getItem('studentId') || 'Anonymous',
        examId: Date.now(),
        questions: questions,
        userAnswers: userAnswers,
        duration: 30 - timeRemaining, // Total exam duration
        screenRecordingAvailable: screenRecorder.stream !== null,
        webcamMonitoringPassed: true // You may want to add actual logic here
    };

    // Create and use ResultExporter
    const resultExporter = new ResultExporter(examResultData);
    resultExporter.exportResults();

    // End the exam
    endExam('Exam Submitted');
});

document.addEventListener("copy", function (event) {
    event.preventDefault();
}, true);

let isExamStarted = false;
let tabSwitchCount = 0;
const MAX_TAB_SWITCHES = 3;
let webcamViolationCount = 0;
const MAX_WEBCAM_VIOLATIONS = 3;
const DARKNESS_THRESHOLD = 10; // Adjust this value as needed

function startExam() {
    try {
        document.getElementById("calibration-container").style.display = "none";
        document.querySelector(".timer-container").style.display = "block";
        examContainer.style.display = "flex";
        if (webcamStream) {
            document.getElementById("webcam-container").style.display = "block";
        }
        loadQuestion();
        updateAnsweredCount();
        if (audioStream) startNoiseDetection();
        if (webcamStream) startWebcam();
        isExamStarted = true;
    } catch (err) {
        console.error("Error starting the exam:", err);
        showErrorDialog("An error occurred while starting the exam. Please refresh the page and try again.");
    }
}

function startWebcam() {
    if (webcamStream) {
        const video = document.getElementById('webcam-video');
        video.srcObject = webcamStream;
        video.onloadedmetadata = () => {
            video.play();
            checkWebcamDarkness();
        };
    } else {
        console.warn("Webcam stream not available. Video monitoring disabled.");
    }
}

function checkWebcamDarkness() {
    if (!isExamStarted || !webcamStream) return;

    const video = document.getElementById('webcam-video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    let brightness = 0;
    for (let i = 0; i < data.length; i += 4) {
        brightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
    }
    brightness /= (data.length / 4);

    if (brightness < DARKNESS_THRESHOLD) {
        handleWebcamViolation();
    }

    setTimeout(checkWebcamDarkness, 1000); // Check every second
}

function handleWebcamViolation() {
    examWarningSystem.showWebcamBlockWarning();
}

function endExam(reason) {
    isExamStarted = false;
    alert(reason);
    userAnswers = userAnswers.map(() => -1);
    showResults();
    scoreElement.textContent = `0/${questions.length}`;
    disableExamInteractions();

    if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
    }

    // Close the page after a short delay to allow the user to see the final message
    setTimeout(() => {
        window.close();
    }, 3000);
}

window.addEventListener("blur", function () {
    if (isExamStarted && !document.getElementById('warning-ok-button')) {
        tabSwitchCount++;
        
        // Show tab switch warning
        examWarningSystem.showTabSwitchWarning();

        if (tabSwitchCount >= MAX_TAB_SWITCHES) {
            endExam('Excessive tab switching');
        }
    }
});

function showWarningDialog(message) {
    const warningDialog = document.createElement("div");
    warningDialog.className = "dialog";
    warningDialog.id = "warning-dialog";
    warningDialog.innerHTML = `
                <p>${message}</p>
                <button id="warning-ok-button">OK</button>
            `;
    document.body.appendChild(warningDialog);

    document.getElementById("warning-ok-button").addEventListener("click", () => {
        document.body.removeChild(warningDialog);
    });
}

function disableExamInteractions() {
    // Disable all buttons and inputs
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => button.disabled = true);

    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => input.disabled = true);

    // Optionally, show a message indicating the exam has ended
    const examEndedMessage = document.createElement('div');
    examEndedMessage.textContent = "The exam has ended. Please contact the administrator.";
    examEndedMessage.style.color = "#f44336";
    examEndedMessage.style.fontWeight = "bold";
    examEndedMessage.style.marginTop = "20px";
    document.body.appendChild(examEndedMessage);
}

let audioContext;
let microphone;
let analyser;
let calibrationThreshold;
let noiseWarningCount = 0;
const MAX_NOISE_WARNINGS = 3;

function startCalibration(audioTrack) {
    if (!audioTrack) {
        console.warn("No audio track available. Skipping calibration.");
        startExam();
        return;
    }

    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        microphone = audioContext.createMediaStreamSource(new MediaStream([audioTrack]));
        analyser = audioContext.createAnalyser();
        microphone.connect(analyser);

        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        let calibrationSum = 0;
        let calibrationCount = 0;
        let calibrationTime = 15;

        const calibrationInterval = setInterval(() => {
            analyser.getByteFrequencyData(dataArray);
            const volume = dataArray.reduce((acc, val) => acc + val, 0) / bufferLength;
            calibrationSum += volume;
            calibrationCount++;

            // Update volume meter
            const volumeBar = document.getElementById("volume-bar");
            volumeBar.style.width = `${(volume / 255) * 100}%`;

            document.getElementById("calibration-countdown").textContent = calibrationTime;
            calibrationTime--;

            if (calibrationTime < 0) {
                clearInterval(calibrationInterval);
                calibrationThreshold = calibrationSum / calibrationCount * 1.5; // Set threshold to 150% of average
                document.getElementById("calibration-container").innerHTML = "<h3>Calibration Complete</h3><button id='start-test-button'>Start Test</button>";
                document.getElementById("start-test-button").addEventListener("click", startExam);
            }
        }, 1000);
    } catch (err) {
        console.error("Error during audio calibration:", err);
        showErrorDialog("An error occurred during audio setup. The exam will start without audio monitoring.");
        startExam();
    }
}

function startNoiseDetection() {
    if (!audioStream) {
        console.warn("Audio stream not available. Noise detection disabled.");
        return;
    }

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function checkNoise() {
        if (!isExamStarted) return; // Stop checking if exam has ended

        analyser.getByteFrequencyData(dataArray);
        const volume = dataArray.reduce((acc, val) => acc + val, 0) / bufferLength;

        if (volume > calibrationThreshold) {
            handleNoiseViolation();
        }

        requestAnimationFrame(checkNoise);
    }

    checkNoise();
}

function handleNoiseViolation() {
    noiseViolationCount++;
    timeRemaining = 0;
    updateTimerDisplay();

    if (noiseViolationCount >= MAX_NOISE_VIOLATIONS) {
        endExam("You have exceeded the noise limit 3 times. The exam has been terminated.");
    } else {
        alert(`Excessive noise detected. Timer reset to 0. Violation ${noiseViolationCount}/${MAX_NOISE_VIOLATIONS}`);
        submitAnswer();
    }
}

submitButton.addEventListener("click", submitAnswer, true);
nextButton.addEventListener("click", nextQuestion);

document.addEventListener("keydown", function (event) {
    if (event.ctrlKey || event.key === "PrintScreen" || event.key === "F12") {
        event.preventDefault();
    }
});

document.addEventListener("selectstart", function (event) {
    event.preventDefault();
});

document.addEventListener("contextmenu", function (event) {
    event.preventDefault();
});

// Enhanced Warning Dialog System
class ExamWarningSystem {
    constructor() {
        this.warningCount = 0;
        this.MAX_WARNINGS = 3;
    }

    createWarningDialog(message, type = 'warning') {
        // Remove any existing warning dialogs
        const existingDialog = document.getElementById('exam-warning-dialog');
        if (existingDialog) {
            existingDialog.remove();
        }

        // Create warning dialog
        const dialog = document.createElement('div');
        dialog.id = 'exam-warning-dialog';
        dialog.style.position = 'fixed';
        dialog.style.top = '50%';
        dialog.style.left = '50%';
        dialog.style.transform = 'translate(-50%, -50%)';
        dialog.style.backgroundColor = type === 'critical' ? '#ff4444' : '#ffbb33';
        dialog.style.color = 'white';
        dialog.style.padding = '20px';
        dialog.style.borderRadius = '10px';
        dialog.style.zIndex = '9999';
        dialog.style.textAlign = 'center';
        dialog.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';

        // Warning message
        const warningText = document.createElement('p');
        warningText.textContent = message;
        warningText.style.marginBottom = '15px';
        dialog.appendChild(warningText);

        // Warning count
        this.warningCount++;
        const warningCountText = document.createElement('p');
        warningCountText.textContent = `Warning ${this.warningCount} of ${this.MAX_WARNINGS}`;
        warningCountText.style.fontSize = '0.8em';
        dialog.appendChild(warningCountText);

        // OK Button
        const okButton = document.createElement('button');
        okButton.textContent = 'OK';
        okButton.style.backgroundColor = 'white';
        okButton.style.color = 'black';
        okButton.style.border = 'none';
        okButton.style.padding = '10px 20px';
        okButton.style.borderRadius = '5px';
        okButton.style.cursor = 'pointer';
        okButton.addEventListener('click', () => {
            dialog.remove();
        });
        dialog.appendChild(okButton);

        // Add to body
        document.body.appendChild(dialog);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (document.body.contains(dialog)) {
                dialog.remove();
            }
        }, 5000);

        // Check if max warnings reached
        if (this.warningCount >= this.MAX_WARNINGS) {
            this.endExamDueToViolations();
        }

        return this.warningCount;
    }

    showKeyBlockWarning(key) {
        const keyMappings = {
            'Escape': 'Escape (Exit) key',
            'ControlLeft': 'Left Control key',
            'ControlRight': 'Right Control key',
            'ShiftLeft': 'Left Shift key',
            'ShiftRight': 'Right Shift key',
            'AltLeft': 'Left Alt key',
            'AltRight': 'Right Alt key',
            'MetaLeft': 'Left Command/Windows key',
            'MetaRight': 'Right Command/Windows key',
            'Tab': 'Tab key'
        };

        const keyName = keyMappings[key] || key;
        return this.createWarningDialog(`Exam Violation: ${keyName} is blocked during the exam.`, 'warning');
    }

    showTabSwitchWarning() {
        return this.createWarningDialog('Exam Violation: Tab switching is not allowed during the exam.', 'warning');
    }

    showWebcamBlockWarning() {
        return this.createWarningDialog('Exam Violation: Camera access is required throughout the exam.', 'critical');
    }

    showNoiseDetectionWarning() {
        return this.createWarningDialog('Exam Violation: Excessive background noise detected.', 'warning');
    }

    endExamDueToViolations() {
        // Implement exam termination logic
        alert('Exam terminated due to multiple violations.');
        // You might want to call your existing endExam function here
        endExam('Multiple exam violations');
    }
}

// Instantiate the warning system
const examWarningSystem = new ExamWarningSystem();

// Add side panel to track how many questions are answered
const sidePanel = document.createElement('div');
sidePanel.className = 'side-panel';
document.body.appendChild(sidePanel);

const answeredCount = document.createElement('div');
answeredCount.className = 'answered-count';
answeredCount.textContent = `Answered: 0/${questions.length}`;
sidePanel.appendChild(answeredCount);

function updateAnsweredCount() {
    const answered = userAnswers.filter(answer => answer !== null).length;
    answeredCount.textContent = `Answered: ${answered}/${questions.length}`;
}

// Update the count whenever an answer is submitted
submitButton.addEventListener("click", function () {
    updateAnsweredCount();
});

// Handle window resize
window.addEventListener("resize", function () {
    document.querySelector(".container").style.height = `${window.innerHeight}px`;
});

// CSS for side panel
const style = document.createElement('style');
style.textContent = `
            .side-panel {
                position: fixed;
                top: 50%;
                right: 0;
                transform: translateY(-50%);
                background-color: #f8f9fa;
                border: 1px solid #ddd;
                border-radius: 8px 0 0 8px;
                padding: 20px;
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                font-family: sans-serif;
                font-size: 1rem;
                color: #333;
            }

            .answered-count {
                font-weight: bold;
            }

            /* Add scrolling */
            .container {
                overflow-y: auto;
                max-height: 100vh;
            }

            body {
                max-height: 100vh;
                overflow: hidden; /* Prevent body scroll if needed */
            }
        `;
document.head.appendChild(style);

document.head.appendChild(style);