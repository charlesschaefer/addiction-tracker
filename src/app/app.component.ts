import { Component, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterOutlet, RouterLink, Router } from "@angular/router";
import { MatMenuModule } from "@angular/material/menu";
import { MatIconModule } from "@angular/material/icon";
import { ToolbarModule } from "primeng/toolbar";
import { MenuModule } from "primeng/menu";
import { ButtonModule } from "primeng/button";
import { SpeedDialModule } from "primeng/speeddial";
import { MenuItem, MessageService } from "primeng/api";
import { TieredMenuModule } from "primeng/tieredmenu";
import { MenubarModule } from "primeng/menubar";
import { JoyrideModule } from "ngx-joyride";
import { CookieService } from "ngx-cookie-service";
import {
    isPermissionGranted,
    requestPermission,
    sendNotification,
} from "@tauri-apps/plugin-notification";

import { ThemeService } from "./services/theme.service";
import { invoke } from "@tauri-apps/api/core";
import { TranslocoModule, TranslocoService } from "@jsverse/transloco";
import { HeaderComponent } from "./components/header/header.component";
import { ToastModule } from "primeng/toast";
import { DataUpdatedService } from "./services/data-updated.service";
import { AchievementService } from "./services/achievement.service";
import { RecordSubstanceUseComponent } from "./components/substance/record-substance-use.component";
import { AlternativeActivityOverlayComponent } from "./components/alternative-activity/alternative-activity-overlay.component";
import { SubstanceService } from "./services/substance.service";
import { SubstanceDto } from "./dto/substance.dto";
import {
    SobrietyCardComponent,
    SobrietyCardStyle,
} from "./components/sobriety/sobriety-card.component";
import { AddRecordButtonComponent } from "./components/add-record-button/add-record-button.component";

import { window as TauriWindow } from "@tauri-apps/api";

