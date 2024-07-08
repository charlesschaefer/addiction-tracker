import { Component, OnInit } from '@angular/core';
import { CostService } from '../services/cost.service';
import { CostDto } from '../dto/cost.dto';
import { SubstanceService } from '../services/substance.service';
import { SubstanceDto } from '../dto/substance.dto';

@Component({
  selector: 'app-cost',
  standalone: true,
  imports: [],
  templateUrl: './cost.component.html',
  styleUrl: './cost.component.scss'
})
export class CostComponent implements OnInit {

  constructor(
    private costService: CostService<CostDto>,
    private substanceService: SubstanceService<SubstanceDto>,
  ) {}

  ngOnInit() {
    
  }
}
