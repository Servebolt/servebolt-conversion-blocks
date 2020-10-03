import '../css/block-styling.scss';

window.sb_conv_block_debug = true;

(function() {
    if ( typeof sb_conv_blocks_class == 'undefined' ) return; // Bail if we have no selector to find the conversion blocks
    //sb_moveBlocks('interval'); // Insert blocks using an interval
    sb_moveBlocks('below_fold'); // Insert the first block below the fold, leave the rest (if any) at the bottom of the content
})();

/**
 * Initiate the process of placing the conversion blocks inside the content.
 */
function sb_moveBlocks(strategy) {
    switch (strategy) {
        case 'interval':
            sb_insertBlocksByInterval();
            return true;
        case 'below_fold':
            sb_moveBlocksBelowTheFold();
            return true;
        default:
            return false; // Invalid block insertion strategy
    }
}

/**
 * Move the blocks inside the content below the fold.
 *
 * NOTE: This function only moves the first block. Any other blocks (if present) will be displayed at the bottom of the article. So it needs to change to give support for multiple conversion blocks inside the content.
 */
function sb_moveBlocksBelowTheFold() {
    var debug = window.sb_conv_block_debug;
    if ( debug ) console.log('Starting block placement process - strategy is below the fold');
    var blocks = sb_getBlocks();
    if ( ! blocks.length ) {
        if ( debug ) console.log('No blocks to place');
        return; // No blocks
    }
    var firstBlock = blocks.length > 0 ? blocks[0] : false,
        parentContainer = firstBlock ? firstBlock.parentNode : false,
        elements = parentContainer ? sb_getElements(parentContainer) : false;

    if ( ! elements.length ) {
        if ( debug ) console.log('No elements to work with');
        return; // No elements found in content
    }

    if ( debug ) {
        console.log('Number of blocks: ' + blocks.length);
        console.log('Number of elements: ' + elements.length);
        console.log('Starting to look for element to place the conversion block after');
    }

    var placed = false;
    [].forEach.call(elements, function(element) {
        if ( placed ) return; // Block already place, let's skip
        var isAboveTheFold = sb_elementIsInViewport(element);
        if ( debug ) console.log('Element is ' + ( isAboveTheFold ? 'above' :  'below' ) + ' the fold');
        if ( ! isAboveTheFold ) {
            placed = true;
            if ( debug ) console.log('We found a potential place to insert the first block');
            if ( sb_shouldFindAlternativeInsertPosition(element) && element.nextElementSibling ) {
                if ( debug ) console.log('The current element is not very suitable for conversion block insertion, so lets look further down and see if we find a better place');
                var alternativeInsertElement = sb_findAlternativeInsertPosition(element.nextElementSibling);
                if ( alternativeInsertElement ) {
                    if ( debug ) console.log('Found a better option to insert conversion block');
                    element = alternativeInsertElement;
                }
            }
            if ( debug ) console.log('Placing block after element with text: ' + element.innerText);
            sb_placeBlock(firstBlock, element); // We have multiple blocks, then move the first one above the first element

        }
    });

    sb_displayAllBlocks(); // Display all blocks (including the ones that are not allready placed which will be displayed at the bottom)
}

/**
 * Check whether we should look for a better insert position.
 *
 * @param element
 * @returns {boolean}
 */
function sb_shouldFindAlternativeInsertPosition(element) {
    var tagName = element.tagName.toLowerCase();

    // This paragraph most likely belongs to the next element due to the text ending with colon
    if ( tagName == 'p' && element.innerText.trim().endsWith(':') ) {
        return true;
    }

    // Certain elements are not suitable for inserting a conversion block after
    if ( sb_tagIsUndesirableForInsert(tagName) ) {
        return true;
    }

    return false;

}

/**
 * Check whether an element tag type is undesirable for conversion block insertion.
 *
 * @param tagName
 * @returns {boolean}
 */
function sb_tagIsUndesirableForInsert(tagName) {
    return ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img'].includes(tagName);
}

/**
 * Iterate through the elements until we find a better position to insert the conversion block.
 *
 * @param element
 * @returns {boolean|*}
 */
function sb_findAlternativeInsertPosition(element) {
    var currentCheck = element;
    while ( currentCheck ) {
        if ( ! sb_shouldFindAlternativeInsertPosition(currentCheck) ) {
            return currentCheck; // This element is eligible as an insert position
        }
        if ( typeof currentCheck.nextElementSibling == 'undefined' ) {
            return false; // Seems like we reached the end or the elements
        } else {
            currentCheck = currentCheck.nextElementSibling; // Go to the next element and evaluate that one
        }
    }
    return false;
}

/**
 * Insert the blocks to the content by a calculated interval.
 */
