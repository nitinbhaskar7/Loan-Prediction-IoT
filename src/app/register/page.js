'use client'
import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import axios from 'axios';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const page = () => {
  const [fingerprint, setFingerprint] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [gender, setGender] = useState("");
  const [married, setMarried] = useState("");
  const [education, setEducation] = useState("");
  const [selfEmployed, setSelfEmployed] = useState("");
  const [propertyArea, setPropertyArea] = useState("");
  const [dependents, setDependents] = useState("");
  const [income, setIncome] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFingerprint = () => {
    setLoading(true);
    axios.post('/api/fingerenroll')
      .then(response => {
        setLoading(false);
        console.log("Fingerprint response:", response.data);
        if (response.data.finger === -1) {
          setError("Fingerprint enrollment failed.");
        } else {
          setFingerprint(response.data.finger);
        }
      })
      .catch(error => {
        setLoading(false);
        setError("Fingerprint enrollment failed: " + error.response.data.message);
      });
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setError("");
    if (!fingerprint) {
      setError("Please scan and capture your fingerprint.");
      return;
    }
    if (!gender || !married || !education || !selfEmployed || !propertyArea || dependents === "" || !income) {
      setError("Please fill all fields.");
      return;
    }
    axios.post('/api/register', {
      name: name.trim(),
      phone: phone.trim(),
      gender: gender === "Male" ? 1 : 0,
      married: married === "Yes" ? 1 : 0,
      education: education === "Graduate" ? 1 : 0,
      self_employed: selfEmployed === "Y" ? 1 : 0,
      property_area: propertyArea === "Urban" ? 2 : propertyArea === "Semiurban" ? 1 : 0,
      dependents: Number(dependents),
      applicant_income: Number(income),
      finger: fingerprint
    })
      .then(response => {
        alert("Registration successful: " + response.data.message);
      })
      .catch(error => {
        setError("Registration failed: " + (error?.response?.data?.message || error.message));
      });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-background">
      <Card>
        <form onSubmit={handleRegister}>
          <CardHeader>
            <CardTitle>Register</CardTitle>
            <CardDescription>Register using your Aadhar Number and Fingerprint</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Name</label>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded-md bg-background text-foreground"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
              <label className="block mb-1 font-medium mt-2">Phone Number</label>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded-md bg-background text-foreground"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, ""))}
                required  
              />
              
              <label className="block mb-1 font-medium">Gender</label>
              <Select value={gender} onValueChange={setGender} required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Married</label>
              <Select value={married} onValueChange={setMarried} required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Education</label>
              <Select value={education} onValueChange={setEducation} required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Graduate">Graduate</SelectItem>
                  <SelectItem value="Not Graduate">Not Graduate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Self Employed</label>
              <Select value={selfEmployed} onValueChange={setSelfEmployed} required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Y">Yes</SelectItem>
                  <SelectItem value="N">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Locality</label>
              <Select value={propertyArea} onValueChange={setPropertyArea} required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Urban">Urban</SelectItem>
                  <SelectItem value="Semiurban">Semiurban</SelectItem>
                  <SelectItem value="Rural">Rural</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Dependents</label>
              <Select value={dependents} onValueChange={setDependents} required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0</SelectItem>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Applicant Income (Rs./yr)</label>
              <input
                type="number"
                min="0"
                className="w-full px-4 py-2 border rounded-md bg-background text-foreground"
                value={income}
                onChange={e => setIncome(e.target.value.replace(/\D/g, ""))}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Fingerprint</label>
              <Button type="button" variant="secondary" className="w-full mb-2" onClick={handleFingerprint} disabled={loading}>
                {fingerprint ? "Fingerprint Captured" : loading ? "Capturing..." : "Scan Fingerprint"}
              </Button>
              {loading && (
                <div className="flex justify-center mt-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              )}
            </div>
            {error && <div className="text-destructive text-sm mb-2">{error}</div>}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">Register</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default page
