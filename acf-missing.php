<?php

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

/**
 * Display notice about composer-files missing.
 */
add_action('admin_notices', function() {
    ?>
    <div class="notice notice-error">
        <h3><?php _e('Servebolt Conversion Blocks', 'sb-conv-blocks'); ?></h3>
        <p><?php _e('Servebolt Conversion Blocks cannot run since the plugin <a href="https://www.advancedcustomfields.com/" target="_blank">Advanced Custom Fields</a> is not active. Please install and activate Advanced Custom Fields it to use this plugin.', 'sb-conv-blocks'); ?></p>
    </div>
    <?php
});
