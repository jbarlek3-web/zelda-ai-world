CREATE TABLE `aurastria_saves` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`slot` int NOT NULL,
	`label` varchar(64) NOT NULL,
	`stateJson` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `aurastria_saves_id` PRIMARY KEY(`id`),
	CONSTRAINT `aurastria_saves_user_slot_unique` UNIQUE(`userId`,`slot`),
	CONSTRAINT `aurastria_saves_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action
);
--> statement-breakpoint
CREATE INDEX `aurastria_saves_user_updated_idx` ON `aurastria_saves` (`userId`,`updatedAt`);
