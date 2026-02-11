interface EncryptedPayload {
  headers: Record<string, string>
  body: {
    algorithm: "RSA-OAEP+AES-GCM"
    payload: string
    iv: string
  }
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ""
  const chunkSize = 0x8000
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    const chunk = bytes.subarray(offset, offset + chunkSize)
    binary += String.fromCharCode(...chunk)
  }
  return btoa(binary)
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

function pemToDer(pem: string): Uint8Array {
  const normalized = pem
    .replace("-----BEGIN PUBLIC KEY-----", "")
    .replace("-----END PUBLIC KEY-----", "")
    .replace(/\s+/g, "")
  return base64ToBytes(normalized)
}

function bytesToArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(bytes.byteLength)
  new Uint8Array(buffer).set(bytes)
  return buffer
}

function getEncryptionPublicKey(): string | null {
  if (typeof window === "undefined") return null
  const fromStorage = window.localStorage.getItem("NEXUS_PASSWORD_RSA_PUBLIC_KEY")
  if (fromStorage && fromStorage.trim().length > 0) {
    return fromStorage.trim()
  }
  const fromEnv = import.meta.env.VITE_NEXUS_PASSWORD_RSA_PUBLIC_KEY
  if (typeof fromEnv === "string" && fromEnv.trim().length > 0) {
    return fromEnv.trim()
  }
  return null
}

/**
 * 若缺少公钥配置，会返回 null 并由调用方回退到明文传输。
 */
export async function encryptPayloadRSA_AES(payload: unknown): Promise<EncryptedPayload | null> {
  if (typeof window === "undefined" || !window.crypto?.subtle) return null

  const publicKeyPem = getEncryptionPublicKey()
  if (!publicKeyPem) return null

  const content = JSON.stringify(payload)
  const encoder = new TextEncoder()
  const contentBytes = encoder.encode(content)

  const aesKey = await window.crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt"],
  )

  const iv = window.crypto.getRandomValues(new Uint8Array(12))
  const encryptedContent = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    aesKey,
    contentBytes,
  )

  const rawAesKey = await window.crypto.subtle.exportKey("raw", aesKey)
  const rsaKey = await window.crypto.subtle.importKey(
    "spki",
    bytesToArrayBuffer(pemToDer(publicKeyPem)),
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    false,
    ["encrypt"],
  )

  const encryptedAesKey = await window.crypto.subtle.encrypt(
    {
      name: "RSA-OAEP",
    },
    rsaKey,
    rawAesKey,
  )

  return {
    headers: {
      "x-encryption-algorithm": "RSA-OAEP+AES-GCM",
      "x-encrypted-key": bytesToBase64(new Uint8Array(encryptedAesKey)),
    },
    body: {
      algorithm: "RSA-OAEP+AES-GCM",
      payload: bytesToBase64(new Uint8Array(encryptedContent)),
      iv: bytesToBase64(iv),
    },
  }
}
