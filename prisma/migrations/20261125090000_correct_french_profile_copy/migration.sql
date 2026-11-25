-- Correct the original seed without overwriting edited French copy.
UPDATE profiles
SET fr = fr || jsonb_build_object(
  'about', replace(replace(replace(fr->>'about', 'systemes', U&'syst\00E8mes'), 'simples a exploiter', U&'simples \00E0 exploiter'), 'et a maintenir', U&'et \00E0 maintenir'),
  'availability', U&'Disponible pour de nouvelles opportunit\00E9s',
  'portrait', (fr->'portrait') || jsonb_build_object('alt', U&'Portrait illustr\00E9 temporaire')
)
WHERE id = 1 AND placeholder
  AND fr->>'availability' = 'Disponible pour de nouvelles opportunites'
  AND fr->'portrait'->>'alt' = 'Portrait illustre temporaire'
  AND fr->>'about' = U&'Je travaille sur les applications, leur livraison et les plateformes qui les h\00E9bergent. Je privil\00E9gie les systemes simples a exploiter et a maintenir.';
