"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface TaxCalculation {
  structure: string
  entityTax: number
  individualTax: number
  totalTax: number
  netCash: number
}

interface FormInputs {
  income_before_salary: number
  salary_to_director_plc: number
  salary_to_partner_llp: number
  expenses_in_2nd_plc: number
  salary_to_director_2nd_plc: number
}

export default function TaxCalculatorPage() {
  const [inputs, setInputs] = useState<FormInputs>({
    income_before_salary: 0,
    salary_to_director_plc: 0,
    salary_to_partner_llp: 0,
    expenses_in_2nd_plc: 0,
    salary_to_director_2nd_plc: 0
  })

  const [results, setResults] = useState<TaxCalculation[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [allowableRemuneration, setAllowableRemuneration] = useState<number>(0)

  // Calculate allowable remuneration for LLP
  useEffect(() => {
    // Book profit should be calculated without deducting partner salary
    const bookProfit = inputs.income_before_salary
    let allowable = 0
    
    if (bookProfit <= 300000) {
      allowable = bookProfit * 0.9
    } else {
      allowable = 300000 * 0.9 + (bookProfit - 300000) * 0.6
    }
    
    setAllowableRemuneration(Math.max(0, allowable))
  }, [inputs.income_before_salary])

  const handleInputChange = (field: keyof FormInputs, value: string) => {
    const numValue = parseFloat(value) || 0
    
    if (numValue < 0) {
      setErrors(prev => ({ ...prev, [field]: 'Value cannot be negative' }))
      return
    } else {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }

    setInputs(prev => ({ ...prev, [field]: numValue }))
  }

  const calculateIndividualTax = (salary: number): number => {
    // New Tax Regime with standard deduction of ₹75,000
    const taxableIncome = Math.max(0, salary - 75000)
    
    let tax = 0
    
    // Tax slabs for FY 2025-26 New Regime
    if (taxableIncome <= 300000) {
      tax = 0
    } else if (taxableIncome <= 700000) {
      tax = (taxableIncome - 300000) * 0.05
    } else if (taxableIncome <= 1000000) {
      tax = 400000 * 0.05 + (taxableIncome - 700000) * 0.10
    } else if (taxableIncome <= 1200000) {
      tax = 400000 * 0.05 + 300000 * 0.10 + (taxableIncome - 1000000) * 0.15
    } else if (taxableIncome <= 1500000) {
      tax = 400000 * 0.05 + 300000 * 0.10 + 200000 * 0.15 + (taxableIncome - 1200000) * 0.20
    } else {
      tax = 400000 * 0.05 + 300000 * 0.10 + 200000 * 0.15 + 300000 * 0.20 + (taxableIncome - 1500000) * 0.30
    }

    // Add surcharge if applicable
    if (taxableIncome > 5000000) {
      tax += tax * 0.10 // 10% surcharge for income > 50 lakhs
    }

    // Add 4% cess
    tax += tax * 0.04

    return Math.round(tax)
  }

  const calculateCorporateTax = (income: number): number => {
    // Corporate tax @ 22% + 10% surcharge + 4% cess
    const baseTax = income * 0.22
    const withSurcharge = baseTax * 1.10
    const withCess = withSurcharge * 1.04
    return Math.round(withCess)
  }

  const calculateLLPTax = (income: number): number => {
    // LLP tax @ 30% + surcharge (if income > 1 Cr) + 4% cess
    let tax = income * 0.30
    
    if (income > 10000000) { // If income > 1 Cr
      tax += tax * 0.12 // 12% surcharge
    }
    
    tax += tax * 0.04 // 4% cess
    return Math.round(tax)
  }

  const calculateTaxes = () => {
    try {
      const calculations: TaxCalculation[] = []

      // 1. Private Limited Company Structure
      const plcTaxableIncome = inputs.income_before_salary - inputs.salary_to_director_plc
      const plcEntityTax = calculateCorporateTax(Math.max(0, plcTaxableIncome))
      const plcIndividualTax = calculateIndividualTax(inputs.salary_to_director_plc)
      const plcTotalTax = plcEntityTax + plcIndividualTax
      const plcNetCash = inputs.salary_to_director_plc - plcIndividualTax

      calculations.push({
        structure: 'Private Limited Company',
        entityTax: plcEntityTax,
        individualTax: plcIndividualTax,
        totalTax: plcTotalTax,
        netCash: plcNetCash
      })

      // 2. LLP Structure
      const llpTaxableIncome = inputs.income_before_salary - inputs.salary_to_partner_llp
      const llpEntityTax = calculateLLPTax(Math.max(0, llpTaxableIncome))
      const llpIndividualTax = calculateIndividualTax(inputs.salary_to_partner_llp)
      const llpTotalTax = llpEntityTax + llpIndividualTax
      const llpNetCash = inputs.salary_to_partner_llp - llpIndividualTax

      calculations.push({
        structure: 'Limited Liability Partnership',
        entityTax: llpEntityTax,
        individualTax: llpIndividualTax,
        totalTax: llpTotalTax,
        netCash: llpNetCash
      })

      // 3. Chained Structure
      const firstPlcTaxableIncome = inputs.income_before_salary - inputs.salary_to_director_plc
      const firstPlcTax = calculateCorporateTax(Math.max(0, firstPlcTaxableIncome))
      
      const secondPlcTaxableIncome = inputs.salary_to_director_plc - inputs.expenses_in_2nd_plc - inputs.salary_to_director_2nd_plc
      const secondPlcTax = calculateCorporateTax(Math.max(0, secondPlcTaxableIncome))
      
      const chainedEntityTax = firstPlcTax + secondPlcTax
      const chainedIndividualTax = calculateIndividualTax(inputs.salary_to_director_2nd_plc)
      const chainedTotalTax = chainedEntityTax + chainedIndividualTax
      const chainedNetCash = inputs.salary_to_director_2nd_plc - chainedIndividualTax

      calculations.push({
        structure: 'Chained Structure (Pvt Ltd → Director → Pvt Ltd)',
        entityTax: chainedEntityTax,
        individualTax: chainedIndividualTax,
        totalTax: chainedTotalTax,
        netCash: chainedNetCash
      })

      setResults(calculations)
    } catch (error) {
      console.error('Calculation error:', error)
      setErrors({ general: 'Error in calculations. Please check your inputs.' })
    }
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getMinTaxStructure = (): string => {
    if (results.length === 0) return ''
    const minTax = Math.min(...results.map(r => r.totalTax))
    return results.find(r => r.totalTax === minTax)?.structure || ''
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <img 
              src="https://placehold.co/1920x300?text=Dynamic+Tax+Calculator+Dashboard+with+Modern+Interface+and+Professional+Layout" 
              alt="Dynamic Tax Calculator Dashboard with Modern Interface and Professional Layout" 
              className="w-full h-48 object-cover rounded-lg mb-6"
            />
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Tax Structure Comparison Calculator
            </h1>
            <p className="text-muted-foreground">
              Compare tax outflow across different business structures for FY 2025-26
            </p>
          </div>

          {/* Input Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Input Parameters</CardTitle>
              <CardDescription>
                Enter your income and salary details to calculate tax implications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Basic Inputs */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Basic Income Details</h3>
                  
                  <div>
                    <Label htmlFor="income_before_salary">Income Before Salary (₹)</Label>
                    <Input
                      id="income_before_salary"
                      type="number"
                      value={inputs.income_before_salary || ''}
                      onChange={(e) => handleInputChange('income_before_salary', e.target.value)}
                      placeholder="Enter total income before salary"
                    />
                    {errors.income_before_salary && (
                      <p className="text-sm text-destructive mt-1">{errors.income_before_salary}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="salary_to_director_plc">Salary to Director (Pvt Ltd) (₹)</Label>
                    <Input
                      id="salary_to_director_plc"
                      type="number"
                      value={inputs.salary_to_director_plc || ''}
                      onChange={(e) => handleInputChange('salary_to_director_plc', e.target.value)}
                      placeholder="Enter director salary"
                    />
                    {errors.salary_to_director_plc && (
                      <p className="text-sm text-destructive mt-1">{errors.salary_to_director_plc}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="salary_to_partner_llp">Salary to Partner (LLP) (₹)</Label>
                    <Input
                      id="salary_to_partner_llp"
                      type="number"
                      value={inputs.salary_to_partner_llp || ''}
                      onChange={(e) => handleInputChange('salary_to_partner_llp', e.target.value)}
                      placeholder="Enter partner salary"
                    />
                    {errors.salary_to_partner_llp && (
                      <p className="text-sm text-destructive mt-1">{errors.salary_to_partner_llp}</p>
                    )}
                  </div>

                  <div>
                    <Label>Allowable Remuneration (LLP Act)</Label>
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm font-medium">{formatCurrency(allowableRemuneration)}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Auto-calculated: 90% up to ₹3L, then 60% on balance (based on book profit)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Chained Structure Inputs */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Chained Structure Details</h3>
                  
                  <div>
                    <Label htmlFor="expenses_in_2nd_plc">Expenses in Second Pvt Ltd (₹)</Label>
                    <Input
                      id="expenses_in_2nd_plc"
                      type="number"
                      value={inputs.expenses_in_2nd_plc || ''}
                      onChange={(e) => handleInputChange('expenses_in_2nd_plc', e.target.value)}
                      placeholder="Enter operational expenses"
                    />
                    {errors.expenses_in_2nd_plc && (
                      <p className="text-sm text-destructive mt-1">{errors.expenses_in_2nd_plc}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="salary_to_director_2nd_plc">Final Director Salary (Second Pvt Ltd) (₹)</Label>
                    <Input
                      id="salary_to_director_2nd_plc"
                      type="number"
                      value={inputs.salary_to_director_2nd_plc || ''}
                      onChange={(e) => handleInputChange('salary_to_director_2nd_plc', e.target.value)}
                      placeholder="Enter final director salary"
                    />
                    {errors.salary_to_director_2nd_plc && (
                      <p className="text-sm text-destructive mt-1">{errors.salary_to_director_2nd_plc}</p>
                    )}
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-md">
                    <h4 className="font-medium text-sm mb-2">Tax Assumptions (FY 2025-26)</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Corporate Tax: 22% + 10% surcharge + 4% cess</li>
                      <li>• LLP Tax: 30% + 12% surcharge (if income {'>'} ₹1 Cr) + 4% cess</li>
                      <li>• Individual Tax: New Regime with ₹75,000 standard deduction</li>
                      <li>• Surcharge: 10% for income {'>'} ₹50 lakhs</li>
                    </ul>
                  </div>
                </div>
              </div>

              {errors.general && (
                <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <p className="text-sm text-destructive">{errors.general}</p>
                </div>
              )}

              <div className="mt-6">
                <Button onClick={calculateTaxes} size="lg" className="w-full md:w-auto">
                  Calculate Tax Comparison
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          {results.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tax Comparison Results</CardTitle>
                <CardDescription>
                  Detailed breakdown of tax implications for each structure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-semibold">Structure</th>
                        <th className="text-right p-3 font-semibold">Entity Tax</th>
                        <th className="text-right p-3 font-semibold">Individual Tax</th>
                        <th className="text-right p-3 font-semibold">Total Tax Outflow</th>
                        <th className="text-right p-3 font-semibold">Net Post-Tax Cash</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((result, index) => {
                        const isOptimal = result.structure === getMinTaxStructure()
                        return (
                          <tr 
                            key={index} 
                            className={`border-b ${isOptimal ? 'bg-green-50 dark:bg-green-950/20' : ''}`}
                          >
                            <td className="p-3">
                              <div className="font-medium">{result.structure}</div>
                              {isOptimal && (
                                <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                                  ✓ Most Tax Efficient
                                </div>
                              )}
                            </td>
                            <td className="text-right p-3" title="Tax paid by the business entity">
                              {formatCurrency(result.entityTax)}
                            </td>
                            <td className="text-right p-3" title="Tax paid by individual on salary/remuneration">
                              {formatCurrency(result.individualTax)}
                            </td>
                            <td className="text-right p-3 font-semibold" title="Total tax burden (Entity + Individual)">
                              {formatCurrency(result.totalTax)}
                            </td>
                            <td className="text-right p-3 font-semibold" title="Cash available to individual after all taxes">
                              {formatCurrency(result.netCash)}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 p-4 bg-muted rounded-md">
                  <h4 className="font-semibold mb-2">Key Insights</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• The structure highlighted in green offers the lowest total tax outflow</li>
                    <li>• Individual tax calculations use the New Tax Regime with standard deduction</li>
                    <li>• Corporate tax includes surcharge and cess as applicable</li>
                    <li>• LLP partner&apos;s profit share is exempt from individual taxation</li>
                    <li>• Chained structure allows for additional expense optimization</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
