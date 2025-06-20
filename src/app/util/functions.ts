
export function isMobile(): boolean {
    return Boolean(window.navigator.userAgent.toLowerCase().match(/(android|iphone|android|iemobile|ipad)/i));
}
