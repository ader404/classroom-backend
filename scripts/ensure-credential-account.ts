import "dotenv/config";
import { eq, and } from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";

import { db } from "../src/db/index.js";
import { account, user } from "../src/db/schema/auth.js";

const email = "mia.lopez@classroom.dev";
const plainPassword = "Teach#9012";

const run = async () => {
  const [userRecord] = await db
    .select({ id: user.id, email: user.email })
    .from(user)
    .where(eq(user.email, email));

  if (!userRecord) {
    throw new Error(`User not found for email: ${email}`);
  }

  const [existingAccount] = await db
    .select({ id: account.id })
    .from(account)
    .where(
      and(
        eq(account.providerId, "credential"),
        eq(account.accountId, email)
      )
    );

  const passwordHash = await hashPassword(plainPassword);

  if (existingAccount) {
    await db
      .update(account)
      .set({ password: passwordHash })
      .where(eq(account.id, existingAccount.id));
    console.log("Updated credential password for:", email);
    return;
  }

  const uniqueId = `acc_${userRecord.id}_${Date.now()}`;

  await db.insert(account).values({
    id: uniqueId,
    userId: userRecord.id,
    accountId: email,
    providerId: "credential",
    password: passwordHash,
  });

  console.log("Inserted credential account for:", email);
};

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
