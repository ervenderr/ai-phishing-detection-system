import { Shield, Zap, BarChart3, Users, Globe, Lock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const features = [
  {
    icon: Shield,
    title: "AI-Powered Detection",
    description:
      "Advanced machine learning algorithms analyze email content, headers, and metadata to identify sophisticated phishing attempts with industry-leading accuracy.",
  },
  {
    icon: Zap,
    title: "Real-Time Analysis",
    description:
      "Instant email scanning and threat detection with sub-second response times. Get immediate alerts when suspicious content is detected.",
  },
  {
    icon: BarChart3,
    title: "Comprehensive Analytics",
    description:
      "Detailed reporting and analytics dashboard providing insights into threat patterns, user behavior, and system performance metrics.",
  },
  {
    icon: Users,
    title: "Multi-User Management",
    description:
      "Role-based access control with admin and user permissions. Manage teams, monitor activity, and configure settings across your organization.",
  },
  {
    icon: Globe,
    title: "API Integration",
    description:
      "RESTful API for seamless integration with existing email systems, security tools, and custom applications. Full documentation included.",
  },
  {
    icon: Lock,
    title: "Enterprise Security",
    description:
      "Bank-grade encryption, SOC 2 compliance, and advanced security measures to protect your data and maintain privacy.",
  },
]

export function Features() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Powerful Features for Complete Protection</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our comprehensive suite of tools provides everything you need to defend against phishing attacks and
            maintain email security.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 leading-relaxed">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
