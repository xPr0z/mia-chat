<?php

/**
 * Used to perform the database portable installation of Mia
 */
class MiaInstaller {
	
	/** @private string Internal variable to hold the db resource */
	private $db;
	/** @private string Internal variable to hold the db platform type */
	private $dbVendor;
	/** @private string Internal variable to hold the db hostname (ex) localhost */
	private $dbHostname;
	/** @private string Internal variable to hold the db username */
	private $dbUsername;
	/** @private string Internal variable to hold the db password */
	private $dbPassword;
	/** @private string Internal variable to hold the name of the db */
	private $dbName;
	/** @private string Internal variable to hold the email address of the mia admin */
	private $adminEail;
	/** @private string Internal variable to hold the live site url (ex) http://example.com */
	private $liveSiteUrl;
	/** @private string display the emails of the users in the manage buddy/search features */
	private $showUserEmails;
	/** @private string Internal variable to hold server time offset value */
	private $serverTimeOffset;
	/** @private string Internal variable to hold captcha preference */
    private $captcha;
	/** @private string Random key to help with mia security */
	private $secret;
	/* @private array Internal variable to hold error messages */
	private $returnStatus;
	
	function __construct($vendor, $hostname, $username, $password, $dbname, $admin_email, $live_site_url, $captcha, $show_user_emails, $server_time_offset) {
	    $this->dbVendor = $vendor;
	    $this->dbHostname = $hostname;
	    $this->dbUsername = $username;
	    $this->dbPassword = $password;
	    $this->dbName = $dbname;
	    $this->adminEmail = $admin_email;
	    $this->liveSiteUrl = $live_site_url;
	    $this->showUserEmails = $show_user_emails;
	    $this->serverTimeOffset = $server_time_offset;
	    $this->captcha = $captcha;
	    $this->secret = sha1(mt_rand());
	}

	function buildDb() {
        //Get the database connection
    	$dbconn = $this->setupConnection();
    	if ($dbconn===false) {
    	    $errorMsg = 'Failed to connect to the database! Check your settings.';
	        $this->setReturn('false', $errorMsg);
		    return  $this->returnStatus;
    	} else {
    	    $this->db = $dbconn;
    	}
		 
    	//XML file holding portable DB structure
		$schemaFile = 'mia_structure.xml';
		
		//Use the database connection to create a new adoSchema object.
		$schema = new adoSchema($this->db);
		//Build DML SQL statements
		if ($schema->ParseSchema($schemaFile)===false) {
		    $errorMsg = 'Failed to construct DML statements!';
	        $this->setReturn('false', $errorMsg);
		    return  $this->returnStatus;
		}
		//Execute DML SQL statements
		if ($schema->ExecuteSchema()===false) {
		    $errorMsg = 'Failed to execute DML statements!';
	        $this->setReturn('false', $errorMsg);
		    return  $this->returnStatus;
		}
		
		//Write out the Mia-Chat configuration file
		if ($this->writeMiaConfig()===false) {
		    $errorMsg = 'Failed to open the %s file for writing!';
	        $this->setReturn('false', $errorMsg);
	        return  $this->returnStatus;
		}
		
		$successMsg = 'The Mia-Chat database has been created sucessfully!';
        $this->setReturn('true', $successMsg);
		return $this->returnStatus;
	}
    
