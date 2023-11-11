import { createTransform } from "redux-persist";
import { AES, enc } from "crypto-js";

const stateEncryptor = createTransform(
  // Transform state on the way to being stored
  (inboundState, key) => {
    const stateToEncrypt = { ...inboundState };

    // Convert state to JSON
    const jsonString = JSON.stringify(stateToEncrypt);

    // Encrypt
    const encryptedString = AES.encrypt(
      jsonString,
      import.meta.env.VITE_ENCRYPTION_KEY
    ).toString();

    return encryptedString;
  },

  // Transform state being rehydrated
  (outboundState, key) => {
    // Decrypt
    const decryptedString = AES.decrypt(
      outboundState,
      import.meta.env.VITE_ENCRYPTION_KEY
    );

    // If decryption fails return empty object
    if (decryptedString.sigBytes === 0) {
      return {};
    }

    // Parse
    return JSON.parse(decryptedString.toString(enc.Utf8));
  }
);

export default stateEncryptor;
