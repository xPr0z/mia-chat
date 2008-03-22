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
    die('Invalid session, operation not permitted! Please <a href="index.php">login</a>.');
}
include('mia.gzip.php'); //Compress page if possible

//clean post vars
require('includes/htmlpurifier/HTMLPurifier.auto.php');
$config = HTMLPurifier_Config::createDefault();
$config->set('HTML', 'Doctype', 'XHTML 1.0 Strict');
$purifier = new HTMLPurifier($config);
$clnMessageID =  intval($_POST['message_id']);
$clnRandInsertKey =  $purifier->purify($_POST['insert_key']);

$mia->removeMessage($clnMessageID, $clnRandInsertKey);
?>