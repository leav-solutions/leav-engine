// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IQueryInfos} from '_types/queryInfos';
import {IFormDomain} from 'domain/form/formDomain';

interface IDeps {
    'core.domain.form'?: IFormDomain;
}

export interface IUpdateAssociatedFormsHelper {
    updateAssociatedForms: (deletedAttrs: string[], libraryId: string, ctx: IQueryInfos) => Promise<void>;
}

export default function ({'core.domain.form': formDomain = null}: IDeps): IUpdateAssociatedFormsHelper {
    return {
        async updateAssociatedForms(deletedAttrs: string[], libraryId: string, ctx: IQueryInfos): Promise<void> {
            const forms = await formDomain.getFormsByLib({library: libraryId, ctx});

            for (const form of forms.list) {
                const updatedForm = {
                    ...form,
                    elements: form.elements.map(depElem => ({
                        ...depElem,
                        elements: depElem.elements.filter(elem => !deletedAttrs.includes(elem.settings?.attribute))
                    }))
                };

                await formDomain.saveForm({form: updatedForm, ctx});
            }
        }
    };
}
