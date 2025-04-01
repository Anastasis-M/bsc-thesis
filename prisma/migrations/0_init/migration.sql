-- CreateTable
CREATE TABLE "cards" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "store_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,
    "product_name" VARCHAR(200) NOT NULL,
    "store_name" VARCHAR(200) NOT NULL,
    "image_cover_path" VARCHAR(200),
    "average_rating" REAL,
    "average_price" REAL,
    "number_of_reviews" INTEGER,
    "review_ids" INTEGER[],
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorites" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "card_id" INTEGER NOT NULL,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "images" (
    "id" SERIAL NOT NULL,
    "review_id" INTEGER NOT NULL,
    "image_path" VARCHAR(200) NOT NULL,

    CONSTRAINT "images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "category" INTEGER NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "store_id" INTEGER NOT NULL,
    "price" REAL NOT NULL,
    "rating" INTEGER NOT NULL,
    "review_text" TEXT NOT NULL,
    "review_date" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "helpful_votes" INTEGER DEFAULT 0,
    "total_votes" INTEGER DEFAULT 0,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stores" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "position" point NOT NULL,

    CONSTRAINT "stores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokens" (
    "token_value" VARCHAR(255) NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "tokens_pkey" PRIMARY KEY ("token_value")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password" VARCHAR(100) NOT NULL,
    "role" VARCHAR(50),
    "display_name" VARCHAR(100),
    "number_of_reviews" INTEGER DEFAULT 0,
    "helpful_review_score" INTEGER DEFAULT 0,
    "helpful_ratio" REAL DEFAULT 0.0,
    "liked_reviews_ids" INTEGER[],
    "disliked_reviews_ids" INTEGER[],

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cards_id_index" ON "cards"("id");

-- CreateIndex
CREATE UNIQUE INDEX "cards_product_id_store_id_key" ON "cards"("product_id", "store_id");

-- CreateIndex
CREATE INDEX "favorites_card_id_index" ON "favorites"("card_id");

-- CreateIndex
CREATE INDEX "products_name_index" ON "products"("name");

-- CreateIndex
CREATE INDEX "products_product_id_index" ON "products"("id");

-- CreateIndex
CREATE INDEX "reviews_review_id_index" ON "reviews"("id");

-- CreateIndex
CREATE INDEX "stores_store_id_index" ON "stores"("id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_user_id_index" ON "users"("id");

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cards_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cards_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cards_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "cards"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "images" ADD CONSTRAINT "images_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_category_fkey" FOREIGN KEY ("category") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tokens" ADD CONSTRAINT "tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

