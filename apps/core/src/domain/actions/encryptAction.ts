// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import * as bcrypt from 'bcryptjs';
import {Errors} from '../../_types/errors';
import {ActionsListIOTypes, IActionsListFunction} from '../../_types/actionsList';

export default function (): IActionsListFunction {
    return {
        id: 'encrypt',
        name: 'Encrypt',
        description: 'Encrypt value',
        input_types: [ActionsListIOTypes.STRING],
        output_types: [ActionsListIOTypes.STRING],
        compute: false,
        action: async values =>
            values.reduce(
                async (promAcc, valueElement) => {
                    const acc = await promAcc;
                    try {
                        if (valueElement.payload === null) {
                            acc.values.push({...valueElement, payload: null});
                            return acc;
                        }

                        const salt = await bcrypt.genSalt(10);
                        const hash = await bcrypt.hash(valueElement.payload, salt);

                        acc.values.push({...valueElement, payload: hash});
                    } catch (e) {
                        acc.errors.push({errorType: Errors, attributeValue: valueElement});
                    }

                    return acc;
                },
                Promise.resolve({values: [], errors: []})
            )
    };
}
