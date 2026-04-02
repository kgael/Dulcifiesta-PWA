import webpush from 'web-push'
import dotenv from 'dotenv'

dotenv.config()

const publicKey = process.env.VAPID_PUBLIC_KEY
const privateKey = process.env.VAPID_PRIVATE_KEY
const subject = process.env.VAPID_SUBJECT || 'mailto:example@example.com'

if (!publicKey || !privateKey) {
  throw new Error('Faltan VAPID_PUBLIC_KEY o VAPID_PRIVATE_KEY en backend/.env')
}

webpush.setVapidDetails(subject, publicKey, privateKey)

export const VAPID_PUBLIC_KEY = publicKey
export { webpush }
