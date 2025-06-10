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
import { apiService } from "@/lib/api"
import type { EmailPayload, VerdictRequest } from "@/lib/api/types"

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
    
    try {
      // Create email payload for the API
      const emailPayload: EmailPayload = {
        subject: subject,
        sender: senderEmail,
        recipient: "user@example.com", // In a real app, this would be the logged-in user
        body: emailContent,
        raw: uploadedFile ? undefined : emailContent, // Only send raw if we don't have a file
      };
      
      // Create verdict request
      const verdictRequest: VerdictRequest = {
        email: emailPayload,
        send_notification: true,
        user_email: "user@example.com", // In a real app, this would be the logged-in user's email
      };
      
      // If we have an uploaded file, try to parse it first
      if (uploadedFile) {
        try {
          // For .eml files, parse them using the API
          const parsedEmail = await apiService.parseEmlFile(uploadedFile);
          
          // Update the form fields with the parsed data
          if (parsedEmail.subject) setSubject(parsedEmail.subject);
          if (parsedEmail.from && parsedEmail.from.length > 0) {
            setSenderEmail(parsedEmail.from[0].email);
          }
          if (parsedEmail.body) setEmailContent(parsedEmail.body);
          
          // Update the verdict request with the parsed data
          verdictRequest.email = {
            ...verdictRequest.email,
            subject: parsedEmail.subject || subject,
            sender: parsedEmail.from && parsedEmail.from.length > 0 ? parsedEmail.from[0].email : senderEmail,
            body: parsedEmail.body || emailContent,
          };
        } catch (error) {
          console.error("Error parsing email file:", error);
          // Continue with original data if parsing fails
        }
      }
      
      // Call the API to get the verdict
      const response = await apiService.getVerdict(verdictRequest);
      
      // Map the API response to our UI model
      const apiResult: AnalysisResult = {
        verdict: response.verdict,
        confidence: response.risk_score / 100, // Convert from 0-100 to 0-1 range
        reasons: response.evidence.map(evidence => evidence.description),
        
        // URL analysis mapping
        urlAnalysis: {
          suspicious: response.evidence.some(e => e.type === 'links' && e.score > 50),
          reputation: response.evidence.some(e => e.type === 'links' && e.score > 50) ? "Poor" : "Good",
          details: response.evidence
            .filter(e => e.type === 'links')
            .map(e => e.description),
          suspiciousLinks: response.evidence
            .filter(e => e.type === 'links')
            .reduce((count, e) => (e.suspicious_urls?.length || 0) + count, 0),
          totalLinks: response.evidence
            .filter(e => e.type === 'links')
            .reduce((count, e) => (e.suspicious_urls?.length || 0) + count, 0),
        },
        
        // Text analysis mapping
        textAnalysis: {
          sentiment: response.verdict === 'safe' ? "Informational" : "Manipulative",
          urgencyScore: response.risk_score,
          suspiciousPatterns: response.evidence
            .filter(e => e.type === 'content')
            .map(e => e.description),
        },
        
        // Sender analysis mapping
        senderAnalysis: {
          domainReputation: response.evidence.some(e => e.type === 'sender' && e.score > 50) ? "Poor" : "Good",
          spfStatus: response.evidence.some(e => e.type === 'sender' && e.description.includes("SPF")) ? "Fail" : "Pass",
          dkimStatus: response.evidence.some(e => e.type === 'sender' && e.description.includes("DKIM")) ? "Fail" : "Pass",
          details: response.evidence
            .filter(e => e.type === 'sender')
            .map(e => e.description),
        },
        
        // Subject analysis mapping
        subjectAnalysis: {
          score: response.evidence
            .filter(e => e.type === 'subject')
            .reduce((sum, e) => sum + e.score/100, 0) / 
            Math.max(1, response.evidence.filter(e => e.type === 'subject').length),
          indicators: response.evidence
            .filter(e => e.type === 'subject')
            .map(e => e.description),
        },
      };
      
      setAnalysisResult(apiResult);
    } catch (error) {
      console.error("Error analyzing email:", error);
      
      // Fallback to a simple mock result if the API fails
      const fallbackResult: AnalysisResult = {
        verdict: "suspicious",
        confidence: 0.7,
        reasons: ["API error occurred, using fallback analysis"],
        urlAnalysis: {
          suspicious: emailContent.includes("http"),
          reputation: "Unknown",
          details: ["Could not analyze links due to API error"],
          suspiciousLinks: 0,
          totalLinks: 0,
        },
        textAnalysis: {
          sentiment: "Unknown",
          urgencyScore: 50,
          suspiciousPatterns: ["Could not analyze content due to API error"],
        },
        senderAnalysis: {
          domainReputation: "Unknown",
          spfStatus: "Unknown",
          dkimStatus: "Unknown",
          details: ["Could not analyze sender due to API error"],
        },
        subjectAnalysis: {
          score: 0.5,
          indicators: ["Could not analyze subject due to API error"],
        },
      };
      
      setAnalysisResult(fallbackResult);
    } finally {
      setIsAnalyzing(false);
    }

    // setAnalysisResult(mockResult)
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
