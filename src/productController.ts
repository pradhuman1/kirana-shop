import { Request, Response, NextFunction } from "express";
import Product from "./Product.Model";

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

  try {
    const productExists = await Product.findOne({ email: product_title });

    if (productExists) {
      return res.status(400).json({ message: "Product already exists" });
    }

    const product = await Product.create({
      productTitle: product_title,
      imgUrl: product_imgURL,
      price: product_price,
      commission: product_commision,
    });

    if (product) {
      res.status(201).json({
        _id: product._id,
        productTitle: product.productTitle,
        imgUrl: product.imgUrl,
        price: product.price,
        commission: product.commission,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }

    next();
  } catch (error) {
    next();
    res.status(500).json({
      message: `Something went wrong ${error}`,
    });
  }
};
