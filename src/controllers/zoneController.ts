import { Request, Response, NextFunction } from "express";
import Zone from "../models/Zone.Model";
import { IZone } from "../interface/zone.interface";

export const addZone = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { locationCoordinates, backupZones }: IZone = req.body;
    const zone = await Zone.create({
      locationCoordinates,
      backupZones,
    });
    return res.status(200).json({
      message: `Zone created with ID: ${zone._id}`,
    });
  } catch (error) {
    res.status(500).json({
      message: `Something went wrong: ${error}`,
    });
  }
};
