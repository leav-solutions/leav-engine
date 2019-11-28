import {getFileType} from './getFileType';

describe('getFileType', () => {
    test('jpg is an image type', () => {
        expect(getFileType('test.jpg')).toEqual('image');
    });

    test('png is an image type', () => {
        expect(getFileType('test.png')).toEqual('image');
    });

    test('pdf is an image type', () => {
        expect(getFileType('test.pdf')).toEqual('image');
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
});
