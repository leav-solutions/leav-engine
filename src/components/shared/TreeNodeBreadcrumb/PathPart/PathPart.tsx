import React, {useState} from 'react';
import {Dropdown, Icon} from 'semantic-ui-react';
import styled from 'styled-components';
import {RecordIdentity_whoAmI} from '../../../../_gqlTypes/RecordIdentity';
import RecordCard from '../../RecordCard';
import {ITreeBreadcrumbMenuItem} from '../TreeNodeBreadcrumb';

interface IPathPartProps {
    record: RecordIdentity_whoAmI;
    actions?: ITreeBreadcrumbMenuItem[];
}

const PathPartWrapper = styled.div`
    position: relative;
    padding-right: 60px;
    height: 30px;
`;

const HoverDropdown = styled(Dropdown)`
    && {
        position: absolute;
        top: 7px;
        right: 0;
    }
`;

function PathPart({record, actions = []}: IPathPartProps): JSX.Element {
    const [isHovering, setIsHovering] = useState<boolean>(false);
    const _handleMouseEnter = () => setIsHovering(true);
    const _handleMouseLeave = () => setIsHovering(false);

    const menuItems = actions
        .filter(a => !a.displayFilter || a.displayFilter(record))
        .map((item, index) => {
            const action = () => item.action(record);
            return <Dropdown.Item key={index} text={item.text} icon={item.icon} onClick={action} />;
        });
    const displayMenu = !!menuItems.length;
    const showMenuBtn = <Icon name="ellipsis vertical" />;

    return (
        <>
            <PathPartWrapper
                data-test-id="path_part_wrapper"
                onMouseEnter={_handleMouseEnter}
                onMouseLeave={_handleMouseLeave}
            >
                <RecordCard record={record} />
                {displayMenu && isHovering && (
                    <HoverDropdown trigger={showMenuBtn} icon={false}>
                        <Dropdown.Menu>{menuItems}</Dropdown.Menu>
                    </HoverDropdown>
                )}
            </PathPartWrapper>
        </>
    );
}

export default PathPart;
