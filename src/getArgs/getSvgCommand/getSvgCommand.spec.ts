import {getSvgCommand} from './getSvgCommand';
describe('test getSvgCommand', () => {
    test('command and args return', () => {
        const input = 'test.svg';
        const output = 'test.png';
        const size = 800;

        const {command, args} = getSvgCommand(input, output, size);

        expect(command).toBe('inkscape');
        expect(args).toEqual(expect.arrayContaining([input, output, size.toString()]));
    });
});
