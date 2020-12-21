export const getSvgCommand = (input: string, output: string, size: number) => {
    const command = 'inkscape';

    const args = ['-z', '-e', output, '-w', size.toString(), '-h', size.toString(), input];

    return {
        command,
        args
    };
};
