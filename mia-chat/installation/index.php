<?php
/**
* @package Mia-Chat
* @copyright Brilaps, LLC (http://brilaps.com)
* @license The MIT License (http://www.opensource.org/licenses/mit-license.php)
*/

$phpVersion            = phpversion();
$configExists          = @file_exists('../config.ini.php');
$configWriteable       = @fopen('../config.ini.php', 'w+');
$htmlPurifierWriteable = @is_writable('../includes/htmlpurifier/library/HTMLPurifier/DefinitionCache/Serializer');
$continueAllowed       = true;

if ($phpVersion<'5.0' || $configWriteable===false || $htmlPurifierWriteable===false) {
    $continueAllowed = false;
}

//Build the siteURL
$currentFilePath = $_SERVER['SERVER_NAME'].($_SERVER['SERVER_PORT']!=80?':'.$_SERVER['SERVER_PORT']:'').$_SERVER['PHP_SELF'];
$MiaChatUrl = 'http://'.str_replace('installation/index.php','',$currentFilePath);
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
   <title>The Mia-Chat Installer</title>
   <link rel="shortcut icon" type="image/x-icon" href="../images/favicon.ico">
   <link rel="stylesheet" href="../css/reset-fonts-grids.css" type="text/css" />
   <link rel="stylesheet" href="css/installer.css" type="text/css" />
