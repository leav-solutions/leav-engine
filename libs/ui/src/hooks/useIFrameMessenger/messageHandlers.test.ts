// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {decodeMessage, encodeMessage, getExposedMethods} from './messageHandlers';
import {Message, type NavigateToPanelMessage} from './types';

describe('MessageHandlers', () => {
    describe('getExposedMethods', () => {
        const dispatchMock = jest.fn();
        const fakeTime = 1748350849872;
        jest.spyOn(Date, 'now').mockReturnValue(fakeTime);

        beforeEach(() => {
            dispatchMock.mockClear();
        });

        it('Should provide 7 methods', async () => {
            const providedMethods = getExposedMethods({current: null}, jest.fn());

            expect(providedMethods).toEqual({
                showSidePanelForm: expect.any(Function),
                showModalConfirm: expect.any(Function),
                showModalForm: expect.any(Function),
                showAlert: expect.any(Function),
                showNotification: expect.any(Function),
                messageToParent: expect.any(Function),
                navigateToPanel: expect.any(Function)
            });
        });

        it('Should expose method showSidePanelForm which dispatch to parent', async () => {
            const data: any = {someField: 'someValue'};

            const {showSidePanelForm} = getExposedMethods({current: null}, dispatchMock);
            showSidePanelForm(data);

            expect(dispatchMock).toHaveBeenCalledWith({type: 'sidepanel-form', data, id: String(fakeTime)});
        });

        it('Should expose method showModalConfirm which dispatch to parent and store callback', async () => {
            const data: any = {someField: 'someValue', someCallback: jest.fn()};
            const callbacksStore = {current: {}};

            const {showModalConfirm} = getExposedMethods(callbacksStore, dispatchMock);
            showModalConfirm(data);

            expect(dispatchMock).toHaveBeenCalledWith({
                type: 'modal-confirm',
                data,
                id: String(fakeTime),
                overrides: ['someCallback']
            });
            expect(callbacksStore.current).toEqual({
                [String(fakeTime)]: {
                    someCallback: data.someCallback
                }
            });
        });

        it('Should expose method showModalForm which dispatch to parent and store callback', async () => {
            const data: any = {someField: 'someValue', someCallback: jest.fn()};
            const callbacksStore = {current: {}};

            const {showModalForm} = getExposedMethods(callbacksStore, dispatchMock);
            showModalForm(data);

            expect(dispatchMock).toHaveBeenCalledWith({
                type: 'modal-form',
                data,
                id: String(fakeTime),
                overrides: ['someCallback']
            });
            expect(callbacksStore.current).toEqual({
                [String(fakeTime)]: {
                    someCallback: data.someCallback
                }
            });
        });

        it('Should expose method showAlert which dispatch to parent and store callback', async () => {
            const data: any = {someField: 'someValue', someCallback: jest.fn()};
            const callbacksStore = {current: {}};

            const {showAlert} = getExposedMethods(callbacksStore, dispatchMock);
            showAlert(data);

            expect(dispatchMock).toHaveBeenCalledWith({
                type: 'alert',
                data,
                id: String(fakeTime),
                overrides: ['someCallback']
            });
            expect(callbacksStore.current).toEqual({
                [String(fakeTime)]: {
                    someCallback: data.someCallback
                }
            });
        });

        it('Should expose method showNotification which dispatch to parent and store callback', async () => {
            const data: any = {someField: 'someValue', someCallback: jest.fn()};
            const callbacksStore = {current: {}};

            const {showNotification} = getExposedMethods(callbacksStore, dispatchMock);
            showNotification(data);

            expect(dispatchMock).toHaveBeenCalledWith({
                type: 'notification',
                data,
                id: String(fakeTime),
                overrides: ['someCallback']
            });
            expect(callbacksStore.current).toEqual({
                [String(fakeTime)]: {
                    someCallback: data.someCallback
                }
            });
        });

        it('Should expose method messageToParent which dispatch to parent', async () => {
            const data: any = {someField: 'someValue'};

            const {messageToParent} = getExposedMethods({current: null}, dispatchMock);
            messageToParent(data);

            expect(dispatchMock).toHaveBeenCalledWith({type: 'message', data, id: String(fakeTime)});
        });

        it('should expose method navigateToPanel which dispatch to the parent', async () => {
            const data: NavigateToPanelMessage['data'] = {panelId: 'panelId'};

            const {navigateToPanel} = getExposedMethods({current: null}, dispatchMock);
            navigateToPanel(data);

            expect(dispatchMock).toHaveBeenCalledWith({type: 'navigate-to-panel', data});
        });
    });

    describe('encode - decode Message', () => {
        it('Should encode a structure above message with `__frameId`', async () => {
            const message = {
                __frameId: '__frameId',
                type: 'change-language',
                language: 'fr'
            } as const;

            const encodedMessage = encodeMessage(message);

            expect(encodedMessage).toBe(
                '{"payload":"{\\"__frameId\\":\\"__frameId\\",\\"type\\":\\"change-language\\",\\"language\\":\\"fr\\"}","__fromIframeMessenger":true}'
            );
        });

        it('Should encode a structure above message without `__frameId`', async () => {
            const message: Message = {
                type: 'change-language',
                language: 'fr'
            };

            const encodedMessage = encodeMessage(message);

            expect(encodedMessage).toBe(
                '{"payload":"{\\"type\\":\\"change-language\\",\\"language\\":\\"fr\\"}","__fromIframeMessenger":true}'
            );
        });

        it('Should decode to `undefined` on packetId false or not present', async () => {
            expect(
                decodeMessage(
                    '{"payload":"{\\"type\\":\\"change-language\\",\\"language\\":\\"fr\\"}","__fromIframeMessenger":false}'
                )
            ).toBeUndefined();
            expect(
                decodeMessage('{"payload":"{\\"type\\":\\"change-language\\",\\"language\\":\\"fr\\"}"}')
            ).toBeUndefined();
        });

        it('Should decode to `undefined` on if parsing on error', async () => {
            expect(decodeMessage('{this is not a json valid')).toBeUndefined();
        });

        it('Should decode the payload', async () => {
            expect(
                decodeMessage(
                    '{"payload":"{\\"type\\":\\"change-language\\",\\"language\\":\\"fr\\"}","__fromIframeMessenger":true}'
                )
            ).toEqual({language: 'fr', type: 'change-language'});
        });

        it('Should create a couple of idempotente functions', async () => {
            const data: Message = {
                __frameId: '__frameId',
                type: 'on-call-callback',
                path: 'path',
                data: 'data'
            };

            expect(decodeMessage(encodeMessage(data))).toEqual(data);
        });
    });
});
