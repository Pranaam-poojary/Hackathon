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