@Component({
    selector: "app-root",
    standalone: true,
    imports: [
        RouterOutlet,
        MatMenuModule,
        MatIconModule,
        ToolbarModule,
        MenuModule,
        ButtonModule,
        SpeedDialModule,
        JoyrideModule,
        TieredMenuModule,
        MenuModule,
        TranslocoModule,
        CommonModule,
        MenubarModule,
        HeaderComponent,
        ToastModule,
        RecordSubstanceUseComponent,
        AlternativeActivityOverlayComponent,
        SobrietyCardComponent,
        AddRecordButtonComponent,
    ],
    providers: [CookieService, RouterLink, MessageService],
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
    isProtected: any = false;
    isAuthenticated: any = false;
    navLinks: any;
    pathname: any;

    title = "Controle de Vícios";
    menuItems!: MenuItem[];

    speedDialItems: MenuItem[] = [
        {
            icon: "pi pi-wallet",
            command: () => this.router.navigate(["/cost"]),
        },
        {
            icon: "pi pi-money-bill",
            command: () => this.router.navigate(["/cost-add"]),
            title: "Adicionar gasto",
        },
        {
            icon: "pi pi-home",
            command: () => this.router.navigate(["/"]),
        },
        {
            icon: "pi pi-chart-line",
            command: () => this.router.navigate(["/usage-track"]),
        },
        {
            icon: "pi pi-plus",
            command: () => this.router.navigate(["/usage-add"]),
        },
    ];

    testPath: string;

    showOnboarding = false;
    showAuthPrompt = false;

    showBreathingPrompt = false;
    showBreathingExercise = false;
    addingMotivationalFactor = false;
    showAddSubstance = false;
    showAddTrigger = false;
    showCostInput = false;

    showRecordPopup = false;
    showMotivationalFactors = false;
    showMotivationalPrompt = false;
    currentMotivationalFactor: any = null;

    substances = signal<SubstanceDto[]>([]);

    //substances: any[] = [];
    selectedSubstance: SubstanceDto;

    date = "";
    time = "";
    amount = "";
    cost = "";
    cravingIntensity = 5;
    mood = "";
    moods = [
        { emoji: "😢", label: "Sad" },
        { emoji: "😟", label: "Anxious" },
        { emoji: "😐", label: "Neutral" },
        { emoji: "🙂", label: "Good" },
        { emoji: "😄", label: "Great" },
    ];
    triggers: string[] = [];
    selectedTriggers: string[] = [];
    newTrigger = "";
    usageHistory: any[] = [];
    openedAlternativeActivityDialog = false;
    wasAlternativeActivityEffective = false;

    mobileMenuOpen: any;

    /** List of alternative activities. */
    alternativeActivities: any[] = [
        {
            id: 1,
            name: "Breathing Exercise",
            count: 0,
            successCount: 0,
            failCount: 0,
        },
        { id: 2, name: "Drink Water", count: 0, successCount: 0, failCount: 0 },
        { id: 3, name: "Take a Walk", count: 0, successCount: 0, failCount: 0 },
        { id: 4, name: "Stretching", count: 0, successCount: 0, failCount: 0 },
        {
            id: 5,
            name: "Healthy Snack",
            count: 0,
            successCount: 0,
            failCount: 0,
        },
        {
            id: 6,
            name: "Call a Friend",
            count: 0,
            successCount: 0,
            failCount: 0,
        },
    ];

    /** The currently selected activity for feedback. */
    currentActivity: any = null;
    sobrietyComponentStyle = SobrietyCardStyle.BADGE;

    showPrivacyOverlay = signal(false);

    constructor(
        private themeService: ThemeService,
        private translateService: TranslocoService,
        private router: Router,
        private dataUpdatedService: DataUpdatedService,
        private achievementService: AchievementService,
        private substanceService: SubstanceService,
        private messageService: MessageService
    ) {
        translateService.setDefaultLang("en");
        let userLanguage = localStorage.getItem("language");
        if (!userLanguage) {
            userLanguage = "en";
        }
        this.translateService
            .setActiveLang(userLanguage)
            // .selectTranslation(userLanguage)
            // .subscribe(translation => {
            //     console.log("Loaded the translations for the language ", userLanguage);
            // });
    }

    ngOnInit(): void {
        const window = globalThis.window as Window & {
            __TAURI_INTERNALS__?: { invoke: (command: string) => void };
        };
        if (window?.__TAURI_INTERNALS__?.invoke) {
            invoke("set_frontend_complete");
        }

        this.setupPrivacyOverlay();

        this.setupMenu();

        const currentTheme = this.themeService.getCurrentTheme()();
        let userTheme = localStorage.getItem("theme");
        if (!userTheme) {
            userTheme = currentTheme;
        }
        if (userTheme != currentTheme) {
            console.log(userTheme, currentTheme);
            this.themeService.switchTheme();
        }

        const detectAchievements = () => {
            console.log("Vamos verificar os achievements");
            this.achievementService.detectAchievements();
        };

        this.dataUpdatedService.subscribe("cost", detectAchievements);
        this.dataUpdatedService.subscribe("usage", detectAchievements);
        this.dataUpdatedService.subscribe("motivational_factor", detectAchievements);
        this.dataUpdatedService.subscribe("usage_filling", detectAchievements);

        this.substanceService.list().then((substances) => {
            this.substances.set(substances as SubstanceDto[]);
            if (!substances.length) {
                this.showAddSubstance = true;
                this.showRecordPopup = true;
            }
        });

        // this.translateService.setActiveLang("pt-br");
        // this.translateService.selectTranslation('pt-br').subscribe((trans) => {
        //     console.error("Translations:", trans);
        //     this.translateService.selectTranslate('Your Journey to Recovery', undefined, "pt-br").subscribe((translation) => {
        //         console.log("Lingua atual: ", this.translateService.getActiveLang(), this.translateService.getAvailableLangs());
        //         console.log("Your path journey bla bla", translation);
        //     });
        // });
    }

    async notify() {
        let permissionGranted = await isPermissionGranted();
        if (!permissionGranted) {
            const permission = await requestPermission();
            permissionGranted = permission === "granted";
        }
        console.log("permission", permissionGranted);
        if (permissionGranted) {
            sendNotification("Tauri is awesome");
            sendNotification({
                title: "Addiction Tracker",
                body: "Olá usuário, este é um exemplo de notificação",
            });
        }
    }

    switchTheme() {
        this.themeService.switchTheme();

        const currentTheme = this.themeService.getCurrentTheme()();
        localStorage.setItem("theme", currentTheme);
    }

    switchLanguage(language: "en" | "pt-br") {
        this.translateService.setActiveLang(language);
        localStorage.setItem("language", language);
        this.setupMenu();
    }

    async setupMenu() {
        this.menuItems = [
            {
                label: this.translateService.translate("Home"),
                routerLink: "/",
                //icon: "pi pi-home",
            } as MenuItem,
            {
                label: "Consumo",
                items: [
                    {
                        label: this.translateService.translate("Acompanhar"),
                        routerLink: "/usage-track",
                        //icon: "pi pi-chart-line",
                    } as MenuItem,
                    {
                        label: this.translateService.translate(
                            "Intervalos de Consumo"
                        ),
                        routerLink: "/usage-interval",
                        //icon: "pi pi-clock",
                    } as MenuItem,
                    {
                        label: this.translateService.translate("Adicionar"),
                        routerLink: "/usage-add",
                        //icon: "pi pi-plus",
                    } as MenuItem,
                    {
                        label: this.translateService.translate("Recomendações"),
                        routerLink: "/recommendations",
                        //icon: "pi pi-book",
                    } as MenuItem,
                    {
                        label: this.translateService.translate(
                            "Acompanhar Gastos"
                        ),
                        routerLink: "/cost",
                        //icon: "pi pi-wallet",
                    } as MenuItem,
                    {
                        label: this.translateService.translate(
                            "Adicionar Gastos"
                        ),
                        routerLink: "/cost-add",
                        //icon: "pi pi-money-bill",
                    } as MenuItem,
                ],
            },
            // {
            //     separator: true,
            // },
            // {
            //     label: await firstValueFrom(
            //         this.translateService.translate("Recomendações")
            //     ),

            // },
            // {
            //     separator: true,
            // },
            // {
            //     label: await firstValueFrom(this.translateService.translate("Gastos")),
            //     items: [

            //     ],
            // },
            // {
            //     separator: true,
            // },
            {
                label: this.translateService.translate("Configurações"),
                items: [
                    {
                        label: this.translateService.translate(
                            "Adicionar Substância"
                        ),
                        routerLink: "/substance-add",
                        // icon: "pi pi-user-minus",
                    } as MenuItem,
                    {
                        label: this.translateService.translate("Backup"),
                        routerLink: "/backup",
                        // icon: "pi pi-lock",
                    } as MenuItem,
                    {
                        label: this.translateService.translate(
                            "Sincronizar dispositivos"
                        ),
                        routerLink: "/sync",
                        // icon: "pi pi-sync",
                    } as MenuItem,
                    {
                        label: this.translateService.translate("Mudar tema"),
                        command: () => this.switchTheme(),
                        // icon: "pi pi-moon",
                    } as MenuItem,
                    {
                        label: this.translateService.translate("Idioma"),
                        items: [
                            {
                                label: this.translateService.translate(
                                    "Português"
                                ),
                                command: () => this.switchLanguage("pt-br"),
                            },
                            {
                                label: this.translateService.translate(
                                    "Inglês"
                                ),
                                command: () => this.switchLanguage("en"),
                            },
                        ],
                    },
                ],
            },

            // {
            //     separator: true,
            // },
            {
                label: this.translateService.translate("Sobre"),
                routerLink: "/about",
                //icon: "pi pi-info",
            } as MenuItem,
        ];
    }

    toggleMobileMenu() {
        this.mobileMenuOpen = !this.mobileMenuOpen;
    }

    setShowRecordPopup(val: boolean) {
        this.showRecordPopup = val;
    }

    setShowMotivationalFactors(val: boolean) {
        this.showMotivationalFactors = val;
    }

    onAddRecordClick() {
        this.showRecordPopup = true;
    }

    handleAddSubstance(substance: SubstanceDto) {
        const substances = this.substances();
        substances.push(substance);
        this.substances.set([...substances]);
    }

    handleAlternativeSelected(activityId: number) {
        // Find the selected alternative activity
        const selectedActivity = this.alternativeActivities.find(
            (alt) => alt.id === activityId
        );
        if (!selectedActivity) return;

        // Create a record of this activity and update count
        const activityIndex = this.alternativeActivities.findIndex(
            (a) => a.id === activityId
        );
        if (activityIndex >= 0) {
            this.alternativeActivities[activityIndex] = {
                ...this.alternativeActivities[activityIndex],
                count: this.alternativeActivities[activityIndex].count + 1,
            };
        }

        // Set the current activity for reference
        this.currentActivity = {
            id: selectedActivity.id,
            name: selectedActivity.name,
        };
    }

    /**
     * Handles feedback from the alternative activity overlay
     */
    handleAlternativeFeedback(
        activity: any,
        wasSuccessful: boolean,
        _feedback?: string
    ): void {
        if (!activity) return;

        // Update the alternative activity success/fail counts
        const activityIndex = this.alternativeActivities.findIndex(
            (a) => a.id === activity.id
        );

        if (activityIndex >= 0) {
            const updatedActivity = {
                ...this.alternativeActivities[activityIndex],
                successCount: wasSuccessful
                    ? this.alternativeActivities[activityIndex].successCount + 1
                    : this.alternativeActivities[activityIndex].successCount,
                failCount: !wasSuccessful
                    ? this.alternativeActivities[activityIndex].failCount + 1
                    : this.alternativeActivities[activityIndex].failCount,
            };

            this.alternativeActivities[activityIndex] = updatedActivity;
        }

        // Update the current activity with feedback results
        // if (this.currentActivity) {
        //     this.currentActivity.wasSuccessful = wasSuccessful;
        //     this.currentActivity.feedback = feedback;
        // }

        // Close any related dialogs or prompts
        this.showBreathingPrompt = false;
    }

    handleMotivationalFeedback(_feedback: any) {
        /* ... */
    }

    handleSubmit() {
        /* ... */
    }

    handleSelectSubstance(substance: SubstanceDto) {
        this.selectedSubstance = substance;
    }

    handleGiveUpUsage() {
        this.showRecordPopup = false;
        this.showBreathingPrompt = false;

        this.messageService.add({
            severity: "success",
            summary: "Congratulations for this decision",
            detail: "This is an important step for your recovery",
            life: 3000,
        });
    }

    get isDarkMode() {
        return this.themeService.getCurrentTheme()() === "dark";
    }

    toggleTheme() {
        this.themeService.switchTheme();
    }

    setupPrivacyOverlay() {
        const currentWindow = TauriWindow.getCurrentWindow();
        currentWindow.listen('tauri://blur', (event) => {
            setTimeout(() => {
                currentWindow.isVisible().then(isVisible => this.showPrivacyOverlay.set(!isVisible));
                //currentWindow.isVisible
            }, 2000);
            console.log("Window blured", event);
        });

        // TauriWindow.getCurrentWindow().listen('tauri://focus', (event) => {
        //     this.showPrivacyOverlay.set(false);
        //     console.log("Window focused", event);
        // })
    }
}
