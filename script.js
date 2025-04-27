// script.js - Updated version
document.addEventListener('DOMContentLoaded', () => {
    const askButton = document.getElementById('askButton');
    const questionInput = document.getElementById('question');
    const languageInput = document.getElementById('language');
    const explanationDiv = document.getElementById('explanation');

    askButton.addEventListener('click', async () => {
        const question = questionInput.value.trim();
        const language = languageInput.value.trim();

        if (!question) {
            explanationDiv.textContent = 'Please enter a question.';
            return;
        }

        explanationDiv.textContent = 'Thinking...';
        
        try {
            const response = await fetch('https://eli5endeza.vercel.app/api/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    question: question, 
                    language: language || 'English' // Default language
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            explanationDiv.textContent = data.explanation || 'No explanation received.';
        } catch (error) {
            console.error('Error fetching explanation:', error);
            explanationDiv.textContent = error.message || 'Failed to get explanation. Please try again later.';
        }
    });
});