import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

import { getServerEnv } from "@/lib/utils/server-env";

const ALGORITHM = "aes-256-gcm";
const AUTH_TAG_BYTES = 16;
const IV_BYTES = 12;

function getEncryptionKey() {
  return createHash("sha256").update(getServerEnv().PENDING_SIGNUP_SECRET, "utf8").digest();
}

export function encryptPendingPassword(password: string) {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(password, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    passwordEncrypted: Buffer.concat([encrypted, authTag]).toString("base64"),
    passwordNonce: iv.toString("base64"),
  };
}

export function decryptPendingPassword(passwordEncrypted: string, passwordNonce: string) {
  const encryptedWithTag = Buffer.from(passwordEncrypted, "base64");
  const iv = Buffer.from(passwordNonce, "base64");
  const encrypted = encryptedWithTag.subarray(0, encryptedWithTag.length - AUTH_TAG_BYTES);
  const authTag = encryptedWithTag.subarray(encryptedWithTag.length - AUTH_TAG_BYTES);

  const decipher = createDecipheriv(ALGORITHM, getEncryptionKey(), iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}
