import { Injectable } from '@angular/core';
import { AchievementAddDto, AchievementDto } from '../dto/achievement.dto';
import { ServiceAbstract } from './service.abstract';
import { DbService } from './db.service';

type Achievements = AchievementDto | AchievementAddDto;

@Injectable({
    providedIn: "root",
})
export class AchievementService extends ServiceAbstract<Achievements> {
    protected override storeName: 'achievement' = 'achievement';

    constructor(
        protected override dbService: DbService
    ) {
        super();
        this.setTable();
    }
}
