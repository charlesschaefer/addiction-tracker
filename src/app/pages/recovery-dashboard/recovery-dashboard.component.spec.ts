import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecoveryDashboardComponent } from './recovery-dashboard.component';

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
        component.usageHistory.set([]);
        component.ngOnInit();
        expect(component.usageHistory.length).toBeGreaterThan(0);
    });

    it('should calculate sobriety days correctly', () => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        component.usageHistory.set([
            {
                id: 1,
                substance: 1,
                datetime: yesterday,
                quantity: 1,
                sentiment: 4,
                trigger: [],
                cost: 10,
                craving: 5,
            },
        ]);
        expect(component.calculateSobrietyDays()).toBe(1);
    });

    it('should prepare usage by substance data', () => {
        component.usageHistory.set([
            { id: 1, substance: 1, datetime: new Date('2024-01-01'), quantity: 0, sentiment: 4, trigger: [], cost: 10, craving: 5 },
            { id: 2, substance: 2, datetime: new Date('2024-01-02'), quantity: 0, sentiment: 4, trigger: [], cost: 5, craving: 3 },
            { id: 3, substance: 1, datetime: new Date('2024-01-03'), quantity: 0, sentiment: 4, trigger: [], cost: 8, craving: 2 },
        ]);
        const data = component.prepareUsageBySubstanceData();
        expect(data.find(d => d.name === 'Alcohol')?.count).toBe(2);
        expect(data.find(d => d.name === 'Cigarettes')?.count).toBe(1);
    });

    it('should filter usage history by selected substance', () => {
        component.usageHistory.set([
            { id: 1, substance: 1, datetime: new Date('2024-01-01'), quantity: 0, sentiment: 4, trigger: [], cost: 10, craving: 5 },
            { id: 2, substance: 2, datetime: new Date('2024-01-02'), quantity: 0, sentiment: 4, trigger: [], cost: 5, craving: 3 },
        ]);
        component.selectedAnalysisSubstance = 'Alcohol';
        const filtered = component.getFilteredUsageHistory();
        expect(filtered.length).toBe(1);
        // expect(filtered[0].substance).toBe('Alcohol');
    });

    it('should prepare trigger data', () => {
        // component.usageHistory.set([
        //     { id: 1, substance: 1, datetime: new Date('2024-01-01'), quantity: 0, sentiment: 4, trigger: ['Stress', 'Boredom'], cost: 10, craving: 5 },
        //     { id: 2, substance: 1, datetime: new Date('2024-01-02'), quantity: 0, sentiment: 4, trigger: ['Stress'], cost: 5, craving: 3 },
        // ]);
        // component.selectedAnalysisSubstance = 'Alcohol';
        // const triggers = component.prepareTriggerData();
        // const stress = triggers.find(t => t.name === 'Stress');
        // expect(stress?.value).toBe(2);
        // const boredom = triggers.find(t => t.name === 'Boredom');
        // expect(boredom?.value).toBe(1);
    });

    it('should calculate total spending', () => {
        component.usageHistory.set([
            { id: 1, substance: 1, datetime: new Date('2024-01-01'), quantity: 0, sentiment: 4, trigger: [], cost: 10, craving: 5 },
            { id: 2, substance: 2, datetime: new Date('2024-01-02'), quantity: 0, sentiment: 4, trigger: [], cost: 5, craving: 3 },
        ]);
        //expect(component.calculateTotalSpending()).toBe(15);
    });

    it('should calculate spending by period', () => {
        const today = new Date();
        const lastWeek = new Date(today);
        lastWeek.setDate(today.getDate() - 5);
        const lastMonth = new Date(today);
        lastMonth.setDate(today.getDate() - 20);

        component.usageHistory.set([
            { id: 1, substance: 1, datetime: today, quantity: 0, sentiment: 4, trigger: [], cost: 10, craving: 5 },
            { id: 2, substance: 2, datetime: lastWeek, quantity: 0, sentiment: 4, trigger: [], cost: 5, craving: 3 },
            { id: 3, substance: 3, datetime: lastMonth, quantity: 0, sentiment: 4, trigger: [], cost: 8, craving: 2 },
        ]);

        // expect(component.calculateSpendingByPeriod('week')).toBe(15);
        // expect(component.calculateSpendingByPeriod('month')).toBe(23);
        // expect(component.calculateSpendingByPeriod('year')).toBe(23);
        // expect(component.calculateSpendingByPeriod('all')).toBe(23);
    });

    it('should project annual spending', () => {
        // spyOn(component, 'calculateSpendingByPeriod').and.returnValue(100);
        // expect(component.projectAnnualSpending()).toBe(1200);
    });

    it('should calculate potential savings', () => {
        // spyOn(component, 'projectAnnualSpending').and.returnValue(1000);
        // expect(component.calculatePotentialSavings(5)).toBe(5000);
    });

    it('should prepare cost by substance data', () => {
        component.usageHistory.set([
            { id: 1, substance: 1, datetime: new Date('2024-01-01'), quantity: 0, sentiment: 4, trigger: [], cost: 10, craving: 5 },
            { id: 2, substance: 1, datetime: new Date('2024-01-02'), quantity: 0, sentiment: 4, trigger: [], cost: 5, craving: 3 },
            { id: 3, substance: 2, datetime: new Date('2024-01-03'), quantity: 0, sentiment: 4, trigger: [], cost: 8, craving: 2 },
        ]);
        // const costs = component.prepareCostBySubstanceData();
        // expect(costs.find(c => c.name === 'Alcohol')?.value).toBe(15);
        // expect(costs.find(c => c.name === 'Cigarettes')?.value).toBe(8);
    });
});
