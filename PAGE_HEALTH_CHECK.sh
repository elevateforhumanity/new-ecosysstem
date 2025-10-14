#!/bin/bash

echo "🏥 PAGE HEALTH CHECK - Analyzing all 82 pages"
echo "=============================================="
echo ""

# Define the 15 core products
CORE_PRODUCTS=(
  "Email"
  "Calendar" 
  "VideoMeeting"
  "FileManager"
  "Docs"
  "Sheets"
  "Slides"
  "Forms"
  "Vids"
  "Sites"
  "Groups"
  "LMS"
  "AITutor"
  "NotebookLM"
  "Pay"
)

echo "📦 CHECKING 15 CORE PRODUCTS:"
echo "---"

for product in "${CORE_PRODUCTS[@]}"; do
  file="src/pages/${product}.jsx"
  if [ -f "$file" ]; then
    lines=$(wc -l < "$file")
    has_export=$(grep -c "export" "$file" || echo 0)
    has_return=$(grep -c "return" "$file" || echo 0)
    has_jsx=$(grep -c "<" "$file" || echo 0)
    
    if [ $lines -gt 50 ] && [ $has_export -gt 0 ] && [ $has_return -gt 0 ] && [ $has_jsx -gt 5 ]; then
      echo "✅ $product - $lines lines (COMPLETE)"
    elif [ $lines -gt 20 ]; then
      echo "⚠️  $product - $lines lines (BASIC)"
    else
      echo "❌ $product - $lines lines (INCOMPLETE)"
    fi
  else
    echo "❌ $product - FILE MISSING"
  fi
done

echo ""
echo "📄 CHECKING ALL 82 PAGES:"
echo "---"

total=0
complete=0
basic=0
incomplete=0

for file in src/pages/*.jsx; do
  if [ -f "$file" ]; then
    filename=$(basename "$file")
    lines=$(wc -l < "$file")
    has_export=$(grep -c "export" "$file" || echo 0)
    has_return=$(grep -c "return" "$file" || echo 0)
    has_jsx=$(grep -c "<" "$file" || echo 0)
    
    total=$((total + 1))
    
    if [ $lines -gt 50 ] && [ $has_export -gt 0 ] && [ $has_return -gt 0 ] && [ $has_jsx -gt 5 ]; then
      complete=$((complete + 1))
      status="✅ COMPLETE"
    elif [ $lines -gt 20 ]; then
      basic=$((basic + 1))
      status="⚠️  BASIC"
    else
      incomplete=$((incomplete + 1))
      status="❌ INCOMPLETE"
    fi
    
    printf "%-40s %4d lines - %s\n" "$filename" "$lines" "$status"
  fi
done

echo ""
echo "=============================================="
echo "📊 SUMMARY:"
echo "---"
echo "Total Pages:      $total"
echo "✅ Complete:      $complete ($(( complete * 100 / total ))%)"
echo "⚠️  Basic:         $basic ($(( basic * 100 / total ))%)"
echo "❌ Incomplete:    $incomplete ($(( incomplete * 100 / total ))%)"
echo ""

if [ $incomplete -eq 0 ]; then
  echo "🎉 ALL PAGES ARE AT LEAST BASIC LEVEL!"
else
  echo "⚠️  $incomplete pages need attention"
fi
