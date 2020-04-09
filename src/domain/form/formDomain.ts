import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {ILibraryDomain} from 'domain/library/libraryDomain';
import {IPermissionDomain} from 'domain/permission/permissionDomain';
import {IFormRepo} from 'infra/form/formRepo';
import {difference} from 'lodash';
import {IUtils} from 'utils/utils';
import {IQueryInfos} from '_types/queryInfos';
import {IGetCoreEntitiesParams} from '_types/shared';
import PermissionError from '../../errors/PermissionError';
import ValidationError from '../../errors/ValidationError';
import {Errors} from '../../_types/errors';
import {FormFieldType, IField, IForm, IFormInputField, IFormStrict} from '../../_types/forms';
import {IList, SortOrder} from '../../_types/list';
import {AdminPermissionsActions} from '../../_types/permissions';
import {validateLibrary} from './helpers/validateLibrary';

export interface IFormDomain {
    getFormsByLib(library: string, params?: IGetCoreEntitiesParams): Promise<IList<IForm>>;
    getFormProperties(library: string, id: string): Promise<IForm>;
    saveForm(form: IForm, infos: IQueryInfos): Promise<IForm>;
    deleteForm(library: string, id: string, infos: IQueryInfos): Promise<IForm>;
}

interface IDeps {
    'core.domain.library'?: ILibraryDomain;
    'core.domain.attribute'?: IAttributeDomain;
    'core.domain.permission'?: IPermissionDomain;
    'core.infra.form'?: IFormRepo;
    'core.utils'?: IUtils;
}

export default function(deps: IDeps = {}): IFormDomain {
    const {
        'core.domain.attribute': attributeDomain = null,
        'core.domain.permission': permissionDomain = null,
        'core.infra.form': formRepo = null,
        'core.utils': utils = null
    } = deps;

    const _isInputField = (field: IField): field is IFormInputField => {
        return field.type === FormFieldType.INPUT_FIELD;
    };

    return {
        async getFormsByLib(library: string, params?: IGetCoreEntitiesParams): Promise<IList<IForm>> {
            const filters = {...params?.filters, library};
            const initializedParams = {...params, filters};

            await validateLibrary(library, deps);

            if (typeof initializedParams.sort === 'undefined') {
                initializedParams.sort = {field: 'id', order: SortOrder.ASC};
            }

            return formRepo.getForms(initializedParams);
        },
        async getFormProperties(library: string, id: string): Promise<IForm> {
            const filters = {id, library};

            await validateLibrary(library, deps);

            const forms = await formRepo.getForms({filters, strictFilters: true, withCount: false});

            if (!forms.list.length) {
                throw new ValidationError({id: Errors.UNKNOWN_FORM});
            }

            return forms.list[0];
        },
        async saveForm(form: IForm, infos: IQueryInfos): Promise<IForm> {
            const defaultParams: IFormStrict = {
                id: '',
                library: '',
                system: false,
                dependencyAttributes: [],
                label: {fr: '', en: ''},
                layout: [],
                fields: []
            };

            // Check if form exists
            const forms = await formRepo.getForms({
                filters: {library: form.library, id: form.id},
                strictFilters: true,
                withCount: false
            });

            const existingForm = !!forms.list.length;

            const dataToSave = existingForm
                ? {...defaultParams, ...forms.list[0], ...form}
                : {...defaultParams, ...form};

            // Check permissions
            const permToCheck = existingForm ? AdminPermissionsActions.EDIT_FORM : AdminPermissionsActions.CREATE_FORM;
            if (!(await permissionDomain.getAdminPermission(permToCheck, infos.userId))) {
                throw new PermissionError(permToCheck);
            }

            await validateLibrary(dataToSave.library, deps);

            // Validate ID
            if (!utils.validateID(dataToSave.id)) {
                throw new ValidationError({id: Errors.INVALID_ID_FORMAT});
            }

            // Extract attributes from form data
            if (dataToSave.fields?.length) {
                const attributes: string[] = dataToSave.fields.reduce((attrs, {fields}) => {
                    for (const field of fields) {
                        if (_isInputField(field)) {
                            attrs.push(field.attribute);
                        }
                    }

                    return attrs;
                }, []);

                // Check if they exist
                const existingAttributes = await attributeDomain.getAttributes({withCount: false});
                const invalidAttributes = difference(
                    attributes,
                    existingAttributes.list.map(a => a.id)
                );

                if (invalidAttributes.length) {
                    throw new ValidationError({
                        fields: {
                            msg: Errors.UNKNOWN_FORM_ATTRIBUTES,
                            vars: {attributes: invalidAttributes.join(', ')}
                        }
                    });
                }
            }

            return existingForm ? formRepo.updateForm(dataToSave) : formRepo.createForm(dataToSave);
        },
        async deleteForm(library: string, id: string, infos: IQueryInfos): Promise<IForm> {
            // Check permissions
            const permToCheck = AdminPermissionsActions.DELETE_FORM;
            if (!(await permissionDomain.getAdminPermission(permToCheck, infos.userId))) {
                throw new PermissionError(permToCheck);
            }

            // Check if form exists
            const forms = await formRepo.getForms({
                filters: {library, id},
                strictFilters: true,
                withCount: false
            });

            if (!forms.list.length) {
                throw new ValidationError({id: Errors.UNKNOWN_FORM});
            }

            return formRepo.deleteForm(forms.list[0]);
        }
    };
}
