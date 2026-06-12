import twilio from "twilio";

function getTwilioVerifyService() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

    if (!accountSid || !authToken || !serviceSid) {
        throw new Error(
            "Twilio is not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_VERIFY_SERVICE_SID.",
        );
    }

    return twilio(accountSid, authToken).verify.v2.services(serviceSid);
}

export async function sendPhoneOtp(phone: string) {
    const verification = await getTwilioVerifyService().verifications.create({
        to: phone,
        channel: "sms",
    });

    return {
        status: verification.status,
    };
}

export async function verifyPhoneOtp(phone: string, otp: string) {
    const verification = await getTwilioVerifyService().verificationChecks.create({
        to: phone,
        code: otp,
    });

    return {
        verified: verification.status === "approved",
        status: verification.status,
    };
}
