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
