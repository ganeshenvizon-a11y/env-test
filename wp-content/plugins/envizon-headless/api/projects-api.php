<?php

if (!defined('ABSPATH')) {
    exit;
}

function envizon_register_project_rest_fields() {

    register_rest_field(
        'projects',
        'featured_image',
        array(
            'get_callback' => function ($post) {

                if (!has_post_thumbnail($post['id'])) {
                    return null;
                }

                return get_the_post_thumbnail_url($post['id'], 'full');
            },
            'schema' => null,
        )
    );

    register_rest_field(
        'projects',
        'service_terms',
        array(
            'get_callback' => function ($post) {

                $terms = get_the_terms($post['id'], 'services');

                if (empty($terms) || is_wp_error($terms)) {
                    return array();
                }

                return array_map(function ($term) {
                    return array(
                        'id'   => $term->term_id,
                        'name' => $term->name,
                        'slug' => $term->slug,
                    );
                }, $terms);
            },
            'schema' => null,
        )
    );

}

add_action('rest_api_init', 'envizon_register_project_rest_fields');
