// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import * as bcrypt from 'bcryptjs';
import {
    ActionsListIOTypes,
    ActionsListValueType,
    IActionsListContext,
    IActionsListFunction
} from '../../_types/actionsList';

export default function(): IActionsListFunction {
    return {
        id: 'encrypt',
        name: 'Encrypt',
        description: 'Encrypt value',
        input_types: [ActionsListIOTypes.STRING],
        output_types: [ActionsListIOTypes.STRING],
        action: async (value: ActionsListValueType, params: any, ctx: IActionsListContext): Promise<string> => {
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(value, salt);

            return hash;
        }
    };
}
