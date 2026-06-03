declare global {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    interface Window {
        _paq?: unknown[][];
    }
}

const push = (args: unknown[]) => {
    window._paq = window._paq || [];
    window._paq.push(args);
};

export const matomo = {
    setUserRole(userRole: string) {
        // ID 1 → User Role, scope Visit
        push(['setCustomDimension', 1, userRole || 'unknown']);
    },

    trackEvent(params: {
        category: string;
        action: string;
        name?: string;
        value?: number;
        pageType?: string;
        panelName?: string;
        inComparisonMode?: boolean;
    }) {
        push(['trackEvent', params.category, params.action, params.name, params.value]);
    },
};
