import "./ArticleSkills.scss"
import React from 'react'
import Article from "/src/components/articles/base/Article.jsx"
import {useUtils} from "/src/hooks/utils.js"
import Collapsable from "/src/components/capabilities/Collapsable.jsx"
import {useViewport} from "/src/providers/ViewportProvider.jsx"
import {useConstants} from "/src/hooks/constants.js"
import AvatarView from "/src/components/generic/AvatarView.jsx"

/**
 * @param {ArticleDataWrapper} dataWrapper
 * @param {Number} id
 * @return {JSX.Element}
 * @constructor
 */
function ArticleSkills({ dataWrapper, id }) {
    const [selectedItemCategoryId, setSelectedItemCategoryId] = React.useState(null)

    return (
        <Article id={dataWrapper.uniqueId}
                 type={Article.Types.SPACING_DEFAULT}
                 dataWrapper={dataWrapper}
                 className={`article-skills`}
                 selectedItemCategoryId={selectedItemCategoryId}
                 setSelectedItemCategoryId={setSelectedItemCategoryId}>
            <ArticleSkillsItems dataWrapper={dataWrapper}
                                selectedItemCategoryId={selectedItemCategoryId}/>
        </Article>
    )
}

/**
 * @param {ArticleDataWrapper} dataWrapper
 * @param {String} selectedItemCategoryId
 * @return {JSX.Element}
 * @constructor
 */
function ArticleSkillsItems({ dataWrapper, selectedItemCategoryId }) {
    const constants = useConstants()
    const utils = useUtils()
    const viewport = useViewport()

    const filteredItems = dataWrapper.getOrderedItemsFilteredBy(selectedItemCategoryId)

    const customBreakpoint = viewport.getCustomBreakpoint(
        constants.SWIPER_BREAKPOINTS_FOR_THREE_SLIDES
    )

    const customBreakpointId = customBreakpoint?.id
    const customBreakpointRowThreshold = customBreakpoint?.slidesPerView || 1

    const maxItemsPerRow = utils.number.clamp(
        dataWrapper.settings.maxItemsPerRow,
        1,
        customBreakpointRowThreshold
    )

    const maxRowsCollapseThreshold =
        dataWrapper.settings.maxRowsCollapseThreshold

    const itemsPerRowClass =
        `article-skills-items-${Math.min(
            customBreakpointRowThreshold,
            maxItemsPerRow
        )}-per-row`

    const initialVisibleItemsCount = maxRowsCollapseThreshold
        ? maxItemsPerRow * maxRowsCollapseThreshold
        : filteredItems.length

    return (
        <Collapsable
            className={`article-skills-items ${itemsPerRowClass}`}
            id={dataWrapper.uniqueId}
            breakpointId={customBreakpointId}
            initialVisibleItems={initialVisibleItemsCount}
        >
            {filteredItems.map((itemWrapper, key) => (
                <ArticleSkillsItem
                    itemWrapper={itemWrapper}
                    key={key}
                />
            ))}
        </Collapsable>
    )
}

/**
 * @param {ArticleItemDataWrapper} itemWrapper
 * @return {JSX.Element}
 * @constructor
 */
function ArticleSkillsItem({ itemWrapper }) {
    const avatarViewClass =
        itemWrapper.articleWrapper.settings.roundIcons
            ? `article-skills-item-avatar-round`
            : ``

    return (
        <div className={`article-skills-item`}>
            <div className={`article-skills-item-avatar-wrapper`}>
                <AvatarView
                    src={itemWrapper.img}
                    faIcon={itemWrapper.faIconWithFallback}
                    style={itemWrapper.faIconStyle}
                    alt={itemWrapper.imageAlt}
                    className={`article-skills-item-avatar ${avatarViewClass}`}
                />
            </div>

            <ArticleSkillsItemInfo itemWrapper={itemWrapper}/>
        </div>
    )
}

/**
 * @param {ArticleItemDataWrapper} itemWrapper
 * @return {JSX.Element}
 * @constructor
 */
function ArticleSkillsItemInfo({ itemWrapper }) {
    const description = itemWrapper.locales.text
    const experienceTime =
        itemWrapper.dateStartDisplayAsExperienceTime

    return (
        <div className={`article-skills-item-info`}>

            <div className={`article-skills-item-title text-5`}>
                <div className={`article-skills-item-title-left-column`}>

                    <span
                        className={`article-skills-item-title-main`}
                        dangerouslySetInnerHTML={{
                            __html:
                                itemWrapper.locales.title ||
                                itemWrapper.placeholder
                        }}
                    />

                </div>
            </div>

            {experienceTime && (
                <div className={`article-skills-item-experience text-2`}>
                    <span
                        dangerouslySetInnerHTML={{
                            __html: experienceTime
                        }}
                    />
                </div>
            )}

            {description && (
                <div
                    className={`article-skills-item-description text-2`}
                    dangerouslySetInnerHTML={{
                        __html: description
                    }}
                />
            )}

        </div>
    )
}

export default ArticleSkills