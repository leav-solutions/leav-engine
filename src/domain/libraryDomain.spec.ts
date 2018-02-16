import libraryDomain from './libraryDomain';

describe('LibraryDomain', () => {
    describe('getLibrary', () => {
        test('Should call repo', async function() {
            const mockLibRepo = {getLibraries: jest.fn().mockReturnValue(Promise.resolve([{id: 'test'}]))};
            const libDomain = libraryDomain(mockLibRepo);

            const lib = await libDomain.getLibrary('test');

            expect(mockLibRepo.getLibraries.mock.calls.length).toBe(1);
            expect(mockLibRepo.getLibraries.mock.calls[0][0]).toMatchObject({id: 'test'});

            expect(lib).toMatchObject({id: 'test'});
        });
    });

    describe('getLibraries', () => {
        test('Should return a list of libs', async function() {
            const mockLibRepo = {
                getLibraries: jest.fn().mockReturnValue(Promise.resolve([{id: 'test'}, {id: 'test2'}]))
            };

            const libDomain = libraryDomain(mockLibRepo);
            const lib = await libDomain.getLibraries();

            expect(mockLibRepo.getLibraries.mock.calls.length).toBe(1);
            expect(lib.length).toBe(2);
        });
    });

    describe('saveLibrary', () => {
        test('Should save a new library', async function() {
            const mockLibRepo = {
                getLibraries: jest.fn().mockReturnValue(Promise.resolve([])),
                createLibrary: jest.fn().mockReturnValue(Promise.resolve({id: 'test', system: false})),
                updateLibrary: jest.fn()
            };

            const libDomain = libraryDomain(mockLibRepo);

            libDomain.getLibrary = jest.fn().mockReturnValue(Promise.resolve([{}]));

            const newLib = await libDomain.saveLibrary({id: 'test'});

            expect(mockLibRepo.createLibrary.mock.calls.length).toBe(1);
            expect(mockLibRepo.updateLibrary.mock.calls.length).toBe(0);

            expect(newLib).toMatchObject({id: 'test', system: false});
        });

        test('Should update a library', async function() {
            const mockLibRepo = {
                getLibraries: jest.fn().mockReturnValue(Promise.resolve([{id: 'test', system: false}])),
                createLibrary: jest.fn(),
                updateLibrary: jest.fn().mockReturnValue(Promise.resolve({id: 'test', system: false}))
            };

            const libDomain = libraryDomain(mockLibRepo);

            libDomain.getLibrary = jest.fn().mockReturnValue(Promise.resolve([{id: 'test'}]));

            const updatedLib = await libDomain.saveLibrary({id: 'test'});

            expect(mockLibRepo.createLibrary.mock.calls.length).toBe(0);
            expect(mockLibRepo.updateLibrary.mock.calls.length).toBe(1);

            expect(updatedLib).toMatchObject({id: 'test', system: false});
        });
    });
});
