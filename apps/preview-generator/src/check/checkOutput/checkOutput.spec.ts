// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IConfig} from '../../types/types';
import {checkOutput} from './checkOutput';

describe('checkOutput', () => {
    const path = '/data/test.jpg';
    const size = 800;
    const name = 'big';
    const config: Mockify<IConfig> = {
        outputRootPath: '/data/'
    };

    test('should throw an error', async () => {
        (console.error as jest.FunctionLike) = jest.fn();
        checkOutput(path, size, name, config as IConfig).catch(e => expect(e).not.toBeNull());
    });
});
