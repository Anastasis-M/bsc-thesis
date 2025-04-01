/*
  Warnings:

  - Made the column `created_at` on table `cards` required. This step will fail if there are existing NULL values in that column.
  - Made the column `helpful_votes` on table `reviews` required. This step will fail if there are existing NULL values in that column.
  - Made the column `total_votes` on table `reviews` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `maps_id` to the `stores` table without a default value. This is not possible if the table is not empty.
  - Made the column `role` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `display_name` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `number_of_reviews` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `helpful_review_score` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `helpful_ratio` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "cards" ALTER COLUMN "created_at" SET NOT NULL;

-- AlterTable
ALTER TABLE "reviews" ALTER COLUMN "helpful_votes" SET NOT NULL,
ALTER COLUMN "total_votes" SET NOT NULL;

-- AlterTable
ALTER TABLE "stores" ADD COLUMN     "maps_id" VARCHAR NOT NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "role" SET NOT NULL,
ALTER COLUMN "display_name" SET NOT NULL,
ALTER COLUMN "number_of_reviews" SET NOT NULL,
ALTER COLUMN "helpful_review_score" SET NOT NULL,
ALTER COLUMN "helpful_ratio" SET NOT NULL;
