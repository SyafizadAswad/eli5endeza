// script.js - Updated to handle mode selection, quiz functionality, and back buttons
document.addEventListener("DOMContentLoaded", () => {
  const learnButton = document.getElementById("learnButton");
  const quizButton = document.getElementById("quizButton");
  const modeSelection = document.getElementById("mode-selection");
  const learnSection = document.getElementById("learn-section");
  const quizSection = document.getElementById("quiz-section");

  const backToMenuLearnButton = document.getElementById("backToMenuLearn");
  const backToMenuQuizButton = document.getElementById("backToMenuQuiz");

  const askButton = document.getElementById("askButton");
  const questionInput = document.getElementById("learn-question");
  const languageInput = document.getElementById("learn-language");
  const styleInput = document.getElementById("learn-style");
  const explanationDiv = document.getElementById("explanation");
  const imageContainer = document.getElementById("imageContainer");

  const quizTopicInput = document.getElementById("quiz-topic-input");
  const suggestedTopicsDiv = document.getElementById("suggested-topics");
  const quizLanguageInput = document.getElementById("quiz-language");
  const generateQuizButton = document.getElementById("generateQuizButton");
  const quizQuestionsDiv = document.getElementById("quiz-questions");
  const submitQuizButton = document.getElementById("submitQuizButton");
  const quizFeedbackDiv = document.getElementById("quiz-feedback");
  let currentQuizQuestions = []; // Store the quiz questions with correct answers

  function renderMarkdown(text) {
    const boldRegex = /\*\*(.*?)\*\*/gs;
    return text.replace(boldRegex, "<strong>$1</strong>");
  }

  // Initially hide learn and quiz sections
  learnSection.classList.add("hidden");
  quizSection.classList.add("hidden");

  // Event listener for "Learn" button
  learnButton.addEventListener("click", () => {
    modeSelection.classList.add("hidden");
    learnSection.classList.remove("hidden");
    quizSection.classList.add("hidden");
  });

  // Event listener for "Quiz" button
  quizButton.addEventListener("click", () => {
    modeSelection.classList.add("hidden");
    learnSection.classList.add("hidden");
    quizSection.classList.remove("hidden");
    fetchSuggestedTopics();
  });

  // Event listener for "Back to Menu" button in Learn section
  backToMenuLearnButton.addEventListener("click", () => {
    modeSelection.classList.remove("hidden");
    learnSection.classList.add("hidden");
    // Optionally clear previous explanation
    explanationDiv.textContent = "";
    imageContainer.innerHTML = "";
  });

  // Event listener for "Back to Menu" button in Quiz section
  backToMenuQuizButton.addEventListener("click", () => {
    modeSelection.classList.remove("hidden");
    quizSection.classList.add("hidden");
    // Optionally clear previous quiz questions and topic input
    quizQuestionsDiv.innerHTML = "";
    quizTopicInput.value = "";
    suggestedTopicsDiv.innerHTML = ""; // Clear suggested topics as well
  });

  // Event listener for "Explain!" button (Learn mode)
  askButton.addEventListener("click", async () => {
    const question = questionInput.value.trim();
    const language = languageInput.value.trim();
    const style = styleInput.value;

    if (!question) {
      explanationDiv.textContent = "Please enter a question.";
      imageContainer.innerHTML = "";
      return;
    }

    explanationDiv.textContent = "Thinking...";
    imageContainer.innerHTML = "Searching for image...";

    try {
      const response = await fetch("https://eli5endeza.vercel.app/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question,
          language: language || "English",
          style: style,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      const formattedExplanation = renderMarkdown(
        data.explanation || "No explanation received."
      );
      explanationDiv.innerHTML = formattedExplanation;

      imageContainer.innerHTML = "";
      if (data.image) {
        const img = document.createElement("img");
        img.src = data.image;
        img.style.maxWidth = "100%";
        imageContainer.appendChild(img);
      } else {
        const noImageText = document.createElement("p");
        noImageText.textContent = "No related image found.";
        imageContainer.appendChild(noImageText);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      explanationDiv.textContent =
        error.message || "Failed to get explanation. Please try again later.";
      imageContainer.innerHTML = "";
    }
  });

  // Function to fetch and display suggested quiz topics
  async function fetchSuggestedTopics() {
    suggestedTopicsDiv.innerHTML = "Loading suggestions...";
    try {
      const response = await fetch(
        `https://eli5endeza.vercel.app/api/ask?language=${quizLanguageInput.value}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      suggestedTopicsDiv.innerHTML = "";
      if (data && Array.isArray(data.topics)) {
        data.topics.forEach((topic) => {
          const topicButton = document.createElement("button");
          topicButton.textContent = topic;
          topicButton.addEventListener("click", () => {
            quizTopicInput.value = topic;
          });
          suggestedTopicsDiv.appendChild(topicButton);
        });
      } else {
        suggestedTopicsDiv.textContent = "No topics suggested.";
      }
    } catch (error) {
      console.error("Error fetching suggested topics:", error);
      suggestedTopicsDiv.textContent = "Failed to load topic suggestions.";
    }
  }

  async function generateQuizQuestions(topic, language) {
    const textModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `
          Generate 4-5 objective multiple-choice questions about "${topic}".
          Each question should have four options labeled A, B, C, and D, with only one correct answer.
          Provide the questions and the options. Do not include the answer key.
          The questions and options should be in "${language}".
          Format the output clearly, for example:
          1. Question 1?
             A. Option A
             B. Option B
             C. Option C
             D. Option D

          2. Question 2?
             A. Option A
             B. Option B
             C. Option C
             D. Option D
          `.trim();

    const textResult = await textModel.generateContent(prompt);
    const quizText = (await textResult.response).text();
    return parseQuizResponse(quizText);
  }

  function parseQuizResponse(quizText) {
    const questions = [];
    const questionBlocks = quizText.split(/\n\d+\.\s/).slice(1); // Split after the intro sentence

    questionBlocks.forEach((block) => {
      const lines = block.trim().split("\n");
      if (lines.length >= 2) {
        const question = lines[0].trim();
        const options = {};
        let correctAnswer = null;
        let explanation = null;

        for (let i = 1; i < lines.length; i++) {
          const match = lines[i].match(
            /^\s*([A-D])\.\s(.*?)(?:\s\(Correct Answer\))?(?:\s-\s(.*))?$/
          );
          if (match) {
            const letter = match[1];
            const optionText = match[2].trim();
            options[letter] = optionText;
            if (lines[i].includes("(Correct Answer)")) {
              correctAnswer = letter;
            }
            if (match[3]) {
              explanation = match[3].trim();
            }
          }
        }

        if (Object.keys(options).length === 4 && correctAnswer) {
          questions.push({ question, options, correctAnswer, explanation });
        }
      }
    });
    return { questions };
  }

  function displayQuiz(questionsData) {
    currentQuizQuestions = questionsData.questions;
    console.log("displayQuiz called with questionsData:", questionsData);
    console.log(
      "Inside displayQuiz, currentQuizQuestions set to:",
      currentQuizQuestions
    );
    let quizHTML = "";
    currentQuizQuestions.forEach((questionData, index) => {
      quizHTML += `
              <div class="quiz-question-box" data-question-index="${index}">
                  <p><strong>${index + 1}. ${questionData.question}</strong></p>
          `;
      for (const letter in questionData.options) {
        if (questionData.options.hasOwnProperty(letter)) {
          const option = questionData.options[letter];
          quizHTML += `
                      <div class="quiz-option">
                          <input type="radio" name="q${index}" value="${letter}" id="q${index}-${letter}">
                          <label for="q${index}-${letter}">${letter}. ${option}</label>
                      </div>
                  `;
        }
      }
      quizHTML += `
                  <div class="quiz-feedback-${index}"></div>
              </div>
          `;
    });
    quizQuestionsDiv.innerHTML = quizHTML;
    submitQuizButton.classList.remove("hidden");
    quizFeedbackDiv.textContent = "";
    console.log("displayQuiz finished rendering HTML.");
  }

  generateQuizButton.addEventListener("click", async () => {
    const topic = quizTopicInput.value.trim();
    const language = quizLanguageInput.value.trim();

    if (!topic && suggestedTopicsDiv.children.length === 0) {
      quizQuestionsDiv.textContent =
        "Please enter a quiz topic or wait for suggestions to load.";
      return;
    }

    quizQuestionsDiv.textContent = "Generating quiz...";
    submitQuizButton.classList.add("hidden");
    quizFeedbackDiv.textContent = "";
    quizQuestionsDiv.innerHTML = "";
    currentQuizQuestions = []; // Reset

    console.log(
      "generateQuizButton clicked. currentQuizQuestions reset:",
      currentQuizQuestions
    );

    try {
      const response = await fetch("https://eli5endeza.vercel.app/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: topic,
          language: language || "English",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error in generateQuizButton:", errorData);
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      console.log("Data received from API:", data);
      if (data && Array.isArray(data.questions)) {
        console.log("Calling displayQuiz with:", data);
        displayQuiz(data);
        console.log(
          "displayQuiz completed. currentQuizQuestions:",
          currentQuizQuestions
        );
      } else {
        quizQuestionsDiv.textContent = "No quiz questions received.";
        console.log("No quiz questions received from API.");
      }
    } catch (error) {
      console.error("Error generating quiz:", error);
      quizQuestionsDiv.textContent =
        error.message || "Failed to generate quiz. Please try again later.";
    }
  });

  submitQuizButton.addEventListener("click", () => {
    console.log(
      "submitQuizButton clicked. currentQuizQuestions:",
      currentQuizQuestions
    );
    let correctAnswers = 0;
    if (currentQuizQuestions && Array.isArray(currentQuizQuestions)) {
      // Add a check here
      currentQuizQuestions.forEach((questionData, index) => {
        const selectedAnswer = document.querySelector(
          `input[name="q${index}"]:checked`
        );
        const feedbackDiv = document.querySelector(`.quiz-feedback-${index}`);

        if (
          selectedAnswer &&
          selectedAnswer.value === questionData.correctAnswer
        ) {
          feedbackDiv.textContent = "Correct!";
          feedbackDiv.className = `quiz-feedback-${index} feedback-correct`;
          correctAnswers++;
        } else if (selectedAnswer) {
          feedbackDiv.textContent = `Incorrect. Correct answer is ${questionData.correctAnswer}.`;
          feedbackDiv.className = `quiz-feedback-${index} feedback-incorrect`;
          if (questionData.explanation) {
            const explanationDiv = document.createElement("p");
            explanationDiv.className = "feedback-explanation";
            explanationDiv.textContent = questionData.explanation;
            feedbackDiv.appendChild(explanationDiv);
          }
        } else {
          feedbackDiv.textContent = `You didn't answer this question. Correct answer is ${questionData.correctAnswer}.`;
          feedbackDiv.className = `quiz-feedback-${index} feedback-incorrect`;
          if (questionData.explanation) {
            const explanationDiv = document.createElement("p");
            explanationDiv.className = "feedback-explanation";
            explanationDiv.textContent = questionData.explanation;
            feedbackDiv.appendChild(explanationDiv);
          }
        }
      });

      quizFeedbackDiv.textContent = `You got ${correctAnswers} out of ${currentQuizQuestions.length} correct!`;
    } else {
      console.error(
        "currentQuizQuestions is undefined or not an array when submitting."
      );
      quizFeedbackDiv.textContent =
        "Error submitting quiz. Please generate a new quiz.";
    }
  });
});
