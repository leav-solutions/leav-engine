// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent, useEffect, useRef} from 'react';
import {MetadataSubmitValueFunc} from '../EditRecordContent/_types';
import {useEditRecordReducer} from '../editRecordReducer/useEditRecordReducer';
import RecordSummary from './RecordSummary';
import ValuesVersions from './ValuesVersions';
import {createPortal} from 'react-dom';
import {EditRecordReducerActionsTypes, IEditRecordReducerState} from '../editRecordReducer/editRecordReducer';
import {KitSidePanel, KitSpace} from 'aristid-ds';
import {KitSidePanelRef} from 'aristid-ds/dist/Kit/Navigation/SidePanel/types';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {EDIT_RECORD_SIDEBAR_ID} from '_ui/constants';
import Breadcrumb from './Breacrumb';
import AttributeSummary from './AttributeSummary';
import ValuesSummary from './ValuesSummary';
import styled from 'styled-components';
import {useLang} from '_ui/hooks';
import {localizedTranslation} from '@leav/utils';

interface IEditRecordSidebarProps {
    onMetadataSubmit: MetadataSubmitValueFunc;
    open: boolean;
    sidebarContainer?: HTMLElement;
}

const _getRecordSidebarContent = (state: IEditRecordReducerState, onMetadataSubmit: MetadataSubmitValueFunc) => {
    // TODO: ValuesVersions should be removed or refactored later
    switch (state.sidebarContent) {
        case 'none':
            return null;
        case 'valueDetails':
            return (
                <KitSpace direction="vertical" size="s" style={{width: '100%'}}>
                    <AttributeSummary attribute={state.activeAttribute.attribute} />
                    <ValuesSummary
                        globalValues={state.activeAttribute.globalValues}
                        calculatedValue={state.activeAttribute.calculatedValue}
                    />
                </KitSpace>
            );
        case 'valuesVersions':
            return <ValuesVersions />;
        default:
            return <RecordSummary record={state.record} />;
    }
};

const StyledKitSidePanel = styled(KitSidePanel)<{$hideBoxShadow: boolean}>`
    ${({$hideBoxShadow}) =>
        $hideBoxShadow &&
        `&&& section {
            box-shadow: none;
        }`}
`;

export const EditRecordSidebar: FunctionComponent<IEditRecordSidebarProps> = ({
    onMetadataSubmit,
    open,
    sidebarContainer
}) => {
    const {t} = useSharedTranslation();
    const {lang} = useLang();
    const {state, dispatch} = useEditRecordReducer();
    const sidePanelRef = useRef<KitSidePanelRef | null>(null);
    const sidePanelTitle =
        state.sidebarContent === 'valueDetails'
            ? localizedTranslation(state.activeAttribute?.attribute.label, lang)
            : (state.record?.label ?? state.record?.id ?? t('record_summary.new_record'));

    const editRecordSidebarContent = (
        <StyledKitSidePanel
            ref={sidePanelRef}
            initialOpen={false}
            idCardProps={{title: sidePanelTitle}}
            id={EDIT_RECORD_SIDEBAR_ID}
            headerExtra={<Breadcrumb />}
            $hideBoxShadow={!sidebarContainer}
        >
            {_getRecordSidebarContent(state, onMetadataSubmit)}
        </StyledKitSidePanel>
    );

    console.log('SIDEBAR', {
        open,
        sidebarContent: state.sidebarContent,
        default: state.sidebarDefaultHidden,
        enable: state.sidebarEnabled
    });

    useEffect(() => {
        if (sidePanelRef.current && state.sidebarEnabled) {
            // on manual mode frome the outside, we ignore reducer state...
            const isOpen = open !== undefined ? open : state.sidebarContent !== 'none';
            if (isOpen) {
                sidePanelRef.current.open();
            } else {
                sidePanelRef.current.close();
            }

            // ...but keep updating it for prevent unexpected behavior
            if (open !== undefined) {
                dispatch({
                    type: EditRecordReducerActionsTypes.SET_SIDEBAR_CONTENT,
                    content: open ? state.sidebarContent : 'none'
                });
            }
        }
    }, [open]);

    return sidebarContainer === undefined
        ? editRecordSidebarContent
        : createPortal(editRecordSidebarContent, sidebarContainer);
};

export default EditRecordSidebar;
