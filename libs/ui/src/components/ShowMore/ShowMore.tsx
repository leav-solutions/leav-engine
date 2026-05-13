import {useIntersectionObserver} from '@uidotdev/usehooks';
import {type FunctionComponent, useEffect} from 'react';
import {Loading} from '../Loading';

interface IShowMoreProps {
    hasMore: boolean;
    fetchMore: () => void;
    /**
     * default is 0.2 (20% of the component is visible)
     */
    threshold?: number;
}

export const ShowMore: FunctionComponent<IShowMoreProps> = ({hasMore, fetchMore, threshold}) => {
    const [ref, entry] = useIntersectionObserver({threshold: threshold || 0.2});

    useEffect(() => {
        if (entry?.isIntersecting) {
            fetchMore();
        }
    }, [entry]);

    return (
        hasMore && (
            <div ref={ref} data-testid="show-more">
                <Loading />
            </div>
        )
    );
};

export default ShowMore;
