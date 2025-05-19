import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

// You should implement/use an AuthService with login() and isAuthenticated() methods.
//import { AuthService } from "../../services/auth.service";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { TranslocoModule } from "@jsverse/transloco";

@Component({
    selector: "app-auth-screen",
    standalone: true,
    imports: [CommonModule, FormsModule, TranslocoModule],
    templateUrl: "./auth-screen.component.html",
})
export class AuthScreenComponent implements OnInit {
    password = "";
    error = "";
    isLoading = false;
    showSuccess = false;
    auth!: any;

    constructor(
        //private auth: AuthService, 
        private router: Router
    ) {}

    ngOnInit() {
        if (this.auth.isAuthenticated() && this.showSuccess) {
            setTimeout(() => {
                this.router.navigate(["/"]);
            }, 1000);
        }
    }

    handleSubmit(event: Event) {
        event.preventDefault();
        this.isLoading = true;
        this.error = "";

        setTimeout(() => {
            const success = this.auth.login(this.password);
            if (success) {
                this.showSuccess = true;
                setTimeout(() => {
                    this.router.navigate(["/"]);
                }, 1000);
            } else {
                this.error = "Incorrect password. Please try again.";
                this.isLoading = false;
            }
        }, 500);
    }
}
