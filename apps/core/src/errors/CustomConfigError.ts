// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ErrorTypes} from '../_types/errors';
import LeavError from './LeavError';

export default class CustomConfigError<T> extends LeavError<T> {
    public constructor(message = 'Custom config error') {
        super(ErrorTypes.CUSTOM_CONFIG_ERROR, message);
    }
}
