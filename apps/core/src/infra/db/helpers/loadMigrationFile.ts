export default async (filepath: string): Promise<any> => {
    const importedFile = await import(filepath);

    return importedFile;
};
