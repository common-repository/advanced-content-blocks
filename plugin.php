<?php
/**
 * Plugin Name: Advanced Content Blocks
 * Plugin URI: https://www.wordplus.org/
 * Description: Advanced Content Blocks for the new WordPress editor.
 * Author: WordPlus
 * Author URI: https://www.wordplus.org/
 * Version: 1.0.0
 * License: GPL2+
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Block Initializer.
 */
require_once plugin_dir_path( __FILE__ ) . 'src/init.php';
