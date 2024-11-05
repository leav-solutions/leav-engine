// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useMutation} from '@apollo/client';
import {useHistory, useLocation} from 'react-router-dom-v5';
import {saveFormQuery} from '../../../../../../../../queries/forms/saveFormMutation';
import {clearCacheForQuery} from '../../../../../../../../utils';
import {FormInput} from '../../../../../../../../_gqlTypes/globalTypes';
import {SAVE_FORM, SAVE_FORMVariables} from '../../../../../../../../_gqlTypes/SAVE_FORM';
import {useEditFormContext} from '../../hooks/useEditFormContext';
import InfosForm from './InfosForm';

function InfosTab(): JSX.Element {
    const {form, library, setForm} = useEditFormContext();
    const [saveForm] = useMutation<SAVE_FORM, SAVE_FORMVariables>(saveFormQuery, {
        // Prevents Apollo from throwing an exception on error state. Errors are managed with the error variable
        onError: e => undefined,
        onCompleted: res => {
            if (history?.replace) {
                history.replace({pathname, hash: 'forms', search: `fid=${res.saveForm.id}`});
            }
        },
        update: cache => {
            // On form creation, handle cache
            if (!form) {
                clearCacheForQuery(cache, 'forms', {filters: {library}});
            }
        }
    });

    const history = useHistory();
    const {pathname} = useLocation();

    const _handleSubmit = async (formData: FormInput) => {
        const res = await saveForm({
            variables: {
                formData: {...formData, id: formData.id, library}
            }
        });

        setForm(res.data.saveForm);
    };
    return <InfosForm onSubmit={_handleSubmit} />;
}

export default InfosTab;
