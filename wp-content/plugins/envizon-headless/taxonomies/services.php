<?php
/**
 * Register the "Services" taxonomy for the Projects CPT.
 *
 * @package Envizon_Headless
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register the hierarchical "services" taxonomy, attached only to "projects".
 */
function envizon_register_services_taxonomy() {

	$labels = array(
		'name'              => __( 'Services', 'envizon-headless' ),
		'singular_name'     => __( 'Service', 'envizon-headless' ),
		'search_items'      => __( 'Search Services', 'envizon-headless' ),
		'all_items'         => __( 'All Services', 'envizon-headless' ),
		'parent_item'       => __( 'Parent Service', 'envizon-headless' ),
		'parent_item_colon' => __( 'Parent Service:', 'envizon-headless' ),
		'edit_item'         => __( 'Edit Service', 'envizon-headless' ),
		'update_item'       => __( 'Update Service', 'envizon-headless' ),
		'add_new_item'      => __( 'Add New Service', 'envizon-headless' ),
		'new_item_name'     => __( 'New Service Name', 'envizon-headless' ),
		'menu_name'         => __( 'Services', 'envizon-headless' ),
	);

	$args = array(
		'labels'                => $labels,
		'hierarchical'          => true,
		'public'                => true,
		'show_ui'               => true,
		'show_admin_column'     => true,
		'show_in_nav_menus'     => true,
		'show_in_rest'          => true,
		'rest_base'             => 'services',
		'rest_controller_class' => WP_REST_Terms_Controller::class,
		'query_var'             => true,
		'rewrite'               => array( 'slug' => 'services' ),
	);

	register_taxonomy( 'services', array( 'projects' ), $args );
}
add_action( 'init', 'envizon_register_services_taxonomy' );
