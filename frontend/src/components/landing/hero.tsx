import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield, ArrowRight, Play } from "lucide-react"

export function Hero() {
  return (
    <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                <Shield className="h-4 w-4 mr-2" />
                AI-Powered Protection
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Stop Phishing Attacks Before They
                <span className="text-blue-600"> Strike</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Advanced AI technology that analyzes emails in real-time, detecting sophisticated phishing attempts with
                97.8% accuracy. Protect your organization from cyber threats.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  <Play className="mr-2 h-5 w-5" />
                  View Demo
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-200">
              <div>
                <div className="text-2xl font-bold text-gray-900">97.8%</div>
                <div className="text-sm text-gray-600">Detection Accuracy</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">1M+</div>
                <div className="text-sm text-gray-600">Emails Analyzed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">500+</div>
                <div className="text-sm text-gray-600">Organizations Protected</div>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-6">
              <img
                src="/placeholder.svg?height=400&width=600"
                alt="PhishGuard AI Dashboard"
                className="w-full h-auto rounded-lg"
              />
              <div className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                Live Protection
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
