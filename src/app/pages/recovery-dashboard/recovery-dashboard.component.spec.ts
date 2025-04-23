import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecoveryDashboardComponent } from './recovery-dashboard.component';
import { By } from '@angular/platform-browser';

describe('RecoveryDashboardComponent', () => {
    let component: RecoveryDashboardComponent;
    let fixture: ComponentFixture<RecoveryDashboardComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RecoveryDashboardComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(RecoveryDashboardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should generate sample data on init if usageHistory is empty', () => {
        component.usageHistory = [];
        component.ngOnInit();
        expect(component.usageHistory.length).toBeGreaterThan(0);
    });

    it('should calculate sobriety days correctly', () => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        component.usageHistory = [
            {
                id: 1,
                substance: 'Alcohol',
                date: yesterday.toISOString().split('T')[0],
                time: '12:00',
                amount: '1 drink',
                mood: 'Good',
                triggers: [],
                cost: 10,
                cravingIntensity: 5,
            },
        ];
        expect(component.calculateSobrietyDays()).toBe(1);
    });

    it('should prepare usage by substance data', () => {
        component.usageHistory = [
            { id: 1, substance: 'Alcohol', date: '2024-01-01', time: '12:00', amount: '', mood: 'Good', triggers: [], cost: 10, cravingIntensity: 5 },
            { id: 2, substance: 'Cigarettes', date: '2024-01-02', time: '13:00', amount: '', mood: 'Good', triggers: [], cost: 5, cravingIntensity: 3 },
            { id: 3, substance: 'Alcohol', date: '2024-01-03', time: '14:00', amount: '', mood: 'Good', triggers: [], cost: 8, cravingIntensity: 2 },
        ];
        const data = component.prepareUsageBySubstanceData();
        expect(data.find(d => d.name === 'Alcohol')?.count).toBe(2);
        expect(data.find(d => d.name === 'Cigarettes')?.count).toBe(1);
    });

    it('should filter usage history by selected substance', () => {
        component.usageHistory = [
            { id: 1, substance: 'Alcohol', date: '2024-01-01', time: '12:00', amount: '', mood: 'Good', triggers: [], cost: 10, cravingIntensity: 5 },
            { id: 2, substance: 'Cigarettes', date: '2024-01-02', time: '13:00', amount: '', mood: 'Good', triggers: [], cost: 5, cravingIntensity: 3 },
        ];
        component.selectedAnalysisSubstance = 'Alcohol';
        const filtered = component.getFilteredUsageHistory();
        expect(filtered.length).toBe(1);
        expect(filtered[0].substance).toBe('Alcohol');
    });

    it('should prepare trigger data', () => {
        component.usageHistory = [
            { id: 1, substance: 'Alcohol', date: '2024-01-01', time: '12:00', amount: '', mood: 'Good', triggers: ['Stress', 'Boredom'], cost: 10, cravingIntensity: 5 },
            { id: 2, substance: 'Alcohol', date: '2024-01-02', time: '13:00', amount: '', mood: 'Good', triggers: ['Stress'], cost: 5, cravingIntensity: 3 },
        ];
        component.selectedAnalysisSubstance = 'Alcohol';
        const triggers = component.prepareTriggerData();
        const stress = triggers.find(t => t.name === 'Stress');
        expect(stress?.value).toBe(2);
        const boredom = triggers.find(t => t.name === 'Boredom');
        expect(boredom?.value).toBe(1);
    });

    it('should calculate total spending', () => {
        component.usageHistory = [
            { id: 1, substance: 'Alcohol', date: '2024-01-01', time: '12:00', amount: '', mood: 'Good', triggers: [], cost: 10, cravingIntensity: 5 },
            { id: 2, substance: 'Cigarettes', date: '2024-01-02', time: '13:00', amount: '', mood: 'Good', triggers: [], cost: 5, cravingIntensity: 3 },
        ];
        expect(component.calculateTotalSpending()).toBe(15);
    });

    it('should calculate spending by period', () => {
        const today = new Date();
        const lastWeek = new Date(today);
        lastWeek.setDate(today.getDate() - 5);
        const lastMonth = new Date(today);
        lastMonth.setDate(today.getDate() - 20);

        component.usageHistory = [
            { id: 1, substance: 'Alcohol', date: today.toISOString().split('T')[0], time: '12:00', amount: '', mood: 'Good', triggers: [], cost: 10, cravingIntensity: 5 },
            { id: 2, substance: 'Cigarettes', date: lastWeek.toISOString().split('T')[0], time: '13:00', amount: '', mood: 'Good', triggers: [], cost: 5, cravingIntensity: 3 },
            { id: 3, substance: 'Cannabis', date: lastMonth.toISOString().split('T')[0], time: '14:00', amount: '', mood: 'Good', triggers: [], cost: 8, cravingIntensity: 2 },
        ];

        expect(component.calculateSpendingByPeriod('week')).toBe(15);
        expect(component.calculateSpendingByPeriod('month')).toBe(23);
        expect(component.calculateSpendingByPeriod('year')).toBe(23);
        expect(component.calculateSpendingByPeriod('all')).toBe(23);
    });

    it('should project annual spending', () => {
        spyOn(component, 'calculateSpendingByPeriod').and.returnValue(100);
        expect(component.projectAnnualSpending()).toBe(1200);
    });

    it('should calculate potential savings', () => {
        spyOn(component, 'projectAnnualSpending').and.returnValue(1000);
        expect(component.calculatePotentialSavings(5)).toBe(5000);
    });

    it('should prepare cost by substance data', () => {
        component.usageHistory = [
            { id: 1, substance: 'Alcohol', date: '2024-01-01', time: '12:00', amount: '', mood: 'Good', triggers: [], cost: 10, cravingIntensity: 5 },
            { id: 2, substance: 'Alcohol', date: '2024-01-02', time: '13:00', amount: '', mood: 'Good', triggers: [], cost: 5, cravingIntensity: 3 },
            { id: 3, substance: 'Cigarettes', date: '2024-01-03', time: '14:00', amount: '', mood: 'Good', triggers: [], cost: 8, cravingIntensity: 2 },
        ];
        const costs = component.prepareCostBySubstanceData();
        expect(costs.find(c => c.name === 'Alcohol')?.value).toBe(15);
        expect(costs.find(c => c.name === 'Cigarettes')?.value).toBe(8);
    });
});
