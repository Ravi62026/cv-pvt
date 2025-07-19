import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export const verifyCaptcha = async (captchaToken) => {
    try {
        // For testing purposes - accept specific test tokens
        const testTokens = ["test-captcha", "postman-test", "development-token"];

        if (process.env.NODE_ENV === "development" && testTokens.includes(captchaToken)) {
            console.log("Using test CAPTCHA token:", captchaToken);
            return true;
        }

        if (!captchaToken) {
            throw new Error("CAPTCHA token is required");
        }

        const response = await axios.post(
            "https://www.google.com/recaptcha/api/siteverify",
            null,
            {
                params: {
                    secret: process.env.RECAPTCHA_SECRET_KEY,
                    response: captchaToken,
                },
            }
        );

        const { success, score, "error-codes": errorCodes } = response.data;

        if (!success) {
            console.error("CAPTCHA verification failed:", errorCodes);
            throw new Error("CAPTCHA verification failed");
        }

        // For reCAPTCHA v3, check score (optional)
        if (score !== undefined && score < 0.5) {
            throw new Error("CAPTCHA score too low");
        }

        return true;
    } catch (error) {
        console.error("CAPTCHA verification error:", error.message);
        throw new Error("CAPTCHA verification failed");
    }
};
