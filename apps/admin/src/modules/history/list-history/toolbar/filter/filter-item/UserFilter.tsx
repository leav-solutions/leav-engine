import {useTranslation} from 'react-i18next';
import {SingleSelectFilter} from '../../../../../ui/filter/SingleSelectFilter';
import {useGetUsers} from './get-users/useGetUsers';

type UserFilterProps = {
    loading: boolean;
    value: string | null;
    onChange: (value: string | null) => void;
    onReset: () => void;
};

export const UserFilter = ({loading, value, onChange, onReset}: UserFilterProps) => {
    const {t} = useTranslation();
    const {fetchUsers, users, loading: usersLoading} = useGetUsers();

    const options = users.map(user => ({value: user.id, label: user.email}));

    // Guard against refetching on every dropdown opening (SingleSelectFilter calls onOpen each time).
    const _handleOpen = () => {
        if (!users.length && !usersLoading) {
            fetchUsers();
        }
    };

    return (
        <SingleSelectFilter
            label={t('logs.filters.user.label')}
            options={options}
            value={value}
            onChange={onChange}
            onReset={onReset}
            disabled={loading}
            searchable
            loading={usersLoading}
            onOpen={_handleOpen}
        />
    );
};
