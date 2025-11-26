const form = document.getElementById('leaveForm');
const submitBtn = document.getElementById('submitBtn');
const messageDiv = document.getElementById('message');
const fromDateInput = document.getElementById('fromDate');
const toDateInput = document.getElementById('toDate');
const counterDiv = document.getElementById('counter');

// REPLACE THIS WITH YOUR GOOGLE APPS SCRIPT WEB APP URL
const SCRIPT_URL =
    'https://script.google.com/macros/s/AKfycbw53ndApCDkAtTmM4KrRq2Hkj8o_y3iUbyQ-MEyyxZlg2pJskX_V8LmzzElp9C_IoAwhw/exec';

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (SCRIPT_URL === '') {
        showMessage('Please configure the Google Apps Script URL in script.js', 'error');
        return;
    }

    setLoading(true);

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Date Validation
    if (new Date(data.fromDate) > new Date(data.toDate)) {
        showMessage('From Date cannot be later than To Date', 'error');
        setLoading(false);
        return;
    }
    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(data),
            mode: 'no-cors' // Important for Google Apps Script
        });

        // Since mode is 'no-cors', we can't read the response status directly.
        // We assume success if no error was thrown.
        showMessage('Application submitted successfully!', 'success');
        form.reset();
    } catch (error) {
        console.error('Error:', error);
        showMessage('Something went wrong. Please try again.', 'error');
    } finally {
        setLoading(false);
    }
});

function setLoading(isLoading) {
    if (isLoading) {
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
    } else {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
}

let messageTimeout;

function showMessage(text, type) {
    // Clear any existing timeout to prevent message from disappearing early
    if (messageTimeout) {
        clearTimeout(messageTimeout);
    }

    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block'; // Ensure it's visible even if previously hidden

    // Hide message after 5 seconds
    messageTimeout = setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

function calculateLeaveDays() {
    const start = new Date(fromDateInput.value);
    const end = new Date(toDateInput.value);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        counterDiv.textContent = '0';
        return;
    }

    if (start > end) {
        counterDiv.textContent = '0';
        return;
    }

    let count = 0;
    let currentDate = new Date(start);

    while (currentDate <= end) {
        const dayOfWeek = currentDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 0 is Sunday, 6 is Saturday
            count++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }

    counterDiv.textContent = count;
}

fromDateInput.addEventListener('change', calculateLeaveDays);
toDateInput.addEventListener('change', calculateLeaveDays);
