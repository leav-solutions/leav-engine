module.exports = {
    '^components/(.*)$': '<rootDir>/src/components/$1',
    '^context/(.*)$': '<rootDir>/src/context/$1',
    '^hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^queries/(.*)$': '<rootDir>/src/queries/$1',
    '^_gqlTypes/(.*)$': '<rootDir>/src/_gqlTypes/$1',
    '^__mocks__/(.*)$': '<rootDir>/src/__mocks__/$1',
    '^_tests/(.*)$': '<rootDir>/src/_tests/$1',
    '^@leav/(.*)$': '<rootDir>/../../libs/$1/src'
};
