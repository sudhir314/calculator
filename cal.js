// --- SELECTORS ---
const display = document.querySelector('.display'); // Grab the display div
const inputBox = document.getElementById('inputBox');
const buttons = document.querySelectorAll('button');
const body = document.body;
const themeToggler = document.querySelector('.theme-toggler');
const historyList = document.getElementById('history-list');
const clearHistoryBtn = document.getElementById('clear-history');

// --- STATE VARIABLES ---
let string = '';
let history = [];
let lastInputWasError = false;

// --- NEW HELPER FUNCTION ---
function triggerAnimation(element, className) {
    // Add the class to start the animation
    element.classList.add(className);
    
    // Remove the class after the animation finishes
    element.addEventListener('animationend', () => {
        element.classList.remove(className);
    }, { once: true }); // 'once: true' automatically removes the listener
}

// --- CORE FUNCTIONS ---
function calculate() {
    if (string === '') return;

    let calculationString = string;
    try {
        let result = new Function('return ' + string.replace('√', 'Math.sqrt'))();
        
        if (result === Infinity || result === -Infinity) {
            throw new Error("Division by zero");
        }
        
        string = String(result);
        inputBox.value = string;

        history.push({ calc: calculationString, ans: result });
        updateHistoryUI();
        
        triggerAnimation(display, 'pop'); // <-- ADDED "POP" ANIMATION

    } catch (error) {
        inputBox.value = 'Error';
        string = '';
        lastInputWasError = true;
        
        triggerAnimation(display, 'shake'); // <-- ADDED "SHAKE" ANIMATION
    }
}

function clearAll() {
    string = '';
    inputBox.value = '0';
    lastInputWasError = false;
    
    triggerAnimation(display, 'pop'); // <-- ADDED "POP" ANIMATION
}

function deleteLast() {
    if (lastInputWasError) {
        clearAll();
        return;
    }
    string = string.substring(0, string.length - 1);
    inputBox.value = string === '' ? '0' : string;
}

function handleInput(value) {
    if (lastInputWasError) {
        clearAll();
    }
    if (string === '0' && value !== '.') string = '';

    let valueToAppend = value;
    if (value === 'x²') {
        valueToAppend = '**(2)';
    } else if (value === '√') {
        valueToAppend = 'Math.sqrt(';
    }

    const operators = ['+', '-', '*', '/', '%', '.'];
    const lastChar = string[string.length - 1];

    // Prevent multiple decimals
    if (valueToAppend === '.') {
        let parts = string.split(/[\+\-\*\/%]/);
        if (parts.pop().includes('.')) {
            triggerAnimation(display, 'shake'); // <-- ADDED "SHAKE" ANIMATION
            return;
        }
    }
    
    // Prevent multiple operators
    if (operators.includes(valueToAppend) && operators.includes(lastChar)) {
        string = string.substring(0, string.length - 1);
    }

    string += valueToAppend;
    inputBox.value = string;
}

// --- EVENT LISTENERS ---

// 1. Theme Toggler
themeToggler.addEventListener('click', () => {
    body.classList.toggle('dark');
    themeToggler.querySelector('.light-mode').classList.toggle('active');
    themeToggler.querySelector('.dark-mode').classList.toggle('active');
});

// 2. History Listeners
function updateHistoryUI() {
    historyList.innerHTML = '';
    history.slice().reverse().forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `${item.calc} = <strong>${item.ans}</strong>`;
        historyList.appendChild(li);
    });
}

clearHistoryBtn.addEventListener('click', () => {
    history = [];
    updateHistoryUI();
});

// 3. Button Clicks
buttons.forEach(element => {
    element.addEventListener('click', (e) => {
        const value = e.target.innerText;
        const id = e.target.id;

        if (value === '=') calculate();
        else if (value === 'AC') clearAll();
        else if (value === 'DEL') deleteLast();
        else if (id === 'plusMinus') {
             try { string = String(-eval(string)); inputBox.value = string; }
             catch(e){ triggerAnimation(display, 'shake'); }
        }
        else if (id === 'clear-history') return;
        else handleInput(value);
    });
});

// 4. Keyboard Support
window.addEventListener('keydown', (e) => {
    // A mapping to find the button text from the key press
    const keyMap = {
        's': '√',
        '^': 'x²',
        '(': '(',
        ')': ')',
        '%': '%',
        '/': '/',
        '7': '7',
        '8': '8',
        '9': '9',
        '*': '*',
        '4': '4',
        '5': '5',
        '6': '6',
        '-': '-',
        '1': '1',
        '2': '2',
        '3': '3',
        '+': '+',
        '0': '0',
        '.': '.'
    };
    
    if (keyMap[e.key] !== undefined) {
        handleInput(keyMap[e.key]);
    } else if (e.key === 'Enter' || e.key === '=') {
        calculate();
    } else if (e.key === 'Backspace') {
        deleteLast();
    } else if (e.key === 'Escape') {
        clearAll();
    }
});