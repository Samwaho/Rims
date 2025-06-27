# Product Category System

This document explains the new flexible product category system that supports different fields for different product types.

## Overview

The system now supports 5 main product categories, each with their own specific fields and validation rules:

1. **Rims** - Standard automotive wheels
2. **Off-Road Rims** - Rugged wheels for off-road vehicles
3. **Tyres** - Automotive tires
4. **Accessories** - General automotive accessories
5. **Cars** - Used vehicles

## Category-Specific Fields

### Common Fields (All Categories)
- `name` - Product name
- `description` - Product description
- `price` - Selling price
- `buyingPrice` - Cost price
- `shippingCost` - Shipping cost
- `deliveryTime` - Delivery time
- `stock` - Stock quantity
- `images` - Product images
- `category` - Product category
- `madeIn` - Country of origin (optional)
- `specifications` - Custom specifications
- `productType` - OEM, Aftermarket, or Alloy
- `condition` - New or Used

### Rims & Off-Road Rims
**Required Fields:**
- `size` - Wheel size
- `brand` - Brand name
- `model` - Model name
- `wheelDiameter` - Diameter in inches (13-26)
- `wheelWidth` - Width in inches (4-15)
- `offset` - Offset in mm
- `boltPattern` - Bolt pattern (e.g., "5x114.3")

### Tyres
**Required Fields:**
- `size` - Tyre size
- `brand` - Brand name
- `model` - Model name
- `loadIndex` - Load index (e.g., "91")
- `speedRating` - Speed rating (e.g., "V")
- `treadDepth` - Tread depth in mm

### Cars
**Required Fields:**
- `brand` - Car brand
- `model` - Car model
- `year` - Manufacturing year (1900-current)
- `mileage` - Mileage in km
- `fuelType` - Petrol, Diesel, Electric, Hybrid, or LPG
- `transmission` - Manual, Automatic, or CVT

### Accessories
**Required Fields:**
- `compatibility` - Array of compatible vehicles

**Optional Fields:**
- `size` - Size (if applicable)
- `brand` - Brand name
- `model` - Model name

## Database Schema

The MongoDB schema uses conditional validation where fields are only required based on the selected category. This is achieved using Mongoose's conditional validation functions.

## Frontend Implementation

### Form Validation
The frontend uses Zod schemas with discriminated unions to provide type-safe validation based on the selected category.

### Dynamic Form Fields
The ProductForm component dynamically renders different fields based on the selected category:

1. **Category Selection** - User selects a category
2. **Field Rendering** - Form shows only relevant fields for that category
3. **Template Specifications** - Pre-defined specifications are loaded based on category
4. **Validation** - Category-specific validation rules are applied

### Type Safety
TypeScript interfaces ensure type safety across the application:

```typescript
interface Product {
  // Common fields...
  category: ProductCategory;
  
  // Category-specific fields (optional)
  wheelDiameter?: number;
  loadIndex?: string;
  year?: number;
  compatibility?: string[];
}
```

## Migration

A migration script is provided to update existing products to the new category structure:

```bash
node backend/scripts/migrate-categories.js
```

The migration:
1. Maps old categories to new ones
2. Adds default values for new required fields
3. Preserves existing data
4. Reports migration results

## Usage Examples

### Creating a Rim Product
```javascript
const rimProduct = {
  name: "Sport Rim 18\"",
  category: "rims",
  brand: "BBS",
  model: "CH-R",
  wheelDiameter: 18,
  wheelWidth: 8.5,
  offset: 35,
  boltPattern: "5x114.3",
  // ... other fields
};
```

### Creating a Tyre Product
```javascript
const tyreProduct = {
  name: "Summer Tyre 225/45R17",
  category: "tyres",
  brand: "Michelin",
  model: "Pilot Sport 4",
  loadIndex: "91",
  speedRating: "V",
  treadDepth: 8,
  // ... other fields
};
```

### Creating a Car Product
```javascript
const carProduct = {
  name: "Toyota Camry 2020",
  category: "cars",
  brand: "Toyota",
  model: "Camry",
  year: 2020,
  mileage: 50000,
  fuelType: "petrol",
  transmission: "automatic",
  // ... other fields
};
```

## Benefits

1. **Flexibility** - Each category can have its own specific fields
2. **Type Safety** - Full TypeScript support with discriminated unions
3. **Validation** - Category-specific validation rules
4. **User Experience** - Dynamic forms that only show relevant fields
5. **Maintainability** - Clear separation of concerns
6. **Scalability** - Easy to add new categories or fields

## Future Enhancements

The system is designed to be easily extensible:

1. **New Categories** - Add new categories by extending the schema and form
2. **Custom Fields** - Add category-specific fields as needed
3. **Advanced Validation** - Implement more complex validation rules
4. **Field Dependencies** - Add conditional field requirements
5. **Category Hierarchies** - Support subcategories if needed 