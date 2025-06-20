import { Routes } from "@angular/router";
import { HomeComponent } from "./pages/home/home.component";
import { LoginComponent } from "./pages/login/login.component";

export const routes: Routes = [
    /** New routes */
    { path: "", component: HomeComponent },
    { path: "login", component: LoginComponent },
    { 
        path: "usage-entries", 
        loadComponent: () =>
            import("./pages/usage-entries/usage-entries.component").then(
                (comp) => comp.UsageEntriesComponent,
            ),
    },
    { 
        path: "motivational-factors", 
        loadComponent: () =>
            import("./pages/motivational-factors/motivational-factors.component").then(
                (comp) => comp.MotivationalFactorsComponent,
            ),
    },
    { 
        path: "recovery-dashboard", 
        loadComponent: () =>
            import("./pages/recovery-dashboard/recovery-dashboard.component").then(
                (comp) => comp.RecoveryDashboardComponent,
            ),
    },
    { 
        path: "usage-entries", 
        loadComponent: () =>
            import("./pages/usage-entries/usage-entries.component").then(
                (comp) => comp.UsageEntriesComponent,
            ),
    },
    { 
        path: "achievements", 
        loadComponent: () =>
            import("./pages/achievements/achievements.component").then(
                (comp) => comp.AchievementsComponent,
            ),
    },
    { 
        path: "alternative-activity-analytics", 
        loadComponent: () =>
            import("./pages/alternative-activity-analytics/alternative-activity-analytics.component").then(
                (comp) => comp.AlternativeActivityAnalyticsComponent,
            ),
    },
    { 
        path: "financial-impact", 
        loadComponent: () =>
            import("./pages/financial-impact/financial-impact.component").then(
                (comp) => comp.FinancialImpactComponent,
            ),
    },
    { 
        path: "triggers", 
        loadComponent: () =>
            import("./pages/triggers/triggers.component").then(
                (comp) => comp.TriggersComponent,
            ),
    },
    { 
        path: "settings", 
        loadComponent: () =>
            import("./pages/settings/settings.component").then(
                (comp) => comp.SettingsComponent,
            ),
    },
    { 
        path: "settings/backup", 
        loadComponent: () =>
            import("./pages/backup/backup.component").then(
                (comp) => comp.BackupComponent,
            ),
    },
    { 
        path: "settings/sync", 
        loadComponent: () =>
            import("./pages/synchronization/synchronization.component").then(
                (comp) => comp.SynchronizationComponent,
            ),
    },
    { 
        path: "about", 
        loadComponent: () =>
            import("./version/version.component").then(
                (comp) => comp.VersionComponent,
            ),
    },
    {
        path: "license",
        loadComponent: () =>
        import("./license/license.component").then(
            (comp) => comp.LicenseComponent,
        ),
    },
];
