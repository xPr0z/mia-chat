<?php
/**
* @package Mia-Chat
* @copyright Brilaps, LLC (http://brilaps.com)
* @license The MIT License (http://www.opensource.org/licenses/mit-license.php)
*/
session_start();
require('includes/mia.classes.php');
$mia = MiaChatDb::getInstance();
if ($mia->sessionHijackCheck()===false) {
    die('Invalid session, operation not permitted! Please <a href="index.php" target="_parent">login</a>.');
}
include('mia.gzip.php'); //Compress page if possible

$clnSelectedBuddy =  intval($_POST['buddyid']);
if ($clnSelectedBuddy<1) {
	return false;
} else {
	$result = $mia->addNewBuddy($clnSelectedBuddy);
	if ($result===false) {
		echo "Unable to add new buddy!";
	}
}
?>