import { Request, Response, NextFunction } from "express";
import Product from "./Product.Model";
import { scrapProduct } from "./scrappers/index"
interface ProductBody {
  product_title: string;
  product_imgURL: string;
  product_price: string;
  product_commision: string;
}

/*id:,name:"Parl G",imgUrl:"",price:"",commission:""*/

/*


 productName: { type: String, required: true },
  imgUrl: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  price: { type: String, require: true },
  commission: { type: String, require: true },
*/

export const addProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const {
    product_title,
    product_imgURL,
    product_price,
    product_commision,
  }: ProductBody = req.body;

  console.log("req.body");
  console.log(req.body);

  try {
    const productExists = await Product.findOne({ email: product_title });

    if (productExists) {
      return res.status(400).json({ message: "Product already exists" });
    }

    const product = await Product.create({
      productTitle: product_title,
      imgCDNUrl: product_imgURL,
      price: product_price,
      commission: product_commision,
    });

    if (product) {
      res.status(201).json({
        _id: product._id,
        productTitle: product.productTitle,
        imgLink: product.imgCDNUrl,
        price: product.price,
        commission: product.commission,
      });
    } else {
      res.status(400).json({ message: "Invalid Product data" });
    }

    next();
  } catch (error) {
    next();
    res.status(500).json({
      message: `Something went wrong  ${error}`,
    });
  }
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
