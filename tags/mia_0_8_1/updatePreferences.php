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
if (isset($_POST['showoffline'])) {
	$showoffline = intval($_POST['showoffline']);
} else {
	$showoffline = 1;
}

$_SESSION['showoffline'] = $showoffline;
?>