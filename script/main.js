const quizConceptInput = document.getElementById("quizConcept");
const vocabularyList = document.getElementById("vocabularyList");
const grammarList = document.getElementById("grammarList");
const difficultySelect = document.getElementById("difficulty");
const numQuestionsInput = document.getElementById("numQuestions");
const categorySelect = document.getElementById("category");
const quizGeneratorForm = document.getElementById("quizGeneratorForm");

let grammarPoints = [];
let vocabularyWords = [];
const apiKey = "d723abdbd1batbf0d4fo3fa95586fbba";
let context =
  "Please generate an JSON array of two objects one should contain all the questions and they should not be objects (unless it's multiple choice questions, they should be objects as well with no commas or letters, but with the question and options) and one should contain all the answers with no comments inside or text other than JSON.";
let prompt = "";
let questions = [];
let answers = [];

function parseAIJson(aiResponseText) {
  try {
    // 1. Clean up Markdown code fences if the AI wrapped the response
    let cleanText = aiResponseText.replace(/```json|```/g, "").trim();

    // 2. Extract only the JSON portion if the AI added conversational text
    const jsonStart = cleanText.indexOf("{");
    const jsonArrayStart = cleanText.indexOf("[");

    // Find whichever comes first (object or array)
    let startIndex = -1;
    if (jsonStart !== -1 && jsonArrayStart !== -1) {
      startIndex = Math.min(jsonStart, jsonArrayStart);
    } else {
      startIndex = jsonStart !== -1 ? jsonStart : jsonArrayStart;
    }

    if (startIndex === -1) {
      throw new Error("No JSON structure found in the AI response.");
    }

    // Find the last closing bracket
    const endIndex = Math.max(
      cleanText.lastIndexOf("}"),
      cleanText.lastIndexOf("]"),
    );
    cleanText = cleanText.substring(startIndex, endIndex + 1);

    // 3. Parse into a usable JavaScript object
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Failed to parse AI JSON:", error.message);
    return null;
  }
}

function addConcept(e) {
  e.preventDefault();
  if (e.key === "Enter") {
    const concept = quizConceptInput.value.trim();
    if (!concept) {
      alert("Please enter a grammar rule or vocabulary word.");
      return;
    }
    if (categorySelect.value === "grammar") {
      grammarPoints.push(concept);
      addGrammar();
      quizConceptInput.value = "";
      quizConceptInput.focus();
    } else if (categorySelect.value === "vocabulary") {
      vocabularyWords.push(concept);
      addVocabulary();
      quizConceptInput.value = "";
      quizConceptInput.focus();
    }
  }
}
function addGrammar() {
  grammarList.innerHTML = "";
  grammarPoints.forEach((point) => {
    const li = document.createElement("li");
    li.textContent = point;
    grammarList.appendChild(li);
  });
}

function addVocabulary() {
  vocabularyList.innerHTML = "";
  vocabularyWords.forEach((word) => {
    const li = document.createElement("li");
    li.textContent = word;
    vocabularyList.appendChild(li);
  });
}

function getLetter(index) {
  return String.fromCharCode(65 + index);
}

function handleMakeQuiz(response) {
  let quizHTML = "";
  data = parseAIJson(response.data.answer);
  console.log(data);
  questions = data[0].questions;
  answers = data[1].answers;
  const formContainer = document.querySelector("#formContainer");
  formContainer.innerHTML = "";
  const quizForm = document.createElement("form");
  quizForm.classList.add("quiz-form");
  formContainer.appendChild(quizForm);
  for (const question in questions) {
    let questionHTML = "";
    let questionNumber = parseInt(question) + 1;
    console.log(`Question ${questionNumber}: ${questions[question]}`);

    if (questions[question].options) {
      questionHTML = `
             <div class="mb-3">
            <label for="question-${questionNumber}" class="m-2">Question ${questionNumber}:</label>
            <p>${questions[question].question}</p>
            <div class="d-flex flex-column">
            ${questions[question].options.map((option, index) => {
              return `<div>
             <input type="radio" name="multiple-choice-${questionNumber}" id="question-${questionNumber}-option-${option}" value="${option}" />
             <label for="question-${questionNumber}-option-${option}">${getLetter(index)}. ${option}</label></div>`;
            })}
             </div>
             </div>
             `;
    } else {
      questionHTML = `
            <div class="mb-3">
            <label for="question-${questionNumber}">Question ${questionNumber}</label>
            <p>${questions[question]}</p>
            <input type="text" lang="en" id="question-${questionNumber}-answer" name="question-${questionNumber}-answer"/>
            </div>`;
    }
    quizHTML += questionHTML;
  }

  quizForm.innerHTML = quizHTML;
  let submitButton = document.createElement("button");
  submitButton.type = "submit";
  submitButton.textContent = "Submit";
  submitButton.classList.add("btn", "btn-primary");
  quizForm.appendChild(submitButton);
}

function handleFormSubmit(e) {
  e.preventDefault();
  // Logic to handle form submission and generate the quiz
  prompt = `Generate an English quiz for a Korean learner with the following context: ${context}\nGrammar Points: ${grammarPoints.join(", ")}\nVocabulary Words: ${vocabularyWords.join(", ")}\nNumber of Questions: ${numQuestions.value}\nDifficulty: ${difficulty.value}\nCategory: ${categorySelect.value}`;
  let apiURL = `https://api.shecodes.io/ai/v1/generate?prompt=${prompt}&context=${context}&key=${apiKey}`;
  axios.get(apiURL).then(handleMakeQuiz);
}

quizConceptInput.addEventListener("keydown", addConcept);
quizGeneratorForm.addEventListener("submit", handleFormSubmit);
// quizForm.addEventListener("submit", handleQuizSubmit);

// Ensure that the input field is not empty before adding a concept
// Add the new concept to the appropriate list based on the selected category
// Ensure that the lists are displayed correctly after each addition
// Ensure that the Enter key triggers the addition of the concept without submitting the form
// When the form is submitted handle making the prompt for the quiz based on the selected options and added concepts
// Use AI API to generate quiz questions and answers based on the selected options and added concepts
// Use the generated quiz questions to create an interactive quiz interface for the user
// Allow the user to take the test
// Generate the final score after the user completes the quiz and show it and the correct answers to the user.
