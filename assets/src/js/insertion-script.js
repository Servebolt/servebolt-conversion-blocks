import '../css/block-styling.scss';

window.sb_conv_block_debug = false;

(function() {
    sb_moveBlocks();
})();

/**
 * Initiate the process of placing the conversion blocks inside the content.
 */
function sb_moveBlocks() {
    if ( typeof sb_conv_blocks_class == 'undefined' ) return;
    var debug = window.sb_conv_block_debug;
    if ( debug ) console.log('Starting block placement process');
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
    block.classList.add('sb-conversion-block-placed');
    block.removeAttribute('style');
}

/**
 * Look through all elements in the content and figure out which ones that are visible.
 *
 * @returns {[]}
 */
function sb_getElements(parentContainer) {
    var elements = parentContainer.querySelectorAll(':scope > *:not(.' + sb_conv_blocks_class + '):not(.sb-conversion-block-placed)'),
        filteredElements = [],
        validElements = ['img'];
    [].forEach.call(elements, function(element) {
        if ( element.innerText != '' || validElements.includes(element.tagName.toLowerCase()) || element.querySelectorAll('img').length > 0 ) {
            filteredElements.push(element);
        }
    });
    return filteredElements;
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
