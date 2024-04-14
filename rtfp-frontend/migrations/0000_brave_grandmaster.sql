-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migraitons
/*
CREATE TABLE `research_papers` (
	`id` int AUTO_INCREMENT PRIMARY KEY NOT NULL,
	`key` varchar(1000) NOT NULL,
	`content` text NOT NULL
);

CREATE INDEX `content` ON `research_papers` (`content`);
*/