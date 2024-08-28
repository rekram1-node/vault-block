CREATE TABLE `vaults` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` integer NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`notion_page_id` text NOT NULL,
	`encrypted_content` blob,
	`password_hash` text,
	`serverside_password_salt` blob,
	`document_salt` text,
	`iv` text,
	`password_salt` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `vaults_id_unique` ON `vaults` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `vaults_notion_page_id_unique` ON `vaults` (`notion_page_id`);--> statement-breakpoint
CREATE INDEX `encrypted_document_userId_idx` ON `vaults` (`name`);