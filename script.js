document.addEventListener('DOMContentLoaded', () => {
    const askButton = document.getElementById('askButton');
    const questionInput = document.getElementById('question');
    const languageInput = document.getElementById('language');
    const explanationDiv = document.getElementById('explanation');

    askButton.addEventListener('click', async () => {
        const question = questionInput.value.trim();
        const language = languageInput.value.trim();

        if (question) {
            explanationDiv.textContent = 'Thinking...';
            try {
                const response = await fetch('https://eli5endeza.vercel.app/ask', { // Point to port 5000
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ question: question, language: language })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                explanationDiv.textContent = data.explanation || 'No explanation received.';

            } catch (error) {
                console.error('Error fetching explanation:', error);
                explanationDiv.textContent = 'Failed to get explanation. Please try again later.';
            }
        } else {
            explanationDiv.textContent = 'Please enter a question.';
        }
    });
});