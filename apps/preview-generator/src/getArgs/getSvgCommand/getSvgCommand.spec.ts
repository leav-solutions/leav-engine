import {getSvgCommand} from './getSvgCommand';
import fs from 'fs';

const svgContent = (width: number, height: number) => `
    <svg width="${width}" height="${height}" /> 
`;

describe('test getSvgCommand', () => {
    const input = 'test.svg';
    const output = 'test.png';
    const size = 800;

    test('Command and args return on width larger', async () => {
        vi.spyOn(fs.promises, 'readFile').mockResolvedValue(svgContent(200, 100));
        const {command, args} = await getSvgCommand(input, output, size);
        expect(command).toBe('inkscape');
        expect(args).toEqual(expect.arrayContaining([input, output, '-w', size.toString()]));
    });

    test('Command and args return on height larger', async () => {
        vi.spyOn(fs.promises, 'readFile').mockResolvedValue(svgContent(100, 200));
        const {command, args} = await getSvgCommand(input, output, size);
        expect(command).toBe('inkscape');
        expect(args).toEqual(expect.arrayContaining([input, output, '-h', size.toString()]));
    });
});
