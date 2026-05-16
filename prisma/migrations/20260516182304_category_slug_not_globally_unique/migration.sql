-- DropIndex
DROP INDEX "CategoryTranslation_locale_slug_key";

-- CreateIndex
CREATE INDEX "CategoryTranslation_locale_slug_idx" ON "CategoryTranslation"("locale", "slug");
