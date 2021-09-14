// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import Joi from '@hapi/joi';
import {GraphQLScalarType, ValueNode} from 'graphql';
import {IConfig} from '_types/config';
import {IKeyValue} from '_types/shared';
import {ISystemTranslation} from '_types/systemTranslation';
import parseLiteral from '../helpers/parseLiteral';

export interface ISystemTranslationGenerator {
    getScalarType: (optional?: boolean) => GraphQLScalarType;
}

interface IDeps {
    config: IConfig;
}

export default function ({config}: IDeps): ISystemTranslationGenerator {
    const _validateValue = (val: unknown, optional: boolean) => {
        // We accept a key-value object, keys being an available language and value being a string.
        // The default language has to be present
        const validValueSchema = Joi.object().keys(
            config.lang.available.reduce((acc, lng) => {
                return {
                    ...acc,
                    [lng]:
                        lng === config.lang.default && !optional
                            ? Joi.string().required()
                            : Joi.string().optional().allow('')
                };
            }, {})
        );

        const isValid = validValueSchema.validate(val);

        if (isValid.error) {
            throw new Error(`Invalid system translation input: ${isValid.error.message}`);
        }
    };

    const getScalar = (optional: boolean = true) =>
        new GraphQLScalarType({
            name: 'SystemTranslation',
            description: 'System entities fields translation (label...)',
            serialize: (val: ISystemTranslation): ISystemTranslation => val,
            parseValue: (val: unknown): ISystemTranslation => {
                _validateValue(val, optional);

                return val as ISystemTranslation;
            },
            parseLiteral: (valAst: ValueNode, valVariables?: IKeyValue<unknown>): ISystemTranslation => {
                const objVal = parseLiteral('SystemTranslation', valAst, valVariables);

                _validateValue(objVal, optional);

                return objVal as ISystemTranslation;
            }
        });

    return {
        getScalarType(optional = false) {
            return getScalar(optional);
        }
    };
}
