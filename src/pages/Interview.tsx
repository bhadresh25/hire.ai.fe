import { useState, useEffect, useCallback } from "react"
import { Layout } from "@/components/Layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Upload, FileText, Settings, ChevronDown, ChevronRight, Sparkles, RotateCcw, AlertCircle, Search, CheckCircle, TrendingUp } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Question {
  question: string
  type: string
  complexity: string
  expectedAnswer: string
  skills: string[]
}

interface APIQuestion {
  question: string
  type: string
  complexity: string
  expectedAnswer: string
  skills: string[]
}

interface APIResponse {
  success: boolean
  data: {
    role: string
    requestedSkills: string[]
    questionComplexity: number
    numberOfQuestions: number
    questions: APIQuestion[]
  }
  timestamp: string
}

interface Role {
  _id: string
  role: string
  skills: string[]
}

interface CompatibilityResult {
  score: number
  overallAssessment: string
  strengths: string[]
  missingSkills: string[]
  recommendations: string[]
  skillMatches: { skill: string; proficiency: string; match: boolean }[]
}

export default function Interview() {
  const { toast } = useToast()
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [selectedRole, setSelectedRole] = useState("")
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [complexity, setComplexity] = useState(50)
  const [questionCount, setQuestionCount] = useState(10)
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set())
  const [newSkill, setNewSkill] = useState("");
  const [addingSkill, setAddingSkill] = useState(false);
  const [showSkillInput, setShowSkillInput] = useState(false);
  const [customInstructions, setCustomInstructions] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [compatibilityResult, setCompatibilityResult] = useState<CompatibilityResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // API data states
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch roles on component mount
  useEffect(() => {
    fetchRoles()
  }, [])

  const fetchRoles = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('https://7ngkk5dj-3000.inc1.devtunnels.ms/api/candidate-role-skills')
      if (!response.ok) {
        throw new Error(`Failed to fetch roles: ${response.status}`)
      }
      const result = await response.json()
      const data = result.data || result
      const rolesArray = Array.isArray(data) ? data : []
      setRoles(rolesArray)
    } catch (error) {
      console.error('Error fetching roles:', error)
      setError('Failed to fetch roles. Please check if the API server is running.')
      toast({
        title: "Error",
        description: "Failed to fetch roles. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Get available skills for selected role
  const availableSkills = roles.find(role => role._id === selectedRole)?.skills || []

  const getComplexityLabel = (value: number): string => {
    if (value <= 25) return "Easy"
    if (value <= 50) return "Medium-Low"
    if (value <= 75) return "Medium-High"
    return "Hard"
  }

  const getComplexityDescription = (value: number): string => {
    if (value <= 25) return "Basic concepts and straightforward implementations"
    if (value <= 50) return "Intermediate concepts with some complexity"
    if (value <= 75) return "Advanced concepts requiring deeper understanding"
    return "Expert-level with edge cases and complex scenarios"
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf" || file.type.includes("word")) {
        setUploadedFile(file);
        toast({
          title: "Resume uploaded",
          description: `${file.name} has been uploaded successfully.`
        });
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF or Word document.",
          variant: "destructive"
        });
      }
    }
  }, [toast]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      toast({
        title: "Resume uploaded",
        description: `${file.name} has been uploaded successfully.`
      })
    }
  }

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    )
  }

  const analyzeCompatibility = async () => {
    if (!uploadedFile || !selectedRole || selectedSkills.length === 0) {
      toast({
        title: "Missing information",
        description: "Please upload a resume, select a role, and choose skills first.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('pdf', uploadedFile);
      formData.append('role', roles.find(r => r._id === selectedRole)?.role || '');
      formData.append('skills', JSON.stringify(selectedSkills));

      const response = await fetch('https://7ngkk5dj-3000.inc1.devtunnels.ms/api/interview-questions/candidate-compatibility', {
        method: 'POST',
        body: formData
      });
      if (!response.ok) throw new Error('Failed to analyze compatibility');
      const result = await response.json();

      // Map API response to CompatibilityResult
      const compatibilityResult: CompatibilityResult = {
        score: result.compatibilityScore,
        overallAssessment: result.compatibilitySummary,
        strengths: result.keyStrengths,
        missingSkills: result.skillsToExplore,
        recommendations: result.interviewRecommendations,
        skillMatches: (result.skillAssessment || []).map((s: any) => ({
          skill: s.skill,
          proficiency: s.status,
          match: s.status !== 'Not found'
        }))
      };
      setCompatibilityResult(compatibilityResult);
      toast({
        title: "Analysis complete!",
        description: `Compatibility score: ${compatibilityResult.score}%`
      });
    } catch (error) {
      setCompatibilityResult(null);
      toast({
        title: "Error",
        description: "Failed to analyze compatibility.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateQuestions = async () => {
    if (!selectedRole || selectedSkills.length === 0) {
      toast({
        title: "Missing requirements",
        description: "Please select a role and at least one skill.",
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)
    setGeneratedQuestions([])

    try {
      // Create FormData for the API request
      const formData = new FormData()
      formData.append('role', roles.find(r => r._id === selectedRole)?.role || '')
      formData.append('skills', JSON.stringify(selectedSkills))
      formData.append('questionComplexity', complexity.toString())
      formData.append('numberOfQuestions', questionCount.toString())
      if (customInstructions.trim()) {
        formData.append('customInstructions', customInstructions.trim())
      }
      // Add the uploaded file if it exists
      if (uploadedFile) {
        formData.append('pdf', uploadedFile)
      }

      const response = await fetch('https://7ngkk5dj-3000.inc1.devtunnels.ms/api/interview-questions/generate', {
        method: 'POST',
        body: formData
      })

      let result = null;
      try {
        result = await response.json();
      } catch (e) {
        toast({
          title: "Error",
          description: "Failed to generate questions. Please try again.",
          variant: "destructive"
        });
        return;
      }

      // Show custom error if present (object)
      if (result && result.success === false && result.error) {
        toast({
          title: "Error Generating Questions",
          description: `${result.error}\n${result.reason || ''}`,
          variant: "destructive"
        });
        return;
      }
      // Show custom error if present (array)
      if (Array.isArray(result) && result[0]?.error) {
        toast({
          title: "Error Generating Questions",
          description: `${result[0].error}\n${result[0].reason || ''}`,
          variant: "destructive"
        });
        return;
      }

      // Only show generic error if nothing else matched
      if (!response.ok) {
        toast({
          title: "Error",
          description: "Failed to generate questions. Please try again.",
          variant: "destructive"
        });
        return;
      }

      const questions = result.data?.questions || []
      
      // Transform the API response to match our Question interface
      const transformedQuestions: Question[] = questions.map((q: APIQuestion, index: number) => ({
        question: q.question,
        type: q.type,
        complexity: q.complexity,
        expectedAnswer: q.expectedAnswer,
        skills: q.skills
      }))

      setGeneratedQuestions(transformedQuestions)
      toast({
        title: "Questions generated",
        description: `${transformedQuestions.length} questions have been generated based on your selections.`
      })
    } catch (error) {
      console.error('Error generating questions:', error)
    toast({
        title: "Error",
        description: "Failed to generate questions. Please try again.",
        variant: "destructive"
    })
    } finally {
      setIsGenerating(false)
    }
  }

  const toggleQuestion = (questionIndex: number) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(questionIndex)) {
        newSet.delete(questionIndex)
      } else {
        newSet.add(questionIndex)
      }
      return newSet
    })
  }

  const resetForm = () => {
    setUploadedFile(null)
    setSelectedRole("")
    setSelectedSkills([])
    setComplexity(50)
    setQuestionCount(10)
    setGeneratedQuestions([])
    setExpandedQuestions(new Set())
    setCustomInstructions("");
    
    // Clear file input
    const fileInput = document.getElementById('resume-upload') as HTMLInputElement
    if (fileInput) fileInput.value = ''
  }

  const handleDownloadPdf = async (withAnswers: boolean) => {
    if (!selectedRole || !roles.length || !generatedQuestions.length) {
      toast({
        title: "Missing data",
        description: "Please generate questions first.",
        variant: "destructive"
      });
      return;
    }
    const roleObj = roles.find(r => r._id === selectedRole);
    const payload = {
      role: roleObj?.role || "",
      requestedSkills: selectedSkills,
      questionComplexity: complexity,
      numberOfQuestions: questionCount,
      customInstructions: customInstructions || null,
      questions: generatedQuestions.map(q => ({
        question: q.question,
        type: q.type,
        complexity: q.complexity,
        expectedAnswer: q.expectedAnswer,
        skills: q.skills
      }))
    };
    const url = `https://7ngkk5dj-3000.inc1.devtunnels.ms/api/interview-questions/download-pdf?withAnswers=${withAnswers}`;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error("Failed to download PDF");
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = withAnswers ? "interview-questions-with-answers.pdf" : "interview-questions.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast({ title: "Preparing download", description: "Your download will start shortly..." });
    } catch (err) {
      toast({ title: "Error", description: "Failed to download PDF.", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <Layout 
        title="Interview Generator"
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={resetForm}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        }
      >
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading roles and skills...</p>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout 
        title="Interview Generator"
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={resetForm}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        }
      >
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="interview-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Connection Error</h3>
                  <p className="text-muted-foreground mb-4">{error}</p>
                  <Button onClick={fetchRoles} className="interview-button-primary">
                    Try Again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    )
  }

  return (
    <Layout 
      title="Interview Generator"
      action={
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={resetForm}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      }
    >
      <div className="px-8 py-6">
        {/* Professional Header Section */}
        <div className="mb-8 professional-header">
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-2xl font-semibold header-text-pulse-color">Interview Intelligence Starts Here</h1>
          </div>
          <p className="text-muted-foreground text-base leading-relaxed max-w-3xl">
            Upload a resume, select role and skills, then generate AI-powered interview questions.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Configuration Panel */}
          <div className="vertical-rhythm">
            {/* Resume Upload */}
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Resume Upload
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-primary/50"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {uploadedFile ? (
                    <div className="flex items-center justify-center">
                      <FileText className="h-8 w-8 text-primary mr-3" />
                      <div>
                        <p className="font-medium">{uploadedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg font-medium mb-2">Drop your resume here</p>
                      <p className="text-muted-foreground mb-4">or click to browse files</p>
                    <input
                      id="resume-upload"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                      <Button 
                        variant="outline" 
                        className="rounded-2xl"
                        onClick={() => document.getElementById('resume-upload')?.click()}
                      >
                        Choose File
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Role Selection */}
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle>Role Selection</CardTitle>
              </CardHeader>
              <CardContent>
                <Label htmlFor="role-select">Select Role</Label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Choose a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map(role => (
                        <SelectItem key={role._id} value={role._id}>
                          {role.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
              </CardContent>
            </Card>

                {/* Skills Selection */}
                {selectedRole && (
              <Card className="card-shadow">
                <CardHeader>
                  <CardTitle>Skills Selection</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Select skills to focus on ({selectedSkills.length} selected)
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {availableSkills.map((skill) => (
                      <div key={skill} className="flex items-center space-x-2">
                        <Checkbox
                          id={skill}
                          checked={selectedSkills.includes(skill)}
                          onCheckedChange={() => toggleSkill(skill)}
                        />
                        <Label htmlFor={skill} className="text-sm font-normal cursor-pointer">
                          {skill}
                        </Label>
                      </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Resume Compatibility Check */}
            {uploadedFile && selectedRole && selectedSkills.length > 0 && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    onClick={analyzeCompatibility}
                    disabled={isAnalyzing}
                    variant="outline"
                    size="lg"
                    className="w-full rounded-2xl border-primary/20 hover:border-primary bg-primary/5 hover:bg-primary/10 compatibility-button"
                  >
                    <Search className="h-5 w-5 mr-2" />
                    {isAnalyzing ? "Analyzing Compatibility..." : "Check Resume Compatibility"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Resume Compatibility Analysis
                    </DialogTitle>
                  </DialogHeader>
                  
                  {compatibilityResult && (
                    <div className="space-y-6">
                      {/* Compatibility Score */}
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center space-y-4">
                            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 border-4 border-primary/20">
                              <span className="text-2xl font-bold text-primary">
                                {compatibilityResult.score}%
                              </span>
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold mb-1">Overall Compatibility</h3>
                              <p className="text-muted-foreground">{compatibilityResult.overallAssessment}</p>
                            </div>
                            <Progress value={compatibilityResult.score} className="w-full" />
                          </div>
                        </CardContent>
                      </Card>

                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Strengths */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center text-green-600">
                              <CheckCircle className="h-5 w-5 mr-2" />
                              Key Strengths
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {compatibilityResult.strengths.map((strength, index) => (
                                <li key={index} className="flex items-start">
                                  <CheckCircle className="h-4 w-4 mt-0.5 mr-2 text-green-600 flex-shrink-0" />
                                  <span className="text-sm">{strength}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>

                        {/* Missing Skills */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center text-amber-600">
                              <AlertCircle className="h-5 w-5 mr-2" />
                              Skills to Explore
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {compatibilityResult.missingSkills.length > 0 ? (
                              <ul className="space-y-2">
                                {compatibilityResult.missingSkills.map((skill, index) => (
                                  <li key={index} className="flex items-center">
                                    <AlertCircle className="h-4 w-4 mr-2 text-amber-600" />
                                    <span className="text-sm">{skill}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-muted-foreground">All role skills are covered!</p>
                )}
              </CardContent>
            </Card>
                      </div>

                      {/* Skill Breakdown */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Skill Assessment Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid gap-3">
                            {compatibilityResult.skillMatches.map((skillMatch, index) => (
                              <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                                <div className="flex items-center space-x-3">
                                  {skillMatch.match ? (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <AlertCircle className="h-4 w-4 text-amber-600" />
                                  )}
                                  <span className="font-medium text-sm">{skillMatch.skill}</span>
                                </div>
                                <Badge 
                                  variant={skillMatch.match ? "default" : "secondary"}
                                  className="text-xs"
                                >
                                  {skillMatch.proficiency}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Recommendations */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Sparkles className="h-5 w-5 mr-2" />
                            Interview Recommendations
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-3">
                            {compatibilityResult.recommendations.map((rec, index) => (
                              <li key={index} className="flex items-start">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-3 mt-0.5">
                                  <span className="text-xs font-medium text-primary">{index + 1}</span>
                                </div>
                                <span className="text-sm">{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            )}

            {/* Interview Settings */}
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle>Interview Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Question Complexity Slider */}
                <div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <Label className="text-sm font-medium flex items-center gap-2 mb-3">
                            Question Complexity
                            <span className="text-xs text-muted-foreground">({complexity}/100)</span>
                          </Label>
                          <div className="space-y-4">
                            <Slider
                              value={[complexity]}
                              onValueChange={(value) => setComplexity(value[0])}
                              max={100}
                              min={0}
                              step={1}
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Very Easy</span>
                              <span>Medium</span>
                              <span>Very Hard</span>
                            </div>
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Drag toward 'Hard' for more in-depth/edge-case questions.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{getComplexityLabel(complexity)}</span>
                      <Badge variant="outline" className="text-xs">
                        {complexity <= 25 ? '🟢' : complexity <= 50 ? '🟡' : complexity <= 75 ? '🟠' : '🔴'} Level {Math.ceil(complexity / 25)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {getComplexityDescription(complexity)}
                    </p>
                  </div>
                </div>

                {/* Dynamic Number of Questions */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-medium">Number of Questions</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setQuestionCount(Math.max(1, questionCount - 1))}
                        disabled={questionCount <= 1}
                        className="h-8 w-8 p-0"
                      >
                        -
                      </Button>
                      <span className="min-w-[3rem] text-center font-semibold text-lg">
                        {questionCount}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setQuestionCount(Math.min(20, questionCount + 1))}
                        disabled={questionCount >= 20}
                        className="h-8 w-8 p-0"
                      >
                        +
                      </Button>
                    </div>
                  </div>
                  <Input
                    type="range"
                    min="1"
                    max="20"
                    step="1"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>1 question</span>
                    <span>10 questions</span>
                    <span>20 questions</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {questionCount <= 5 ? 'Quick interview' :
                     questionCount <= 10 ? 'Standard interview' :
                     questionCount <= 15 ? 'Comprehensive interview' : 'Extended assessment'}
                  </p>
                </div>

                {/* Custom Instructions Textarea */}
                <div>
                  <Label className="text-sm font-medium mb-1 block">Additional Instructions (optional)</Label>
                  <textarea
                    value={customInstructions}
                    onChange={e => setCustomInstructions(e.target.value)}
                    placeholder="Add any custom instructions or context for generating the questions..."
                    rows={3}
                    className="w-full rounded-md border border-muted bg-muted/40 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-vertical"
                    style={{ minHeight: '60px' }}
                  />
                </div>

                {/* Generate Button */}
                <Button
                  onClick={generateQuestions}
                  disabled={!selectedRole || selectedSkills.length === 0 || isGenerating}
                  size="lg"
                  className="w-full rounded-2xl button-hover elevated-shadow"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating Questions...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      Generate Interview
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results Panel */}
          <div className="vertical-rhythm">
            {generatedQuestions.length > 0 ? (
              <Card className="card-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Interview Questions</span>
                    <Badge variant="secondary">
                      {generatedQuestions.length} questions
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {generatedQuestions.map((question, index) => (
                      <Collapsible 
                        key={`${question.question}-${index}`}
                        open={expandedQuestions.has(index)}
                        onOpenChange={() => toggleQuestion(index)}
                      >
                        <CollapsibleTrigger className="w-full">
                          <div className="flex items-start gap-3 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors text-left">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold flex-shrink-0">
                              {index + 1}
                            </span>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{question.question}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {question.complexity}
                                </Badge>
                                {expandedQuestions.has(index) ? (
                                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                            </div>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="mt-2 p-4 bg-muted/30 rounded-lg border-l-2 border-primary/20">
                            <h4 className="font-medium text-sm mb-2">Sample Answer:</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {question.expectedAnswer}
                            </p>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                  {/* Download Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                    <Button
                      variant="outline"
                      size="lg"
                      className="flex-1 flex items-center justify-center gap-2 rounded-lg font-semibold"
                      onClick={() => handleDownloadPdf(false)}
                    >
                      <span className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="inline-block">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" />
                        </svg>
                        Download Questions
                      </span>
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="flex-1 flex items-center justify-center gap-2 rounded-lg font-semibold"
                      onClick={() => handleDownloadPdf(true)}
                    >
                      <span className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="inline-block">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" />
                        </svg>
                        Download Questions + Answers
                      </span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            
            ) : (
              <Card className="card-shadow text-center py-12">
                <CardContent>
                  <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Ready to Generate</h3>
                  <p className="text-muted-foreground">
                    Configure your settings and click "Generate Interview" to create customized questions.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}