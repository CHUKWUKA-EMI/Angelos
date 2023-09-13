import { Request, Response } from "express";
import { Topic } from "../Entities/Topic";
import { User } from "../Entities/User";
import { CreateTopic } from "src/interfaces/createTopic";
import { validate } from "class-validator";

export const createTopic = async (req: Request, res: Response) => {
  const body = req.body as CreateTopic;
  if (!body.topicName) {
    return res.status(400).json({ message: "invalid topic name" });
  }
  try {
    const user = await User.findOneBy({ id: (req as any).userId });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Server couldn't obtain current user's info" });
    }
    const existingTopic = await Topic.findOne({
      where: { name: `Angelos-core/topics/${user.email}/${body.topicName}` },
    });

    if (existingTopic) {
      return res.status(400).json({
        message: `A topic with name ${body.topicName} already exists for this account.`,
      });
    }
    const topic = Topic.create({
      name: body.topicName.replace(/\s/g, ""),
      owner: user,
    });

    const errors = await validate(topic);
    if (errors.length > 0) {
      return {
        success: false,
        errors,
      };
    }

    const topicData = await topic.save();
    const {
      owner: { password, topics, ...restOwnerData },
      ...restData
    } = topicData;
    return res.status(201).json({
      message: "Topic created successfully",
      data: { ...restData, owner: { ...restOwnerData } },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error occured while creating topic" });
  }
};
