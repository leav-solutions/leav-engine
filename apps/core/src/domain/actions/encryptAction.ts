// Copyright LEAV Solutions 2017
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
        action: async values =>
            values.reduce(async (promAcc, valueElement) => {
                const acc = await promAcc;
                try {
                    if (valueElement.value === null) {
                        acc.values.push({...valueElement, value: null});
                        return acc;
                    }

                    const salt = await bcrypt.genSalt(10);
                    const hash = await bcrypt.hash(valueElement.value, salt);

                    acc.values.push({...valueElement, value: hash});
                } catch (e) {
                    acc.errors.push({errorType: Errors, attributeValue: valueElement});
                }

                return acc;
            }, Promise.resolve({values: [], errors: []}))
    };
}
