<?php

namespace Servebolt\ConversionBlocks\ContentHandling;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

/**
 * Class ContentHandling
 * @package Servebolt\ConversionBlocks\ContentHandling
 */
class ContentHandling {

    /**
     * Define the container ID.
     *
     * @var string
     */
    private $container_identifier = 'sb-conversion-block-container';

    /**
     * Define the block ID.
     *
     * @var string
     */
    private $block_identifier = 'sb-conversion-block';

    /**
     * Initial block count.
     *
     * @var int
     */
    private $block_count = 1;

    /**
     * Maximum number of blocks.
     *
     * @var int
     */
    private $max_block_numbers = 1;

    /**
     * Blocks that are already displayed.
     *
     * @var array
     */
    private $blocks_already_displayed = [];

    /**
     * Whether to make sure that the same block is not displayed twice.
     *
     * @var bool
     */
    private $prevent_duplicate_blocks = true;

    /**
     * ContentHandling constructor.
     */
    public function __construct()
    {
        if ( is_admin() ) { // Don't run if in WP Admin
            return;
        }

        // Include script that moves the block into the content
        add_action('wp_footer', [$this, 'script'], apply_filters('sb_conversion_block_script_inclusion_priority', 10));

        // Include basic block styling
        if ( apply_filters('sb_conversion_block_include_styling', true) ) {
            add_action('wp_footer', [$this, 'style'], apply_filters('sb_conversion_block_style_inclusion_priority', 10));
        }

        // Alter the content
        add_action($this->content_insertion_init_hook(), [$this, 'on']);

    }

    /**
     * Get the hook used for altering the content.
     *
     * @return mixed|void
     */
    private function content_insertion_init_hook() {
        return apply_filters('sb_conversion_block_content_insertion_init_hook', 'wp_head');
    }

    /**
     * Add block to the end of the content.
     *
     * @param $content
     * @return mixed
     */
    public function add_block_to_content($content) {

        if ( ! apply_filters('sb_conversion_block_is_active', $this->is_active(), get_the_ID()) ) {
            return $content;
        }

        for ($i = 1; $i <= $this->get_max_block_number(); $i++) {

            if ( $block = $this->resolve_block() ) {
                $this->increment_block_count();

                // Flag this block as already displayed
                $this->flag_block_as_displayed($block['id']);

                // Add the block to the content
                $content .= $block['markup'];

            }

        }

        // Add container to content
        if ( did_action('wp_head') && apply_filters('sb_conversion_block_add_content_container', false) ) {
            $content = sprintf('<div class="%s">%s</div>', $this->get_container_class(), $content);
        }

        return $content;
    }

    /**
     * Whether the conversion blocks should be inserted.
     *
     * @return mixed|void
     */
    private function is_active() {

        // Don't insert conversion blocks when fetching the content via the API
        if ( defined('REST_REQUEST') && REST_REQUEST ) {
            return false;
        }

        // Only insert conversion blocks when viewed singularly
        if ( ! is_single() ) {
            return false;
        }

        return true;
    }

    /**
     * Get the maximum number of blocks to insert.
     *
     * @return mixed|void
     */
    private function get_max_block_number() {
        return apply_filters('sb_conversion_block_max_number_of_conversion_blocks', $this->max_block_numbers);
    }

    /**
     * Insert the style that should be applied to the conversion blocks.
     */
    public function style() {
        $path = SERVEBOLT_CONV_BLOCK_PATH . '/assets/dist/css/block-styling.css';
        if ( file_exists($path) ) {
            printf("<style>%s</style>", apply_filters('sb_conversion_block_styling', trim(file_get_contents($path))));
        }
    }

    /**
     * Insert the script that moves the block into the content.
     */
    public function script() {
        $path = SERVEBOLT_CONV_BLOCK_PATH . '/assets/dist/js/insertion-script.js';
        if ( file_exists($path) ) {
            printf("<script>var sb_conv_blocks_class = '%s';\n%s</script>", $this->get_block_class(), trim(file_get_contents($path)));
        }
    }

    /**
     * Add content altering filter.
     */
    public function on() {
        add_action('the_content', [$this, 'add_block_to_content']);
    }

    /**
     * Remove content altering filter.
     */
    private function off() {
        remove_action('the_content', [$this, 'add_block_to_content']);
    }

    /**
     * Get block Id.
     *
     * @return mixed|void
     */
    private function get_block_id() {
        return sprintf(apply_filters('sb_conversion_block_block_id', $this->block_identifier . '-%s'), $this->get_block_count());
    }

    /**
     * Get the block to insert.
     *
     * @return string
     */
    private function resolve_block() {
        $this->off(); // Remove hook while getting the content of the blocks

        $query = [
            'orderby'        => 'rand',
            'posts_per_page' => 1,
            'post_type'      => 'sb_blocks',
            'post_status'    => 'publish',
        ];

        if ( $this->prevent_duplicate_blocks ) {
            $query['post__not_in'] = $this->blocks_already_displayed;
        }

        $posts = get_posts($query);
        $post = current($posts);

        if ( ! is_a($post, 'WP_Post') ) return false;

        $content = $this->get_post_content($post);

        if ( ! $content ) return false;

        $this->on();

        return [
            'id'     => $post->ID,
            'markup' => $this->block_markup($content),
        ];
    }

    /**
     * Get post content by post.
     *
     * @param $post
     * @return string|string[]
     */
    private function get_post_content($post) {
        if ( ! is_a($post, 'WP_Post') ) {
            $post = get_post($post);
        }
        $content = $post->post_content;
        $content = apply_filters('the_content', $content);
        $content = str_replace(']]>', ']]&gt;', $content);
        return $content;
    }

    /**
     * Get container class name.
     *
     * @return string
     */
    private function get_container_class() {
        return apply_filters('sb_conversion_block_container_class', $this->container_identifier);
    }

    /**
     * Get block class name.
     *
     * @return string
     */
    private function get_block_class() {
        return apply_filters('sb_conversion_block_block_class', $this->block_identifier);
    }

    /**
     * Generate block markup.
     *
     * @param $block_content
     * @return string
     */
    private function block_markup($block_content) {
        return sprintf('<div style="display: none;" class="%s" id="%s">%s</div>', $this->get_block_class(), $this->get_block_id(), $block_content);
    }

    /**
     * Get block count.
     *
     * @return int
     */
    private function get_block_count() {
        return $this->block_count;
    }

    /**
     * Increment the block count.
     */
    private function increment_block_count() {
        $this->block_count++;
    }

    /**
     * @param $id
     */
    private function flag_block_as_displayed($id) {
        $this->blocks_already_displayed[] = $id;
    }

}
