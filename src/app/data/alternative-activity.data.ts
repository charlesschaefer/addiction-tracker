import { TranslocoService } from "@jsverse/transloco";
import { AlternativeActivityDto } from "../dto/alternative-activity.dto";

export class AlternativeActivityData {
    public static data: AlternativeActivityDto[] = [
        {
            id: 1,
            name: "Breathing Exercise",
            description: '',
            duration: 5
        },
        {
            id: 2,
            name: "Drink Water",
            description: '',
            duration: 1
        },
        {
            id: 3,
            name: "Take a Walk",
            description: '',
            duration: 10
        },
        {
            id: 4,
            name: "Stretching",
            description: '',
            duration: 5
        },
        {
            id: 5,
            name: "Healthy Snack",
            description: '',
            duration: 5
        },
        {
            id: 6,
            name: "Call a Friend",
            description: '',
            duration: 10
        },
    ];

    constructor(
        private translateService: TranslocoService,
    ) {
        this.translateService.translate("Breathing Exercise");
        this.translateService.translate("Drink Water");
        this.translateService.translate("Take a Walk");
        this.translateService.translate("Stretching");
        this.translateService.translate("Healthy Snack");
        this.translateService.translate("Call a Friend");
    }
}
