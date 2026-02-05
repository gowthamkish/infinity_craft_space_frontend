#!/bin/bash

# Accessibility Quick Fix Script
# This script helps identify and fix common accessibility issues

echo "🔍 Scanning for accessibility issues..."

# 1. Find images without alt attributes
echo ""
echo "📸 Images without alt attributes:"
echo "=================================="
grep -rn "<img" src/ --include="*.js" --include="*.jsx" | grep -v "alt=" | head -20

# 2. Find buttons without aria-labels (icon-only buttons)
echo ""
echo "🔘 Icon-only buttons (may need aria-label):"
echo "==========================================="
grep -rn "<Button" src/ --include="*.js" | grep -E "(FiEdit|FiTrash|FiPlus|FiMinus|FiX)" | grep -v "aria-label" | head -20

# 3. Find links without descriptive text
echo ""
echo "🔗 Links that may need better text:"
echo "===================================="
grep -rn "<a" src/ --include="*.js" | grep "onClick" | head -10

# 4. Check for proper heading hierarchy
echo ""
echo "📑 Heading tags found (check hierarchy):"
echo "========================================="
grep -rn "<h[1-6]" src/ --include="*.js" | cut -d: -f1 | sort | uniq -c

echo ""
echo "✅ Scan complete!"
echo ""
echo "📝 Recommended fixes:"
echo "1. Add alt=\"descriptive text\" to all <img> tags"
echo "2. Add aria-label=\"action description\" to icon-only buttons"
echo "3. Ensure heading hierarchy is logical (h1 -> h2 -> h3)"
echo "4. Add aria-labels to form inputs if labels are missing"
echo ""
echo "🔧 Next steps:"
echo "1. Review the output above"
echo "2. Add missing alt and aria-label attributes"
echo "3. Test with a screen reader"
echo "4. Re-run PageSpeed Insights"
