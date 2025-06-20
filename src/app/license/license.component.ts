import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-license',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './license.component.html',
    styles: 'a { color: var(--p-primary-color); }'
})
export class LicenseComponent implements OnInit {

    licenseText?: string;

    constructor(
        private http: HttpClient,
    ) {}

    ngOnInit(): void {
        this.http.get('assets/LICENSE', {responseType: 'text'}).subscribe(data => this.licenseText = data);
    }
}
