// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IMigration} from '_types/migration';
import {IFormRepo} from 'infra/form/formRepo';
import {IFormStrict} from '_types/forms';

interface IDeps {
    'core.infra.form'?: IFormRepo;
    config?: any;
}

export default function ({'core.infra.form': formRepo = null, config = null}: IDeps = {}): IMigration {
    return {
        async run(ctx) {
            const defaultLang = config.lang.default;

            const formsList = await formRepo.getForms({ctx});

            // update form to remove attribute
            await Promise.all(
                formsList.list.map(form => {
                    form.elements = form.elements.map(dependentElements => {
                        dependentElements.elements = dependentElements.elements.map(element => {
                            if ('settings' in element && typeof element.settings.label !== 'object') {
                                element.settings.label = {
                                    [defaultLang]: element.settings.label
                                };
                            }
                            return element;
                        });
                        return dependentElements;
                    });

                    return formRepo.updateForm({formData: form as IFormStrict, ctx});
                })
            );
        }
    };
}
