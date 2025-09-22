// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IDbService} from 'infra/db/dbService';

export default async function () {
    try {
        const dbService: IDbService = globalThis.coreContainer.cradle['core.infra.db.dbService'];
        dbService.db.close();
    } catch (e) {
        console.error(e);
        console.error(e.stack);
    }
}
