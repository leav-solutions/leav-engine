// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
module.exports = {
    connect: (mapStateToProps, mapDispatchToProps) => ReactComponent => ({
        mapStateToProps,
        mapDispatchToProps,
        ReactComponent
    }),
    useDispatch: jest.fn(),
    useSelector: jest.fn(),
    Provider: ({children}) => children
};
