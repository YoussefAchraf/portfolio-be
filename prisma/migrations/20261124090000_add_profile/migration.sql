CREATE TABLE "profiles" (
  "id" INTEGER PRIMARY KEY CHECK ("id" = 1),
  "name" VARCHAR(120) NOT NULL,
  "email" VARCHAR(254) NOT NULL,
  "github" TEXT NOT NULL,
  "linkedin" TEXT NOT NULL,
  "en" JSONB NOT NULL,
  "fr" JSONB NOT NULL,
  "placeholder" BOOLEAN NOT NULL DEFAULT true
);

INSERT INTO "profiles" ("id", "name", "email", "github", "linkedin", "en", "fr") VALUES (
  1, 'Achraf Youssef', 'contact@example.com', 'https://github.com/', 'https://www.linkedin.com/',
  $profile${"headline":"Software Engineer - Full-Stack, DevOps, Platform & AI","pitch":"I build web products and the infrastructure that runs them.","about":"I work across application development, delivery automation and platform engineering. I care about making systems easy to run and maintain.","availability":"Open to opportunities","location":"Tunisia","portrait":{"url":"/portrait-placeholder.svg","alt":"Illustrated portrait placeholder"},"seo":{"title":"Achraf Youssef - Software Engineer","description":"Full-stack, DevOps, platform and AI engineering portfolio.","imageUrl":null}}$profile$::jsonb,
  $profile${"headline":"Ing\u00e9nieur logiciel - Full-Stack, DevOps, Plateforme et IA","pitch":"Je d\u00e9veloppe des produits web et les infrastructures qui les font fonctionner.","about":"Je travaille sur les applications, leur livraison et les plateformes qui les h\u00e9bergent. Je privil\u00e9gie les systemes simples a exploiter et a maintenir.","availability":"Disponible pour de nouvelles opportunites","location":"Tunisie","portrait":{"url":"/portrait-placeholder.svg","alt":"Portrait illustre temporaire"},"seo":{"title":"Achraf Youssef - Ing\u00e9nieur logiciel","description":"Portfolio en d\u00e9veloppement full-stack, DevOps, plateforme et IA.","imageUrl":null}}$profile$::jsonb
);
