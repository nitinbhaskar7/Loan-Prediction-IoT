'use client';
import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { signOut } from 'firebase/auth';
import { auth } from '../../../firebase';
import Link from 'next/link';


const DashboardPage = () => {


  const [loanAmount, setLoanAmount] = useState("");
  const [loanTerm, setLoanTerm] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();


  const handleLoan = async () => {
    try {
        if (!loanAmount || !loanTerm) {
          setError("Please fill all fields.");
          return;
        }
        if(loanAmount > result) {
          setError("Loan amount exceeds the predicted limit.");
          return;
        }
        const response = await axios.post('/api/apply-loan', {
          loanAmount: loanAmount,
          loanTerm: loanTerm
        });

        if(response.data.success) {
          alert("Loan application submitted successfully!");
        }
    }
    catch (err) {
      console.error("Error applying for loan:", err);
      setError("Failed to apply for loan. Please try again.");
    }
  }


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    if (!loanTerm) {
      setError("Please fill all fields.");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post('/api/predict', {
        loanTerm
      });
      const data = response.data;
      console.log(data);
      setResult(Math.floor(data.result));
    } catch (err) {
      setError("Prediction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-background">
      <Card>

        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>User Dashboard </CardTitle>
            <CardDescription>Predict your loan default risk</CardDescription>
            <div className="flex justify-between mt-2">
              <Button asChild>
                <Link href="/dashboard/loans">
                My Loans 
                </Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="text-sm"
                onClick={async () => {
                  try {
                    await signOut(auth);
                    await axios.get('/api/logout');

                    router.push('/'); // Redirect to home page after logout 

                  } catch (e) {
                    alert('Logout failed.');
                  }
                }}
              >
                Logout
              </Button>
            </div>
          </CardHeader>
          <CardContent>
           {result != null && <div className="mb-4">
              <label className="block mb-1 font-medium">Loan Amount (Rs.)</label>
              <input
                type="number"
                min="0"
                className="w-full px-4 py-2 border rounded-md bg-background text-foreground"
                value={loanAmount}
                onChange={e => setLoanAmount(e.target.value.replace(/\D/g, ""))}
              />
            </div>}
            <div className="mb-4">
              <label className="block mb-1 font-medium">Loan Amount Term (days)</label>
              <input
                type="number"
                min="0"
                max="365"
                className="w-full px-4 py-2 border rounded-md bg-background text-foreground"
                value={loanTerm}
                onChange={e => setLoanTerm(e.target.value.replace(/\D/g, ""))}
                required
              />
            </div>
            {loading && (
              <div className="flex justify-center mt-2">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            )}
            {error && <div className="text-destructive text-sm mb-2">{error}</div>}
            {result != null && (
              <div className="mt-4 p-4 rounded bg-secondary text-secondary-foreground text-center">
                <span className="font-bold">Prediction Result:</span> <span className=''>Eligible for loan amount upto ₹{result}</span> 
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>Predict</Button>
          </CardFooter>
          {
            // Apply for Loan button
            result != null && result >= 0.5 && (
              <div className="mt-4">
                <Button
                  type="button"
                  className="w-full"
                  onClick={() => {
                    handleLoan();
                   }
           }
                >
                  Apply for Loan
                </Button>
              </div>
            )
          }
        </form>
      </Card>
    </div>
  );
};

export default DashboardPage;
