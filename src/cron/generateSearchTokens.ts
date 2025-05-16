import Product from "../Product.Model";
import { Request, Response, NextFunction } from "express";

function tokenize(...parts: (string | undefined | null)[]): string[] {
    return parts
        .filter(Boolean)
        .flatMap(part => part!.toLowerCase().split(/\s+/))
        .filter(Boolean);
}

export const generateSearchTokens = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
    try{
        const cursor = Product.find({}).cursor();
        let count = 0;

        for await (const doc of cursor) {
            const tokens = tokenize(doc.productTitle, doc.brand, doc.weight);

            await Product.updateOne(
                { _id: doc._id },
                { $set: { searchTokens: tokens } }
            );

            count++;
            if (count % 100 === 0) {
                console.log(`Processed ${count} products...`);
                console.log(tokens);
                console.log(doc._id);
                console.log(doc.productTitle, doc.brand, doc.weight);
            }
        }

        await Product.collection.createIndex({ searchTokens: 1 });
        console.log(`Index created on 'searchTokens'`);
        console.log(`✅ Finished processing ${count} products.`);
        res.status(200).json({
            message: "Successfully created search tokens"
        })
    }catch(error){
        next();
        res.status(500).json({
          message: `Something went wrong ${error}`,
        });
    }

}