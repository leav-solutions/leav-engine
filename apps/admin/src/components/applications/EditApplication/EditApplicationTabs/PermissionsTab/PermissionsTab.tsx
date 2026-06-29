import DefinePermByUserGroupView from '../../../../permissions/DefinePermByUserGroupView';
import {useEditApplicationContext} from '../../../../../context/EditApplicationContext';
import styled from 'styled-components';
import {PermissionTypes} from '../../../../../_gqlTypes';

const Wrapper = styled.div`
    display: grid;
    grid-template-rows: auto;
`;

function PermissionsTab(): JSX.Element {
    const {application, readonly} = useEditApplicationContext();

    return (
        <Wrapper>
            <DefinePermByUserGroupView
                type={PermissionTypes.application}
                applyTo={application.id}
                readOnly={readonly}
            />
        </Wrapper>
    );
}

export default PermissionsTab;
