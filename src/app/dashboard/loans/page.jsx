'use client'
import axios from 'axios';
import React, { useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Script from 'next/script';

const page = () => {
    // This page is for displaying loan details, applying for loans, etc.
    const [loading, setLoading] = React.useState(false);
    const [loans, setLoans] = React.useState([]);
    const [username , setUsername] = React.useState("");

    const handleRepayLoan = async(loanIdx) => {
        // Handle loan repayment logic here
       try {
         console.log(`Repaying loan with ID: ${loans[loanIdx].loanAmount}`);
                 console.log("Payment ID:", loans[loanIdx]._id);
        const loanId = loans[loanIdx]._id; // Assuming you have the loan ID
        if(loans[loanIdx].status === 'paid') {
            alert("This loan has already been repaid.");
            return;
        }
         const res = await axios.post('/api/create-order', {
             amount: loans[loanIdx].loanAmount , // Replace with the actual amount to be repaid
             });
         const data = res.data;
         const options = {
             key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Your Razorpay key ID
             amount: data.amount * 100, // Amount in paise
             currency: "INR",
             name: "Loan Repayment",
             description: "Repayment for loan",
             order_id: data.orderId, // The order ID returned from the server
             handler: async function (response) {
                 // Handle successful payment here
                 console.log("Payment successful:", response);
                  // You can make an API call to update the loan status in your database
                  try {
                      console.log("Updating loan status for loan ID:", loanId);
                      const updateResponse = await axios.post('/api/repay-loan', {
                          loanId : loanId, // Assuming you have the loan ID
                          paymentId: response.razorpay_payment_id, // Payment ID from Razorpay
                      });
                      console.log("Loan status updated:", updateResponse.data);
                      // Optionally, you can refresh the loans list or redirect the user
                      await fetchLoans(); // Refresh the loans list
                  } catch (error) {
                      console.error("Error updating loan status:", error);
                      alert("Failed to update loan status. Please try again later.");
                  }

             },
             prefill: {
                 name: username, // Assuming you have the user's name
                 email: "",
                 contact: "", // You can also include the user's contact number if available
             },
             theme: {
                 color: "#F37254", // Customize the color of the Razorpay payment form
             },
         };
 
         const razorpay = new window.Razorpay(options);
         razorpay.open(); // Open the Razorpay payment form
         
       } catch (error) {
          console.error("Error processing repayment:", error);
          alert("Failed to process repayment. Please try again later.");
       }

        // You can make an API call to process the repayment
    }

    const fetchLoans = async () => {
        // Fetch loans from the server or perform any necessary setup
        try {
            // Simulate fetching data
            const response = await axios.get('/api/getloans'); // Replace with your actual API endpoint
            const data = response.data
            setUsername(data.name || ""); // Assuming the response contains a name field
            console.log("Fetched loans:", data);
            setLoans(data.loans || []); // Assuming the response contains an array of loans
            setLoading(false);
        } catch (error) {
            console.error("Error fetching loans:", error);
            setLoading(false);
        }
    };
    useEffect(() => {
        // Fetch loan details or perform any necessary setup here
        setLoading(true);
        fetchLoans();
    }, []);
    

    if(loading) {
        return null; // or a loading spinner
    }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-background py-8">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      {username && (
        <h2 className="text-2xl font-bold mb-8 text-primary">Welcome, {username}!</h2>
      )}
      {loans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
          {loans.map((loan,idx) => {
            const loanDate = loan.createdAt ? new Date(loan.createdAt) : null;
            const dueDate = loanDate ? new Date(loanDate.getTime() + (loan.tenure || 0) * 24 * 60 * 60 * 1000) : null;
            const today = new Date();
            const daysToDue = dueDate ? Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24)) : null;
            const highlightRed = daysToDue !== null && daysToDue <= 5;
            return (
              <Card
                key={loan._id}
                className={`shadow-lg border border-border bg-card text-card-foreground transition-colors duration-200 ${highlightRed ? 'bg-red-900 border-red-500' : ''}`}
              >
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>Loan Amount</span>
                    <span className="text-2xl font-bold text-primary">₹{loan.loanAmount}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-2 flex justify-between">
                    <span className="font-medium">Loan Date:</span>
                    <span>{loanDate ? loanDate.toLocaleDateString() : "-"}</span>
                  </div>
                  <div className="mb-2 flex justify-between">
                    <span className="font-medium">Tenure:</span>
                    <span>{loan.tenure} days</span>
                  </div>
                  <div className="mb-2 flex justify-between">
                    <span className="font-medium">Status:</span>
                    <span className={loan.status === 'paid' ? 'text-green-600' : 'text-muted-foreground'}>{loan.status.toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')}</span>
                  </div>
                  {daysToDue !== null && (
                    <div className="mb-2 flex justify-between">
                      <span className="font-medium">Days to Due Date:</span>
                      <span className={daysToDue <= 5 ? 'text-red-600 font-bold' : ''}>{daysToDue < 0 ? "-" : daysToDue}</span>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="default" disabled={loan.status === 'paid'} className="w-full" onClick={(e)=>{
                    e.preventDefault();
                    handleRepayLoan(idx);
                  }}>Repay Loan</Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <p className="text-muted-foreground text-lg">No loans found.</p>
      )}
    </div>
  )
}

export default page
