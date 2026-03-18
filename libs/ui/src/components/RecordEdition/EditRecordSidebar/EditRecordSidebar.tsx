// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type FunctionComponent, useEffect, useRef} from 'react';
import {useEditRecordReducer} from '../editRecordReducer/useEditRecordReducer';
import RecordSummary from './RecordSummary';
import ValuesVersions from './ValuesVersions';
import {createPortal} from 'react-dom';
import {EditRecordSidebarContentTypeMap, type IEditRecordReducerState} from '../editRecordReducer/editRecordReducer';
import {KitSidePanel} from 'aristid-ds';
import {type KitSidePanelRef} from 'aristid-ds/dist/Kit/Navigation/SidePanel/types';
import {EDIT_RECORD_SIDEBAR_ID} from '_ui/constants';
import Breadcrumb from './Breacrumb';
import AttributeSummary from './AttributeSummary';
import ValuesSummary from './ValuesSummary';
import styled from 'styled-components';
import {useLang} from '_ui/hooks';
import {localizedTranslation} from '@leav/utils';

interface IEditRecordSidebarProps {
    sidebarContainer?: HTMLElement;
    scrollAllRecordSummary?: boolean;
}

const StyledDivContentWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: calc(var(--general-spacing-s) * 1px);
    height: 100%;
`;

const _getRecordSidebarContent = (state: IEditRecordReducerState, scrollAllRecordSummary: boolean = false) => {
    // TODO: ValuesVersions should be removed or refactored later
    switch (state.sidebarContent) {
        case 'none':
            return null;
        case 'valueDetails':
            return (
                <StyledDivContentWrapper>
                    <AttributeSummary attribute={state.activeAttribute.attribute} />
                    <ValuesSummary
                        record={state.record}
                        attributeId={state.activeAttribute.attribute.id}
                        globalValues={state.activeAttribute.globalValues}
                        calculatedValues={state.activeAttribute.calculatedValues}
                    />
                </StyledDivContentWrapper>
            );
        case 'valuesVersions':
            return <ValuesVersions />;
        default:
            return <RecordSummary record={state.record} scrollAll={scrollAllRecordSummary} />;
    }
};

const StyledKitSidePanel = styled(KitSidePanel)<{$hideBoxShadow: boolean; $isOpen: boolean}>`
    ${({$hideBoxShadow}) =>
        $hideBoxShadow &&
        `&&& section {
            box-shadow: none;
        }`}
    grid-area: sidebar;
    display: ${({$isOpen}) => ($isOpen ? 'block' : 'none')};
`;

export const EditRecordSidebar: FunctionComponent<IEditRecordSidebarProps> = ({
    sidebarContainer,
    scrollAllRecordSummary,
}) => {
    const {lang} = useLang();
    const {state} = useEditRecordReducer();
    const sidePanelRef = useRef<KitSidePanelRef | null>(null);
    const idCardProps =
        state.sidebarContent === EditRecordSidebarContentTypeMap.VALUE_DETAILS
            ? {title: localizedTranslation(state.activeAttribute?.attribute.label, lang)}
            : undefined;

    const editRecordSidebarContent = (
        <StyledKitSidePanel
            ref={sidePanelRef}
            initialOpen={state.isOpenSidebar && state.enableSidebar}
            idCardProps={idCardProps}
            id={EDIT_RECORD_SIDEBAR_ID}
            headerExtra={<Breadcrumb />}
            $hideBoxShadow={!sidebarContainer}
            $isOpen={state.isOpenSidebar}
        >
            {_getRecordSidebarContent(state, scrollAllRecordSummary)}
        </StyledKitSidePanel>
    );

    useEffect(() => {
        if (sidePanelRef.current && state.enableSidebar) {
            if (state.isOpenSidebar) {
                sidePanelRef.current.open();
            } else {
                sidePanelRef.current.close();
            }
        }
    }, [state.enableSidebar, state.isOpenSidebar, sidePanelRef.current]);

    if (!state.enableSidebar) {
        return null;
    }

    return sidebarContainer === undefined
        ? editRecordSidebarContent
        : createPortal(editRecordSidebarContent, sidebarContainer);
};

export default EditRecordSidebar;
