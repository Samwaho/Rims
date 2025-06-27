import mongoose from "mongoose";
import Product from "../models/product.model.js";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Use environment variable for MongoDB URI, fallback to hardcoded for backward compatibility
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://wheelshubke:eqNNM7aPKIIFBAWZ@wheelshub.8zsiy.mongodb.net/RimsDB?retryWrites=true&w=majority&appName=WheelsHub";

if (!MONGODB_URI) {
  console.error("MONGODB_URI is not defined in environment variables");
  process.exit(1);
}

// Category mapping from old to new
const categoryMapping = {
  "general": "accessories",
  "wheels": "rims",
  "tyres": "tyres"
};

async function migrateCategories() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB successfully");

    // Get all products
    const products = await Product.find({});
    console.log(`Found ${products.length} products to migrate`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const product of products) {
      try {
        const oldCategory = product.category;
        const newCategory = categoryMapping[oldCategory];

        if (!newCategory) {
          console.log(`Skipping product ${product._id}: unknown category "${oldCategory}"`);
          skippedCount++;
          continue;
        }

        if (oldCategory === newCategory) {
          console.log(`Skipping product ${product._id}: category already correct`);
          skippedCount++;
          continue;
        }

        // Update category
        product.category = newCategory;

        // Add default values for new required fields based on category
        if (newCategory === "rims" || newCategory === "offroad-rims") {
          if (!product.brand) product.brand = "Unknown";
          if (!product.model) product.model = "Standard";
          if (!product.wheelDiameter) product.wheelDiameter = 17;
          if (!product.wheelWidth) product.wheelWidth = 7;
          if (!product.offset) product.offset = 40;
          if (!product.boltPattern) product.boltPattern = "5x114.3";
        } else if (newCategory === "tyres") {
          if (!product.brand) product.brand = "Unknown";
          if (!product.model) product.model = "Standard";
          if (!product.loadIndex) product.loadIndex = "91";
          if (!product.speedRating) product.speedRating = "V";
          if (!product.treadDepth) product.treadDepth = 8;
        } else if (newCategory === "accessories") {
          if (!product.compatibility) product.compatibility = ["Universal"];
        }

        await product.save();
        console.log(`Updated product ${product._id}: ${oldCategory} -> ${newCategory}`);
        updatedCount++;

      } catch (error) {
        console.error(`Error updating product ${product._id}:`, error.message);
      }
    }

    console.log("\nMigration completed!");
    console.log(`Updated: ${updatedCount} products`);
    console.log(`Skipped: ${skippedCount} products`);

  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run migration if this file is executed directly
// This works better across different platforms and module systems
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log("🚀 Starting category migration...");
  migrateCategories();
}

export default migrateCategories; 