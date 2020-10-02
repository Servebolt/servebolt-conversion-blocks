<?php

namespace Servebolt\ConversionBlocks\PostTypes;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

/**
 * Class SB_Blocks
 * @package Servebolt\Conversion_Blocks\Post_Types
 */
class Blocks {

    /**
     * Post type slug.
     *
     * @var string
     */
    private $slug = 'sb_blocks';

    /**
     * Register post type.
     */
    public function register() {
        register_post_type( $this->slug, $this->post_type_arguments() );
    }

    /**
     * Define post type arguments.
     *
     * @return array
     */
    private function post_type_arguments() {
        return [
            'labels'             => $this->post_type_labels(),
            'description'        => __( 'Custom post type for conversion blocks that will be inserted into the content.', 'sb-conv-blocks' ),
            'public'             => false,
            'show_ui'            => true,
            'show_in_menu'       => true,
            'query_var'          => true,
            'capability_type'    => 'post',
            'has_archive'        => false,
            'hierarchical'       => false,
            'show_in_rest'       => true,
            'menu_position'      => 10,
            'supports'           => [ 'title', 'editor' ],
            'menu_icon'         => 'dashicons-calendar',
        ];
    }

    /**
     * Define post type labels.
     *
     * @return array
     */
    private function post_type_labels() {
        return [
            'name'               => _x( 'Conversion block', 'Custom post type - name', 'sb-conv-blocks' ),
            'singular_name'      => _x( 'Conversion block', 'Custom post type - singular_name', 'sb-conv-blocks' ),
            'menu_name'          => _x( 'Conversion blocks', 'Custom post type - menu_name', 'sb-conv-blocks' ),
            'name_admin_bar'     => _x( 'Conversion blocks', 'Custom post type - name_admin_bar', 'sb-conv-blocks' ),
            'add_new'            => __( 'Add Block', 'sb-conv-blocks' ),
            'add_new_item'       => __( 'Add New Block', 'sb-conv-blocks' ),
            'new_item'           => __( 'New Block', 'sb-conv-blocks' ),
            'edit_item'          => __( 'Edit Block', 'sb-conv-blocks' ),
            'view_item'          => __( 'View block', 'sb-conv-blocks' ),
            'all_items'          => __( 'All block', 'sb-conv-blocks' ),
            'search_items'       => __( 'Search blocks', 'sb-conv-blocks' ),
            'parent_item_colon'  => __( 'Parent block:', 'sb-conv-blocks' ),
            'not_found'          => __( 'No blocks found.', 'sb-conv-blocks' ),
            'not_found_in_trash' => __( 'No blocks found in Trash.', 'sb-conv-blocks' )
        ];
    }

}