</head>
<body>
<div id="doc3" class="yui-t7">
   <div id="hd">
    <img src="../images/mia_logo.png" alt="Mia-Chat logo" />
    <h1>The Mia-Chat Installer</h1>
   <div id="bd">
        <div id="messages">
        <?php
        if ($htmlPurifierWriteable===false) {
            ?>
                <div id="errorMessages" class="yui-g message">
        	        <h2>Installation Warning</h2>
                	<p>
                	Mia-Chat uses <a target="_blank" href="http://htmlpurifier.org">HTMLPurifier</a> to help with input filtering and security issues like xss 
                    attacks, etc.  HTMLPurifier uses caching an its cache folder needs special permission to function properly.  Below
                    you will find the documentation on setting this up.</p>
                    
                    <p>Caching:<br />
                    HTML Purifier generates some cache files (generally one or two) to speed up
                    its execution. For maximum performance, make sure that
                    includes/htmlpurifier/library/HTMLPurifier/DefinitionCache/Serializer is writeable by the webserver.
                    <br /><br />
                    If you are in the root Mia-Chat folder you can set the appropriate permissions using:
                    <br /><br />
                    <span style="font-style: italic; font-weight: bold;">chmod -R 0755 includes/htmlpurifier/library/HTMLPurifier/DefinitionCache/Serializer</span></p>
                    
                    <p>If the above command doesn't work, you may need to assign write permissions
                    to all. This may be necessary if your webserver runs as nobody, but is
                    not recommended since it means any other user can write files in the
                    directory. Use:
                    <br /><br />
                    <span style="font-style: italic; font-weight: bold;">chmod -R 0777 includes/htmlpurifier/library/HTMLPurifier/DefinitionCache/Serializer</span></p>

                    <p>You can also chmod files via your FTP client; this option
                    is usually accessible by right clicking the corresponding directory and
                    then selecting "chmod" or "file permissions".
                	</p>
                	<br />
                	<p><span class="note">Note</span>: You must correct these issues before continuing with the installation of Mia-Chat!</p>
            	</div>
            <?php
        } else if ($continueAllowed===false) {
            ?>
                <div id="errorMessages" class="yui-g message">
        	        <h2>Installation Warning</h2>
                	<?php 
                	if ($phpVersion<'5.0') {
                	    echo '<p>* Mia-Chat requires PHP versions >= 5.0.  This server is running '.$phpVersion.'.</p>';
                	}
                	if ($configWriteable===false) {
                	    echo '<p>* The installer is unable to create or write to the Mia-Chat configuration file: '.realpath('../config.ini.php').'</p>';
                	}
                	?>
                	<br />
                	<p><span class="note">Note</span>: You must correct these issues before continuing with the installation of Mia-Chat!</p>
            	</div>
            <?php
        } else if ($configExists===true && filesize('../config.ini.php')>0 && $continueAllowed===true) {
        ?>
            <div id="errorMessages" class="yui-g message">
    	        <h2>Installation Warning</h2>
        	    <?php echo '<p>* There is already a Mia-Chat config.ini.php file present in the Mia-Chat root directory: '.realpath('../config.ini.php').'</p>'; ?>
            	<br />
            	<p><span class="note">Note</span>: You can continue with the Mia-Chat installation, but the existing configuration file will be replaced!</p>
        	</div>
        <?php 
        }
        ?>
        </div>
        <noscript>
            <div class="yui-g message">
    	        <h2>Installation Warning</h2>
        	    <p>* The Mia-Chat installer requires JavaScript which your browser does not have enabled!</p>
        	</div>
        </noscript>
        <div id="setupFrm" class="yui-g">
            <h2>Fill out the form below and click install when ready</h2>
            <form id="installationFrm" method="post" action="doInstall.php">
		        <fieldset>
                    <label for="adminEmail">Email Address for Administrator:</label>
        			<input type="text" id="adminEmail" name="adminEmail" size="25" value="" />
        			<label for="miaWebPath">Live Site Url to Mia-Chat:</label>
        			<input type="text" id="miaWebPath" name="miaWebPath" size="25" value="<?php echo $MiaChatUrl; ?>" />
        			<p class="note">Note: The installer will try to detect this automatically.  Only change if it appears to be incorrect.</p>
        			<p>
                    <label>Enable Captcha for Registrations: (<a target="_blank" href="http://en.wikipedia.org/wiki/Captcha">What is Captcha?</a>)</label>
                        <input type="radio" name="captcha" value="1" checked="checked" />Yes
                        <input type="radio" name="captcha" value="0" /> No
                    </p>
                    <?php 
                        //Display captcha option only if server supports GD
                        if (!function_exists("gd_info")) {
                            echo '<p class="note">Note: Captcha requires <a target="_blank" href="http://www.php.net/manual/en/image.installation.php">GD support</a> which this server appears to lack.</p>';
                        }
                    ?>
                    <p>
                    <label>Display email address of the users in the manage buddy/search features?</label>
                        <input type="radio" name="showUserEmails" value="true" />Yes
                        <input type="radio" name="showUserEmails" value="false" checked="checked" /> No
                    </p>
                    <p>
		                <label>Select Server Time Offset:</label>
                        <select name="serverTimeOffset">
                            <option value="-1">-1</option>
                            <option value="-2">-2</option>
                            <option value="-3">-3</option>
                            <option value="-4">-4</option>
                            <option value="-5">-5</option>
                            <option value="-6">-6</option>
                            <option value="-7">-7</option>
                            <option value="-8">-8</option>
                            <option value="-9">-9</option>
                            <option value="-10">-10</option>
                            <option value="-11">-11</option>
                            <option value="-12">12</option>
                            <option selected="selected" value="0">0</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                            <option value="6">6</option>
                            <option value="7">7</option>
                            <option value="8">8</option>
                            <option value="9">9</option>
                            <option value="10">10</option>
                            <option value="11">11</option>
                            <option value="12">12</option>
                        </select>
                    </p>
		            <p>
		                <label for="dbVendor">Select a Database Vendor:</label>
                        <select class="dbVendor" name="dbVendor">
                            <option value="none">Select One</option>
                            <!--
                            <option value="db2">IBM DB2</option>
                            <option value="mssql">Microsoft SQL Server 2000 and higher</option>
                            <option value="sqlite">SQLite 2 (Not 3)</option>
                            <option value="oracle">Oracle 8 or higher</option>
                            -->
                            <option value="mysql">MySQL 4 or 5</option>
                            <option value="postgres">PostgreSQL 7 or 8</option>
                            
                        </select>
                    </p>
                    <div id="database-fields">
              			<label for="dbName">Database Name:</label>
            			<input type="text" id="dbName" name="dbName" size="25" value="" />
            			<div id="just-sqlite">
            			    <p class="note">Note: For SQLite make sure to include the full path to your database including the file extension if your 
            			    database has one (ex) /path/to/miachat.db, c:\path\to\miachat.db, etc.  The database will be created if it does not exist 
            			    and OS file permissions allow it.</p>
            			</div>
            			<div id="no-sqlite">
            			    <label for="dbHostname">Database Hostname:</label>
                			<input type="text" id="dbHostname" name="dbHostname" size="25" value="" />
              			    <label for="dbUsername">Database Username:</label>
                			<input type="text" id="dbUsername" name="dbUsername" size="25" value="" />
                  			<label for="dbPassword">Database Password:</label>
                			<input type="password" id="dbPassword" name="dbPassword" size="25" value="" />
                  			<label for="dbVerifyPassword">Verify Database Password:</label>
                			<input type="password" id="dbVerifyPassword" name="dbVerifyPassword" size="25" value="" />
            			</div>
                    </div>
                    <br />
                    <input id="installSubmit" type="submit" value="Run Installation" />
			    </fieldset>
			</form>
    	</div>
	</div>
   <div id="ft"><?php include '../footer.html'; ?></div>
</div>
<script type="text/javascript" src="../includes/js/jquery/jquery.min.js"></script>
<script type="text/javascript" src="../includes/js/jquery/plugins/validate/lib/jquery.metadata.js"></script>
<script type="text/javascript" src="../includes/js/jquery/plugins/validate/jquery.validate.min.js"></script>
<script type="text/javascript" src="js/mia.installer.js"></script>
<script type="text/javascript" src="js/jquery.form.js"></script>
</body>
</html>