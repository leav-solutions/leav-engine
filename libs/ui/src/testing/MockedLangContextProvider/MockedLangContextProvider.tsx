import {type ILangContext, LangContext} from '../../contexts/LangContext';

function MockedLangContextProvider({children}) {
    const mockLangs: ILangContext = {
        lang: ['fr'],
        availableLangs: ['fr', 'en'],
        defaultLang: 'fr',
        setLang: jest.fn(),
    };

    return <LangContext.Provider value={mockLangs}>{children}</LangContext.Provider>;
}

export default MockedLangContextProvider;
