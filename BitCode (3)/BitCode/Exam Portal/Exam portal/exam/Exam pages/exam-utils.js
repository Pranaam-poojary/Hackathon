class ExamManager {
    constructor(screenRecorder, keyBlocker) {
        this.screenRecorder = screenRecorder;
        this.keyBlocker = keyBlocker;
        this.eyeTracker = null;
        this.isExamStarted = false;
    }

    async startExam() {
        // Request screen recording permission
        const permissionGranted = await this.screenRecorder.startRecording();
        
        if (!permissionGranted) {
            this.endExam('Screen recording permission denied');
            return;
        }
        
        // Enable key blocking
        this.keyBlocker.enableBlocking();
        
        // Start exam-related functions
        this.isExamStarted = true;
        this.startTimer();
        this.loadQuestion(0);
        this.startWebcam();
        this.startNoiseDetection();

        // Initialize eye tracking
        this.eyeTracker = new EyeTracker(this);
        const eyeTrackingInitialized = await this.eyeTracker.initializeTracking();

        if (!eyeTrackingInitialized) {
            // Handle eye tracking initialization failure
            this.showErrorDialog('Eye tracking could not be initialized');
            return;
        }
    }

    endExam(reason) {
        // Stop screen recording
        this.screenRecorder.stopRecording();
        
        // Disable key blocking
        this.keyBlocker.disableBlocking();
        
        // Stop eye tracking
        if (this.eyeTracker) {
            this.eyeTracker.stopTracking();
        }
        
        // Additional exam end logic
        this.isExamStarted = false;
        this.showResults();
    }

    // Placeholder methods - implement based on your existing exam logic
    startTimer() {
        // Implement timer start logic
    }

    loadQuestion(index) {
        // Implement question loading logic
    }

    startWebcam() {
        // Implement webcam start logic
    }

    startNoiseDetection() {
        // Implement noise detection logic
    }

    showResults() {
        // Implement results display logic
    }

    showErrorDialog(message) {
        // Create a simple error dialog
        const dialog = document.createElement('div');
        dialog.className = 'error-dialog';
        dialog.innerHTML = `
            <h2>Error</h2>
            <p>${message}</p>
            <button onclick="this.parentElement.remove()">Close</button>
        `;
        document.body.appendChild(dialog);
    }
}