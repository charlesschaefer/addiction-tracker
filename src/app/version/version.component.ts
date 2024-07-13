import { Component } from '@angular/core';
import packageJson from '../../../package.json';

@Component({
  selector: 'app-version',
  standalone: true,
  imports: [],
  templateUrl: './version.component.html',
  styleUrl: './version.component.scss'
})
export class VersionComponent {
  version: string = packageJson.version;
}
