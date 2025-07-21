import fetch from 'node-fetch';

const testAuthMe = async () => {
    try {
        // First, login to get a token
        const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'cursorfreetrials100@gmail.com',
                password: 'password123', // Assuming this is the password
                captchaToken: 'test-captcha'
            })
        });

        const loginData = await loginResponse.json();
        
        if (!loginData.success) {
            console.log('Login failed:', loginData);
            return;
        }

        console.log('Login successful');
        const token = loginData.data.tokens.accessToken;

        // Now test the /auth/me endpoint
        const meResponse = await fetch('http://localhost:5000/api/auth/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        });

        const meData = await meResponse.json();
        
        if (meData.success) {
            console.log('Auth/me response:');
            console.log('Name:', meData.data.user.name);
            console.log('Email:', meData.data.user.email);
            console.log('Role:', meData.data.user.role);
            console.log('isVerified:', meData.data.user.isVerified);
            console.log('lawyerDetails.verificationStatus:', meData.data.user.lawyerDetails?.verificationStatus);
        } else {
            console.log('Auth/me failed:', meData);
        }

    } catch (error) {
        console.error('Error:', error);
    }
};

testAuthMe();
