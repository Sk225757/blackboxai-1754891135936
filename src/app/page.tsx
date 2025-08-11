import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <img 
              src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/36e51343-882c-4929-9be2-47c04f49b2cf.png" 
              alt="Professional Tax Calculator Dashboard for Business Structure Analysis" 
              className="w-full h-48 object-cover rounded-lg mb-6"
            />
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Business Tax Structure Calculator
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Compare tax outflow across different business structures in India
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Private Limited Company</CardTitle>
                <CardDescription>
                  Direct income routing through Pvt Ltd with director salary
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Corporate tax @ 22% + surcharge + cess</li>
                  <li>• Director salary taxed individually</li>
                  <li>• Standard deduction ₹75,000</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Limited Liability Partnership</CardTitle>
                <CardDescription>
                  Income routing through LLP with partner remuneration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• LLP tax @ 30% + surcharge + cess</li>
                  <li>• Partner's profit share exempt</li>
                  <li>• Partner salary taxed individually</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Chained Structure</CardTitle>
                <CardDescription>
                  Pvt Ltd → Director → Another Pvt Ltd → Final Salary
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Two-tier corporate structure</li>
                  <li>• Multiple tax optimization points</li>
                  <li>• Complex but potentially efficient</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Link href="/tax-calculator">
              <Button size="lg" className="px-8 py-3 text-lg">
                Start Tax Calculation
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
