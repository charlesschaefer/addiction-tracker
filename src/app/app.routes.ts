import { Routes } from "@angular/router";
import { VersionComponent } from "./version/version.component";
import { BackupComponent } from "./pages/backup/backup.component";
import { SynchronizationComponent } from "./pages/synchronization/synchronization.component";
import { UsageEntriesComponent } from "./pages/usage-entries/usage-entries.component";
import { HomeComponent } from "./pages/home/home.component";
import { LoginComponent } from "./pages/login/login.component";
import { MotivationalFactorsComponent } from "./pages/motivational-factors/motivational-factors.component";
import { RecoveryDashboardComponent } from "./pages/recovery-dashboard/recovery-dashboard.component";
import { AchievementsComponent } from "./pages/achievements/achievements.component";
import { AlternativeActivityAnalyticsComponent } from "./pages/alternative-activity-analytics/alternative-activity-analytics.component";
import { FinancialImpactComponent } from "./pages/financial-impact/financial-impact.component";
import { TriggersComponent } from "./pages/triggers/triggers.component";
import { SettingsComponent } from "./pages/settings/settings.component";

export const routes: Routes = [
    /** New routes */
    { path: "", component: HomeComponent },
    { path: "login", component: LoginComponent },
    { path: "usage-entries", component: UsageEntriesComponent },
    { path: "motivational-factors", component: MotivationalFactorsComponent },
    { path: "recovery-dashboard", component: RecoveryDashboardComponent },
    { path: "usage-entries", component: UsageEntriesComponent },
    { path: "achievements", component: AchievementsComponent },
    { path: "alternative-activity-analytics", component: AlternativeActivityAnalyticsComponent },
    { path: "financial-impact", component: FinancialImpactComponent },
    { path: "triggers", component: TriggersComponent },
    { path: "settings", component: SettingsComponent },
    { path: "settings/backup", component: BackupComponent },
    { path: "settings/sync", component: SynchronizationComponent },
    { path: "about", component: VersionComponent },
];