    /**
     * Lands the Mia-Chat configuration file
     */
    function writeMiaConfig() {
		//Output the new Mia-Chat config.inc.php configuration file
		$config_file = "../config.ini.php";
		if (($handle = @fopen($config_file, 'w'))===false) {
	        return false;
	    } else {
			$configText  = ";This is the mia configuration file\n";
			$configText .= ";Comments start with ';', as in php.ini\n\n";
			$configText .= "[database_info]\n";
			$configText .= "vendor = \"{$this->dbVendor}\"\n";
			$configText .= "host = \"{$this->dbHostname}\"\n";
            $configText .= "database = \"{$this->dbName}\"\n"; 
			$configText .= "user = \"{$this->dbUsername}\"\n";
            $configText .= "password = \"{$this->dbPassword}\"\n\n";
			$configText .= "[global_info]\n";
			$configText .= "admin_email = \"{$this->adminEmail}\"\n";	
			$configText .= "secret = \"{$this->secret}\" ; Unique per installation\n";
			$configText .= "enable_captcha = {$this->captcha} ; Requires the GD library\n\n";
			$configText .= ";The live site url is the actual web path to your site (ex) http://example.com/mia\n";
			$configText .= "live_site_url = \"{$this->liveSiteUrl}\"\n\n";
			$configText .= ";display the emails of the users in the manage buddy/search features\n";
            $configText .= "show_user_emails = \"{$this->showUserEmails}\"\n\n";
            $configText .= ";server time offset\n";
            $configText .= "server_time_offset=\"{$this->serverTimeOffset}\"\n\n";
            $configText .= ";welcome tab custom message\n";
            $configText .= "custom_welcome_message = \"Welcome to Mia-Chat :)<br /><br />Use Manage Buddies to add a new buddy or ";
            $configText .= "double-click a buddy to start chatting.<br /><br />We hope you enjoy this application.  Please spread the word.\"";
	    	
	    	if ($handle) {
				fwrite($handle, $configText);
				fclose($handle);
			}
			
			//Attempt to lock down the new file
			@chmod("../config.ini.php", 444);			
    	}
	}
    
