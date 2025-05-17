import { Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import packageJson from '../../../package.json';

@Component({
  selector: 'app-version',
  standalone: true,
  imports: [TranslocoModule],
  templateUrl: './version.component.html',
  styleUrl: './version.component.scss'
})
export class VersionComponent {
  version: string = packageJson.version;
}
