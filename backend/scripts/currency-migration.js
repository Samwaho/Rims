import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/product.model.js";

// Load environment variables
dotenv.config();

// KES to USD conversion rate (update this with current rate)
// As of recent rates: 1 USD ≈ 130-140 KES
const KES_TO_USD_RATE = 1 / 130; // Adjust this rate as needed

// Connect to MongoDB
async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB successfully!");
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error.message);
    process.exit(1);
  }
}

// Function to convert KES to USD and round to 2 decimal places
function convertKESToUSD(kesAmount) {
  // Handle invalid numbers
  if (isNaN(kesAmount) || kesAmount === null || kesAmount === undefined) {
    return 0;
  }
  return Math.round(kesAmount * KES_TO_USD_RATE * 100) / 100;
}

// Function to fix product data issues
function fixProductData(product) {
  const fixes = [];

  // Fix NaN buyingPrice
  if (isNaN(product.buyingPrice) || product.buyingPrice === null || product.buyingPrice === undefined) {
    product.buyingPrice = 0;
    fixes.push('Fixed NaN buyingPrice');
  }

  // Fix missing deliveryTime
  if (!product.deliveryTime || product.deliveryTime.trim() === '') {
    product.deliveryTime = '3-5 business days';
    fixes.push('Added default deliveryTime');
  }

  // Fix invalid productType
  const validProductTypes = ['oem', 'aftermarket', 'alloy'];
  if (!validProductTypes.includes(product.productType)) {
    if (product.productType === 'original') {
      product.productType = 'oem';
      fixes.push('Changed productType from "original" to "oem"');
    } else {
      product.productType = 'aftermarket';
      fixes.push(`Changed invalid productType "${product.productType}" to "aftermarket"`);
    }
  }

  return fixes;
}

// Function to preview the conversion without making changes
async function previewConversion() {
  console.log("\n🔍 PREVIEW MODE - No changes will be made");
  console.log("=" .repeat(60));
  
  const products = await Product.find({}).limit(10); // Preview first 10 products
  
  console.log(`\nFound ${await Product.countDocuments()} total products in database`);
  console.log(`\nPreviewing first ${products.length} products:`);
  console.log(`Exchange Rate: 1 KES = ${KES_TO_USD_RATE.toFixed(6)} USD`);
  console.log("-".repeat(60));
  
  products.forEach((product, index) => {
    console.log(`\n${index + 1}. ${product.name}`);
    console.log(`   Current Price: KES ${product.price.toLocaleString()}`);
    console.log(`   New Price: USD ${convertKESToUSD(product.price)}`);
    console.log(`   Current Buying Price: KES ${product.buyingPrice.toLocaleString()}`);
    console.log(`   New Buying Price: USD ${convertKESToUSD(product.buyingPrice)}`);
    console.log(`   Current Shipping Cost: KES ${product.shippingCost.toLocaleString()}`);
    console.log(`   New Shipping Cost: USD ${convertKESToUSD(product.shippingCost)}`);
  });
  
  console.log("\n" + "=".repeat(60));
  console.log("Preview complete. Run with --execute flag to perform actual conversion.");
}

// Function to perform the actual conversion
async function executeConversion() {
  console.log("\n⚠️  EXECUTING CONVERSION - This will modify your database!");
  console.log("=" .repeat(60));
  
  const totalProducts = await Product.countDocuments();
  console.log(`\nConverting ${totalProducts} products from KES to USD...`);
  console.log(`Exchange Rate: 1 KES = ${KES_TO_USD_RATE.toFixed(6)} USD`);
  
  let convertedCount = 0;
  let errors = [];
  
  // Process products in batches to avoid memory issues
  const batchSize = 100;
  let skip = 0;
  
  while (skip < totalProducts) {
    const products = await Product.find({}).skip(skip).limit(batchSize);
    
    for (const product of products) {
      try {
        const originalPrice = product.price;
        const originalBuyingPrice = product.buyingPrice;
        const originalShippingCost = product.shippingCost;

        // Fix any data issues first
        const fixes = fixProductData(product);

        // Convert prices
        product.price = convertKESToUSD(originalPrice);
        product.buyingPrice = convertKESToUSD(product.buyingPrice); // Use fixed value
        product.shippingCost = convertKESToUSD(originalShippingCost);

        // Save the updated product
        await product.save();
        
        convertedCount++;
        
        // Log progress every 50 products
        if (convertedCount % 50 === 0) {
          console.log(`✅ Converted ${convertedCount}/${totalProducts} products...`);
        }
        
        // Log first few conversions for verification
        if (convertedCount <= 5) {
          console.log(`\n${convertedCount}. ${product.name}`);
          console.log(`   Price: KES ${originalPrice.toLocaleString()} → USD ${product.price}`);
          console.log(`   Buying Price: KES ${originalBuyingPrice.toLocaleString()} → USD ${product.buyingPrice}`);
          console.log(`   Shipping Cost: KES ${originalShippingCost.toLocaleString()} → USD ${product.shippingCost}`);
          if (fixes.length > 0) {
            console.log(`   Fixes applied: ${fixes.join(', ')}`);
          }
        }
        
      } catch (error) {
        errors.push({
          productId: product._id,
          productName: product.name,
          error: error.message
        });
        console.error(`❌ Error converting product ${product.name}:`, error.message);
      }
    }
    
    skip += batchSize;
  }
  
  console.log("\n" + "=".repeat(60));
  console.log(`✅ Conversion completed!`);
  console.log(`   Successfully converted: ${convertedCount} products`);
  console.log(`   Errors: ${errors.length}`);
  
  if (errors.length > 0) {
    console.log("\n❌ Products with errors:");
    errors.forEach(error => {
      console.log(`   - ${error.productName} (${error.productId}): ${error.error}`);
    });
  }
}

// Function to create a backup of current prices
async function createBackup() {
  console.log("\n💾 Creating backup of current prices...");
  
  const products = await Product.find({}, 'name price buyingPrice shippingCost');
  const backup = {
    timestamp: new Date().toISOString(),
    exchangeRate: KES_TO_USD_RATE,
    products: products.map(p => ({
      id: p._id,
      name: p.name,
      originalPrice: p.price,
      originalBuyingPrice: p.buyingPrice,
      originalShippingCost: p.shippingCost
    }))
  };
  
  // You could save this to a file or database collection
  console.log(`✅ Backup created for ${products.length} products`);
  console.log("   (Consider saving this backup data to a file for safety)");
  
  return backup;
}

// Main function
async function main() {
  await connectToDatabase();
  
  const args = process.argv.slice(2);
  const shouldExecute = args.includes('--execute');
  const shouldBackup = args.includes('--backup');
  
  try {
    if (shouldBackup) {
      await createBackup();
    }
    
    if (shouldExecute) {
      console.log("\n⚠️  WARNING: This will permanently modify all product prices in your database!");
      console.log("Make sure you have a backup before proceeding.");
      console.log("Press Ctrl+C to cancel, or wait 10 seconds to continue...");
      
      // Wait 10 seconds before executing
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      await executeConversion();
    } else {
      await previewConversion();
    }
    
  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Database connection closed");
  }
}

// Handle script arguments and run
if (process.argv[1].endsWith('currency-migration.js')) {
  main().catch(console.error);
}

export { convertKESToUSD, previewConversion, executeConversion };
