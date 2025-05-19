import { Request, Response, NextFunction } from "express";
import Product from "../models/Product.Model";
import { scrapProduct } from "../scrappers/index"
import fs from 'fs';
import csv from 'csv-parser';
import {
  getAllInventory
} from "./InventoryController"

interface ProductBody {
  productTitle: string;
  scrappedSource: string;
  scrappedUrl: string;
  weight: string;
  price: string;
  scrappedSellingPrice: string;
  category: [string]
  ean: string;
  packDesc: string;
  brand: string;
  unit: string;
  variantIds: [string | Number];
  imagesUrl: [string]
  commission: string;
}

/*id:,name:"Parl G",imgUrl:"",price:"",commission:""*/

/*


 productName: { type: String, required: true },
  imgUrl: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  price: { type: String, require: true },
  commission: { type: String, require: true },
*/




// export const addProduct = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<any> => {
//   const {
//     product_title,
//     product_imgURL,
//     product_price,
//     product_commision,
//   }: ProductBody = req.body;

//   console.log("req.body");
//   console.log(req.body);

//   try {
//     const productExists = await Product.findOne({ email: product_title });

//     if (productExists) {
//       return res.status(400).json({ message: "Product already exists" });
//     }

//     const product = await Product.create({
//       productTitle: product_title,
//       imgCDNUrl: product_imgURL,
//       price: product_price,
//       commission: product_commision,
//     });

//     if (product) {
//       res.status(201).json({
//         _id: product._id,
//         productTitle: product.productTitle,
//         imgLink: product.imgCDNUrl,
//         price: product.price,
//         commission: product.commission,
//       });
//     } else {
//       res.status(400).json({ message: "Invalid Product data" });
//     }

//     next();
//   } catch (error) {
//     next();
//     res.status(500).json({
//       message: `Something went wrong  ${error}`,
//     });
//   }
// };

export const bulkUploadProducts = async(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try{
    const filePath = req.file?.path;
    if (!filePath) {
      res.status(400).send('No file uploaded');
      return;
    }

    const mongoIDMap = new Map<string, any>(); 
    const variantIDMap = new Map<string, any>(); 

    const rows: any = [];

    fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row: any) => rows.push(row))
    .on('end', async () => {
      try{
        for (const row of rows){
          const images = row.imagesUrl?.split(',').map((i: string) => i.trim()).filter(Boolean) || [];
          const categories = row.category?.split(',').map((c: string) => c.trim()).filter(Boolean) || [];
          const doc = new Product({
            productTitle: row.productTitle,
            scrappedSource: row.source,
            scrappedUrl: row.url,
            weight: row.weight,
            price: row.mrp,
            scrappedSellingPrice: row.sellingPrice,
            category: categories,
            imagesUrl: images,
            ean: row.ean,
            packDesc: row.packDesc,
            brand: row.brand,
            unit: row.unit,
            variantIds: []
          })
          const saved = await doc.save();
          // console.log(`entry saved with ${saved._id}`);
          mongoIDMap.set(row.scrappedId, saved._id);
          if (row.childrenIds && row.childrenIds.length > 0){
            const variantIDs = row.childrenIds?.split(',').map((id: string) => id.trim()).filter(Boolean) || [];
            variantIDs.push(row.scrappedId);
            for (const variantID of variantIDs){
              if (variantIDMap.has(variantID)) {
                console.log(`${variantID} was encountered before`)
                console.log(`${variantIDMap.get(variantID)}`)
                console.log(`${variantIDs}`)
              }
              const others = variantIDs.filter((id: string) => id !== variantID);
              variantIDMap.set(variantID, others);
            }
          }
        }

        await updateVariantIDs(mongoIDMap, variantIDMap);

        res.status(200).json({
          message: "Successfully inserted data"
        })

      }catch (error) {
        res.status(500).json({
          message: `Something went wrong ${error}`,
        });
      }
      fs.unlinkSync(filePath);
    })

  }catch(error) {
    next();
    res.status(500).json({
      message: `Something went wrong ${error}`,
    });
  }
};

