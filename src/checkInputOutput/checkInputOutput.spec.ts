import {checkInputOutput} from './checkInputOutput';
import {execVideo} from '../execVideo/execVideo';
import {execImage} from '../execImage/execImage';
import {checkClipJpg} from '../checkImage/checkImage';

describe('test generateThumbnail', () => {
    const size = {width: 800, height: 800};

    test('input avi', () => {
        const input = 'test.avi';
        const output = 'test.png';

        (execVideo as jest.FunctionLike) = jest.fn();

        checkInputOutput(input, output, size);

        expect(execVideo).toBeCalled();
    });

    test('input png', () => {
        const input = 'test.png';
        const output = 'test.png';

        (execImage as jest.FunctionLike) = jest.fn();

        checkInputOutput(input, output, size);

        expect(execImage).toBeCalled();
    });

    test('input jpg', () => {
        const input = 'test.jpg';
        const output = 'test.png';

        (checkClipJpg as jest.FunctionLike) = jest.fn();

        checkInputOutput(input, output, size);

        expect(checkClipJpg).toBeCalled();
    });
});
