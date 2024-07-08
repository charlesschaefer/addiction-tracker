import { Routes } from "@angular/router";
import { UsageComponent } from "./usage/usage.component";
import { UsageAddComponent } from "./usage-add/usage-add.component";
import { UsageTrackComponent } from "./usage-track/usage-track.component";
import { SubstanceAddComponent } from "./substance-add/substance-add.component";
import { CostAddComponent } from "./cost-add/cost-add.component";
import { CostComponent } from "./cost/cost.component";

export const routes: Routes = [
    {path: '', component: UsageComponent},
    {path: 'usage-add', component: UsageAddComponent},
    {path: 'usage-track', component: UsageTrackComponent},
    {path: 'substance-add', component: SubstanceAddComponent},
    {path: 'cost-add', component: CostAddComponent},
    {path: 'cost', component: CostComponent}
];
