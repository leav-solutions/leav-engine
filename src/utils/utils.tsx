export function getRecordIdentityCacheKey(libId: string, recordId: string): string {
    return `recordIdentity/${libId}/${recordId}`;
}
