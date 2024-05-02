// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useEffect, useState} from 'react';
import {setInfoStack} from 'reduxStore/infos';
import {useAppDispatch, useAppSelector} from 'reduxStore/store';
import {defaultInfosTime} from '../../constants/constants';
import {sortInfoByPriority} from '../../utils';
import {IInfo, InfoChannel} from '../../_types/types';
import DisplayInfo from './DisplayInfo';

function HeaderInfo(): JSX.Element {
    const {stack, base} = useAppSelector(state => state.info);
    const dispatch = useAppDispatch();

    const [message, setMessage] = useState<IInfo>(base);
    const [triggerInfos, setTriggerInfos] = useState<IInfo[]>([]);
    const [activeTimeouts, setActiveTimeouts] = useState<{info: any; base: any}>({
        info: null,
        base: null
    });

    useEffect(() => {
        const {passiveInfos, triggerInfos: triggerInf} = stack.reduce(
            (acc, info) => {
                switch (info.channel) {
                    case InfoChannel.trigger:
                        return {...acc, triggerInfos: [...acc.triggerInfos, info]};
                    case InfoChannel.passive:
                    default:
                        return {...acc, passiveInfos: [...acc.passiveInfos, info]};
                }
            },
            {
                passiveInfos: [] as IInfo[],
                triggerInfos: [] as IInfo[]
            }
        );

        if (triggerInf.length) {
            setTriggerInfos(infos => [...infos, ...triggerInf]);

            dispatch(setInfoStack(passiveInfos));
        }

        if (passiveInfos.length) {
            // Sort info by priority
            const sortPassiveInfos = [...passiveInfos].sort(sortInfoByPriority);

            // Take the first info
            const [info, ...restInfos] = sortPassiveInfos;

            if (info && !activeTimeouts.info) {
                setMessage(info);

                const infoTime = info.time ?? defaultInfosTime;

                // if a timeout to show base info is active, clear it
                if (activeTimeouts.base) {
                    setActiveTimeouts(timeouts => {
                        clearTimeout(timeouts.base);

                        return {
                            base: null,
                            info: timeouts.info
                        };
                    });
                }

                // at the end of the time given for the info, display base message
                const infoTimeout = setTimeout(() => {
                    if (!activeTimeouts.info) {
                        // wait 100 to display base info to avoid
                        // base message to appear between two info
                        const baseTimeout = setTimeout(() => {
                            setMessage(base);
                        }, 100);

                        // set baseTimeout in state
                        setActiveTimeouts(timeouts => ({
                            info: timeouts.info,
                            base: baseTimeout
                        }));
                    }

                    // reset info timeout in state
                    setActiveTimeouts(at => ({
                        info: null,
                        base: at.base
                    }));
                }, infoTime);

                // set the timeout for reset the info in the state
                setActiveTimeouts(timeouts => ({
                    info: infoTimeout,
                    base: timeouts.base
                }));

                // update info stack with rest infos
                dispatch(setInfoStack(restInfos));
            }
        } else if (!activeTimeouts.info) {
            // if no info, display base info
            setMessage(msg => {
                if (base.content !== msg.content) {
                    return base;
                }
                return msg;
            });
        }
    }, [setMessage, stack, base, setActiveTimeouts, activeTimeouts, dispatch]);

    const cancelInfo = () => {
        clearTimeout(activeTimeouts.info);
        setActiveTimeouts(timeouts => ({
            info: null,
            base: timeouts.base
        }));
    };

    return (
        <DisplayInfo
            message={message}
            activeTimeouts={activeTimeouts}
            cancelInfo={cancelInfo}
            triggerInfos={triggerInfos}
            setTriggerInfos={setTriggerInfos}
        />
    );
}

export default HeaderInfo;
