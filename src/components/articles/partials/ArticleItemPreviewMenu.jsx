import "./ArticleItemPreviewMenu.scss"
import React, {useEffect, useState} from 'react'
import Link from "/src/components/generic/Link.jsx"
import {useLanguage} from "/src/providers/LanguageProvider.jsx"
import CircularButton from "/src/components/buttons/CircularButton.jsx"
import {useUtils} from "/src/hooks/utils.js"

/**
 * @param {ArticleItemDataWrapper} itemWrapper
 * @param {String} className
 * @param {Boolean} spaceBetween
 * @return {JSX.Element}
 * @constructor
 */
function ArticleItemPreviewMenu({ itemWrapper, className = "", spaceBetween }) {
    const utils = useUtils()

    const hasScreenshotsOrVideo =
        itemWrapper.preview?.hasScreenshotsOrYoutubeVideo ||
        itemWrapper.preview?.video   
    const hasLinks = itemWrapper.preview?.hasLinks
    const links = itemWrapper.preview?.links

    const linksListClass = utils.string.if(
        hasScreenshotsOrVideo && spaceBetween,
        `justify-content-end`)

    return (
        <div className={`article-item-preview-menu ${className}`}>
            {(hasScreenshotsOrVideo || !spaceBetween) && (
                <div className={`article-item-preview-menu-button-list`}>
                    <ItemPreviewMenuVideoButton itemWrapper={itemWrapper}/>
                    <ItemPreviewMenuGalleryButton itemWrapper={itemWrapper}/>
                    {hasLinks && !spaceBetween && (
                        <>
                            {links.map((link, key) => (
                                <ItemPreviewMenuCustomLinkButton link={link}
                                                                 key={key}/>
                            ))}
                        </>
                    )}
                </div>
            )}

            {hasLinks && spaceBetween && (
                <div className={`article-item-preview-menu-button-list ${linksListClass}`}>
                    {links.map((link, key) => (
                        <ItemPreviewMenuCustomLinkButton link={link}
                                                         key={key}/>
                    ))}
                </div>
            )}
        </div>
    )
}

function ItemPreviewMenuVideoButton({ itemWrapper }) {
    const language = useLanguage()
    const utils = useUtils()
    const video = itemWrapper.preview?.video
    const [isVideoOpen, setIsVideoOpen] = useState(false)

    if (!video)
        return <></>

    const videoTooltip = language.getString("watch_video") || "Watch demo"

    return (
        <>
            <button
                type="button"
                className={`article-item-preview-menu-link article-item-preview-menu-video-button`}
                onClick={() => setIsVideoOpen(true)}
                aria-label={videoTooltip}
            >
                <CircularButton
                    variant={CircularButton.Variants.DARK}
                    size={CircularButton.Sizes.EXTRA_EXTRA_LARGE}
                    className={`article-item-preview-menu-circular-button`}
                    tooltip={videoTooltip}
                    faIcon={`fa-solid fa-play`}
                />
            </button>

            {isVideoOpen && (
                <div
                    className="portfolio-video-modal"
                    onClick={() => setIsVideoOpen(false)}
                >
                    <div
                        className="portfolio-video-modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="portfolio-video-modal-close"
                            onClick={() => setIsVideoOpen(false)}
                            aria-label="Close video"
                        >
                            <i className="fa-solid fa-xmark"/>
                        </button>

                        <video
                            className="portfolio-video"
                            src={utils.file.resolvePath(video)}
                            controls
                            autoPlay
                            playsInline
                        >
                            Your browser does not support the video tag.
                        </video>
                    </div>
                </div>
            )}
        </>
    )
}

function ItemPreviewMenuGalleryButton({ itemWrapper }) {
    const language = useLanguage()
    const utils = useUtils()

    const screenshots = itemWrapper.preview?.screenshots
    const screenshotsAspectRatio = itemWrapper.preview?.screenshotsAspectRatio

    const splitTitle = utils.string.extractFirstPart(itemWrapper.locales.title || "")
    const title = splitTitle.length < 35 ?
        splitTitle :
        language.getString("get_to_know_more")

    const metadata = {
        title: title,
        images: screenshots,
        aspectRatio: screenshotsAspectRatio,
    }

    if(!screenshots || screenshots.length === 0)
        return <></>

    return (
        <Link href={"#gallery:open"}
              metadata={metadata}
              className={`article-item-preview-menu-link`}
              tooltip={language.getString("watch_video")}>
            <CircularButton variant={CircularButton.Variants.DARK}
                            size={CircularButton.Sizes.EXTRA_EXTRA_LARGE}
                            className={`article-item-preview-menu-circular-button`}
                            tooltip={language.getString("open_gallery")}
                            faIcon={`fa-solid fa-camera`}/>
        </Link>
    )
}

function ItemPreviewMenuCustomLinkButton({ link }) {
    const href = link.href
    const tooltip = link.tooltip
    const faIcon = link.faIcon

    return (
        <Link href={href}
              className={`article-item-preview-menu-link`}
              tooltip={tooltip}>
            <CircularButton variant={CircularButton.Variants.DARK}
                            size={CircularButton.Sizes.EXTRA_EXTRA_LARGE}
                            className={`article-item-preview-menu-circular-button`}
                            tooltip={tooltip}
                            faIcon={faIcon}/>
        </Link>
    )
}

export default ArticleItemPreviewMenu