    /**
     * Creates the ADOdb database connection to the selected db platform
     * Note: While similar to the setupConnection class in Mia itself this is slightly different
     *
     * @return db 
     */
	private function setupConnection() {
		/* Valid ADOdb platform options include: mysql, postgres, sqlite, oracle, firebird, db2, mssql 
	   Note: The setup process has been built with all of the platforms listed above in mind.  Some testing has occurred in each
	   and the setup code can actually be used to install on all except for db2 without major modifications.  However, at the moment
	   Mia itself is only setup to work with Mysql 4/5, postgres, & sqlite3. More should be added in time... */
	
		//Include the ADOdb library files
		include('../includes/adodb5/adodb.inc.php');
		include('../includes/adodb5/adodb-xmlschema.inc.php');
		
		/*/////////////////////////////////////////////////////////////////////
		          MySQL / PostgreSQL connection Parameters
		*//////////////////////////////////////////////////////////////////////
		if ($this->dbVendor=='mysql' || $this->dbVendor=='postgres') {
			$db = ADONewConnection( $this->dbVendor );
			//Debug set to 1 for verbose output & connection debugging
			$db->debug = 0;
		    // Start by creating a normal ADODB connection.
		    if (!@$db->Connect($this->dbHostname, $this->dbUsername, $this->dbPassword, $this->dbName)) {
			    $this->setReturn('false', $db->ErrorMsg());
			    return false;
		    } 
		}
		
		/*//////////////////////////////////////////////////////////////////////
		          SQLite2 connection Parameters
		*///////////////////////////////////////////////////////////////////////
		if ($this->dbVendor=='sqlite') {
			//Debug set to 1 for verbose output & connection debugging
		
			$db = ADONewConnection('sqlite');
			//Debug set to 1 for verbose output
			$db->debug = 0;
			//Try to connect (the db will actually be created if it does not exist and OS file permissions allow it.
		    if (!@$db->Connect($this->dbName)) {
		    	$this->setReturn('false', $db->ErrorMsg());
		    	return false;
		    } 
		}
		
		/*//////////////////////////////////////////////////////////////////////
		          Oracle connection Parameters 
		*///////////////////////////////////////////////////////////////////////
		
		//Note: Oracle support must have been compiled into PHP
		
		if ($this->dbVendor=='oracle') {
			$db = ADONewConnection( 'oci8' ); 
			//Debug set to 1 for verbose output & connection debugging
			$db->debug = 0;
		    if (!$db->Connect($this->dbHostname, $this->dbUsername, $this->dbPassword))  {
			    $this->setReturn('false', $db->ErrorMsg());
			    return false;
		    } else {
		    	// Set Oracle date format for inserts
				$set_date_format = "ALTER SESSION SET NLS_DATE_FORMAT = 'YYYY-MM-DD HH24:MI:SS'";
				$db->Execute($set_date_format);
		    }
		
			/**************************************************************************
			With oci8, you can connect in multiple ways. Note that oci8 works 
			fine with newer versions of the Oracle, eg. 9i and 10g.
			
			a. PHP and Oracle reside on the same machine, use default SID.
				$db->Connect(false, 'scott', 'tiger');
			
			b. TNS Name defined in tnsnames.ora (or ONAMES or HOSTNAMES), eg. 'myTNS'
				$db->Connect(false, 'scott', 'tiger', 'myTNS');
			or
			 	$db->Connect('myTNS', 'scott', 'tiger');
			
			c. Host Address and SID
				$conn->connectSID = true;
				$conn->Connect('192.168.0.1', 'scott', 'tiger', 'SID');
			
			d. Host Address and Service Name
				$conn->Connect('192.168.0.1', 'scott', 'tiger', 'servicename');
			
			e. Oracle connection string:
				$cstr = "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=$host)(PORT=$port))
						(CONNECT_DATA=(SID=$sid)))";
				$db->Connect($cstr, 'scott', 'tiger');
			**************************************************************************/
		}
		
		/*//////////////////////////////////////////////////////////////////////
		          DB2 connection Parameters  (Not yet working...)
		*///////////////////////////////////////////////////////////////////////
		if ($this->dbVendor=='db2') {
			$db = ADONewConnection( $this->dbVendor );
			$dsn = "driver={IBM db2 odbc DRIVER};Database=$this->dbName;hostname=$this->dbHostname;port=50000;protocol=TCPIP;".
						"uid=$this->dbUsername; pwd=$this->dbPassword";	
			//Debug set to 1 for verbose output & connection debugging
			$db->debug = 0;
		    if (!@$db->Connect($dsn))  {
			    $this->setReturn('false', $db->ErrorMsg());
			    return false;
		    } 
		}
		
		/*//////////////////////////////////////////////////////////////////////
		          Firebird connection Parameters (Not supported yet...)
		*///////////////////////////////////////////////////////////////////////
		//Note: ibase support must have been compiled into PHP
		if ($this->dbVendor=='firebird') {
			$db = ADONewConnection('ibase'); 
			//Debug set to 1 for verbose output & connection debugging
			$db->debug = 0;
		    if (!@$db->Connect($this->dbName, $this->dbUsername, $this->dbPassword))  {
			    $this->setReturn('false', $db->ErrorMsg());
			    return false;
		    } 
		}
		
		/*//////////////////////////////////////////////////////////////////////
		        MS SQL Server connection Parameters (tested with 2000 & 2005)
		*///////////////////////////////////////////////////////////////////////
		if ($this->dbVendor=='mssql') {
			$db = ADONewConnection('odbc_mssql');
			//Note: if using sql server 2005 you might need servername\instance for the Server string
			$dsn = "Provider=MSDASQL; Driver={SQL Server}; Server=$this->dbHostname; Database=$this->dbName;";
			//Debug set to 1 for verbose output & connection debugging
			$db->debug = 0;
		    if (!@$db->Connect($dsn, $this->dbUsername, $this->dbPassword))  {
			    $this->setReturn('false', $db->ErrorMsg());
			    return false;
		    }
		
			//Or if you prefer to use the mssql extension (which is limited to mssql 6.5 functionality):
			/*
			$db = ADONewConnection('mssql');
			$db->debug = 0;
			$db->Execute('servername', 'user', 'password', 'database');
			*/
		}
		
		return $db;
	}
    
    /**
     * General function to handle constructing the return array
     * 
     * @param string $errorMsg
     */
    private function setReturn($status, $message) {
    	$this->returnStatus = array('created'=>$status, 'message'=>$message);
    }
	
    
}
?>
