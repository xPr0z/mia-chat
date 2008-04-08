<?php
/**
* @package Mia
* @copyright Brilaps, LLC (http://brilaps.com)
* @license The MIT License (http://www.opensource.org/licenses/mit-license.php)
*/
session_start();
require('includes/mia.classes.php');
$mia = MiaDb::getInstance();
if ($mia->sessionHijackCheck()===false) {
    header('Location: index.php');
}
include('mia.gzip.php'); //Compress page if possible

//Clean post vars
require('includes/htmlpurifier/HTMLPurifier.auto.php');
$config = HTMLPurifier_Config::createDefault();
$config->set('HTML', 'Doctype', 'XHTML 1.0 Strict');
$purifier = new HTMLPurifier($config);

if (isset($_POST['ustatus'])) {
	$uncleanUstatus = $_POST['ustatus'];
} else {
	$uncleanUstatus = '';
}
$clnUstatus = $purifier->purify($uncleanUstatus);
$result = $mia->updateStatus($clnUstatus);
if ($result===false) {
	die('Unable to update status!');
}
?>