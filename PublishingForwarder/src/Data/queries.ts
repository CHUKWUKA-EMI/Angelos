import { connectDB } from "./databaseConnection";

export async function getSubscriptionDetails(
  topicId: string,
  publisherAppId: string
) {
  const query = {
    text: `SELECT * FROM subscription WHERE "topicId" = $1 AND "publisherAppId" = $2 LIMIT 1`,
    values: [topicId, publisherAppId],
  };
  try {
    const res = await connectDB().query(query);
    return res.rows[0];
  } catch (error) {
    console.log("Error getting subscription details", error);
  } finally {
    await connectDB().end();
  }
}

export async function getAssignedTopics(publisherAppId: string) {
  const query = {
    text: `SELECT name FROM topic WHERE id IN (SELECT "topicId" FROM subscription WHERE "publisherAppId" = $1)`,
    values: [publisherAppId],
  };
  try {
    const res = await connectDB().query(query);

    return res.rows;
  } catch (error) {
    console.log("Error getting subscription details", error);
  } finally {
    await connectDB().end();
  }
}