function sb_insertBlocksByInterval() {
    var debug = window.sb_conv_block_debug;
    if ( debug ) console.log('Starting block placement process - strategy is interval');
    var blocks = sb_getBlocks();
    if ( ! blocks.length ) {
        if ( debug ) console.log('No blocks to place');
        return; // No blocks
    }
    var firstBlock = blocks.length > 0 ? blocks[0] : false,
        parentContainer = firstBlock ? firstBlock.parentNode : false,
        elements = parentContainer ? sb_getElements(parentContainer) : false,
        firstElement = elements.length > 0 ? elements[0] : false;
    if ( ! elements.length ) {
        if ( debug ) console.log('No elements to work with');
        return; // No elements found in content
    }

    if ( debug ) {
        console.log('Number of blocks: ' + blocks.length);
        console.log('Number of elements: ' + elements.length);
    }

    if ( elements.length == 1 ) { // We have only one element
        if ( blocks.length > 1 ) {
            if ( debug ) console.log('Using placement interval a');
            var halfBlockCount = Math.floor(blocks.length / 2);
            [].forEach.call(blocks, function(block, o) {
                if ( o < halfBlockCount ) {
                    sb_placeBlock(block, firstElement, 'before'); // We have multiple blocks, then move the first one above the first element
                }
            });
        } else {
            if ( debug ) console.log('Using placement interval b');
        }
        sb_displayAllBlocks(); // Display all blocks
        return;
    } else if ( blocks.length == 1 ) {
        if ( debug ) console.log('Using placement interval c');
        var insertInterval = Math.ceil(elements.length / 2); // Insert in the middle (or as close to as possible) of the content
    } else if ( blocks.length == elements.length ) {
        if ( debug ) console.log('Using placement interval d');
        var insertInterval = 1; // Place a block after each element
    } else if ( blocks.length > elements.length ) {
        if ( debug ) console.log('Using placement interval e');
        var insertInterval = 1; // Place a block after each element
    } else {
        if ( debug ) console.log('Using placement interval f');
        var insertInterval = Math.floor(elements.length / blocks.length ); // Insert with a given interval
    }

    if ( debug ) {
        console.log('Insert interval: ' + insertInterval);
        console.log('Starting to parse blocks...');
    }
    [].forEach.call(blocks, function(block, o) {
        var currentInsertInterval = insertInterval * (o + 1);
        if ( debug ) {
            console.log('---------------');
            console.log('Parse block ' + (o + 1));
            console.log('---------');
        }
        [].forEach.call(elements, function(element, i) {
            if ( debug ) console.log('Parsing element ' + i);
            if ( currentInsertInterval && (i + 1) == currentInsertInterval ) {
                if ( debug ) {
                    console.log('Placing block number ' + ( o + 1 ) + '...');
                    console.log(block);
                    console.log(element);
                }
                sb_placeBlock(block, element);
                currentInsertInterval = false;
            } else {
                if ( debug ) console.log('Element ' + i  + ' skipped');
            }
            if ( debug && i !== elements.length - 1 ) {
                console.log('---');
            }
        });
    });

    sb_displayAllBlocks(); // Display all blocks
}

/**
 * Place a conversion block after a specified element.
 *
 * @param block
 * @param element
 */
function sb_placeBlock(block, element, position) {
    if ( ! position ) position = 'after';
    switch (position) {
        case 'after':
            sb_insertAfter(block, element);
            break;
        case 'before':
            sb_insertBefore(block, element);
            break;
        default:
            return;
    }
    sb_displayBlock(block);
}

/**
 * Display a block.
 *
 * @param block
 */
function sb_displayBlock(block) {
    sb_unwrapElement(block);
    //block.classList.add('sb-conversion-block-placed');
    //block.removeAttribute('style');
}

/**
 * Remove the block wrapper so that we are Gutenberg-compatible with the block-elements.
 * 
 * @param wrapper
 */
function sb_unwrapElement(wrapper) {
    var docFrag = document.createDocumentFragment();
    while (wrapper.firstChild) {
        var child = wrapper.removeChild(wrapper.firstChild);
        docFrag.appendChild(child);
    }
    wrapper.parentNode.replaceChild(docFrag, wrapper);
}

/**
 * Look through all elements in the content and figure out which ones that are visible.
 *
 * @returns {[]}
 */
function sb_getElements(parentContainer) {
    var elements = parentContainer.querySelectorAll(':scope > *:not(.' + sb_conv_blocks_class + '):not(.sb-conversion-block-placed)'),
        filteredElements = [];
    [].forEach.call(elements, function(element) {
        if ( sb_elementShouldBeIncluded(element) ) {
            filteredElements.push(element);
        }
    });
    return filteredElements;
}

/**
 * Decide if an element should be included in the block placement or not.
 *
 * @param element
 * @returns {boolean}
 */
function sb_elementShouldBeIncluded(element) {

    // Include in the element contains text
    if ( element.innerText != '' ) {
        return true;
    }

    // Include element if tag should be included
    if ( ['img'].includes(element.tagName.toLowerCase()) ) {
        return true;
    }

    // Include element if there is an image present
    if ( element.querySelectorAll('img').length > 0 ) {
        return true;
    }

    return false;
}

/**
 * Get all conversion blocks.
 *
 * @returns {NodeListOf<Element>}
 */
function sb_getBlocks() {
    return document.querySelectorAll('.' + sb_conv_blocks_class + ':not(.sb-conversion-block-placed)');
}

/**
 * Display all blocks.
 */
function sb_displayAllBlocks() {
    if ( window.sb_conv_block_debug ) console.log('Displaying all blocks');
    [].forEach.call(sb_getBlocks(), function(block) {
        sb_displayBlock(block);
    });
}

/**
 * Insert an element before given element.
 *
 * @param newNode
 * @param referenceNode
 */
function sb_insertBefore(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode);
}

/**
 * Insert an element after given element.
 *
 * @param newNode
 * @param referenceNode
 */
function sb_insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

/**
 * Check whether an element is visible in the viewport (from initial state - scrolled all the way to the top).
 *
 * @param element
 * @returns {boolean|boolean}
 */
function sb_elementIsInViewport(element) {
    const viewport_height = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
    return element.offsetTop < viewport_height;
}
