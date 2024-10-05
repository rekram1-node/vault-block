CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
DROP INDEX IF EXISTS `vault_userId_idx`;--> statement-breakpoint
CREATE UNIQUE INDEX `users_id_unique` ON `users` (`id`);--> statement-breakpoint
CREATE INDEX `vault_userId_idx` ON `vaults` (`user_id`);