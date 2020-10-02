<?php

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

/**
 * Display notice about composer-files missing.
 */
add_action('admin_notices', function() {
	?>
	<div class="notice notice-error">
		<h3><?php _e('Servebolt Conversion Blocks', 'sb-conv-blocks'); ?></h3>
		<p><?php _e('Servebolt Conversion Blocks cannot run since the composer-files are missing. Please check your installation, and maybe try reinstalling if the issue persists.', 'sb-conv-blocks'); ?></p>
	</div>
	<?php
});
