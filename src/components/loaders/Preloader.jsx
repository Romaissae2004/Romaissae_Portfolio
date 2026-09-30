import "./Preloader.scss"
import React, {useEffect, useState} from 'react'
import PacMan from "/src/components/widgets/PacMan.jsx"
import {useScheduler} from "/src/hooks/scheduler.js"
import {useUtils} from "/src/hooks/utils.js"
import {useConstants} from "/src/hooks/constants.js"

const PreloaderState = {
    NONE:               { id: 0, key: "none" },
    PREPARING:          { id: 1, key: "preparing" },
    SHOWING:            { id: 2, key: "showing" },
    SHOWN:              { id: 3, key: "shown" },
    READY_TO_HIDE:      { id: 4, key: "readyToHide" },
    HIDING:             { id: 5, key: "hiding" },
    HIDDEN:             { id: 6, key: "hidden" },
}

function Preloader({ children, preloaderSettings }) {
    const scheduler = useScheduler()
    const utils = useUtils()
    const constants = useConstants()

    const enabled = preloaderSettings?.enabled
    const title = preloaderSettings?.title || ""
    const subtitle = preloaderSettings?.subtitle || ""
    const logoOffset = preloaderSettings?.logoOffset || {}

    const [state, setState] = useState(PreloaderState.NONE)
    const [didLoadAllImages, setDidLoadAllImages] = useState(false)

    const tag = "Preloader"
    const minDisplayTime = 1000
    const shouldShowPreloaderWindow = state.id > PreloaderState.NONE.id && state.id < PreloaderState.HIDDEN.id
    const shouldShowContent = state.id >= PreloaderState.SHOWN.id
    const shouldShowContentElements = state.id >= PreloaderState.SHOWING.id
    const isHiding = state.id >= PreloaderState.HIDING.id

    /** @constructs **/
    useEffect(() => {
        setState(PreloaderState.NONE)

        if(!enabled) {
            setState(PreloaderState.HIDDEN)
            return
        }

        setState(PreloaderState.PREPARING)
    }, [null])

    /**
     * @listens PreloaderState.PREPARING
     */
    useEffect(() => {
        if(state !== PreloaderState.PREPARING || !didLoadAllImages)
            return
        utils.dom.setBodyScrollEnabled(false)
        scheduler.clearAllWithTag(tag)
        setState(PreloaderState.SHOWING)
    }, [state === PreloaderState.PREPARING, didLoadAllImages])

    /**
     * @listens PreloaderState.SHOWING
     */
    useEffect(() => {
        if(state !== PreloaderState.SHOWING)
            return
        scheduler.clearAllWithTag(tag)
        scheduler.schedule(() => {
            setState(PreloaderState.SHOWN)
        }, 1000, tag)
    }, [state === PreloaderState.SHOWING])

    /**
     * @listens PreloaderState.SHOWN
     */
    useEffect(() => {
        if(state !== PreloaderState.SHOWN)
            return
        scheduler.clearAllWithTag(tag)
        scheduler.schedule(() => {
            setState(PreloaderState.READY_TO_HIDE)
        }, minDisplayTime, tag)
    }, [state === PreloaderState.SHOWN])

    /**
     * @listens PreloaderState.READY_TO_HIDE
     */
    useEffect(() => {
        if(state !== PreloaderState.READY_TO_HIDE)
            return
        scheduler.clearAllWithTag(tag)

        if(utils.storage.getWindowVariable("stayOnThePreloaderScreen"))
            return

        let timePassed = 0
        scheduler.interval(() => {
            timePassed += 0.1
            const imageCount = utils.dom.getImageCount(constants.HTML_CLASSES.imageView)
            const imageLoadPercentage = utils.dom.getImageLoadPercentage(constants.HTML_CLASSES.imageView)

            const didLoadAllImages = imageLoadPercentage >= 100 && imageCount > 0 && timePassed >= 0.5
            const noImagesFound = timePassed >= 4 && imageCount === 0
            const didLoadEnoughTime = timePassed >= 5

            if(didLoadAllImages || noImagesFound || didLoadEnoughTime) {
                setState(PreloaderState.HIDING)
            }
        }, 100, tag)
    }, [state === PreloaderState.READY_TO_HIDE])

    /**
     * @listens PreloaderState.HIDING
     */
    useEffect(() => {
        if(state !== PreloaderState.HIDING)
            return

        scheduler.clearAllWithTag(tag)
        utils.dom.setBodyScrollEnabled(true)
        scheduler.schedule(() => {
            setState(PreloaderState.HIDDEN)
        }, 500, tag)
    }, [state === PreloaderState.HIDING])

    /**
     * @listens PreloaderState.HIDDEN
     */
    useEffect(() => {
        if(state !== PreloaderState.HIDDEN)
            return
        scheduler.clearAllWithTag(tag)
        utils.dom.setBodyScrollEnabled(true)
        document.body.classList.add(constants.HTML_CLASSES.bodyAfterLoading)
    }, [state === PreloaderState.HIDDEN])

    return (
        <div className={`preloader-content-wrapper`}>
            {shouldShowPreloaderWindow && (
                <PreloaderWindow title={title}
                                 subtitle={subtitle}
                                 setDidLoadAllImages={setDidLoadAllImages}
                                 showElements={shouldShowContentElements}
                                 isHiding={isHiding}/>
            )}

            {shouldShowContent && (
                <PreloaderContent children={children}/>
            )}
        </div>
    )
}

function PreloaderWindow({ title, subtitle, setDidLoadAllImages, showElements, isHiding }) {
    const scheduler = useScheduler()

    const [isPacManHidden, setIsPacManHidden] = useState(true)

    const hiddenClass = isHiding ?
        `preloader-window-hidden` : ``

    useEffect(() => {
        setDidLoadAllImages(true)
    }, [])

    useEffect(() => {
        if(!showElements) {
            setIsPacManHidden(true)
            return
        }

        scheduler.clearAllWithTag("preloader-pacman")
        scheduler.schedule(() => {
            setIsPacManHidden(false)
        }, 100, "preloader-pacman")
    }, [showElements])

    return (
        <div className={`preloader-window ${hiddenClass}`}>
            <div className={`preloader-window-content`}>
                <PacMan variant={PacMan.ColorVariants.LOADER}
                        hidden={isPacManHidden}/>

                <PreloaderWindowInfo title={title}
                                     subtitle={subtitle}
                                     hidden={!showElements}/>
            </div>
        </div>
    )
}

function PreloaderWindowInfo({ title, subtitle, hidden }) {
    const scheduler = useScheduler()

    const [isHidden, setIsHidden] = useState(true)

    const hiddenClass = isHidden ?
        `preloader-window-info-hidden` : ``

    useEffect(() => {
        if(hidden) {
            setIsHidden(true)
            return
        }

        scheduler.clearAllWithTag("preloader-window-info")
        scheduler.schedule(() => {
            setIsHidden(false)
        }, 600, "preloader-window-info")
    }, [hidden])

    return (
        <div className={`preloader-window-info ${hiddenClass}`}>
            <div className={`preloader-window-info-title`}>
                <h5 className={`lead-2 mb-0`}
                    dangerouslySetInnerHTML={{__html: title}}/>
            </div>

            <div className={`preloader-window-info-developer text-4 mt-1`}
                 dangerouslySetInnerHTML={{__html: subtitle}}>
            </div>
        </div>
    )
}

function PreloaderContent({ children }) {
    return (
        <div className={`preloader-content`}>
            {children}
        </div>
    )
}

export default Preloader