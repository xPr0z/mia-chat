<?php
/**
* @package Mia-Chat
* @copyright Brilaps, LLC (http://brilaps.com)
* @license The MIT License (http://www.opensource.org/licenses/mit-license.php)
*/

require('installer.classes.php');
require('../includes/json.php');
$json = new Services_JSON();

//Clean post vars
require('../includes/htmlpurifier/library/HTMLPurifier.auto.php');
$config = HTMLPurifier_Config::createDefault();
$config->set('HTML.Doctype', 'XHTML 1.0 Strict');
$purifier = new HTMLPurifier($config);
$clnAdminEmail       = isset($_POST['adminEmail']) ? $purifier->purify($_POST['adminEmail']) : '';
$clnMiaWebPath       = isset($_POST['miaWebPath']) ? $purifier->purify($_POST['miaWebPath']) : '';
$clnDbHostname       = isset($_POST['dbHostname']) ? $purifier->purify($_POST['dbHostname']) : '';
$clnDbVendor         = isset($_POST['dbVendor']) ? $_POST['dbVendor'] : '';
$clnCaptcha          = isset($_POST['captcha']) ? intval($_POST['captcha']) : '';
$clnShowUserEmails   = isset($_POST['showUserEmails']) ? $_POST['showUserEmails'] : 'false';
$clnServerTimeOffset = isset($_POST['serverTimeOffset']) ? $_POST['serverTimeOffset'] : '0';
$clnDbName           = isset($_POST['dbName']) ? $purifier->purify($_POST['dbName']) : '';
$clnDbUsername       = isset($_POST['dbUsername']) ? $purifier->purify($_POST['dbUsername']) : '';
$clnDbPassword       = isset($_POST['dbPassword']) ? $_POST['dbPassword'] : '';
$clnVerifyDbPassword = isset($_POST['dbVerifyPassword']) ? $_POST['dbVerifyPassword'] : '';
$jsonReturn          = array('created'=>'', 'message'=>''); //used to send back status

//These check are handled on the frontend as well, but just in case JS was disabled
if (empty($clnAdminEmail) || empty($clnMiaWebPath) || empty($clnDbVendor) || empty($clnCaptcha) || empty($clnDbName)) {
    
    echo 'here';
    exit;
    
    //This are required by all
    $jsonReturn['created']='false';
    $jsonReturn['message']='Invalid form submission.  All fields are required!';
    echo $json->encode($jsonReturn);
    exit;
} else if ($clnDbVendor!='sqlite' && (empty($clnDbUsername) || empty($clnDbHostname))) {
    
    echo 'here2';
    exit;
    
    //This are required for all vendors except sqlite
    $jsonReturn['created']='false';
    $jsonReturn['message']='Invalid form submission.  All fields are required!';
    echo $json->encode($jsonReturn);
    exit;
} else if (empty($clnDbPassword) || ($clnDbPassword!==$clnVerifyDbPassword)) {
    //This are required for all vendors except sqlite
    $jsonReturn['created']='false';
    $jsonReturn['message']='Passwords do not match!';
    echo $json->encode($jsonReturn);
    exit;
}

//Do check for valid db vendor selection
$validVendors = array('mysql', 'mssql', 'postgres', 'sqlite', 'db2', 'oracle');
if (!in_array($clnDbVendor, $validVendors)) {
    $jsonReturn['created']='false';
    $jsonReturn['message']='Invalid database vendor selected!';
    echo $json->encode($jsonReturn);
    exit;
}

$miaInstaller = new MiaInstaller($clnDbVendor, $clnDbHostname, $clnDbUsername, $clnDbPassword, $clnDbName, $clnAdminEmail, 
                                    $clnMiaWebPath, $clnCaptcha, $clnShowUserEmails, $clnServerTimeOffset);
echo $json->encode($miaInstaller->buildDb());
?>