// mocked functions
let mockedGet = jest.fn((data) => Promise.resolve(data));
let mockUpdate = jest.fn();
let mockedArrayRemove = jest.fn((data) => Promise.resolve(data));
let mockedArrayUnion = jest.fn((data) => Promise.resolve(data));
let mockedIncrement = jest.fn((data) => Promise.resolve(data));
let mockedData = jest.fn((data) => Promise.resolve(data));

// mocked firestore
let firestoreMock = jest.fn(() => {
    return {
        doc: jest.fn((data) => {
            return {
                collection: firestoreMock,
                update: jest.fn((data) => Promise.resolve(data)),
                // onSnapshot: jest.fn( (data) => Promise.resolve(data)),
                get: mockedGet,

            };
        }),
        where: jest.fn(() => {
            return {
                get: jest.fn((data) => Promise.resolve(data)),
                onSnapshot: jest.fn((data) => Promise.resolve(data)),
            };
        }),
        collection: jest.fn((data) => Promise.resolve(data)).mockReturnThis(),
        add: jest.fn((data) => Promise.resolve({
                ...data,
                id: 'some wit id',
                ...{
                    get: jest.fn().mockReturnValue({
                        data: jest.fn().mockReturnValue({
                            ...data,
                            created_by: {
                                get: jest.fn().mockReturnValue({
                                    data: jest.fn().mockReturnValue({
                                        profileImage: 'http//image.png',
                                        displayName: 'test user',
                                        idtoken: 'some token',
                                    }),
                                }),
                            },
                        }),
                    }),
                },
            }),
        ),
        then: firestoreMock,
        data: {...firestoreMock, testIdLONGNAME: 1},
        catch: jest.fn((data) => Promise.resolve(data)),

    };
});
// mock firebase
const mockedFirebase = jest.mock('firebase-admin', () => {

    const firebase = jest.fn();
    firebase.apps = ['testAppId'];
    firebase.auth = jest.fn();
    firebase.firestore = firestoreMock;

    firebase.firestore.FieldValue = {
        arrayRemove: mockedArrayRemove,
        arrayUnion: mockedArrayUnion,
        increment: mockedIncrement,
    };

    return firebase;
});
// instantiate module
let create = require('./create');


// define test
describe('test roarWit', () => {

    beforeEach(() => {
        mockedData.mockReset();
        mockedGet.mockReset();
        mockUpdate.mockReset();
        mockedArrayRemove.mockReset();
        mockedArrayUnion.mockReset();
    });

    test('create.postWit.canCreateWit', async () => {
        // arrange
        let request = {
            user: {idtoken: 'some token'},
            body: {
                text: 'test wit',
                movieTags: [],
                userTags: [],
            },
        };

        let response = {
            status: jest.fn().mockReturnValue({
                JSON: {stringify: (data) => {data}},
            }),
        };

        // act
        await create.postWit(request, response);
        let data = JSON.parse(response.res.body)

        // assert
        expect(data.length).toBe(1)
        expect(data[0].text).toBe("test wit")
        expect(data[0].id).toBe("some wit id")

    });

    test('create.roarWit.removesFromArray', async () => {

        // arrange
        let request = {
            query: {roarWit: 'someWitId'},
            user: {idtoken: 'expected id'},
        };
        mockedGet.mockReturnValue({data: jest.fn().mockReturnValue({roars: [{id: 'expected id'}, {id: 2}, {id: 3}]})});
        let response = {};

        // act
        create.roarWit(request, response);

        // assert
        expect(await mockedArrayRemove).toHaveBeenCalledTimes(1);
        expect(await mockedArrayUnion).toHaveBeenCalledTimes(0);

    });

    test('create.roarWit.removesFromArray', async () => {

        // arrange
        let request = {
            query: {roarWit: 'someWitId'},
            user: {idtoken: 'expected id'},
        };
        mockedGet.mockReturnValue({data: jest.fn().mockReturnValue({roars: [{id: 'expected id1'}, {id: 2}, {id: 3}]})});
        let response = {};

        // act
        create.roarWit(request, response);

        // assert
        expect(await mockedArrayRemove).toHaveBeenCalledTimes(0);
        expect(await mockedArrayUnion).toHaveBeenCalledTimes(1);

    });

});
