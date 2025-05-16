import { Request, Response, NextFunction } from "express";
import Product from "./Product.Model";
import { scrapProduct } from "./scrappers/index"
import fs from 'fs';
import csv from 'csv-parser';


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
  variants?: [SearchProductResult],
  imagesUrl: [string],
}

function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
}

export const searchProducts = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
  try{
    const {searchTerm} = req.body;
    if (!searchTerm) throw new Error("No search term provided");
    const tokens = tokenize(searchTerm);

    let globalSearchResults = await Product.find({
      searchTokens: { $in: tokens }
    }).limit(100);

    if (globalSearchResults.length === 0) {
      const regexes = tokens.map(token => new RegExp(token, "i"));

      globalSearchResults = await Product.find({
        $or: [
          { productTitle: { $in: regexes } },
          { brand: { $in: regexes } },
          { weight: { $in: regexes } }
        ]
      }).limit(100);
    }

    const globalRankedResults = globalSearchResults
      .map(doc => {
        const combinedText = `${doc.productTitle} ${doc.brand} ${doc.weight}`.toLowerCase();
        const matchCount = tokens.filter(token => combinedText.includes(token)).length;
        return { doc, score: matchCount };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 20)
      .map(result => result.doc);

    
    
    
    res.status(200).json(globalRankedResults);

  }catch(error){
    next();
    res.status(500).json({
      message: `Something went wrong  ${error}`,
    });
  }
}


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
