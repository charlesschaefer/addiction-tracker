import { DateTime } from "luxon";


export function getDateForChart(dateStr: string, locale: string) {
    let date = DateTime.fromISO(dateStr);
    if (!date.isValid) {
        date = DateTime.fromFormat(dateStr, 'yyyy-MM-dd');
    }
    if (!date.isValid) {
        date = DateTime.fromJSDate(new Date(dateStr));
    }
    
    return date.toLocaleString(
        {
            day: 'numeric',
            month: 'short'
        }, 
        {
            locale: locale
        }
    );
}