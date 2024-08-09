import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class OtpGeneratorService {
    
    constructor() { }
    
    generateOTP() {
        const start = 65;
        const end = 90;
        let otpDigits = "";
        for (let i = 0; i < 6; i++) {
            let digit = this.getRandomDigit(start, end);
            otpDigits += String.fromCharCode(digit);
        }
        return otpDigits;
    }

    getRandomDigit(min: number , max: number) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
}
