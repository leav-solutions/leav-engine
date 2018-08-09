import * as bcrypt from 'bcrypt';
import {
    ActionsListIOTypes,
    ActionsListValueType,
    IActionsListContext,
    IActionsListFunction
} from '../../../_types/actionsList';

export default function(): IActionsListFunction {
    return {
        name: 'encrypt',
        description: 'Encrypt value',
        inputTypes: [ActionsListIOTypes.STRING],
        outputTypes: [ActionsListIOTypes.STRING],
        action: async (value: ActionsListValueType, params: any, ctx: IActionsListContext): Promise<string> => {
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(value, salt);

            return hash;
        }
    };
}
