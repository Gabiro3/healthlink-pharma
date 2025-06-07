"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Star, TrendingUp, FileText, BarChart3, Bell, Shield, Zap, Crown, ArrowRight, Users } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

const features = [
  {
    icon: Users,
    title: "HR Management",
    description: "Manage employee records, roles, attendance, and leaves",
    premium: true,
  },
  {
    icon: FileText,
    title: "Invoicing & Procurement",
    description: "Automated invoicing with integrated purchase order management",
    premium: true,
  },
  {
    icon: BarChart3,
    title: "Vendor Management",
    description: "Track vendor performance, contacts, and contract history",
    premium: true,
  },
  {
    icon: TrendingUp,
    title: "Advanced Accounting",
    description: "Full accounting suite with ledgers, journals, and reports",
    premium: true,
  },
  {
    icon: Bell,
    title: "Smart Alerts",
    description: "Real-time notifications for critical inventory and vendor updates",
    premium: true,
  },
  {
    icon: Shield,
    title: "Priority Support",
    description: "24/7 support with guaranteed 1-hour SLA",
    premium: true,
  },
]

const plans = [
  {
    name: "Basic",
    price: "Free",
    period: "",
    description: "Perfect for small pharmacies getting started",
    features: [
      "Up to 100 products",
      "Basic inventory tracking",
      "Simple sales recording",
      "Email support",
      "Basic reports",
    ],
    current: true,
  },
  {
    name: "Pharma Pro",
    price: "$80",
    period: "/month",
    description: "Complete pharmacy management solution",
    features: [
      "Unlimited products",
      "Advanced inventory management",
      "AI-powered forecasting",
      "Professional invoicing",
      "Smart alerts & notifications",
      "Advanced analytics & reports",
      "Multi-user access",
      "Priority support",
      "Custom branding",
      "API access",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$99",
    period: "/month",
    description: "For pharmacy chains and large operations",
    features: [
      "Everything in Pharma Pro",
      "Multi-location management",
      "Advanced user roles",
      "Custom integrations",
      "Dedicated account manager",
      "On-premise deployment option",
      "Advanced security features",
      "Custom training sessions",
    ],
  },
  // 💼 Optional Add-on Bundles (each at $25/month)
  {
    name: "HR Management",
    price: "$25",
    period: "/month",
    description: "Full HR suite for employee and leave management",
    features: [
      "Employee directory",
      "Role-based access",
      "Leave tracking",
      "Attendance management",
      "HR reports",
    ],
  },
  {
    name: "Procurement",
    price: "$25",
    period: "/month",
    description: "Streamline purchases and supplier interactions",
    features: [
      "Purchase order creation",
      "Inventory-linked procurement",
      "Invoice matching",
      "Order status tracking",
    ],
  },
  {
    name: "Vendor Management",
    price: "$25",
    period: "/month",
    description: "Organize vendors and track performance",
    features: [
      "Vendor database",
      "Contract tracking",
      "Performance scoring",
      "Communication logs",
    ],
  },
  {
    name: "Advanced Accounting",
    price: "$25",
    period: "/month",
    description: "Deep financial control and reporting tools",
    features: [
      "General ledger",
      "Income & expense tracking",
      "Tax reports",
      "Bank reconciliation",
      "Financial statements",
    ],
  },
]

const testimonials = [
  {
    name: "Dr. Sarah Johnson",
    role: "Pharmacy Owner",
    content:
      "Pharma Pro has transformed how we manage our inventory. The forecasting feature alone has saved us thousands in overstocking.",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "Pharmacy Manager",
    content:
      "The automated invoicing and smart alerts have made our operations so much more efficient. Highly recommended!",
    rating: 5,
  },
  {
    name: "Lisa Rodriguez",
    role: "Chain Pharmacy Director",
    content:
      "Managing multiple locations is now seamless with the Enterprise plan. The analytics provide incredible insights.",
    rating: 5,
  },
  {
    name: "Aisha Mahmoud",
    role: "HR Lead",
    content:
      "The HR module helped us centralize leave tracking and employee data. It’s intuitive and saves a lot of time.",
    rating: 5,
  },
  {
    name: "David Kumar",
    role: "Finance Manager",
    content:
      "Advanced accounting and vendor tracking brought our finance operations to a new level of clarity and control.",
    rating: 5,
  },
]


export default function PremiumPage() {
  const [selectedPlan, setSelectedPlan] = useState("Pharma Pro")
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")
  const { toast } = useToast()

  const handleUpgrade = (planName: string) => {
    toast({
      title: "Upgrade Initiated",
      description: `Redirecting to checkout for ${planName} plan...`,
    })
    // Here you would integrate with your payment processor
  }

  const getDiscountedPrice = (price: string) => {
    if (price === "Free") return price
    const numPrice = Number.parseInt(price.replace("$", ""))
    const yearlyPrice = Math.round(numPrice * 12 * 0.8) // 20% discount for yearly
    return `$${yearlyPrice}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#004d40] to-[#00695c]">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="h-8 w-8 text-yellow-400" />
              <span className="text-xl font-bold text-white">Pharma Pro</span>
            </div>
            <Button variant="outline" className="text-yellow-400 border-white/30 hover:bg-white/10" onClick={() => window.location.href = "/dashboard"}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge className="mb-4 bg-yellow-400 text-black hover:bg-yellow-500">
            <Star className="h-3 w-3 mr-1" />
            Most Popular Upgrade
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Unlock the Full Power of
            <span className="text-yellow-400"> Pharma Pro</span>
          </h1>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Transform your pharmacy operations with AI-powered forecasting, professional invoicing, and advanced
            analytics that drive real business results.
          </p>
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="flex items-center gap-2 text-white/80">
              <Check className="h-5 w-5 text-green-400" />
              <span>30-day free trial</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <Check className="h-5 w-5 text-green-400" />
              <span>No setup fees</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <Check className="h-5 w-5 text-green-400" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything You Need to Succeed</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Pharma Pro includes all the advanced features you need to streamline operations, increase efficiency, and
              grow your pharmacy business.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="relative overflow-hidden">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#004d40]/10 rounded-lg">
                      <feature.icon className="h-6 w-6 text-[#004d40]" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                      {feature.premium && (
                        <Badge variant="secondary" className="text-xs">
                          <Crown className="h-3 w-3 mr-1" />
                          Pro
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Plan</h2>
            <p className="text-lg text-gray-600 mb-8">Start with a free trial and upgrade when you're ready</p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className={billingCycle === "monthly" ? "font-medium" : "text-gray-500"}>Monthly</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
                className="relative"
              >
                <div
                  className={`w-12 h-6 rounded-full transition-colors ${
                    billingCycle === "yearly" ? "bg-[#004d40]" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition-transform transform ${
                      billingCycle === "yearly" ? "translate-x-6" : "translate-x-0.5"
                    } mt-0.5`}
                  />
                </div>
              </Button>
              <span className={billingCycle === "yearly" ? "font-medium" : "text-gray-500"}>
                Yearly
                <Badge variant="secondary" className="ml-2">
                  Save 20%
                </Badge>
              </span>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`relative ${
                  plan.popular ? "border-[#004d40] border-2 scale-105" : ""
                } ${plan.current ? "opacity-75" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-[#004d40] text-white">
                      <Star className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="text-4xl font-bold">
                    {billingCycle === "yearly" && plan.price !== "Free" ? getDiscountedPrice(plan.price) : plan.price}
                    <span className="text-lg font-normal text-gray-500">
                      {plan.period && (billingCycle === "yearly" ? "/year" : plan.period)}
                    </span>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full ${
                      plan.current
                        ? "bg-gray-400 cursor-not-allowed"
                        : plan.popular
                          ? "bg-[#004d40] hover:bg-[#00695c]"
                          : ""
                    }`}
                    onClick={() => !plan.current && handleUpgrade(plan.name)}
                    disabled={plan.current}
                  >
                    {plan.current ? "Current Plan" : `Upgrade to ${plan.name}`}
                    {!plan.current && <ArrowRight className="h-4 w-4 ml-2" />}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Trusted by Pharmacy Professionals</h2>
            <p className="text-lg text-gray-600">See what our customers are saying about Pharma Pro</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">"{testimonial.content}"</p>
                  <div>
                    <p className="font-medium">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-[#004d40] py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Pharmacy?</h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Join thousands of pharmacy professionals who have already upgraded to Pharma Pro. Start your free trial
            today and see the difference.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-yellow-400 text-black hover:bg-yellow-500"
              onClick={() => handleUpgrade("Pharma Pro")}
            >
              <Zap className="h-5 w-5 mr-2" />
              Start Free Trial
            </Button>
            <Button variant="outline" size="lg" className="text-yellow-400 border-white/30 hover:bg-white/10">
              Schedule Demo
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
