import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AuthScreenComponent } from "../../components/auth-screen.component";

// You should implement/use an AuthService with isAuthenticated and isProtected observables or properties.
//import { AuthService } from '../../services/auth.service';

@Component({
    selector: "app-login-page",
    standalone: true,
    imports: [AuthScreenComponent],
    templateUrl: "./login.component.html",
})
export class LoginComponent implements OnInit {
    auth!: any;
    constructor(
        //private auth: AuthService,
        private router: Router
    ) {}

    ngOnInit() {
        // Redirect to home if already authenticated or if protection is not enabled
        if (this.auth.isAuthenticated() || !this.auth.isProtected()) {
            this.router.navigate(["/"]);
        }
    }
}
