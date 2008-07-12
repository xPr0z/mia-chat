<?php
/**
* @package Mia
* @copyright Brilaps, LLC (http://brilaps.com)
* @license The MIT License (http://www.opensource.org/licenses/mit-license.php)
*/

/**
* Mia-Chat tries to enable compression for optiomal performance.  It checks current compression settings and 
* ability for client to handle compression.  If server side compression is enabled it will not duplicate efforts.
*
* Note: This compression test comes from the TinyMCE PHP compressor released under the LGPL License -
* http://sourceforge.net/project/showfiles.php?group_id=103281&package_id=179496&release_id=612357
*/

$encodings = '';
if (isset($_SERVER['HTTP_ACCEPT_ENCODING'])) {
   $encodings = explode(',', strtolower(preg_replace("/\s+/", "", $_SERVER['HTTP_ACCEPT_ENCODING'])));
}

if ((in_array('gzip', $encodings) || in_array('x-gzip', $encodings) || isset($_SERVER['---------------'])) && function_exists('ob_gzhandler') && !ini_get('zlib.output_compression')) {
	$enc = in_array('x-gzip', $encodings) ? "x-gzip" : "gzip";
	ob_start("ob_gzhandler");
}
?>