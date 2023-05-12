// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

import {IUseMessagesHook} from '../useMessages';

const mockUseMessages = (): IUseMessagesHook => {
    return {
        messages: [],
        addMessage: jest.fn(),
        removeMessage: jest.fn()
    };
};

export default mockUseMessages;
