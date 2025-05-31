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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Upload,
  Scan,
  AlertTriangle,
  CheckCircle,
  Shield,
  Link,
  Mail,
  FileText,
  Loader2,
  File,
  X,
  Download,
} from "lucide-react"

interface AnalysisResult {
  verdict: "safe" | "suspicious" | "dangerous" | "critical"
  confidence: number
  reasons: string[]
  urlAnalysis: {
    suspicious: boolean
    reputation: string
    details: string[]
    suspiciousLinks: number
    totalLinks: number
  }
  textAnalysis: {
    sentiment: string
    urgencyScore: number
    suspiciousPatterns: string[]
  }
  senderAnalysis: {
    domainReputation: string
    spfStatus: string
    dkimStatus: string
    details: string[]
  }
  subjectAnalysis: {
    score: number
    indicators: string[]
  }
}

export default function AnalyzePage() {
  const [activeTab, setActiveTab] = useState("upload")
  const [emailContent, setEmailContent] = useState("")
  const [senderEmail, setSenderEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const analyzeEmail = async () => {
    setIsAnalyzing(true)

    // Simulate API call to backend
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock analysis result
    const hasUrgentKeywords =
      emailContent.toLowerCase().includes("urgent") ||
      emailContent.toLowerCase().includes("verify") ||
      subject.toLowerCase().includes("urgent") ||
      subject.toLowerCase().includes("verify")

    const hasLinks = emailContent.includes("http")

    const mockResult: AnalysisResult = {
      verdict: hasUrgentKeywords ? (hasLinks ? "critical" : "dangerous") : hasLinks ? "suspicious" : "safe",
      confidence: Math.random() * 0.3 + 0.7, // 70-100%
      reasons: hasUrgentKeywords
        ? ["Urgency tactics detected", "Suspicious sender domain", "Credential harvesting attempt"]
        : ["Legitimate sender", "Standard content patterns", "No suspicious links"],
      urlAnalysis: {
        suspicious: hasLinks,
        reputation: hasLinks ? "Poor" : "Good",
        details: hasLinks
          ? ["Domain recently registered", "No SSL certificate", "Blacklisted IP"]
          : ["Established domain", "Valid SSL certificate"],
        suspiciousLinks: hasLinks ? Math.floor(Math.random() * 3) + 1 : 0,
        totalLinks: hasLinks ? Math.floor(Math.random() * 5) + 1 : 0,
      },
      textAnalysis: {
        sentiment: hasUrgentKeywords ? "Manipulative" : "Informational",
        urgencyScore: hasUrgentKeywords ? 85 : 15,
        suspiciousPatterns: hasUrgentKeywords
          ? ["Time pressure tactics", "Account verification request", "Suspicious grammar"]
          : [],
      },
      senderAnalysis: {
        domainReputation: hasUrgentKeywords ? "Poor" : "Good",
        spfStatus: hasUrgentKeywords ? "Fail" : "Pass",
        dkimStatus: hasUrgentKeywords ? "Fail" : "Pass",
        details: hasUrgentKeywords
          ? ["Domain age: 2 days", "No valid business records", "Similar to legitimate domain"]
          : ["Domain age: 5+ years", "Valid business records", "Consistent sending history"],
      },
      subjectAnalysis: {
        score: hasUrgentKeywords ? 0.85 : 0.15,
        indicators: hasUrgentKeywords
          ? ["Urgent language", "Action required", "Security alert keywords"]
          : ["Standard notification", "Expected communication"],
      },
    }

    setAnalysisResult(mockResult)
    setIsAnalyzing(false)
  }

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case "critical":
        return "text-red-700 bg-red-50 border-red-300"
      case "dangerous":
        return "text-red-600 bg-red-50 border-red-200"
      case "suspicious":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "safe":
        return "text-green-600 bg-green-50 border-green-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case "critical":
      case "dangerous":
        return <AlertTriangle className="h-5 w-5" />
      case "suspicious":
        return <Shield className="h-5 w-5" />
      case "safe":
        return <CheckCircle className="h-5 w-5" />
      default:
        return <Shield className="h-5 w-5" />
    }
  }

  const getVerdictBadge = (verdict: string) => {
    switch (verdict) {
      case "critical":
        return (
          <Badge variant="destructive" className="bg-red-600">
            Critical
          </Badge>
        )
      case "dangerous":
        return <Badge variant="destructive">Dangerous</Badge>
      case "suspicious":
        return <Badge variant="default">Suspicious</Badge>
      case "safe":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Safe
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0])
    }
  }

  const processFile = (file: File) => {
    setUploadedFile(file)

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setEmailContent(content)

      // Parse email headers
      const lines = content.split("\n")
      const subjectLine = lines.find((line) => line.toLowerCase().startsWith("subject:"))
      const fromLine = lines.find((line) => line.toLowerCase().startsWith("from:"))

      if (subjectLine) setSubject(subjectLine.replace(/^subject:\s*/i, ""))
      if (fromLine) setSenderEmail(fromLine.replace(/^from:\s*/i, ""))
    }
    reader.readAsText(file)
  }

  const clearFile = () => {
    setUploadedFile(null)
    setEmailContent("")
    setSenderEmail("")
    setSubject("")
  }

  const resetAnalysis = () => {
    setAnalysisResult(null)
    setEmailContent("")
    setSenderEmail("")
    setSubject("")
    setUploadedFile(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Email Analysis</h1>
        <p className="text-muted-foreground">Analyze emails for phishing attempts and security threats</p>
      </div>

      {!analysisResult ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload Email File</TabsTrigger>
            <TabsTrigger value="paste">Paste Email Content</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="h-5 w-5 mr-2 text-blue-600" />
                  Upload Email File
                </CardTitle>
                <CardDescription>Upload .eml or .msg files for analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center ${
                    dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {!uploadedFile ? (
                    <>
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <File className="h-10 w-10 text-gray-400" />
                        <p className="text-lg font-medium">Drag and drop your email file here</p>
                        <p className="text-sm text-gray-500">or</p>
                        <Button variant="outline" onClick={() => document.getElementById("file-upload")?.click()}>
                          Select File
                        </Button>
                        <input
                          id="file-upload"
                          type="file"
                          accept=".eml,.msg"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <p className="text-xs text-gray-500 mt-2">Supports .eml and .msg files</p>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-between p-2 border rounded-md">
                      <div className="flex items-center space-x-2">
                        <File className="h-6 w-6 text-blue-500" />
                        <div>
                          <p className="font-medium">{uploadedFile.name}</p>
                          <p className="text-xs text-gray-500">{(uploadedFile.size / 1024).toFixed(2)} KB</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={clearFile}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {uploadedFile && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sender">Detected Sender</Label>
                        <Input
                          id="sender"
                          value={senderEmail}
                          onChange={(e) => setSenderEmail(e.target.value)}
                          placeholder="No sender detected"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subject">Detected Subject</Label>
                        <Input
                          id="subject"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          placeholder="No subject detected"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="preview">Email Content Preview</Label>
                      <div className="border rounded-md p-3 bg-gray-50 max-h-40 overflow-y-auto text-sm">
                        <pre className="whitespace-pre-wrap font-mono">{emailContent.slice(0, 500)}...</pre>
                      </div>
                    </div>

                    <Button onClick={analyzeEmail} disabled={isAnalyzing} className="w-full">
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
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="paste" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-blue-600" />
                  Paste Email Content
                </CardTitle>
                <CardDescription>Enter email details manually for analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sender-input">Sender Email</Label>
                    <Input
                      id="sender-input"
                      placeholder="sender@example.com"
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject-input">Subject Line</Label>
                    <Input
                      id="subject-input"
                      placeholder="Email subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content-input">Email Content</Label>
                  <Textarea
                    id="content-input"
                    placeholder="Paste the email content here for analysis..."
                    className="min-h-[200px]"
                    value={emailContent}
                    onChange={(e) => setEmailContent(e.target.value)}
                  />
                </div>

                <Button onClick={analyzeEmail} disabled={!emailContent.trim() || isAnalyzing} className="w-full">
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="space-y-6">
          {/* Analysis Results */}
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Analysis Results</h2>
            <Button variant="outline" onClick={resetAnalysis}>
              Analyze Another Email
            </Button>
          </div>

          {/* Main Result */}
          <Alert className={getVerdictColor(analysisResult.verdict)}>
            <div className="flex items-center">
              {getVerdictIcon(analysisResult.verdict)}
              <div className="ml-3">
                <AlertDescription className="text-lg font-semibold">
                  {analysisResult.verdict === "safe"
                    ? "Email appears safe"
                    : analysisResult.verdict === "suspicious"
                      ? "Suspicious email detected"
                      : analysisResult.verdict === "dangerous"
                        ? "Dangerous phishing attempt detected"
                        : "Critical security threat detected!"}
                </AlertDescription>
                <p className="text-sm mt-1">Confidence: {(analysisResult.confidence * 100).toFixed(1)}%</p>
              </div>
            </div>
          </Alert>

          {/* Email Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Email Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Subject</Label>
                    <p className="text-lg font-medium">{subject || "No subject"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">From</Label>
                    <p>{senderEmail || "Unknown sender"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Verdict</Label>
                    <div className="mt-1">{getVerdictBadge(analysisResult.verdict)}</div>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Key Risk Factors</Label>
                  <ul className="mt-2 space-y-1">
                    {analysisResult.reasons.map((reason, index) => (
                      <li key={index} className="flex items-center text-sm">
                        {analysisResult.verdict === "safe" ? (
                          <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-3 w-3 mr-2 text-red-500" />
                        )}
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Analysis */}
          <Tabs defaultValue="subject" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="subject">Subject Analysis</TabsTrigger>
              <TabsTrigger value="content">Content Analysis</TabsTrigger>
              <TabsTrigger value="links">Link Analysis</TabsTrigger>
              <TabsTrigger value="sender">Sender Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="subject" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Mail className="h-5 w-5 mr-2" />
                    Subject Line Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Risk Score</span>
                      <span className="text-sm">{(analysisResult.subjectAnalysis.score * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={analysisResult.subjectAnalysis.score * 100} />
                  </div>

                  <div>
                    <span className="text-sm font-medium">Detected Indicators</span>
                    <ul className="mt-2 space-y-1">
                      {analysisResult.subjectAnalysis.indicators.map((indicator, index) => (
                        <li key={index} className="flex items-center text-sm">
                          {analysisResult.subjectAnalysis.score > 0.5 ? (
                            <AlertTriangle className="h-3 w-3 mr-2 text-red-500" />
                          ) : (
                            <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                          )}
                          {indicator}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 bg-gray-50 rounded border">
                    <p className="text-sm font-medium">Subject: {subject || "No subject"}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Content Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Urgency Score</span>
                      <span className="text-sm">{analysisResult.textAnalysis.urgencyScore}%</span>
                    </div>
                    <Progress value={analysisResult.textAnalysis.urgencyScore} />
                  </div>

                  <div>
                    <span className="text-sm font-medium">Sentiment Analysis</span>
                    <p className="text-sm text-gray-600 mt-1">{analysisResult.textAnalysis.sentiment}</p>
                  </div>

                  {analysisResult.textAnalysis.suspiciousPatterns.length > 0 && (
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

                  <div>
                    <span className="text-sm font-medium">Email Content Preview</span>
                    <div className="mt-2 p-3 bg-gray-50 rounded border max-h-40 overflow-y-auto">
                      <pre className="text-sm whitespace-pre-wrap font-mono">{emailContent.slice(0, 500)}...</pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="links" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Link className="h-5 w-5 mr-2" />
                    URL & Link Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Domain Reputation</span>
                    <Badge variant={analysisResult.urlAnalysis.reputation === "Good" ? "secondary" : "destructive"}>
                      {analysisResult.urlAnalysis.reputation}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Links Detected</span>
                    <span className="text-sm">
                      {analysisResult.urlAnalysis.totalLinks} ({analysisResult.urlAnalysis.suspiciousLinks} suspicious)
                    </span>
                  </div>

                  <div>
                    <span className="text-sm font-medium">Analysis Details</span>
                    <ul className="mt-2 space-y-1">
                      {analysisResult.urlAnalysis.details.map((detail, index) => (
                        <li key={index} className="flex items-center text-sm">
                          {analysisResult.urlAnalysis.suspicious ? (
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
            </TabsContent>

            <TabsContent value="sender" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Mail className="h-5 w-5 mr-2" />
                    Sender Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <span className="text-sm font-medium">Domain Reputation</span>
                      <Badge
                        variant={
                          analysisResult.senderAnalysis.domainReputation === "Good" ? "secondary" : "destructive"
                        }
                        className={
                          analysisResult.senderAnalysis.domainReputation === "Good" ? "bg-green-100 text-green-800" : ""
                        }
                      >
                        {analysisResult.senderAnalysis.domainReputation}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <span className="text-sm font-medium">SPF Check</span>
                      <Badge
                        variant={analysisResult.senderAnalysis.spfStatus === "Pass" ? "secondary" : "destructive"}
                        className={
                          analysisResult.senderAnalysis.spfStatus === "Pass" ? "bg-green-100 text-green-800" : ""
                        }
                      >
                        {analysisResult.senderAnalysis.spfStatus}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <span className="text-sm font-medium">DKIM Check</span>
                      <Badge
                        variant={analysisResult.senderAnalysis.dkimStatus === "Pass" ? "secondary" : "destructive"}
                        className={
                          analysisResult.senderAnalysis.dkimStatus === "Pass" ? "bg-green-100 text-green-800" : ""
                        }
                      >
                        {analysisResult.senderAnalysis.dkimStatus}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm font-medium">Sender Details</span>
                    <ul className="mt-2 space-y-1">
                      {analysisResult.senderAnalysis.details.map((detail, index) => (
                        <li key={index} className="flex items-center text-sm">
                          {analysisResult.senderAnalysis.domainReputation === "Good" ? (
                            <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-3 w-3 mr-2 text-red-500" />
                          )}
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 bg-gray-50 rounded border">
                    <p className="text-sm font-medium">From: {senderEmail || "Unknown sender"}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="flex flex-wrap gap-4">
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Export Analysis Report
            </Button>
            <Button variant="outline">
              <Mail className="h-4 w-4 mr-2" />
              Report False Positive
            </Button>
            <Button variant="outline">
              <Shield className="h-4 w-4 mr-2" />
              Add to Whitelist
            </Button>
            {analysisResult.verdict !== "safe" && (
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
