const quizConceptInput = document.getElementById("quizConcept");
const vocabularyList = document.getElementById("vocabularyList");
const grammarList = document.getElementById("grammarList");
const difficultySelect = document.getElementById("difficulty");
const numQuestionsInput = document.getElementById("numQuestions");
const categorySelect = document.getElementById("category");
const quizGeneratorForm = document.getElementById("quizGeneratorForm");

let grammarPoints = [];
let vocabularyWords = [];

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
    } else if (categorySelect.value === "vocabulary") {
        vocabularyWords.push(concept);
        addVocabulary();
    }
}
}

    function addGrammar() {
        grammarList.innerHTML = "";
        grammarPoints.forEach(point => {
            const li = document.createElement("li");
            li.textContent = point;
            grammarList.appendChild(li);
        });
    }
    
    function addVocabulary() {
        vocabularyList.innerHTML = "";
        vocabularyWords.forEach(word => {
            const li = document.createElement("li");
            li.textContent = word;
            vocabularyList.appendChild(li);
        });
    }

quizConceptInput.addEventListener("keydown", addConcept);