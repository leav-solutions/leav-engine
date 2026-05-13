import {useNavigate, useLocation} from 'react-router-dom';
import {clearCacheForQuery} from '../../../../../../../../utils';
import {type FormInput, useSaveFormMutation} from '../../../../../../../../_gqlTypes';
import {useEditFormContext} from '../../hooks/useEditFormContext';
import InfosForm from './InfosForm';
import {type GET_FORM_forms_list} from '../../../../../../../../_gqlTypes/GET_FORM';

function InfosTab(): JSX.Element {
    const {form, library, setForm} = useEditFormContext();
    const navigate = useNavigate();
    const {pathname} = useLocation();
    const [saveForm] = useSaveFormMutation({
        // Prevents Apollo from throwing an exception on error state. Errors are managed with the error variable
        onError: e => undefined,
        onCompleted: res => {
            navigate(`${pathname}#forms?fid=${res.saveForm.id}`, {replace: true});
        },
        update: cache => {
            // On form creation, handle cache
            if (!form) {
                clearCacheForQuery(cache, 'forms', {filters: {library}});
            }
        },
    });

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