const updateVariantIDs = async(
    mongoIDMap: Map<string, any>,
    variantIDMap: Map<string, any> 
) => {
  const bulkOps = [];

  for (const [scrappedId, variantScrappedIds] of variantIDMap.entries()) {
    const mongoId = mongoIDMap.get(scrappedId);
    if (!mongoId) {
      console.log(`mongoId not found for ${scrappedId}`);
      continue;
    }

    const variantMongoIds = variantScrappedIds
      .map((id: string) => mongoIDMap.get(id))
      .filter(Boolean);

    const update = {
      updateOne: {
        filter: { _id: mongoId },
        update: { $set: { variantIds: variantMongoIds } },
      },
    };

    bulkOps.push(update);
  }

  if (bulkOps.length > 0) {
    try {
      await Product.bulkWrite(bulkOps);
    } catch (err) {
      console.error("bulkWrite failed:", err);
    }
  }
};

interface SearchProductResult {
  productID: string,
  productTitle: string,
  weight: string,
  price: string,
  brand: string,
  variants?: SearchProductResult[],
  imagesUrl: string[],
}

function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
}

export const searchProductByEan = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any>  => {
  try {
    const { ean } = req.body;
    if (!ean) throw new Error("No ean provided");

    const productData = await Product.findOne({ ean });

    if (productData) {
      const finalResult: SearchProductResult = {
        productID: productData._id.toString(),
        productTitle: productData.productTitle?? "",
        weight: productData.weight?? "",
        price: productData.price?? "",
        brand: productData.brand?? "",
        imagesUrl: productData.imagesUrl || [],
      };

      return res.status(200).json(finalResult);
    } else {
      return res.status(404).json({ message: "Product not found" });
    }

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: `Something went wrong: ${error}`,
    });
  }
}

export const searchProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { searchTerm, page = 1, pageSize = 100 } = req.body;
    const zoneId = "123"; // to be changed
    const userType = "KIRANA"; // to be changed

    if (!searchTerm) throw new Error("No search term provided");

    const tokens = tokenize(searchTerm);
    const fetchLimit = 1000;
    const skip = (page - 1) * pageSize;

    // Stage 1: Search using searchTokens
    const tokenResults = await Product.find({
      searchTokens: { $in: tokens }
    }).skip(skip).limit(fetchLimit);

    let regexResults: any[] = [];

    // Stage 2: If results are not enough, fetch from regex
    if (tokenResults.length < fetchLimit) {
      const regexes = tokens.map(token => new RegExp(token, "i"));
      regexResults = await Product.find({
        $or: [
          { productTitle: { $in: regexes } },
          { brand: { $in: regexes } },
          { weight: { $in: regexes } }
        ]
      }).skip(skip).limit(fetchLimit);
    }

    // Stage 3: Deduplicate
    const deduplicatedMap = new Map<string, any>();
    for (const doc of [...tokenResults, ...regexResults]) {
      deduplicatedMap.set(doc._id.toString(), doc);
    }
    const deduplicatedResults = Array.from(deduplicatedMap.values());

    // Stage 4: Rank
    const globalRankedResults = deduplicatedResults
      .map(doc => {
        const combinedText = `${doc.productTitle} ${doc.brand} ${doc.weight}`.toLowerCase();
        const matchCount = tokens.filter(token => combinedText.includes(token)).length;
        return { doc, score: matchCount };
      })
      .sort((a, b) => b.score - a.score)
      .map(result => result.doc);

    // Stage 5: Filter by userType and inventory
    const zoneInventoryData = await getAllInventory(zoneId);
    const filteredResults = filterResults(userType, globalRankedResults, zoneInventoryData);

    // Stage 6: Final pagination on filtered data
    const paginatedResults = filteredResults.slice(0, pageSize);

    // Stage 7: Shape response
    const finalResults: SearchProductResult[] = [];

    // Stage 9: Fetch variants data
    for (const filteredFinalResult of paginatedResults) {
      // Resolve variants
      let variantResults: SearchProductResult[] | undefined;

      if (filteredFinalResult.variantIds?.length) {
        const rawVariants: any[] = [];

        const missingVariantIds: string[] = [];

        // check if variant data was already fetched
        for (const id of filteredFinalResult.variantIds) {
          const strId = id.toString();
          const variantDoc = deduplicatedMap.get(strId);
          if (variantDoc) {
            rawVariants.push(variantDoc);
          } else {
            missingVariantIds.push(strId);
          }
        }

        // Fetch only missing ones from DB
        if (missingVariantIds.length > 0) {
          const fetchedVariants = await Product.find({
            _id: { $in: missingVariantIds },
          });
          rawVariants.push(...fetchedVariants);
        }

        // Filter variants data
        const filteredVariants = filterResults(
          userType,
          rawVariants,
          zoneInventoryData
        );
        
        // Shape variants data
        variantResults = filteredVariants.map(v => ({
          productID: v._id,
          productTitle: v.productTitle,
          weight: v.weight,
          price: v.price,
          brand: v.brand,
          variants: [], // Nested variants not needed (1-level deep only)
          imagesUrl: v.imagesUrl,
        }));
      }

      // Shape parent product
      finalResults.push({
        productID: filteredFinalResult._id,
        productTitle: filteredFinalResult.productTitle,
        weight: filteredFinalResult.weight,
        price: filteredFinalResult.price,
        brand: filteredFinalResult.brand,
        variants: variantResults,
        imagesUrl: filteredFinalResult.imagesUrl,
      });
    }
    res.status(200).json({
      products: finalResults
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: `Something went wrong: ${error}`,
    });
  }
};

