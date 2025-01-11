class EyeTracker {
    constructor(examManager) {
        this.examManager = examManager;
        this.warningCount = 0;
        this.MAX_WARNINGS = 3;
        this.isTracking = false;
        this.video = null;
        this.canvas = null;
        this.ctx = null;
        this.faceMesh = null;
    }

    async initializeTracking() {
        // Check if WebGL and MediaPipe are supported
        if (!this.isWebGLSupported() || !this.isMediaPipeSupported()) {
            console.error('WebGL or MediaPipe not supported');
            return false;
        }

        // Initialize video and canvas
        this.video = document.createElement('video');
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');

        try {
            // Request webcam access
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            this.video.srcObject = stream;
            await new Promise(resolve => {
                this.video.onloadedmetadata = resolve;
                this.video.play();
            });

            // Load MediaPipe FaceMesh
            this.faceMesh = new FaceMesh({
                locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
            });

            this.faceMesh.setOptions({
                maxNumFaces: 1,
                refineLandmarks: true,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });

            this.faceMesh.onResults(this.processEyeTracking.bind(this));

            this.startTracking();
            return true;
        } catch (error) {
            console.error('Error initializing eye tracking:', error);
            return false;
        }
    }

    startTracking() {
        if (!this.isTracking) {
            this.isTracking = true;
            this.processVideoFrame();
        }
    }

    stopTracking() {
        this.isTracking = false;
    }

    processVideoFrame() {
        if (!this.isTracking) return;

        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;
        this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);

        this.faceMesh.send({ image: this.canvas });
        requestAnimationFrame(this.processVideoFrame.bind(this));
    }

    processEyeTracking(results) {
        if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
            this.handleEyeTrackingViolation('No face detected');
            return;
        }

        const landmarks = results.multiFaceLandmarks[0];
        const eyePositions = this.calculateEyePositions(landmarks);
        
        if (!this.areEyesInsideScreen(eyePositions)) {
            this.handleEyeTrackingViolation('Eyes outside screen');
        }
    }

    calculateEyePositions(landmarks) {
        // MediaPipe Face Mesh landmark indices for left and right eyes
        const LEFT_EYE_INDICES = [33, 133, 157, 158, 159, 160, 161, 173];
        const RIGHT_EYE_INDICES = [362, 263, 386, 387, 388, 389, 390, 398];

        const getEyeCenter = (indices) => {
            const eyeLandmarks = indices.map(index => landmarks[index]);
            const centerX = eyeLandmarks.reduce((sum, lm) => sum + lm.x, 0) / indices.length;
            const centerY = eyeLandmarks.reduce((sum, lm) => sum + lm.y, 0) / indices.length;
            return { x: centerX, y: centerY };
        };

        return {
            leftEye: getEyeCenter(LEFT_EYE_INDICES),
            rightEye: getEyeCenter(RIGHT_EYE_INDICES)
        };
    }

    areEyesInsideScreen(eyePositions) {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        const isInside = (eye) => {
            return eye.x >= 0 && eye.x <= 1 &&  // Normalized coordinates
                   eye.y >= 0 && eye.y <= 1;
        };

        return isInside(eyePositions.leftEye) && isInside(eyePositions.rightEye);
    }

    handleEyeTrackingViolation(reason) {
        this.warningCount++;

        // Create and show warning dialog
        const warningDialog = document.createElement('div');
        warningDialog.className = 'eye-tracking-warning';
        warningDialog.innerHTML = `
            <h2>Eye Tracking Violation</h2>
            <p>Reason: ${reason}</p>
            <p>Warning ${this.warningCount} of ${this.MAX_WARNINGS}</p>
        `;
        document.body.appendChild(warningDialog);

        // Remove warning after 3 seconds
        setTimeout(() => {
            document.body.removeChild(warningDialog);
        }, 3000);

        // Check if max warnings reached
        if (this.warningCount >= this.MAX_WARNINGS) {
            this.examManager.endExam('Excessive eye tracking violations');
        }
    }

    isWebGLSupported() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && 
                      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    }

    isMediaPipeSupported() {
        return typeof FaceMesh !== 'undefined';
    }
}

// Make the class available globally
window.EyeTracker = EyeTracker;