import {getFileTypeIcon} from './getFileTypeIcon';

describe('getFileTypeIcon', () => {
    test('Should return an office icon for known office extensions', async () => {
        expect(getFileTypeIcon('document.pdf').iconName).toBe('file-pdf');
        expect(getFileTypeIcon('notes.DOCX').iconName).toBe('file-word');
        expect(getFileTypeIcon('data.xlsx').iconName).toBe('file-excel');
        expect(getFileTypeIcon('deck.pptx').iconName).toBe('file-powerpoint');
    });

    test('Should return the image icon for image extensions', async () => {
        expect(getFileTypeIcon('blue.png').iconName).toBe('file-image');
        expect(getFileTypeIcon('photo.psd').iconName).toBe('file-image');
        expect(getFileTypeIcon('logo.eps').iconName).toBe('file-image');
    });

    test('Should fall back to the generic file icon', async () => {
        expect(getFileTypeIcon('archive.zip').iconName).toBe('file');
        expect(getFileTypeIcon('README').iconName).toBe('file');
        expect(getFileTypeIcon('').iconName).toBe('file');
    });
});
