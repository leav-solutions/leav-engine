// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IMigration} from '_types/migration';
import {IFormRepo} from 'infra/form/formRepo';
import {IFormStrict} from '_types/forms';

interface IDeps {
    'core.infra.form'?: IFormRepo;
    config?: any;
}

export default function ({'core.infra.form': formRepo}: IDeps = {}): IMigration {
    return {
        async run(ctx) {
            const formsList = await formRepo.getForms({ctx});
            await Promise.all(
                formsList.list.map(form => {
                    form.sidePanel = form.sidePanel ?? {
                        enable: true,
                        isOpenByDefault: true
                    };
                    return formRepo.updateForm({formData: form as IFormStrict, ctx});
                })
            );
        }
    };
}
