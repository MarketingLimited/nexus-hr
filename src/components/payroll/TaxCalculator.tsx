import { useState } from "react";
import { Calculator, Settings, AlertTriangle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

const TaxCalculator = () => {
  const [selectedYear, setSelectedYear] = useState("2024");

  const taxBrackets = [
    { min: 0, max: 10275, rate: 10, amount: 0 },
    { min: 10276, max: 41775, rate: 12, amount: 1027.50 },
    { min: 41776, max: 89450, rate: 22, amount: 4807.50 },
    { min: 89451, max: 190750, rate: 24, amount: 15213.50 },
    { min: 190751, max: 364200, rate: 32, amount: 39895.50 },
    { min: 364201, max: 462550, rate: 35, amount: 85289.50 },
    { min: 462551, max: Infinity, rate: 37, amount: 119934.50 }
  ];

  const employeeTaxData = [
    {
      id: 1,
      employeeId: "EMP001",
      name: "Sarah Johnson",
      annualSalary: 102000,
      federalTax: 15300,
      stateTax: 5100,
      socialSecurity: 3060,
      medicare: 1479,
      totalTax: 24939,
      effectiveRate: 24.45,
      status: "Calculated"
    },
    {
      id: 2,
      employeeId: "EMP002",
      name: "Michael Chen",
      annualSalary: 86400,
      federalTax: 12096,
      stateTax: 4320,
      socialSecurity: 2592,
      medicare: 1253,
      totalTax: 20261,
      effectiveRate: 23.45,
      status: "Calculated"
    },
    {
      id: 3,
      employeeId: "EMP003",
      name: "Emily Rodriguez",
      annualSalary: 69600,
      federalTax: 9240,
      stateTax: 3480,
      socialSecurity: 2088,
      medicare: 1009,
      totalTax: 15817,
      effectiveRate: 22.73,
      status: "Pending"
    }
  ];

  const calculateTax = (salary) => {
    let tax = 0;
    let remainingSalary = salary;

    for (const bracket of taxBrackets) {
      if (remainingSalary <= 0) break;

      const taxableInBracket = Math.min(remainingSalary, bracket.max - bracket.min + 1);
      tax += (taxableInBracket * bracket.rate) / 100;
      remainingSalary -= taxableInBracket;
    }

    return tax;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Tax Calculator & Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="calculator" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="calculator">Tax Calculator</TabsTrigger>
            <TabsTrigger value="employee-taxes">Employee Taxes</TabsTrigger>
            <TabsTrigger value="settings">Tax Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="calculator" className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Tax rates shown are for illustration purposes. Please consult with a tax professional for accurate calculations.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Calculator Input */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Tax Calculator</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="annual-salary">Annual Salary</Label>
                    <Input
                      id="annual-salary"
                      type="number"
                      placeholder="Enter annual salary"
                      defaultValue="75000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="filing-status">Filing Status</Label>
                    <select className="w-full p-2 border rounded-md">
                      <option value="single">Single</option>
                      <option value="married">Married Filing Jointly</option>
                      <option value="head">Head of Household</option>
                    </select>
                  </div>
                  <Button className="w-full gap-2">
                    <Calculator className="h-4 w-4" />
                    Calculate Taxes
                  </Button>
                </CardContent>
              </Card>

              {/* Tax Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tax Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Federal Income Tax</span>
                      <span className="font-medium">$9,975</span>
                    </div>
                    <div className="flex justify-between">
                      <span>State Income Tax (5%)</span>
                      <span className="font-medium">$3,750</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Social Security (6.2%)</span>
                      <span className="font-medium">$4,650</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Medicare (1.45%)</span>
                      <span className="font-medium">$1,088</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between text-lg font-semibold">
                      <span>Total Tax</span>
                      <span>$19,463</span>
                    </div>
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <div className="flex justify-between">
                        <span>Net Income</span>
                        <span className="text-xl font-bold text-green-600">$55,537</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Effective Tax Rate: 25.95%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tax Brackets Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">2024 Federal Tax Brackets (Single Filer)</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tax Rate</TableHead>
                      <TableHead>Income Range</TableHead>
                      <TableHead>Tax Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {taxBrackets.slice(0, -1).map((bracket, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{bracket.rate}%</TableCell>
                        <TableCell>
                          ${bracket.min.toLocaleString()} - ${bracket.max.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          ${bracket.amount.toLocaleString()} + {bracket.rate}% of amount over ${bracket.min.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="employee-taxes" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Employee Tax Summary</h3>
              <Button className="gap-2">
                <Download className="h-4 w-4" />
                Export Tax Report
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Annual Salary</TableHead>
                  <TableHead>Federal Tax</TableHead>
                  <TableHead>State Tax</TableHead>
                  <TableHead>FICA</TableHead>
                  <TableHead>Total Tax</TableHead>
                  <TableHead>Effective Rate</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employeeTaxData.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{employee.name}</p>
                        <p className="text-sm text-muted-foreground">{employee.employeeId}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">${employee.annualSalary.toLocaleString()}</TableCell>
                    <TableCell>${employee.federalTax.toLocaleString()}</TableCell>
                    <TableCell>${employee.stateTax.toLocaleString()}</TableCell>
                    <TableCell>${(employee.socialSecurity + employee.medicare).toLocaleString()}</TableCell>
                    <TableCell className="font-semibold">${employee.totalTax.toLocaleString()}</TableCell>
                    <TableCell>{employee.effectiveRate}%</TableCell>
                    <TableCell>
                      <Badge variant={employee.status === "Calculated" ? "default" : "secondary"}>
                        {employee.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Tax Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Federal Tax Settings</h4>
                    <div className="space-y-2">
                      <Label htmlFor="federal-rate">Federal Tax Rate (%)</Label>
                      <Input id="federal-rate" type="number" defaultValue="22" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ss-rate">Social Security Rate (%)</Label>
                      <Input id="ss-rate" type="number" defaultValue="6.2" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="medicare-rate">Medicare Rate (%)</Label>
                      <Input id="medicare-rate" type="number" defaultValue="1.45" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold">State Tax Settings</h4>
                    <div className="space-y-2">
                      <Label htmlFor="state-rate">State Tax Rate (%)</Label>
                      <Input id="state-rate" type="number" defaultValue="5" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state-name">State</Label>
                      <select className="w-full p-2 border rounded-md">
                        <option value="CA">California</option>
                        <option value="NY">New York</option>
                        <option value="TX">Texas</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button>Save Settings</Button>
                  <Button variant="outline">Reset to Defaults</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TaxCalculator;