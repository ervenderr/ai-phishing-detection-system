"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Brain, Play, Download, Upload, Clock, CheckCircle, TrendingUp, Database, Cpu, BarChart3 } from "lucide-react"

interface ModelVersion {
  id: string
  version: string
  accuracy: number
  precision: number
  recall: number
  f1Score: number
  trainingDate: string
  status: "active" | "training" | "archived"
  trainingData: {
    totalSamples: number
    positiveLabels: number
    negativeLabels: number
  }
}

const mockModelVersions: ModelVersion[] = [
  {
    id: "1",
    version: "v2.1.0",
    accuracy: 97.8,
    precision: 96.2,
    recall: 94.8,
    f1Score: 95.5,
    trainingDate: "2024-01-15T10:00:00Z",
    status: "active",
    trainingData: {
      totalSamples: 15420,
      positiveLabels: 2340,
      negativeLabels: 13080,
    },
  },
  {
    id: "2",
    version: "v2.0.3",
    accuracy: 96.4,
    precision: 94.8,
    recall: 93.1,
    f1Score: 93.9,
    trainingDate: "2024-01-10T14:30:00Z",
    status: "archived",
    trainingData: {
      totalSamples: 14200,
      positiveLabels: 2100,
      negativeLabels: 12100,
    },
  },
  {
    id: "3",
    version: "v2.0.2",
    accuracy: 95.1,
    precision: 93.2,
    recall: 91.8,
    f1Score: 92.5,
    trainingDate: "2024-01-05T09:15:00Z",
    status: "archived",
    trainingData: {
      totalSamples: 13800,
      positiveLabels: 1950,
      negativeLabels: 11850,
    },
  },
]

