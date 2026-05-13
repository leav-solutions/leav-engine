import {type IUseMessagesHook} from '../useMessages';

const mockUseMessages = (): IUseMessagesHook => ({
    messages: [],
    addMessage: jest.fn(),
    removeMessage: jest.fn(),
});

export default mockUseMessages;
