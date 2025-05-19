// Store flashcards in localStorage
let decks = JSON.parse(localStorage.getItem('flashcards')) || {};

// Sample flashcard decks
const sampleDecks = {
    "Basic Math": [
        { front: "What is 7 x 8?", back: "56" },
        { front: "What is 12 + 15?", back: "27" },
        { front: "What is 100 ÷ 4?", back: "25" },
        { front: "What is 32 - 17?", back: "15" },
        { front: "What is the square root of 81?", back: "9" },
        { front: "What is 15% of 200?", back: "30" },
        { front: "What is 5³?", back: "125" },
        { front: "What is π (pi) rounded to 2 decimal places?", back: "3.14" }
    ],
    "World Capitals": [
        { front: "What is the capital of France?", back: "Paris" },
        { front: "What is the capital of Japan?", back: "Tokyo" },
        { front: "What is the capital of Brazil?", back: "Brasília" },
        { front: "What is the capital of Australia?", back: "Canberra" },
        { front: "What is the capital of Egypt?", back: "Cairo" },
        { front: "What is the capital of Canada?", back: "Ottawa" },
        { front: "What is the capital of South Korea?", back: "Seoul" },
        { front: "What is the capital of Italy?", back: "Rome" }
    ],
    "Programming Basics": [
        { front: "What is a variable?", back: "A container for storing data values" },
        { front: "What is a function?", back: "A block of code designed to perform a particular task" },
        { front: "What is an array?", back: "A special variable that can hold multiple values" },
        { front: "What is a loop?", back: "A way to execute a block of code multiple times" },
        { front: "What is an object?", back: "A container for properties and methods" },
        { front: "What is debugging?", back: "The process of finding and fixing errors in code" },
        { front: "What is an API?", back: "Application Programming Interface - a set of rules for building software" },
        { front: "What is a boolean?", back: "A data type that has only two values: true or false" }
    ],
    "English Vocabulary": [
        { front: "Ubiquitous", back: "Present, appearing, or found everywhere" },
        { front: "Ephemeral", back: "Lasting for a very short time" },
        { front: "Pragmatic", back: "Dealing with things sensibly and realistically" },
        { front: "Ambiguous", back: "Open to more than one interpretation" },
        { front: "Resilient", back: "Able to recover quickly from difficulties" },
        { front: "Paradigm", back: "A typical example or pattern of something" }
    ],
    "Science Facts": [
        { front: "What is photosynthesis?", back: "The process by which plants convert light energy into chemical energy" },
        { front: "What is the hardest natural substance?", back: "Diamond" },
        { front: "What is the fastest land animal?", back: "Cheetah" },
        { front: "What is the largest planet in our solar system?", back: "Jupiter" },
        { front: "What is the chemical symbol for gold?", back: "Au" },
        { front: "What is the speed of light?", back: "299,792,458 meters per second" }
    ],
    "Famous Quotes": [
        { front: "Who said: 'I think, therefore I am'?", back: "René Descartes" },
        { front: "Who said: 'Be the change you wish to see in the world'?", back: "Mahatma Gandhi" },
        { front: "Who said: 'To be or not to be'?", back: "William Shakespeare (Hamlet)" },
        { front: "Who said: 'I have a dream'?", back: "Martin Luther King Jr." },
        { front: "Who said: 'Knowledge is power'?", back: "Francis Bacon" }
    ],
    "Historical Dates": [
        { front: "When did World War II end?", back: "1945" },
        { front: "When was the Declaration of Independence signed?", back: "July 4, 1776" },
        { front: "When did the Berlin Wall fall?", back: "November 9, 1989" },
        { front: "When was the first Moon landing?", back: "July 20, 1969" },
        { front: "When was the Internet invented?", back: "1969 (ARPANET, the precursor to the modern Internet)" }
    ]
};

// Load sample decks if no decks exist
if (Object.keys(decks).length === 0) {
    decks = sampleDecks;
    localStorage.setItem('flashcards', JSON.stringify(decks));
}

