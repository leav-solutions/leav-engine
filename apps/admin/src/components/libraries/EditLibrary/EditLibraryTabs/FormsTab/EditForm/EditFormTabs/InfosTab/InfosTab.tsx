// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useHistory, useLocation} from 'react-router-dom-v5';
import {clearCacheForQuery} from '../../../../../../../../utils';
import {type FormInput} from '../../../../../../../../_gqlTypes/globalTypes';
import {useEditFormContext} from '../../hooks/useEditFormContext';
import InfosForm from './InfosForm';
import {useSaveFormMutation} from '_gqlTypes';
import {type GET_FORM_forms_list} from '_gqlTypes/GET_FORM';

function InfosTab(): JSX.Element {
    const {form, library, setForm} = useEditFormContext();
    const [saveForm] = useSaveFormMutation({
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
        },
    });

    const history = useHistory();
    const {pathname} = useLocation();

    const _handleSubmit = async (formData: FormInput) => {
        const res = await saveForm({
            variables: {
                formData: {...formData, id: formData.id, library},
            },
        });

        setForm(res.data.saveForm as GET_FORM_forms_list);
    };
    return <InfosForm onSubmit={_handleSubmit} />;
}

export default InfosTab;
