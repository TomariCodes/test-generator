const quizConceptInput = document.getElementById("quizConcept");
const vocabularyList = document.getElementById("vocabularyList");
const grammarList = document.getElementById("grammarList");
const difficultySelect = document.getElementById("difficulty");
const numQuestionsInput = document.getElementById("numQuestions");
const categorySelect = document.getElementById("category");
const quizGeneratorForm = document.getElementById("quizGeneratorForm");
const scoreContainer = document.getElementById("scoreContainer");

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
  quizForm.addEventListener("submit", handleQuizSubmit);
  for (const question in questions) {
    let questionHTML = "";
    let questionNumber = parseInt(question) + 1;
    console.log(`Question ${questionNumber}: ${questions[question]}`);

    if (questions[question].options) {
      questionHTML = `
             <div class="mb-3">
            <label for="question-${questionNumber}-answer" class="m-2">Question ${questionNumber}:</label>
            <p class="question">${questions[question].question}</p>
            <div class="d-flex flex-column">
            ${questions[question].options
              .map((option, index) => {
                return `<div>
             <input type="radio" name="multiple-choice-${questionNumber}" id="question-${questionNumber}-option-${option}" value="${option}" />
             <label for="question-${questionNumber}-option-${option}">${getLetter(index)}. ${option}</label></div>`;
              })
              .join("")}
             </div>
             <p id="question-${questionNumber}-correct-answer" class="correct-answer noDisplay"></p>
             </div>
             `;
    } else {
      questionHTML = `
            <div class="mb-3">
            <label for="question-${questionNumber}">Question ${questionNumber}</label>
            <p class="question">${questions[question]}</p>
            <input type="text" lang="en" id="question-${questionNumber}-answer" name="question-${questionNumber}-answer" class="answer-input"/>

            <p id="question-${questionNumber}-correct-answer" class="correct-answer noDisplay"></p>
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

function handleQuizSubmit(event) {
  event.preventDefault();
  let score = 0;

  // First get user's selected answers
  // Then compare the keywords in AI answers with the user's selected answers
  let userAnswers = {};
  for (let i = 1; i <= numQuestionsInput.value; i++) {
    let answer =
      document.querySelector(`[name="multiple-choice-${i}"]:checked`)?.value ||
      document.querySelector(`#question-${i}-answer`)?.value;
    userAnswers[`question-${i}`] = answer;
  }
  for (let i = 1; i <= numQuestionsInput.value; i++) {
    let correctAnswer = answers[i - 1];

    console.log(correctAnswer);
    console.log(userAnswers[`question-${i}`]);
    // Get the input element for the user's answer
    // This will be used to highlight the user's answer if it is incorrect
    let answerInput = document.querySelector(`#question-${i}-answer`);
    let correctWords = correctAnswer.trim().toLowerCase().split(/\s+/);
    let userWords = (userAnswers[`question-${i}`] || "")
      .trim()
      .toLowerCase()
      .split(/\s+/);
    let isCorrect = correctWords.every((word) => userWords.includes(word));
    if (isCorrect) {
      score++;
    } else {
      console.log(
        `Question ${i} is incorrect. Correct answer: ${correctAnswer}`,
      );
      if (answerInput) {
        answerInput.classList.add("incorrect");
        answerInput.disabled = true;
      }
      let correctAnswerElement = document.querySelector(
        `#question-${i}-correct-answer`,
      );
      if (correctAnswerElement) {
        correctAnswerElement.classList.remove("noDisplay");
        correctAnswerElement.classList.add("highlight");
        correctAnswerElement.textContent = `Correct answer: ${correctAnswer}`;
      }
    }
  }

  // Render the correct answers
  for (let i = 1; i <= numQuestionsInput.value; i++) {
    let correctAnswerElement = document.querySelector(
      `#question-${i}-correct-answer`,
    );
    if (correctAnswerElement) {
      correctAnswerElement.classList.remove("noDisplay");
      correctAnswerElement.classList.add("highlight");
      correctAnswerElement.textContent = `Correct answer: ${answers[i - 1]}`;
    }
  }

  // Highlight the score based on pass/fail
  scoreContainer.innerHTML = `<p>Your score is \n <span>${score}</span> out of <span>${numQuestionsInput.value}</span></p>`;
  let scoreSpan = scoreContainer.querySelectorAll("span")[0];
  let totalSpan = scoreContainer.querySelectorAll("span")[1];
  if (scoreSpan && totalSpan) {
    if (score / numQuestionsInput.value >= 0.6) {
      scoreSpan.classList.add("passed");
    totalSpan.classList.add("passed");
  } else {
    scoreSpan.classList.add("failed");
    totalSpan.classList.add("failed");
  }
}
  scoreContainer.classList.remove("noDisplay");
}

quizConceptInput.addEventListener("keydown", addConcept);
quizGeneratorForm.addEventListener("submit", handleFormSubmit);
