class ResultExporter {
    constructor(examData) {
        this.examData = examData;
    }

    // Generate result object for local storage
    generateResultObject() {
        return {
            studentId: this.examData.studentId || 'N/A',
            examId: this.examData.examId || Date.now(),
            timestamp: new Date().toISOString(),
            totalQuestions: this.examData.questions.length,
            correctAnswers: this.calculateCorrectAnswers(),
            score: this.calculateScore(),
            answers: this.examData.userAnswers.map((answer, index) => ({
                questionId: index,
                question: this.examData.questions[index].question,
                selectedOption: this.examData.questions[index].options[answer],
                correctOption: this.examData.questions[index].options[this.examData.questions[index].answer],
                isCorrect: answer === this.examData.questions[index].answer
            })),
            metadata: {
                duration: this.examData.duration,
                screenRecordingAvailable: this.examData.screenRecordingAvailable,
                webcamMonitoringPassed: this.examData.webcamMonitoringPassed
            }
        };
    }

    // Save results to local storage
    saveResultsToLocalStorage() {
        const resultObject = this.generateResultObject();
        
        // Get existing results from local storage or initialize an empty array
        const existingResults = JSON.parse(localStorage.getItem('examResults')) || [];
        
        // Add new result to the array
        existingResults.push(resultObject);
        
        // Save updated results back to local storage
        localStorage.setItem('examResults', JSON.stringify(existingResults));
    }

    // Display results in the UI
    displayResults() {
        const resultObject = this.generateResultObject();
        const resultsContainer = document.getElementById('results-container');
        
        if (!resultsContainer) {
            console.error('Results container not found');
            return;
        }

        // Clear previous results
        resultsContainer.innerHTML =('');

        // Create result display elements
        const resultDiv = document.createElement('div');
        resultDiv.classList.add('result-details');
        
        resultDiv.innerHTML = `
            <h2>Exam Results</h2>
            <p><strong>Student ID:</strong> ${resultObject.studentId}</p>
            <p><strong>Exam ID:</strong> ${resultObject.examId}</p>
            <p><strong>Total Questions:</strong> ${resultObject.totalQuestions}</p>
            <p><strong>Correct Answers:</strong> ${resultObject.correctAnswers}</p>
            <p><strong>Score:</strong> ${resultObject.score}%</p>
            <h3>Detailed Answers</h3>
            <table>
                <tr>
                    <th>Question</th>
                    <th>Selected Option</th>
                    <th>Correct Option</th>
                    <th>Result</th>
                </tr>
                ${resultObject.answers.map(answer => `
                    <tr>
                        <td>${answer.question}</td>
                        <td>${answer.selectedOption}</td>
                        <td>${answer.correctOption}</td>
                        <td>${answer.isCorrect ? '✓ Correct' : '✗ Incorrect'}</td>
                    </tr>
                `).join('')}
            </table>
        `;

        resultsContainer.appendChild(resultDiv);
    }

    // Calculate correct answers
    calculateCorrectAnswers() {
        return this.examData.userAnswers.filter((answer, index) => 
            answer === this.examData.questions[index].answer
        ).length;
    }

    // Calculate score
    calculateScore() {
        const correctAnswers = this.calculateCorrectAnswers();
        return Math.round((correctAnswers / this.examData.questions.length) * 100);
    }
}

// Make the class available globally
window.ResultExporter = ResultExporter;