module.exports = {
    connect: (mapStateToProps, mapDispatchToProps) => reactComponent => ({
        mapStateToProps,
        mapDispatchToProps,
        ReactComponent: reactComponent,
    }),
    useDispatch: vi.fn(),
    useSelector: vi.fn(),
    Provider: ({children}) => children,
};
