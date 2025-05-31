"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, Scan, AlertTriangle, CheckCircle, Shield, Link, Mail, FileText, Loader2 } from "lucide-react"

interface AnalysisResult {
  threatLevel: "safe" | "low" | "medium" | "high"
  confidence: number
  reasons: string[]
  urlAnalysis?: {
    suspicious: boolean
    reputation: string
    details: string[]
  }
  textAnalysis?: {
    sentiment: string
    urgencyScore: number
    suspiciousPatterns: string[]
  }
}

export function EmailAnalyzer() {
  const [emailContent, setEmailContent] = useState("")
  const [senderEmail, setSenderEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)

  const analyzeEmail = async () => {
    setIsAnalyzing(true)

    // Simulate API call to backend
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock analysis result
    const mockResult: AnalysisResult = {
      threatLevel:
        emailContent.toLowerCase().includes("urgent") || emailContent.toLowerCase().includes("verify")
          ? "high"
          : "safe",
      confidence: Math.random() * 0.3 + 0.7, // 70-100%
      reasons: emailContent.toLowerCase().includes("urgent")
        ? ["Urgency tactics detected", "Suspicious sender domain", "Credential harvesting attempt"]
        : ["Legitimate sender", "Standard content patterns", "No suspicious links"],
      urlAnalysis: {
        suspicious: emailContent.includes("http"),
        reputation: emailContent.includes("http") ? "Poor" : "Good",
        details: emailContent.includes("http")
          ? ["Domain recently registered", "No SSL certificate", "Blacklisted IP"]
          : ["Established domain", "Valid SSL certificate"],
      },
      textAnalysis: {
        sentiment: "Manipulative",
        urgencyScore: emailContent.toLowerCase().includes("urgent") ? 85 : 15,
        suspiciousPatterns: emailContent.toLowerCase().includes("urgent")
          ? ["Time pressure tactics", "Account verification request", "Suspicious grammar"]
          : [],
      },
    }

    setAnalysisResult(mockResult)
    setIsAnalyzing(false)
  }

  const getThreatColor = (level: string) => {
    switch (level) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200"
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "low":
        return "text-blue-600 bg-blue-50 border-blue-200"
      case "safe":
        return "text-green-600 bg-green-50 border-green-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getThreatIcon = (level: string) => {
    switch (level) {
      case "high":
        return <AlertTriangle className="h-5 w-5" />
      case "medium":
        return <Shield className="h-5 w-5" />
      case "low":
        return <Shield className="h-5 w-5" />
      case "safe":
        return <CheckCircle className="h-5 w-5" />
      default:
        return <Shield className="h-5 w-5" />
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setEmailContent(content)
        // Parse email headers if needed
        const lines = content.split("\n")
        const subjectLine = lines.find((line) => line.toLowerCase().startsWith("subject:"))
        const fromLine = lines.find((line) => line.toLowerCase().startsWith("from:"))

        if (subjectLine) setSubject(subjectLine.replace(/^subject:\s*/i, ""))
        if (fromLine) setSenderEmail(fromLine.replace(/^from:\s*/i, ""))
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Scan className="h-5 w-5 mr-2 text-blue-600" />
            Email Analysis Engine
          </CardTitle>
          <CardDescription>Analyze emails for phishing attempts using AI-powered detection</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sender">Sender Email</Label>
              <Input
                id="sender"
                placeholder="sender@example.com"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject Line</Label>
              <Input
                id="subject"
                placeholder="Email subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Email Content</Label>
            <Textarea
              id="content"
              placeholder="Paste the email content here for analysis..."
              className="min-h-[200px]"
              value={emailContent}
              onChange={(e) => setEmailContent(e.target.value)}
            />
          </div>

          <div className="flex space-x-4">
            <Button onClick={analyzeEmail} disabled={!emailContent.trim() || isAnalyzing} className="flex-1">
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Scan className="h-4 w-4 mr-2" />
                  Analyze Email
                </>
              )}
            </Button>
            <input
              type="file"
              accept=".eml,.msg"
              onChange={handleFileUpload}
              className="hidden"
              id="email-file-upload"
            />
            <Button variant="outline" onClick={() => document.getElementById("email-file-upload")?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Upload .eml File
            </Button>
          </div>
        </CardContent>
      </Card>

      {analysisResult && (
        <div className="space-y-6">
          {/* Main Result */}
          <Alert className={getThreatColor(analysisResult.threatLevel)}>
            <div className="flex items-center">
              {getThreatIcon(analysisResult.threatLevel)}
              <div className="ml-3">
                <AlertDescription className="text-lg font-semibold">
                  {analysisResult.threatLevel === "safe"
                    ? "Email appears safe"
                    : analysisResult.threatLevel === "low"
                      ? "Low risk detected"
                      : analysisResult.threatLevel === "medium"
                        ? "Medium risk detected"
                        : "High phishing risk detected!"}
                </AlertDescription>
                <p className="text-sm mt-1">Confidence: {(analysisResult.confidence * 100).toFixed(1)}%</p>
              </div>
            </div>
          </Alert>

          {/* Detailed Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Text Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Text Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Urgency Score</span>
                    <span className="text-sm">{analysisResult.textAnalysis?.urgencyScore}%</span>
                  </div>
                  <Progress value={analysisResult.textAnalysis?.urgencyScore} />
                </div>

                <div>
                  <span className="text-sm font-medium">Sentiment Analysis</span>
                  <p className="text-sm text-gray-600 mt-1">{analysisResult.textAnalysis?.sentiment}</p>
                </div>

                {analysisResult.textAnalysis?.suspiciousPatterns &&
                  analysisResult.textAnalysis.suspiciousPatterns.length > 0 && (
                    <div>
                      <span className="text-sm font-medium">Suspicious Patterns</span>
                      <ul className="mt-2 space-y-1">
                        {analysisResult.textAnalysis.suspiciousPatterns.map((pattern, index) => (
                          <li key={index} className="flex items-center text-sm text-red-600">
                            <AlertTriangle className="h-3 w-3 mr-2" />
                            {pattern}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </CardContent>
            </Card>

            {/* URL Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Link className="h-5 w-5 mr-2" />
                  URL & Domain Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Domain Reputation</span>
                  <Badge variant={analysisResult.urlAnalysis?.reputation === "Good" ? "secondary" : "destructive"}>
                    {analysisResult.urlAnalysis?.reputation}
                  </Badge>
                </div>

                <div>
                  <span className="text-sm font-medium">Analysis Details</span>
                  <ul className="mt-2 space-y-1">
                    {analysisResult.urlAnalysis?.details.map((detail, index) => (
                      <li key={index} className="flex items-center text-sm">
                        {analysisResult.urlAnalysis?.suspicious ? (
                          <AlertTriangle className="h-3 w-3 mr-2 text-red-500" />
                        ) : (
                          <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                        )}
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detection Reasons */}
          <Card>
            <CardHeader>
              <CardTitle>Detection Reasons</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysisResult.reasons.map((reason, index) => (
                  <li key={index} className="flex items-center">
                    {analysisResult.threatLevel === "safe" ? (
                      <CheckCircle className="h-4 w-4 mr-3 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 mr-3 text-red-500" />
                    )}
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex space-x-4">
            <Button variant="outline">
              <Mail className="h-4 w-4 mr-2" />
              Report False Positive
            </Button>
            <Button variant="outline">
              <Shield className="h-4 w-4 mr-2" />
              Add to Whitelist
            </Button>
            {analysisResult.threatLevel !== "safe" && (
              <Button variant="destructive">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Block Sender
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
