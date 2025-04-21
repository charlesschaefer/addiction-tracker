import { Routes } from "@angular/router";

import { UsageComponent } from "./usage/usage.component";
import { UsageAddComponent } from "./usage-add/usage-add.component";
import { UsageTrackComponent } from "./usage-track/usage-track.component";
import { SubstanceAddComponent } from "./substance-add/substance-add.component";
import { CostAddComponent } from "./cost-add/cost-add.component";
import { CostComponent } from "./cost/cost.component";
import { VersionComponent } from "./version/version.component";
import { UsageIntervalComponent } from "./usage-interval/usage-interval.component";
import { RecommendationsComponent } from "./recommendations/recommendations.component";
import { BackupComponent } from "./backup/backup.component";
import { RespirationComponent } from "./respiration/respiration.component";
import { SynchronizationComponent } from "./synchronization/synchronization.component";
import { UsageEntriesComponent } from "./pages/usage-entries/usage-entries.component";
import { HomeComponent } from "./pages/home/home.component";
import { LoginComponent } from "./pages/login/login.component";

export const routes: Routes = [
    { path: "", component: HomeComponent },
    { path: "login", component: LoginComponent },
    { path: "usage-add", component: UsageAddComponent },
    { path: "usage-track", component: UsageTrackComponent },
    { path: "substance-add", component: SubstanceAddComponent },
    { path: "cost-add", component: CostAddComponent },
    { path: "cost", component: CostComponent },
    { path: "recommendations", component: RecommendationsComponent },
    { path: "usage-interval", component: UsageIntervalComponent },
    { path: "backup", component: BackupComponent },
    { path: "respiration", component: RespirationComponent },
    { path: "about", component: VersionComponent },
    { path: "sync", component: SynchronizationComponent },
    { path: "usage-entries", component: UsageEntriesComponent },
];
