/**
 * Generate or retrieve certificate for captcha
 * Certificate is a unique ID per browser session to link captcha generation and validation
 */
export const getCertificate = (): string => {
  const STORAGE_KEY = "captcha_certificate"

  let certificate = sessionStorage.getItem(STORAGE_KEY)

  if (!certificate) {
    certificate = `cert_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    sessionStorage.setItem(STORAGE_KEY, certificate)
  }

  return certificate
}
