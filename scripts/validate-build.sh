#!/bin/bash
# Build validation script
# Run this locally to validate your build before pushing
# Usage:
#   ./scripts/validate-build.sh           # Build and validate
#   ./scripts/validate-build.sh --skip-build  # Only validate existing build

set -e

# Check if we should skip the build step
SKIP_BUILD=false
if [ "$1" = "--skip-build" ]; then
  SKIP_BUILD=true
fi

if [ "$SKIP_BUILD" = false ]; then
  echo "🏗  Building site..."
  npm run build
fi

echo ""
echo "✅ Validating build output..."
echo ""

# Check that _site directory exists and has content
if [ ! -d "_site" ]; then
  echo "❌ Build directory _site does not exist"
  exit 1
fi

# Check critical files exist
critical_files=(
  "_site/index.html"
  "_site/sitemap.xml"
  "_site/feed.xml"
  "_site/static/robots.txt"
  "_site/blog/index.html"
)

echo "Checking critical files..."
for file in "${critical_files[@]}"; do
  if [ ! -f "$file" ]; then
    echo "❌ Critical file missing: $file"
    exit 1
  fi
  if [ ! -s "$file" ]; then
    echo "❌ File is empty: $file"
    exit 1
  fi
  echo "  ✓ $file"
done

# Count blog posts
blog_count=$(find _site/blog -name "index.html" -type f | wc -l | tr -d ' ')
echo ""
echo "Blog posts: $blog_count"
if [ "$blog_count" -lt 20 ]; then
  echo "❌ Expected at least 20 blog posts, found: $blog_count"
  exit 1
fi

# Check sitemap
echo ""
echo "Validating sitemap..."
if ! grep -q "<loc>https://rupertmckay.com/blog/" _site/sitemap.xml; then
  echo "❌ Sitemap does not contain blog post URLs"
  exit 1
fi
sitemap_urls=$(grep -c "<loc>" _site/sitemap.xml)
echo "  ✓ Sitemap contains $sitemap_urls URLs"

# Check feed
echo ""
echo "Validating RSS feed..."
if ! grep -q "<entry>" _site/feed.xml; then
  echo "❌ RSS feed does not contain entries"
  exit 1
fi
feed_entries=$(grep -c "<entry>" _site/feed.xml)
echo "  ✓ Feed contains $feed_entries entries"

# Check HTML structure
echo ""
echo "Validating HTML structure..."
invalid_count=0
for html_file in _site/*.html _site/blog/*/index.html; do
  if [ -f "$html_file" ]; then
    if ! grep -q "<html" "$html_file"; then
      echo "❌ Invalid HTML structure in: $html_file"
      invalid_count=$((invalid_count + 1))
    fi
  fi
done

if [ $invalid_count -gt 0 ]; then
  echo "❌ Found $invalid_count invalid HTML files"
  exit 1
fi
echo "  ✓ All HTML files have valid structure"

# Summary
total_size=$(du -sh _site | cut -f1)
echo ""
echo "✅ Build validation passed!"
echo ""
echo "Summary:"
echo "  Total size: $total_size"
echo "  Blog posts: $blog_count"
echo "  Sitemap URLs: $sitemap_urls"
echo "  Feed entries: $feed_entries"
echo ""
