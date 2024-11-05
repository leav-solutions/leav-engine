// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React, {useState} from 'react';
import {Dropdown, Icon} from 'semantic-ui-react';
import styled from 'styled-components';
import {RecordIdentity_whoAmI} from '../../../../_gqlTypes/RecordIdentity';
import RecordCard from '../../RecordCard';
import {ITreeBreadcrumbMenuItem} from '../TreeNodeBreadcrumb';
import {useTranslation} from 'react-i18next';
import AltPaths from '../AltPaths';

interface IPathPartProps {
    record: RecordIdentity_whoAmI;
    actions?: ITreeBreadcrumbMenuItem[];
    altPaths?: RecordIdentity_whoAmI[][];
}

const PathPartWrapper = styled.div`
    position: relative;
    padding-right: 30px;
    height: 30px;
`;

const HoverDropdown = styled(Dropdown)`
    && {
        position: absolute;
        top: 7px;
        right: 0;
    }
`;

function PathPart({record, altPaths = [], actions = []}: IPathPartProps): JSX.Element {
    const [isHovering, setIsHovering] = useState<boolean>(false);
    const _handleMouseEnter = () => setIsHovering(true);
    const _handleMouseLeave = () => setIsHovering(false);
    const [showAltPaths, setShowAltPaths] = useState<boolean>(false);
    const {t} = useTranslation();

    const menuItems = actions
        .filter(a => !a.displayFilter || a.displayFilter(record))
        .map((item, index) => {
            const action = () => item.action(record);
            return <Dropdown.Item key={index} text={item.text} icon={item.icon} onClick={action} />;
        });

    if (altPaths.length) {
        menuItems.push(
            <Dropdown.Item
                key="altPaths"
                text={t('trees.alternative_paths')}
                icon="list"
                onClick={() => setShowAltPaths(true)}
            />
        );
    }

    const displayMenu = !!menuItems.length;
    const showMenuBtn = <Icon name="ellipsis vertical" />;

    return (
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
            {showAltPaths && <AltPaths altPaths={altPaths} onClose={setShowAltPaths}></AltPaths>}
        </PathPartWrapper>
    );
}

export default PathPart;
