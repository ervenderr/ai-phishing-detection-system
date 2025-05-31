'use client';

import type React from 'react';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
} from 'lucide-react';
import { apiService } from '@/lib/api';
import type { Evidence, ActionableInsight } from '@/lib/api/types';

interface AnalysisResult {
  verdict: 'safe' | 'suspicious' | 'dangerous' | 'critical';
  riskScore: number;
  description: string;
  recommendedAction: string;
  evidence: Evidence[];
  analysisDetails: {
    mlSubjectScore: number;
    mlBodyScore: number;
    linkScore: number;
    senderScore: number;
  };
  actionableInsights: ActionableInsight[];
}

export function EmailAnalyzer() {
  const [emailContent, setEmailContent] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const analyzeEmail = async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      // Call the API service to get the verdict
      const response = await apiService.getVerdict({
        email: {
          subject: subject,
          sender: senderEmail,
          recipient: 'user@example.com', // Could be made configurable in the future
          body: emailContent,
        },
        send_notification: true,
      });

      // Map API response to our AnalysisResult interface
      const result: AnalysisResult = {
        verdict: response.verdict,
        riskScore: response.risk_score,
        description: response.description,
        recommendedAction: response.recommended_action,
        evidence: response.evidence,
        analysisDetails: {
          mlSubjectScore: response.analysis_details.ml_subject_score,
          mlBodyScore: response.analysis_details.ml_body_score,
          linkScore: response.analysis_details.link_score,
          senderScore: response.analysis_details.sender_score,
        },
        actionableInsights: response.actionable_insights,
      };

      setAnalysisResult(result);
    } catch (error) {
      console.error('Error analyzing email:', error);
      setAnalysisError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'text-red-700 bg-red-50 border-red-300';
      case 'dangerous':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'suspicious':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'safe':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getThreatIcon = (level: string) => {
    switch (level) {
      case 'critical':
      case 'dangerous':
        return <AlertTriangle className="h-5 w-5" />;
      case 'suspicious':
        return <Shield className="h-5 w-5" />;
      case 'safe':
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <Shield className="h-5 w-5" />;
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.name.endsWith('.eml') || file.name.endsWith('.msg'))) {
      setIsAnalyzing(true);
      setAnalysisError(null);

      try {
        // Parse the EML file using the API
        const parsedEmail = await apiService.parseEmlFile(file);

        // Set the parsed email data
        setEmailContent(parsedEmail.body);
        setSenderEmail(parsedEmail.from[0]?.email || '');
        setSubject(parsedEmail.subject);

        // After parsing, automatically analyze the email
        const response = await apiService.getVerdict({
          email: {
            subject: parsedEmail.subject,
            sender: parsedEmail.from[0]?.email || '',
            recipient: parsedEmail.to[0]?.email || 'user@example.com',
            body: parsedEmail.body,
          },
          send_notification: true,
        });

        // Map API response to our AnalysisResult interface
        const result: AnalysisResult = {
          verdict: response.verdict,
          riskScore: response.risk_score,
          description: response.description,
          recommendedAction: response.recommended_action,
          evidence: response.evidence,
          analysisDetails: {
            mlSubjectScore: response.analysis_details.ml_subject_score,
            mlBodyScore: response.analysis_details.ml_body_score,
            linkScore: response.analysis_details.link_score,
            senderScore: response.analysis_details.sender_score,
          },
          actionableInsights: response.actionable_insights,
        };

        setAnalysisResult(result);
      } catch (error) {
        console.error('Error processing EML file:', error);
        setAnalysisError(
          error instanceof Error ? error.message : 'An error occurred while processing the file'
        );
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Scan className="h-5 w-5 mr-2 text-blue-600" />
            Email Analysis Engine
          </CardTitle>
          <CardDescription>
            Analyze emails for phishing attempts using AI-powered detection
          </CardDescription>
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

          {analysisError && (
            <Alert variant="destructive">
              <AlertDescription>{analysisError}</AlertDescription>
            </Alert>
          )}

          <div className="flex space-x-4">
            <Button
              onClick={analyzeEmail}
              disabled={(!emailContent.trim() && !subject.trim()) || isAnalyzing}
              className="flex-1"
            >
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
            <Button
              variant="outline"
              onClick={() => document.getElementById('email-file-upload')?.click()}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Upload .eml File
            </Button>
          </div>
        </CardContent>
      </Card>

      {analysisResult && (
        <div className="space-y-6">
          {/* Main Result */}
          <Alert className={getThreatColor(analysisResult.verdict)}>
            <div className="flex items-center">
              {getThreatIcon(analysisResult.verdict)}
              <div className="ml-3">
                <AlertDescription className="text-lg font-semibold">
                  {analysisResult.description}
                </AlertDescription>
                <p className="text-sm mt-1">
                  Risk Score: {analysisResult.riskScore.toFixed(1)}/100
                </p>
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
                  Email Content Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Subject Risk Score</span>
                    <span className="text-sm">
                      {Math.round(analysisResult.analysisDetails.mlSubjectScore * 100)}%
                    </span>
                  </div>
                  <Progress value={analysisResult.analysisDetails.mlSubjectScore * 100} />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Body Risk Score</span>
                    <span className="text-sm">
                      {Math.round(analysisResult.analysisDetails.mlBodyScore * 100)}%
                    </span>
                  </div>
                  <Progress value={analysisResult.analysisDetails.mlBodyScore * 100} />
                </div>

                {analysisResult.actionableInsights &&
                  analysisResult.actionableInsights.length > 0 && (
                    <div>
                      <span className="text-sm font-medium">Insights</span>
                      <ul className="mt-2 space-y-1">
                        {analysisResult.actionableInsights.map((insight, index) => (
                          <li
                            key={index}
                            className={`flex items-center text-sm ${
                              insight.type === 'danger'
                                ? 'text-red-600'
                                : insight.type === 'warning'
                                ? 'text-yellow-600'
                                : 'text-blue-600'
                            }`}
                          >
                            {insight.type === 'danger' ? (
                              <AlertTriangle className="h-3 w-3 mr-2" />
                            ) : (
                              <Shield className="h-3 w-3 mr-2" />
                            )}
                            {insight.message}
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
                  URL & Sender Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Links Risk Score</span>
                    <span className="text-sm">
                      {Math.round(analysisResult.analysisDetails.linkScore * 100)}%
                    </span>
                  </div>
                  <Progress value={analysisResult.analysisDetails.linkScore * 100} />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Sender Risk Score</span>
                    <span className="text-sm">
                      {Math.round(analysisResult.analysisDetails.senderScore * 100)}%
                    </span>
                  </div>
                  <Progress value={analysisResult.analysisDetails.senderScore * 100} />
                </div>

                <div>
                  <span className="text-sm font-medium">Suspicious URLs</span>
                  <ul className="mt-2 space-y-1">
                    {analysisResult.evidence
                      .filter(
                        (ev) =>
                          ev.type === 'links' && ev.suspicious_urls && ev.suspicious_urls.length > 0
                      )
                      .map((ev) =>
                        ev.suspicious_urls?.map((url, urlIdx) => (
                          <li
                            key={`${ev.description}-${urlIdx}`}
                            className="flex items-center text-sm text-red-600 break-all"
                          >
                            <AlertTriangle className="h-3 w-3 mr-2 flex-shrink-0" />
                            {url}
                          </li>
                        ))
                      )}
                    {!analysisResult.evidence.some(
                      (ev) =>
                        ev.type === 'links' && ev.suspicious_urls && ev.suspicious_urls.length > 0
                    ) && (
                      <li className="flex items-center text-sm text-green-600">
                        <CheckCircle className="h-3 w-3 mr-2" />
                        No suspicious URLs detected
                      </li>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detection Reasons */}
          <Card>
            <CardHeader>
              <CardTitle>Evidence</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysisResult.evidence.map((evidence, index) => (
                  <li key={index} className="flex items-center">
                    {evidence.score < 0.3 ? (
                      <CheckCircle className="h-4 w-4 mr-3 text-green-500 flex-shrink-0" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 mr-3 text-red-500 flex-shrink-0" />
                    )}
                    <span>
                      <strong>[{evidence.type}]</strong> {evidence.description}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-wrap space-x-2 space-y-2 sm:space-y-0">
            <Button variant="outline">
              <Mail className="h-4 w-4 mr-2" />
              Report False Positive
            </Button>
            <Button variant="outline">
              <Shield className="h-4 w-4 mr-2" />
              Add to Whitelist
            </Button>
            {analysisResult.verdict !== 'safe' && (
              <Button variant="destructive">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Block Sender
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
