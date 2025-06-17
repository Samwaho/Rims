#!/bin/bash

echo "🔄 Currency Migration Script"
echo "=========================="
echo ""
echo "This script will help you convert all product prices from KES to USD"
echo ""

# Check if node is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed or not in PATH"
    exit 1
fi

# Navigate to the backend directory
cd "$(dirname "$0")/.."

echo "Available options:"
echo "1. Preview conversion (recommended first step)"
echo "2. Create backup and preview"
echo "3. Execute conversion (WARNING: This will modify your database!)"
echo "4. Execute with backup"
echo ""

read -p "Choose an option (1-4): " choice

case $choice in
    1)
        echo "🔍 Running preview mode..."
        node scripts/currency-migration.js
        ;;
    2)
        echo "💾 Creating backup and running preview..."
        node scripts/currency-migration.js --backup
        ;;
    3)
        echo "⚠️  WARNING: This will permanently modify your database!"
        read -p "Are you sure you want to continue? (yes/no): " confirm
        if [ "$confirm" = "yes" ]; then
            echo "🚀 Executing conversion..."
            node scripts/currency-migration.js --execute
        else
            echo "❌ Conversion cancelled"
        fi
        ;;
    4)
        echo "⚠️  WARNING: This will permanently modify your database!"
        read -p "Are you sure you want to continue? (yes/no): " confirm
        if [ "$confirm" = "yes" ]; then
            echo "💾 Creating backup and executing conversion..."
            node scripts/currency-migration.js --backup --execute
        else
            echo "❌ Conversion cancelled"
        fi
        ;;
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

echo ""
echo "✅ Script completed"
