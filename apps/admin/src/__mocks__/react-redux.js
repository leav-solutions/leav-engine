module.exports = {
    connect: (mapStateToProps, mapDispatchToProps) => ReactComponent => ({
        mapStateToProps,
        mapDispatchToProps,
        ReactComponent,
    }),
    useDispatch: jest.fn(),
    useSelector: jest.fn(),
    Provider: ({children}) => children,
};
