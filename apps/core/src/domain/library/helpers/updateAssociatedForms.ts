import {type IQueryInfos} from '../../../_types/queryInfos';
import {type IFormDomain} from '../../form/formDomain';

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
                        elements: depElem.elements.filter(elem => !deletedAttrs.includes(elem.settings?.attribute)),
                    })),
                };

                await formDomain.saveForm({form: updatedForm, ctx});
            }
        },
    };
}
