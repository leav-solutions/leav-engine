export const setMetadataRecordLabel = (recordLabel: string) => ({
    ...(recordLabel ? {recordLabel} : {}),
});

export const getMetadataRecordLabel = (metadata: Record<string, any> | undefined) => metadata?.recordLabel;
