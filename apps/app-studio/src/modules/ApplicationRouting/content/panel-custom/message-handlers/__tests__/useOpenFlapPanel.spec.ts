import {renderHook} from '_ui/_tests/testUtils';
import * as ReactRouter from 'react-router-dom';
import {useOpenFlapPanel} from '../useOpenFlapPanel';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn(),
    useParams: jest.fn(() => ({})),
}));

describe('useOpenFlapPanel', () => {
    const spyUseNavigate = jest.spyOn(ReactRouter, 'useNavigate');
    const spyUseParams = jest.spyOn(ReactRouter, 'useParams');
    const navigateMock = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        spyUseNavigate.mockReturnValue(navigateMock);
        spyUseParams.mockReturnValue({});
    });

    it('should provide a method to open a flap panel', () => {
        const {
            result: {current},
        } = renderHook(() => useOpenFlapPanel());

        current.openFlapPanel({
            flapRecordId: '1234567890',
            flapLibraryId: 'testLibrary',
            flapPanelId: 'info-history',
        });

        expect(navigateMock).toHaveBeenCalledWith('flap/1234567890/testLibrary/info-history', {
            relative: 'path',
        });
    });

    describe('when already in a flap context', () => {
        beforeEach(() => {
            spyUseParams.mockReturnValue({flapPanelId: 'info-history'});
        });

        it('should navigate with prefix to replace existing flap', () => {
            const {
                result: {current},
            } = renderHook(() => useOpenFlapPanel());

            current.openFlapPanel({
                flapRecordId: '9876543210',
                flapLibraryId: 'newLibrary',
                flapPanelId: 'thread',
            });

            expect(navigateMock).toHaveBeenCalledWith('../../../../flap/9876543210/newLibrary/thread', {
                relative: 'path',
            });
        });
    });
});