export default function ModelPage() {
  const [isTraining, setIsTraining] = useState(false)
  const [trainingProgress, setTrainingProgress] = useState(0)
  const [selectedModel, setSelectedModel] = useState<ModelVersion | null>(null)

  const startTraining = () => {
    setIsTraining(true)
    setTrainingProgress(0)

    // Simulate training progress
    const interval = setInterval(() => {
      setTrainingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsTraining(false)
          return 100
        }
        return prev + 10
      })
    }, 1000)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Active
          </Badge>
        )
      case "training":
        return <Badge variant="default">Training</Badge>
      case "archived":
        return <Badge variant="outline">Archived</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Model Training & Management</h1>
        <p className="text-muted-foreground">Manage ML models and training pipeline</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="training">Training Pipeline</TabsTrigger>
          <TabsTrigger value="versions">Model Versions</TabsTrigger>
          <TabsTrigger value="performance">Performance Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Model</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">v2.1.0</div>
                <p className="text-xs text-muted-foreground">Accuracy: 97.8%</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Training Data</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">15.4K</div>
                <p className="text-xs text-muted-foreground">Total samples</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Last Training</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5 days</div>
                <p className="text-xs text-muted-foreground">ago</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Model Status</CardTitle>
                <Cpu className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Active</div>
                <p className="text-xs text-muted-foreground">Production ready</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Current Model Performance</CardTitle>
                <CardDescription>Key metrics for the active model</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Accuracy</span>
                    <span className="text-sm font-medium">97.8%</span>
                  </div>
                  <Progress value={97.8} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Precision</span>
                    <span className="text-sm font-medium">96.2%</span>
                  </div>
                  <Progress value={96.2} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Recall</span>
                    <span className="text-sm font-medium">94.8%</span>
                  </div>
                  <Progress value={94.8} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">F1 Score</span>
                    <span className="text-sm font-medium">95.5%</span>
                  </div>
                  <Progress value={95.5} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Training Data Distribution</CardTitle>
                <CardDescription>Current dataset composition</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Total Samples</span>
                  <Badge variant="outline">15,420</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Phishing Samples</span>
                  <Badge variant="destructive">2,340 (15.2%)</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Safe Samples</span>
                  <Badge variant="secondary">13,080 (84.8%)</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>New Feedback</span>
                  <Badge variant="default">127 pending</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Training Pipeline</CardTitle>
              <CardDescription>Retrain the model with new feedback data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isTraining && (
                <Alert>
                  <Brain className="h-4 w-4" />
                  <AlertDescription>
                    Model training in progress... {trainingProgress}% complete
                    <Progress value={trainingProgress} className="mt-2" />
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Data Preparation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>New feedback samples</span>
                        <span>127</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Data validation</span>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Feature extraction</span>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Model Training</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Training epochs</span>
                        <span>50</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Validation split</span>
                        <span>20%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Early stopping</span>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Deployment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Model validation</span>
                        <span>Pending</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>A/B testing</span>
                        <span>Enabled</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Auto-deployment</span>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex space-x-4">
                <Button onClick={startTraining} disabled={isTraining}>
                  <Play className="h-4 w-4 mr-2" />
                  {isTraining ? "Training..." : "Start Training"}
                </Button>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Training Data
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Model
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="versions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Model Version History</CardTitle>
              <CardDescription>Manage and compare different model versions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Version</TableHead>
                    <TableHead>Accuracy</TableHead>
                    <TableHead>Precision</TableHead>
                    <TableHead>Recall</TableHead>
                    <TableHead>F1 Score</TableHead>
                    <TableHead>Training Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockModelVersions.map((model) => (
                    <TableRow key={model.id}>
                      <TableCell className="font-medium">{model.version}</TableCell>
                      <TableCell>{model.accuracy}%</TableCell>
                      <TableCell>{model.precision}%</TableCell>
                      <TableCell>{model.recall}%</TableCell>
                      <TableCell>{model.f1Score}%</TableCell>
                      <TableCell>{new Date(model.trainingDate).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(model.status)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setSelectedModel(model)}>
                                <BarChart3 className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Model Details - {model.version}</DialogTitle>
                                <DialogDescription>
                                  Detailed performance metrics and training information
                                </DialogDescription>
                              </DialogHeader>
                              {selectedModel && <ModelDetailView model={selectedModel} />}
                            </DialogContent>
                          </Dialog>
                          {model.status !== "active" && (
                            <Button variant="outline" size="sm">
                              Activate
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>Model performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Accuracy Improvement</span>
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">+2.7%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">False Positive Rate</span>
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 text-red-500 mr-1 rotate-180" />
                      <span className="text-sm text-green-600">-1.2%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Training Time</span>
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 text-red-500 mr-1 rotate-180" />
                      <span className="text-sm text-green-600">-15 min</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Training Metrics</CardTitle>
                <CardDescription>Latest training session results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Training Duration</span>
                    <span className="text-sm font-medium">2h 34m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Epochs Completed</span>
                    <span className="text-sm font-medium">47/50</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Best Validation Loss</span>
                    <span className="text-sm font-medium">0.0234</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Learning Rate</span>
                    <span className="text-sm font-medium">0.001</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ModelDetailView({ model }: { model: ModelVersion }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium mb-2">Performance Metrics</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Accuracy</span>
              <span className="text-sm font-medium">{model.accuracy}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Precision</span>
              <span className="text-sm font-medium">{model.precision}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Recall</span>
              <span className="text-sm font-medium">{model.recall}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">F1 Score</span>
              <span className="text-sm font-medium">{model.f1Score}%</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Training Data</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Total Samples</span>
              <span className="text-sm font-medium">{model.trainingData.totalSamples.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Positive Labels</span>
              <span className="text-sm font-medium">{model.trainingData.positiveLabels.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Negative Labels</span>
              <span className="text-sm font-medium">{model.trainingData.negativeLabels.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Training Date</span>
              <span className="text-sm font-medium">{new Date(model.trainingDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex space-x-2">
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Download Model
        </Button>
        <Button variant="outline">
          <BarChart3 className="h-4 w-4 mr-2" />
          View Detailed Metrics
        </Button>
      </div>
    </div>
  )
}
