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
    die('Invalid session, operation not permitted! Please <a href="index.php">login</a>.');
}

include('mia.gzip.php'); //Compress page if possible
$mia->heartbeat(); //Update login status
?>