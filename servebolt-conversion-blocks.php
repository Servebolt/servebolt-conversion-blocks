<?php

namespace Servebolt\ConversionBlocks;

use Servebolt\ConversionBlocks\ContentHandling\ContentHandling;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

/*
Plugin Name: Servebolt Conversion Blocks
Version: 0.1
Author: Servebolt
Author URI: https://servebolt.com
Description: A WordPress-plugin that will insert conversion blocks into the content of a post
License: GPLv3 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html
Text Domain: sb-conv-blocks
*/

/**
 * Class Servebolt_Conversion_Blocks
 * @package Servebolt
 */
class Servebolt_Conversion_Blocks {

    /**
     * Servebolt_Conversion_Blocks constructor.
     */
    public function __construct()
    {
        $this->defines();
        if ( ! $this->autoload() ) {
            // We're lacking dependencies, abort
            $this->composer_missing_message();
            return;
        }
        add_action('init', [$this, 'init_actions']);
    }

    private function defines() {
        define( 'SERVEBOLT_CONV_BLOCK_BASENAME', plugin_basename(__FILE__) );
        define( 'SERVEBOLT_CONV_BLOCK_PATH_URL', plugin_dir_url( __FILE__ ) );
        define( 'SERVEBOLT_CONV_BLOCK_PATH', plugin_dir_path( __FILE__ ) );
    }

    /**
     * Initialize autoload.
     *
     * @return bool
     */
    private function autoload() {
        $path = __DIR__ . '/vendor/autoload.php';
        if ( ! file_exists($path) ) {
            return false;
        }
        require $path;
        return true;
    }

    /**
     * Display admin message about missing files.
     */
    private function composer_missing_message() {
        require __DIR__ . '/composer-missing.php';
    }

    /**
     * Display message about ACF missing.
     */
    private function acf_missing_message() {
        require __DIR__ . '/acf-missing.php';
    }

    /**
     * Check if ACF is active.
     *
     * @return bool
     */
    private function acf_active() {
        return class_exists('ACF');
    }

    /**
     * Initializations run on every page load.
     */
    public function init_actions() {
        // ACF is not yet needed
        /*
        if ( ! $this->acf_active() ) {
            $this->acf_missing_message();
            return;
        }
        */
        add_action('admin_init', [$this, 'admin_init_actions']);
        $this->init_post_types();

        new ContentHandling;
    }

    /**
     * Initialize custom post types.
     */
    private function init_post_types() {

        // Initialize CPT sb-blocks
        (new PostTypes\Blocks)->register();

    }

    /**
     * Initializations for WP admin only.
     */
    public function admin_init_actions() {

    }

}
new Servebolt_Conversion_Blocks;
