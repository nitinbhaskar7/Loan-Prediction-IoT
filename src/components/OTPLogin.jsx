import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from './ui/input-otp'
import { REGEXP_ONLY_DIGITS } from 'input-otp'
import { useRouter } from 'next/navigation'
const OTPLogin = ({confirmation}) => {
  const [otp, setOtp] = React.useState('');
  const [error, setError] = React.useState('');
  const router = useRouter();
  useEffect(()=>{
    setError(''); // Reset error message on component mount
    if (otp.length === 6) {
      // Here you can handle the OTP submission, e.g., send it to your server for verification
      verifyOTP(otp);
    }
  }, [otp])

  const verifyOTP = async (otp) => {
    try {
      // Assuming confirmation is a Firebase confirmation object
      await confirmation?.confirm(otp);
      console.log('OTP verified successfully:');
    //  router.push('/dashboard'); // Redirect to dashboard or another page after successful verification
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

  return (
    <Card>

      <CardHeader>
        <CardTitle>Enter OTP</CardTitle>
        <CardDescription>Enter OTP sent to registered Phone No. XXXXXXXX05</CardDescription>
      </CardHeader>
      <CardContent>

        <div className="mb-4 flex items-center justify-center">
          <InputOTP maxLength={6} value={otp} onChange={
            (e) => {
              setOtp(e);
            }
          }   patten={REGEXP_ONLY_DIGITS} >
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
  )
}

export default OTPLogin
