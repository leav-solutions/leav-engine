// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {renderHook} from '@testing-library/react';
import {useOutsideInteractionDetector} from './useOutsideInteractionDetector';
import {
    EditRecordReducerActionsTypes,
    IRecordPropertyWithAttribute
} from '_ui/components/RecordEdition/editRecordReducer/editRecordReducer';
import {EDIT_RECORD_SIDEBAR_ID} from '_ui/constants';
import userEvent from '@testing-library/user-event';
import {RecordFormElementsValue} from '_ui/hooks/useGetRecordForm';
import {mockFormAttribute} from '_ui/__mocks__/common/attribute';

describe('useOutsideInteractionDetector', () => {
    const mockBackendValues: RecordFormElementsValue[] = [
        {id_value: 'backend-value', linkValue: {id: 'test', whoAmI: {id: 'test', library: {id: 'linked_library'}}}}
    ];
    const mockPendingValues: RecordFormElementsValue[] = [
        {id_value: 'pending-value', linkValue: {id: 'test', whoAmI: {id: 'test', library: {id: 'linked_library'}}}}
    ];

    let mockDispatch: jest.Mock;
    let mockActiveAttribute: IRecordPropertyWithAttribute | null;
    let mockFormIdToLoad: string | 'edition' | 'creation';

    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
        mockDispatch = jest.fn();
        mockActiveAttribute = null;
        mockFormIdToLoad = 'creation';

        document.body.innerHTML = '';
        user = userEvent.setup();
    });

    it('should set active value with pendingValues on click inside the target element if formdIdToLoad is in creation', async () => {
        renderHook(() =>
            useOutsideInteractionDetector({
                attribute: mockFormAttribute,
                activeAttribute: mockActiveAttribute,
                dispatch: mockDispatch,
                formIdToLoad: mockFormIdToLoad,
                backendValues: mockBackendValues,
                pendingValues: mockPendingValues,
                allowedSelectors: [],
                attributePrefix: 'standardfield-'
            })
        );

        const targetElement = document.createElement('div');
        targetElement.id = 'standardfield-test_attribute';
        document.body.appendChild(targetElement);

        await user.click(targetElement);

        expect(mockDispatch).toHaveBeenCalledWith({
            type: EditRecordReducerActionsTypes.SET_ACTIVE_VALUE,
            attribute: mockFormAttribute,
            values: mockPendingValues
        });
    });

    it('should set active value with backendValues on click inside the target element if formdIdToLoad is in edition', async () => {
        mockFormIdToLoad = 'edition';

        renderHook(() =>
            useOutsideInteractionDetector({
                attribute: mockFormAttribute,
                activeAttribute: mockActiveAttribute,
                dispatch: mockDispatch,
                formIdToLoad: mockFormIdToLoad,
                backendValues: mockBackendValues,
                pendingValues: mockPendingValues,
                allowedSelectors: [],
                attributePrefix: 'standardfield-'
            })
        );

        const targetElement = document.createElement('div');
        targetElement.id = 'standardfield-test_attribute';
        document.body.appendChild(targetElement);

        await user.click(targetElement);

        expect(mockDispatch).toHaveBeenCalledWith({
            type: EditRecordReducerActionsTypes.SET_ACTIVE_VALUE,
            attribute: mockFormAttribute,
            values: mockBackendValues
        });
    });

    it('should not set active value on click outside the target element', async () => {
        renderHook(() =>
            useOutsideInteractionDetector({
                attribute: mockFormAttribute,
                activeAttribute: mockActiveAttribute,
                dispatch: mockDispatch,
                formIdToLoad: mockFormIdToLoad,
                backendValues: mockBackendValues,
                pendingValues: mockPendingValues,
                allowedSelectors: [],
                attributePrefix: 'standardfield-'
            })
        );

        const otherElement = document.createElement('div');
        otherElement.id = 'other-element';
        document.body.appendChild(otherElement);

        await user.click(otherElement);

        expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('should set null as active value when clicking outside and there is an active attribute', async () => {
        mockActiveAttribute = {
            attribute: mockFormAttribute
        };

        renderHook(() =>
            useOutsideInteractionDetector({
                attribute: mockFormAttribute,
                activeAttribute: mockActiveAttribute,
                dispatch: mockDispatch,
                formIdToLoad: mockFormIdToLoad,
                backendValues: mockBackendValues,
                pendingValues: mockPendingValues,
                allowedSelectors: [],
                attributePrefix: 'standardfield-'
            })
        );

        const otherElement = document.createElement('div');
        otherElement.id = 'other-element';
        document.body.appendChild(otherElement);

        await user.click(otherElement);

        expect(mockDispatch).toHaveBeenCalledWith({
            type: EditRecordReducerActionsTypes.SET_ACTIVE_VALUE,
            attribute: null
        });
    });

    it('should not set null as active value when clicking inside sidebar', async () => {
        mockActiveAttribute = {
            attribute: mockFormAttribute
        };

        renderHook(() =>
            useOutsideInteractionDetector({
                attribute: mockFormAttribute,
                activeAttribute: mockActiveAttribute,
                dispatch: mockDispatch,
                formIdToLoad: mockFormIdToLoad,
                backendValues: mockBackendValues,
                pendingValues: mockPendingValues,
                allowedSelectors: [],
                attributePrefix: 'standardfield-'
            })
        );

        const sidebarElement = document.createElement('div');
        sidebarElement.id = EDIT_RECORD_SIDEBAR_ID;
        document.body.appendChild(sidebarElement);

        await user.click(sidebarElement);

        expect(mockDispatch).not.toHaveBeenCalledWith({
            type: EditRecordReducerActionsTypes.SET_ACTIVE_VALUE,
            attribute: null
        });
    });

    it('should not set null as active value when clicking on allowed selector', async () => {
        mockActiveAttribute = {
            attribute: mockFormAttribute
        };

        renderHook(() =>
            useOutsideInteractionDetector({
                attribute: mockFormAttribute,
                activeAttribute: mockActiveAttribute,
                dispatch: mockDispatch,
                formIdToLoad: mockFormIdToLoad,
                backendValues: mockBackendValues,
                pendingValues: mockPendingValues,
                allowedSelectors: ['#allowed-element'],
                attributePrefix: 'standardfield-'
            })
        );

        const allowedElement = document.createElement('div');
        allowedElement.id = 'allowed-element';
        document.body.appendChild(allowedElement);

        await user.click(allowedElement);

        expect(mockDispatch).not.toHaveBeenCalledWith({
            type: EditRecordReducerActionsTypes.SET_ACTIVE_VALUE,
            attribute: null
        });
    });

    it('should set active value on focus inside the target element', () => {
        renderHook(() =>
            useOutsideInteractionDetector({
                attribute: mockFormAttribute,
                activeAttribute: mockActiveAttribute,
                dispatch: mockDispatch,
                formIdToLoad: mockFormIdToLoad,
                backendValues: mockBackendValues,
                pendingValues: mockPendingValues,
                allowedSelectors: [],
                attributePrefix: 'standardfield-'
            })
        );

        const targetElement = document.createElement('div');
        targetElement.id = 'standardfield-test_attribute';
        document.body.appendChild(targetElement);

        targetElement.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));

        expect(mockDispatch).toHaveBeenCalledWith({
            type: EditRecordReducerActionsTypes.SET_ACTIVE_VALUE,
            attribute: mockFormAttribute,
            values: mockPendingValues
        });
    });

    it('should not set active value on focus outside the target element', () => {
        renderHook(() =>
            useOutsideInteractionDetector({
                attribute: mockFormAttribute,
                activeAttribute: mockActiveAttribute,
                dispatch: mockDispatch,
                formIdToLoad: mockFormIdToLoad,
                backendValues: mockBackendValues,
                pendingValues: mockPendingValues,
                allowedSelectors: [],
                attributePrefix: 'standardfield-'
            })
        );

        const otherElement = document.createElement('div');
        otherElement.id = 'other-element';
        document.body.appendChild(otherElement);

        otherElement.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));

        expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('should add event listener on mount', () => {
        const addEventListenerSpy = jest.spyOn(document, 'addEventListener');

        renderHook(() =>
            useOutsideInteractionDetector({
                attribute: mockFormAttribute,
                activeAttribute: mockActiveAttribute,
                dispatch: mockDispatch,
                formIdToLoad: mockFormIdToLoad,
                backendValues: mockBackendValues,
                pendingValues: mockPendingValues,
                allowedSelectors: [],
                attributePrefix: 'standardfield-'
            })
        );

        expect(addEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
        expect(addEventListenerSpy).toHaveBeenCalledWith('focusin', expect.any(Function));
    });

    it('should remove event listener on unmount', () => {
        const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

        const {unmount} = renderHook(() =>
            useOutsideInteractionDetector({
                attribute: mockFormAttribute,
                activeAttribute: mockActiveAttribute,
                dispatch: mockDispatch,
                formIdToLoad: mockFormIdToLoad,
                backendValues: mockBackendValues,
                pendingValues: mockPendingValues,
                allowedSelectors: [],
                attributePrefix: 'standardfield-'
            })
        );

        unmount();

        expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
        expect(removeEventListenerSpy).toHaveBeenCalledWith('focusin', expect.any(Function));
    });
});
