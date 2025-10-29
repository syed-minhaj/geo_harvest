import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./drizzle"; 
import { sendEmail } from "../utils/email";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg", 
    }),
    emailAndPassword: {
        enabled: true, 
        sendResetPassword: async  ({user, url, token}, request) => {
            await sendEmail({
                email_to: user.email,
                subject: "Reset your password",
                text: `Click the link to reset your password: ${url}`,
            });
        },
        onPasswordReset: async ({ user }, request) => {
            console.log(`Password for user ${user.email} has been reset.`);
        },
    }, 
    socialProviders: {
        google: {
            prompt: "select_account",
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }
    }
});