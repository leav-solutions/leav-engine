// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type i18n} from 'i18next';
import {type IDbService} from '../dbService';
import {type IConfig} from '../../../_types/config';
import {type IMigration} from '../../../_types/migration';
import {type IQueryInfos} from '../../../_types/queryInfos';
import {aql} from 'arangojs';

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
    translator?: i18n;
    config?: IConfig;
}

export default function ({'core.infra.db.dbService': dbService = null}: IDeps = {}): IMigration {
    const _updateAttributes = async (ctx: IQueryInfos): Promise<void> => {
        const attributes = await dbService.execute({
            query: aql`
                FOR attribute IN core_attributes
                    RETURN attribute
            `,
            ctx
        });

        for (const attribute of attributes) {
            if (attribute.required === undefined) {
                attribute.required = false;

                await dbService.execute({
                    query: aql`
                        UPDATE ${attribute._key} WITH ${attribute} IN core_attributes
                    `,
                    ctx
                });
            }
        }
    };

    return {
        run: _updateAttributes
    };
}
