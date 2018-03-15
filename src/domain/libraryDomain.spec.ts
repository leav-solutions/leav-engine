import libraryDomain from './libraryDomain';

describe('LibraryDomain', () => {
    describe('getLibraries', () => {
        test('Should return a list of libs', async function() {
            const mockLibRepo = {
                getLibraries: global.__mockPromise([{id: 'test'}, {id: 'test2'}]),
                getLibraryAttributes: jest.fn().mockReturnValueOnce(Promise.resolve([{id: 'attr1'}, {id: 'attr2'}]))
            };

            const libDomain = libraryDomain(mockLibRepo);
            const lib = await libDomain.getLibraries();

            expect(mockLibRepo.getLibraries.mock.calls.length).toBe(1);
            expect(mockLibRepo.getLibraryAttributes.mock.calls.length).toBe(2);
            expect(lib.length).toBe(2);

            expect(lib[0].attributes).toBeDefined();
        });
    });

    describe('saveLibrary', () => {
        test('Should save a new library', async function() {
            const mockLibRepo = {
                getLibraries: global.__mockPromise([]),
                createLibrary: global.__mockPromise({id: 'test', system: false}),
                updateLibrary: jest.fn(),
                saveLibraryAttributes: jest.fn()
            };

            const libDomain = libraryDomain(mockLibRepo);

            const newLib = await libDomain.saveLibrary({id: 'test'});

            expect(mockLibRepo.createLibrary.mock.calls.length).toBe(1);
            expect(mockLibRepo.updateLibrary.mock.calls.length).toBe(0);
            expect(mockLibRepo.saveLibraryAttributes.mock.calls.length).toBe(1);

            expect(newLib).toMatchObject({id: 'test', system: false});
        });

        test('Should update a library', async function() {
            const mockLibRepo = {
                getLibraries: global.__mockPromise([{id: 'test', system: false}]),
                createLibrary: jest.fn(),
                updateLibrary: global.__mockPromise({id: 'test', system: false}),
                saveLibraryAttributes: jest.fn()
            };

            const libDomain = libraryDomain(mockLibRepo);

            const updatedLib = await libDomain.saveLibrary({id: 'test'});

            expect(mockLibRepo.createLibrary.mock.calls.length).toBe(0);
            expect(mockLibRepo.updateLibrary.mock.calls.length).toBe(1);
            expect(mockLibRepo.saveLibraryAttributes.mock.calls.length).toBe(0);

            expect(updatedLib).toMatchObject({id: 'test', system: false});
        });

        test('Should update library attributes', async function() {
            const mockLibRepo = {
                getLibraries: global.__mockPromise([{id: 'test', system: false}]),
                createLibrary: jest.fn(),
                updateLibrary: global.__mockPromise({id: 'test', system: false}),
                saveLibraryAttributes: jest.fn()
            };

            const libDomain = libraryDomain(mockLibRepo);

            const updatedLib = await libDomain.saveLibrary({id: 'test', attributes: ['attr1', 'attr2']});

            expect(mockLibRepo.updateLibrary.mock.calls.length).toBe(1);
            expect(mockLibRepo.saveLibraryAttributes.mock.calls.length).toBe(1);
            expect(mockLibRepo.saveLibraryAttributes.mock.calls[0][0]).toEqual('test');
            expect(mockLibRepo.saveLibraryAttributes.mock.calls[0][1]).toEqual(['attr1', 'attr2']);

            expect(updatedLib).toMatchObject({id: 'test', system: false});
        });
    });

    describe('deleteLibrary', () => {
        const libData = {id: 'test_lib', system: false, label: {fr: 'Test'}};

        test('Should delete an library and return deleted library', async function() {
            const mockLibRepo = {deleteLibrary: global.__mockPromise(libData)};
            const libDomain = libraryDomain(mockLibRepo);
            libDomain.getLibraries = global.__mockPromise([libData]);

            const deleteRes = await libDomain.deleteLibrary(libData.id);

            expect(mockLibRepo.deleteLibrary.mock.calls.length).toBe(1);
        });

        test('Should throw if unknown attribute', async function() {
            const mockLibRepo = {deleteLibrary: global.__mockPromise()};
            const attrDomain = libraryDomain(mockLibRepo);
            attrDomain.getLibraries = global.__mockPromise([]);

            await expect(attrDomain.deleteLibrary(libData.id)).rejects.toThrow();
        });

        test('Should throw if system library', async function() {
            const mockLibRepo = {deleteLibrary: global.__mockPromise()};
            const libDomain = libraryDomain(mockLibRepo);
            libDomain.getLibraries = global.__mockPromise([{system: true}]);

            await expect(libDomain.deleteLibrary(libData.id)).rejects.toThrow();
        });
    });
});
