import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Product from "../models/product.model.js";

// Get the directory of the current script
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the backend directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// KES to USD conversion rate (same as main migration)
const KES_TO_USD_RATE = 1 / 135;

// Connect to MongoDB
async function connectToDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error("❌ MONGODB_URI environment variable is not set");
      console.log("Make sure you have a .env file in the backend directory with MONGODB_URI");
      process.exit(1);
    }

    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB successfully!");
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error.message);
    process.exit(1);
  }
}

// Function to convert KES to USD and round to 2 decimal places
function convertKESToUSD(kesAmount) {
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

// IDs of products that failed in the previous migration
const failedProductIds = [
  '673b0f41afaf350dee8333a9', // Be by Breyton
  '6739dccd530941dedafb61b1', // VOSSEN HF2
  '6739e4abe9223a5f0d1e0a59', // MICHELIN PILOT SPORT 4S
  '673b28a9afaf350dee83390f', // BBS MOTOR-SPORT CH012
  '673f323ee7e42fbdad64af0d', // OS FLOW FORMED WHEELS
  '673b3258afaf350dee833ccf'  // Rays Homura 2X8GTS
];

async function fixFailedProducts() {
  console.log("\n🔧 Fixing products that failed in previous migration");
  console.log("=" .repeat(60));
  
  let fixedCount = 0;
  let stillFailingCount = 0;
  
  for (const productId of failedProductIds) {
    try {
      const product = await Product.findById(productId);
      
      if (!product) {
        console.log(`❌ Product with ID ${productId} not found`);
        continue;
      }
      
      console.log(`\n🔧 Fixing: ${product.name}`);
      
      // Store original values for logging
      const originalPrice = product.price;
      const originalBuyingPrice = product.buyingPrice;
      const originalShippingCost = product.shippingCost;
      const originalProductType = product.productType;
      const originalDeliveryTime = product.deliveryTime;
      
      // Apply fixes
      const fixes = fixProductData(product);
      
      // Convert prices (they might still be in KES if the product failed completely)
      // Check if prices look like they're still in KES (typically > 1000)
      if (product.price > 100) { // Likely still in KES
        product.price = convertKESToUSD(originalPrice);
        fixes.push('Converted price from KES to USD');
      }
      
      if (product.buyingPrice > 100) { // Likely still in KES
        product.buyingPrice = convertKESToUSD(product.buyingPrice);
        fixes.push('Converted buying price from KES to USD');
      }
      
      if (product.shippingCost > 100) { // Likely still in KES
        product.shippingCost = convertKESToUSD(originalShippingCost);
        fixes.push('Converted shipping cost from KES to USD');
      }
      
      // Save the product
      await product.save();
      
      console.log(`✅ Successfully fixed: ${product.name}`);
      console.log(`   Fixes applied: ${fixes.join(', ')}`);
      console.log(`   Price: ${originalPrice} → ${product.price}`);
      console.log(`   Buying Price: ${originalBuyingPrice} → ${product.buyingPrice}`);
      console.log(`   Shipping Cost: ${originalShippingCost} → ${product.shippingCost}`);
      console.log(`   Product Type: ${originalProductType} → ${product.productType}`);
      console.log(`   Delivery Time: "${originalDeliveryTime}" → "${product.deliveryTime}"`);
      
      fixedCount++;
      
    } catch (error) {
      console.error(`❌ Still failing to fix ${productId}:`, error.message);
      stillFailingCount++;
    }
  }
  
  console.log("\n" + "=".repeat(60));
  console.log(`✅ Fix operation completed!`);
  console.log(`   Successfully fixed: ${fixedCount} products`);
  console.log(`   Still failing: ${stillFailingCount} products`);
}

// Main function
async function main() {
  await connectToDatabase();
  
  try {
    await fixFailedProducts();
  } catch (error) {
    console.error("❌ Fix operation failed:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Database connection closed");
  }
}

// Run the script
main().catch(console.error);
