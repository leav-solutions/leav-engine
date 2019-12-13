import {getFileType} from './getFileType';

describe('getFileType', () => {
    test('jpg is an image type', () => {
        expect(getFileType('test.jpg')).toEqual('image');
    });

    test('png is an image type', () => {
        expect(getFileType('test.png')).toEqual('image');
    });

    test('pdf is an document type', () => {
        expect(getFileType('test.pdf')).toEqual('document');
    });

    test('psd is an image type', () => {
        expect(getFileType('test.psd')).toEqual('image');
    });

    test('avi is an video type', () => {
        expect(getFileType('test.avi')).toEqual('video');
    });

    test('mkv is an video type', () => {
        expect(getFileType('test.mkv')).toEqual('video');
    });

    test('mp4 is an video type', () => {
        expect(getFileType('test.mp4')).toEqual('video');
    });

    test('mov is an video type', () => {
        expect(getFileType('test.mov')).toEqual('video');
    });

    test('docx is an document type', () => {
        expect(getFileType('test.docx')).toEqual('document');
    });

    test('pptx is an document type', () => {
        expect(getFileType('test.pptx')).toEqual('document');
    });

    test('odt is an document type', () => {
        expect(getFileType('test.odt')).toEqual('document');
    });
});
