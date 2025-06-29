'use client'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../../firebase";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp';
import { REGEXP_ONLY_DIGITS } from 'input-otp'
export default function Home() {
  const [recaptchaVerifier, setRecaptchaVerifier] = useState(null);
  useEffect(() => {
    const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
    }
  );
    setRecaptchaVerifier(recaptchaVerifier);
    return () => {
      recaptchaVerifier.clear();
    };
  }, [auth]);

  
  const [fingerprint, setFingerprint] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fingerprintverify, setFingerprintVerify] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [otp, setOtp] = useState('');
  const [phone, setPhone] = useState('');

  const router = useRouter();
  useEffect(() => {
    setError(''); // Reset error message on component mount
    if (otp.length === 6) {
      // Here you can handle the OTP submission, e.g., send it to your server for verification
      verifyOTP(otp);
    }
  }, [otp])

  const verifyOTP = async (otp) => {
    
    try {
      // Assuming confirmation is a Firebase confirmation object
      await confirmationResult?.confirm(otp);
      console.log('OTP verified successfully:');
      router.push('/dashboard'); // Redirect to dashboard or another page after successful verification
      //  return
      // Handle successful verification, e.g., redirect or show success message
    } catch (error) {
      if (error.code === 'auth/invalid-verification-code') {
        setError('Invalid OTP. Please try again.');
      }
      else {
        setError('An error occurred while verifying the OTP. Please try again.');
      }
    }
  }

  const handleFingerprint = async () => {
   try{ setLoading(true);
    setError("");
    const fingerResponse = (await axios.get("/api/fingerverify"));
    if (fingerResponse.data.verify === -1) {
      setError("Fingerprint verification failed.");
    } else {
      setFingerprint(fingerResponse.data.verify);
      const res = await (await axios.post("/api/login", { finger: fingerResponse.data.verify })).data
      const user = res.user;
      setPhone(user.phone);
      const confirmation = await signInWithPhoneNumber(auth, "+91" + user.phone || '+91 7259457305', recaptchaVerifier);
      setConfirmationResult(confirmation);
      setFingerprintVerify(true);
    }} catch (error) {
      if (error.code === 'auth/invalid-phone-number') {
        setError("Invalid phone number format. Please check and try again.");
      }
      else if (error.code === 'auth/missing-phone-number') {
        setError("Phone number is missing. Please ensure you have provided a valid phone number.");
      }
      else {
        setError("An error occurred during phone number verification: " + (error?.message || "Unknown error"));
      }
    }
    finally {
      setLoading(false);
    }
  };

return (
  <div className=" min-h-[80vh] flex items-center justify-center bg-background">
    {!fingerprintverify && <Card>

      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Login using your Fingerprint</CardDescription>
      </CardHeader>
      <CardContent>

        <div className="mb-4">
          <label className="block mb-1 font-medium">Fingerprint</label>
          <Button type="button" variant="secondary" className="w-full mb-2" onClick={() => { handleFingerprint() }} disabled={loading}>
            {fingerprint ? "Fingerprint Captured" : loading ? "Verifying..." : "Scan Fingerprint"}
          </Button>
          {loading && (
            <div className="flex justify-center mt-2">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          )}
        </div>
        {error && <div className="text-destructive text-sm mb-2">{error}</div>}
        <div className="text-center mt-4">
          <span className="text-sm text-muted-foreground">Not registered?</span>{' '}
          <Link href="/register" className="text-primary underline ml-1">Register here</Link>
        </div>

        

      </CardContent>

    </Card>}
    {
      fingerprintverify && <Card>

        <CardHeader>
          <CardTitle>Enter OTP</CardTitle>
          <CardDescription>Enter OTP sent to registered Phone No. XXXXXXXX{phone.substring(phone.length - 2)}</CardDescription>
        </CardHeader>
        <CardContent>

          <div className="mb-4 flex items-center justify-center">
            <InputOTP maxLength={6} value={otp} onChange={
              (e) => {
                setOtp(e);
              }
            } patten={REGEXP_ONLY_DIGITS} >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          {error && <div className="text-destructive text-sm mb-2">{error}</div>}




        </CardContent>


      </Card>
    }
    <div id="recaptcha-container"></div>
  </div>
);
}
