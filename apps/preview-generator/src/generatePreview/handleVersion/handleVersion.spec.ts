// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {join} from 'path';
import {execute} from './../execute/execute';
import {handleVersion, IHandleVersion} from './handleVersion';

describe('handleVersion', () => {
    const output = './test.png';
    const density = 300;
    const background = false;
    const name = 'test';

    const size = {
        output,
        size: 800,
        name
    };

    const rootPaths = {
        input: '/input',
        output: '/output'
    };

    const input = './input';

    const type = 'image';

    const version = {
        background,
        density,
        sizes: [size]
    };

    const params: Mockify<IHandleVersion> = {
        version,
        rootPaths,
        input,
        type
    };

    test('should call execute', () => {
        (execute as jest.FunctionLike) = jest.fn();

        handleVersion(params as IHandleVersion);

        expect(execute).toBeCalledTimes(1);
    });

    test('should call execute with right argument', () => {
        (execute as jest.FunctionLike) = jest.fn();

        handleVersion(params as IHandleVersion);

        expect(execute).toBeCalledWith({
            type,
            absInput: join(rootPaths.input, input),
            absOutput: join(rootPaths.output, output),
            version,
            size,
            results: [],
            rootPaths,
            config: undefined,
            first: true
        });
    });
});
