<?php
/**
* @package Mia
* @copyright Brilaps, LLC (http://brilaps.com)
* @license The MIT License (http://www.opensource.org/licenses/mit-license.php)
*/

/*
MIA Installation Notes:

1) Create a new database and database user for Mia
2) Make sure the new database user has the permissions needed to create and manage the database
3) Run the SQL statements contained in the mia.sql file against your MySQL database (if you are 
    not using MySQL find more information below)
4) Create a Mia configuration file called config.ini.php in the root of your Mia installation.  Use
    the included config.ini.sample.php file as your guide.
5) After setting up the configuration file make sure it is no longer writeable by the server (ex) chmod 444 config.ini.php
6) Remove the installation folder from your server
7) Mia uses HTMLPurifier (http://htmlpurifier.org) to help with input filtering and security issues like xss 
    attacks, etc.  HTMLPurifier uses caching an its cache folder needs special permission to function properly.  Below
    you will find the documentation on setting this up.

	Caching:
	HTML Purifier generates some cache files (generally one or two) to speed up
	its execution. For maximum performance, make sure that
	includes/htmlpurifier/HTMLPurifier/DefinitionCache/Serializer is writeable by the webserver.

	If you are in the library/ folder of HTML Purifier, you can set the
	appropriate permissions using:

	    chmod -R 0755 includes/htmlpurifier/HTMLPurifier/DefinitionCache/Serializer

	If the above command doesn't work, you may need to assign write permissions
	to all. This may be necessary if your webserver runs as nobody, but is
	not recommended since it means any other user can write files in the
	directory. Use:

	    chmod -R 0777 includes/htmlpurifier/HTMLPurifier/DefinitionCache/Serializer

	You can also chmod files via your FTP client; this option
	is usually accessible by right clicking the corresponding directory and
	then selecting "chmod" or "file permissions".

	Starting with 2.0.1, HTML Purifier will generate friendly error messages
	that will tell you exactly what you have to chmod the directory to, if in doubt,
	follow its advice.

	If you are unable or unwilling to give write permissions to the cache
	directory, you can either disable the cache (and suffer a performance
	hit):

	    $config->set('Core', 'DefinitionCache', null);

	Or move the cache directory somewhere else (no trailing slash):

	    $config->set('Cache', 'SerializerPath', '/home/user/absolute/path');
	    
8) That's it.  Browse to http://path_to_mia/index.php.  Enjoy :)

Wait, what about non-MySQL databases?

Mia includes the SQL file needed to create the proper MySQL database. However, Mia has been built with database portability 
in mind. The underlying structure uses ADOdb PHP (http://phplens.com/adodb/) for portability and as a result can communicate with most of the popular 
database management systems in use today (ex) IBM DB2, Oracle 8+, MySQL 4 or 5, MS SQL Server 2000+, SQLite 2+, PostgreSQL 7+. 
The code to setup non-MySQL databases is not distributed with Mia. With a bit a work on your end it can be setup since the 
commication layer is in place. However, if you don't have the in house talent or time to do this work Brilaps, LLC does 
have an affordable commercial installer which makes setting up non-MySQL database structures and communication a snap. The 
installer requires you to fill out 1 short form and the rest is done for you automatically.  For more information on this 
please first the following url - http://brilaps.com/index.php?content=mia.

*/

?>