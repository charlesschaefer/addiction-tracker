import { Injectable } from '@angular/core';

/**
 * Service for generating OTP codes.
 */
@Injectable({
    providedIn: 'root'
})
export class OtpGeneratorService {
    
    constructor() { }
    
    /**
     * Generates a 6-character OTP using uppercase letters.
     */
    generateOTP() {
        const start = 65;
        const end = 90;
        let otpDigits = "";
        for (let i = 0; i < 6; i++) {
            const digit = this.getRandomDigit(start, end);
            otpDigits += String.fromCharCode(digit);
        }
        return otpDigits;
    }

    /**
     * Returns a random integer between min and max (inclusive).
     * @param min Minimum char code
     * @param max Maximum char code
     */
    getRandomDigit(min: number , max: number) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
}
