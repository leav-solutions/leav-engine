export function getRecordIdentityCacheKey(libId: string, recordId: string): string {
    return `recordIdentity/${libId}/${recordId}`;
}

export function getPreviewUrl(preview: string) {
    const url = process.env.REACT_APP_CORE_URL;
    return url + preview;
}
