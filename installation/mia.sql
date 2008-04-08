--
-- Database: `mia`
--

-- --------------------------------------------------------

--
-- Table structure for table `mia_buddies`
--

CREATE TABLE IF NOT EXISTS `mia_buddies` (
  `id` int(11) NOT NULL auto_increment,
  `userid` int(11) NOT NULL,
  `buddy_userid` int(11) NOT NULL,
  PRIMARY KEY  (`id`),
  KEY `userid` (`userid`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=49 ;

-- --------------------------------------------------------

--
-- Table structure for table `mia_messages`
--

CREATE TABLE IF NOT EXISTS `mia_messages` (
  `id` int(11) NOT NULL auto_increment,
  `userid_from` int(11) NOT NULL,
  `userid_to` int(11) NOT NULL,
  `message` varchar(4000) NOT NULL,
  `rand_insert_key` varchar(40) NOT NULL,
  `sent_date_time` datetime NOT NULL,
  PRIMARY KEY  (`id`),
  KEY `userid_to` (`userid_to`),
  KEY `rand_insert_key` (`rand_insert_key`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=184 ;

-- --------------------------------------------------------

--
-- Table structure for table `mia_users`
--

CREATE TABLE IF NOT EXISTS `mia_users` (
  `id` int(11) NOT NULL auto_increment,
  `full_name` varchar(100) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(100) NOT NULL,
  `salt` varchar(8) NOT NULL,
  `email` varchar(100) NOT NULL,
  `usergroup` int(11) NOT NULL default '0',
  `create_date` datetime NOT NULL,
  `heartbeat` datetime NOT NULL,
  `status` varchar(8) default NULL,
  `show_offline_buddies` int(1) NOT NULL default '1',
  `password_reset_key` varchar(100) default NULL,
  `time_offset` varchar(4) NOT NULL default '0',
  PRIMARY KEY  (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=32 ;