// DOM Elements
const navButtons = document.querySelectorAll('.nav-btn');
const pages = document.querySelectorAll('.page');
const createForm = document.getElementById('create-form');
const addCardButton = document.getElementById('add-card');
const cardsContainer = document.getElementById('cards-container');
const deckSelect = document.getElementById('deck-select');
const flashcard = document.querySelector('.flashcard');
const flashcardInner = document.querySelector('.flashcard-inner');
const flipBtn = document.getElementById('flip-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const studyBtns = document.querySelectorAll('.study-btn');

// State
let currentDeck = null;
let currentCardIndex = 0;
let cards = [];

// Navigation
navButtons.forEach(button => {
    button.addEventListener('click', () => {
        const targetPage = button.dataset.page;
        
        // Update active states
        navButtons.forEach(btn => btn.classList.remove('active'));
        pages.forEach(page => page.classList.remove('active'));
        
        button.classList.add('active');
        document.getElementById(targetPage).classList.add('active');
        
        // If switching to study mode, update deck selection
        if (targetPage === 'study') {
            updateDeckSelection();
        }
    });
});

// Card Creation
function createCardInput(index) {
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('form-group', 'card-input');
    cardDiv.innerHTML = `
        <h3>Card ${index + 1}</h3>
        <div class="form-group">
            <label for="front-${index}">Front:</label>
            <input type="text" id="front-${index}" required>
        </div>
        <div class="form-group">
            <label for="back-${index}">Back:</label>
            <input type="text" id="back-${index}" required>
        </div>
        <button type="button" class="remove-card" onclick="removeCard(this)">Remove Card</button>
    `;
    return cardDiv;
}

function addCard() {
    const index = cardsContainer.children.length;
    cardsContainer.appendChild(createCardInput(index));
}

function removeCard(button) {
    button.parentElement.remove();
    // Renumber remaining cards
    document.querySelectorAll('.card-input h3').forEach((header, index) => {
        header.textContent = `Card ${index + 1}`;
    });
}

// Initialize first card input
addCard();
addCardButton.addEventListener('click', addCard);

// Form Submission
createForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const deckName = document.getElementById('deck-name').value;
    const cards = [];
    
    document.querySelectorAll('.card-input').forEach(cardInput => {
        const frontInput = cardInput.querySelector('input[id^="front-"]');
        const backInput = cardInput.querySelector('input[id^="back-"]');
        
        cards.push({
            front: frontInput.value,
            back: backInput.value
        });
    });
    
    // Save to localStorage
    decks[deckName] = cards;
    localStorage.setItem('flashcards', JSON.stringify(decks));
    
    // Reset form
    createForm.reset();
    cardsContainer.innerHTML = '';
    addCard();
    
    alert('Deck saved successfully!');
});

// Study Mode
function updateDeckSelection() {
    deckSelect.innerHTML = '<option value="">Choose a deck</option>';
    
    Object.keys(decks).forEach(deckName => {
        const option = document.createElement('option');
        option.value = deckName;
        option.textContent = deckName;
        deckSelect.appendChild(option);
    });
}

function loadDeck(deckName) {
    currentDeck = decks[deckName];
    currentCardIndex = 0;
    
    if (currentDeck && currentDeck.length > 0) {
        updateCard();
        prevBtn.disabled = true;
        nextBtn.disabled = currentDeck.length <= 1;
        flipBtn.disabled = false;
    }
}

function updateCard() {
    if (!currentDeck || currentDeck.length === 0) return;
    
    const card = currentDeck[currentCardIndex];
    const front = flashcardInner.querySelector('.flashcard-front');
    const back = flashcardInner.querySelector('.flashcard-back');
    
    front.querySelector('p').textContent = card.front;
    back.querySelector('p').textContent = card.back;
    flashcard.classList.remove('flipped');
}

// Event Listeners for Study Mode
deckSelect.addEventListener('change', (e) => {
    if (e.target.value) {
        loadDeck(e.target.value);
    }
});

// Flashcard functionality
function initializeFlashcard(deck) {
    currentDeck = decks[deck];
    cards = currentDeck;
    currentCardIndex = 0;
    updateFlashcard();
}

function updateFlashcard() {
    if (!cards || cards.length === 0) return;
    
    const card = cards[currentCardIndex];
    const front = flashcardInner.querySelector('.flashcard-front');
    const back = flashcardInner.querySelector('.flashcard-back');
    
    front.querySelector('p').textContent = card.front;
    back.querySelector('p').textContent = card.back;
    
    // Reset flip state
    flashcard.classList.remove('flipped');
    
    // Update button states
    prevBtn.disabled = currentCardIndex === 0;
    nextBtn.disabled = currentCardIndex === cards.length - 1;
}

// Event Listeners
if (flipBtn) {
    flipBtn.addEventListener('click', () => {
        flashcard.classList.toggle('flipped');
    });
}

if (prevBtn) {
    prevBtn.addEventListener('click', () => {
        if (currentCardIndex > 0) {
            currentCardIndex--;
            updateFlashcard();
        }
    });
}

if (nextBtn) {
    nextBtn.addEventListener('click', () => {
        if (currentCardIndex < cards.length - 1) {
            currentCardIndex++;
            updateFlashcard();
        }
    });
}

// Study button event listeners
studyBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const topic = e.target.closest('.topic-card').querySelector('h3').textContent.toLowerCase();
        initializeFlashcard(topic);
    });
});

// Authentication functionality
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Here you would typically make an API call to authenticate
        console.log('Login attempt:', { email, password });
        // For demo purposes, we'll just redirect to home
        window.location.href = 'index.html';
    });
}

if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        
        // Here you would typically make an API call to register
        console.log('Registration attempt:', { username, email, password });
        // For demo purposes, we'll just redirect to login
        window.location.href = 'login.html';
    });
}

// Initialize the first deck if on the home page
if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/')) {
    initializeFlashcard('mathematics');
} 