const filterResults = (
  userType: string,
  productData: any[],
  inventoryData: any[]
): any[] => {
  const inventoryMap = new Map<string, any>();

  for (const inv of inventoryData) {
    inventoryMap.set(inv.productId.toString(), inv);
  }

  if (userType === "CONSUMER") {
    return productData.filter((product) => {
      const inv = inventoryMap.get(product._id.toString());
      return inv && !inv.markUnavailable;
    });
  }

  if (userType === "KIRANA") {
    return productData.filter(
      (product) => !inventoryMap.has(product._id.toString())
    );
  }
  return [];
};


export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const productList = await Product.find({});
    console.log("product list data");
    console.log(productList);
    res.status(200).json({ productList: productList });
  } catch (error) {
    next();
    res.status(500).json({
      message: `Something went wrong  ${error}`,
    });
  }
};

interface ProductUpdateType {
  productId: string | Number;
  dataToModify: {
    productTitle?: string;
    imgCDNUrl?: string;
    price?: string;
    commission?: string;
  };
}

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { productId, dataToModify }: ProductUpdateType = req.body;

    // console.log("data to modify");
    // console.log(dataToModify);

    const productDetailInDb = await Product.findById({ _id: productId });

    console.log("productdetails in db");
    console.log(productDetailInDb);
    console.log("dataToModify");
    console.log(dataToModify);
    if (!productDetailInDb)
      return res.status(404).json({ message: "Product dosent exists" });

    const productDataToModify = Object.assign(productDetailInDb, dataToModify);

    // console.log("product details in db");
    // console.log(productDetailInDb);

    console.log("merged data");
    console.log(productDataToModify);

    const modifiedProductData = await Product.findOneAndUpdate(
      {
        _id: productId,
      },
      productDataToModify
    );

    res.status(200).json({
      modifiedProductData: productDataToModify,
    });
  } catch (error) {
    next();
    res.status(500).json({
      message: `Something went wrong  ${error}`,
    });
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.body;

    const result = await Product.findByIdAndDelete(productId);

    res.status(200).json({
      message: `Product with ${productId} deleted successfully`,
    });
  } catch (error) {
    next();
    res.status(500).json({
      message: `Something went wrong  ${error}`,
    });
  }
};

export const generateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const {
    ean,
  } = req.body;

  console.log("req.body");
  console.log(req.body);

  try {

    const product = await scrapProduct(ean)

    if (product) {
      res.status(201).json(product);
    } else {
      res.status(400).json({ message: "Product not found" });
    }

    next();
  } catch (error) {
    next();
    res.status(500).json({
      message: `Something went wrong  ${error}`,
    });
  }
};
