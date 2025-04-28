// script.js - Updated version for Google Image Search URL with style and bold rendering
document.addEventListener("DOMContentLoaded", () => {
  const askButton = document.getElementById("askButton");
  const questionInput = document.getElementById("question");
  const languageInput = document.getElementById("language");
  const styleInput = document.getElementById("style");
  const explanationDiv = document.getElementById("explanation");
  const imageContainer = document.getElementById("imageContainer");

  function renderMarkdown(text) {
    // Replace **bold text** with <strong>bold text</strong>
    const boldRegex = /\*\*(.*?)\*\*/gs;
    return text.replace(boldRegex, "<strong>$1</strong>");
  }

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
      explanationDiv.innerHTML = formattedExplanation; // Use innerHTML to render HTML tags

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
});
