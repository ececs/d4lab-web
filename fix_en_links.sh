#!/bin/bash
for file in en/blog/*.html; do
  sed -i '' 's|href="/en/services"|href="/en/servicios"|g' "$file"
  sed -i '' 's|href="/en/mockups"|href="/en/maquetas"|g' "$file"
  sed -i '' 's|href="/en/guide"|href="/en/guia"|g' "$file"
  sed -i '' 's|href="/en/about-me"|href="/en/sobre-mi"|g' "$file"
  sed -i '' 's|href="/en/faq"|href="/en/precios"|g' "$file"
  sed -i '' 's|href="/en/contact"|href="/en/contacto"|g' "$file"
  sed -i '' 's|>About Me<|>About me<|g' "$file"
done
