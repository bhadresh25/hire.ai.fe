import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { CriteriaReviewForm, ReviewCriteria } from "./CriteriaReviewForm";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { CheckCircle, Clock, User, Calendar } from "lucide-react";
import { useToast } from "../../hooks/use-toast";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName: string;
  candidateEmail: string;
  position: string;
  interviewDate?: string;
  existingReview?: ReviewData;
  onSave: (reviewData: ReviewData) => void;
}

export interface ReviewData {
  overallRating: number;
  progress: {
    totalCriteria: number;
    completedCriteria: number;
    percentage: number;
  };
  criteria: Array<{
    title: string;
    description: string;
    rating: number;
    feedback: string;
    createdAt: Date;
    _id?: string;
    isDefault?: boolean;
  }>;
}

const defaultCriteria: ReviewCriteria[] = [
  {
    id: "technical-knowledge",
    name: "Technical Knowledge",
    description: "Accounting principles, GST, Software",
    rating: 0,
    comment: "",
    isCustom: false
  },
  {
    id: "excel-proficiency",
    name: "Excel Proficiency",
    description: "VLOOKUP, Pivot Tables, basic formulas",
    rating: 0,
    comment: "",
    isCustom: false
  },
  {
    id: "communication-clarity",
    name: "Communication Clarity",
    description: "Explains concepts well",
    rating: 0,
    comment: "",
    isCustom: false
  },
  {
    id: "professional-attitude",
    name: "Professional Attitude",
    description: "Punctuality, politeness, interest",
    rating: 0,
    comment: "",
    isCustom: false
  },
  {
    id: "problem-solving",
    name: "Problem-Solving Ability",
    description: "Handles real scenarios effectively",
    rating: 0,
    comment: "",
    isCustom: false
  },
  {
    id: "cultural-fit",
    name: "Cultural Fit",
    description: "Teamwork, accountability, learning mindset",
    rating: 0,
    comment: "",
    isCustom: false
  }
];

export const ReviewModal = ({
  isOpen,
  onClose,
  candidateName,
  candidateEmail,
  position,
  interviewDate,
  existingReview,
  onSave
}: ReviewModalProps) => {
  const [criteria, setCriteria] = useState<ReviewCriteria[]>(defaultCriteria);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      if (existingReview) {
        // Load existing review data
        const existingCriteria: ReviewCriteria[] = existingReview.criteria.map(criterion => ({
          id: criterion._id || `criteria-${Date.now()}-${Math.random()}`,
          name: criterion.title,
          description: criterion.description,
          rating: criterion.rating,
          comment: criterion.feedback,
          isCustom: !criterion.isDefault // Use isDefault field instead of checking against defaultCriteria
        }));
        setCriteria(existingCriteria);
      } else {
        // Reset to default criteria for new review
        setCriteria(defaultCriteria);
      }
    }
  }, [isOpen, existingReview]);

  const getOverallRating = () => {
    const validRatings = criteria.filter(c => c.rating > 0);
    if (validRatings.length === 0) return 0;
    return Number((validRatings.reduce((sum, c) => sum + c.rating, 0) / validRatings.length).toFixed(1));
  };

  const getCompletionPercentage = () => {
    const completedCriteria = criteria.filter(c => c.rating > 0).length;
    return (completedCriteria / criteria.length) * 100;
  };

  const isReviewComplete = () => {
    return criteria.every(c => c.rating > 0);
  };

  const handleSave = async (isDraft = false) => {
    setIsSaving(true);
    try {
      const completedCriteria = criteria.filter(c => c.rating > 0).length;
      const totalCriteria = criteria.length;
      const percentage = totalCriteria > 0 ? (completedCriteria / totalCriteria) * 100 : 0;

      const reviewData: ReviewData = {
        overallRating: getOverallRating(),
        progress: {
          totalCriteria,
          completedCriteria,
          percentage: Math.round(percentage)
        },
        criteria: criteria.map(criterion => ({
          title: criterion.name,
          description: criterion.description,
          rating: criterion.rating,
          feedback: criterion.comment,
          createdAt: new Date(),
          isDefault: !criterion.isCustom // Set isDefault to false if criteria is custom (modified)
        }))
      };

      await onSave(reviewData);
      
      toast({
        title: isDraft ? "Review saved as draft" : "Review completed",
        description: isDraft 
          ? "You can continue editing this review later" 
          : "Review has been successfully submitted",
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Error saving review",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-start justify-between pr-8">
            <div className="space-y-2 flex-1">
              <DialogTitle className="text-2xl font-bold">
                Candidate Review
              </DialogTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="font-medium">{candidateName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{position}</Badge>
                </div>
                {interviewDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{interviewDate}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-right space-y-1 min-w-fit">
              <div className="flex items-center gap-2 justify-end">
                {isReviewComplete() ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <Clock className="h-5 w-5 text-yellow-500" />
                )}
                <span className="text-sm font-medium whitespace-nowrap">
                  {Math.round(getCompletionPercentage())}% Complete
                </span>
              </div>
              <div className="text-xs text-muted-foreground whitespace-nowrap">
                {criteria.filter(c => c.rating > 0).length} of {criteria.length} criteria rated
              </div>
            </div>
          </div>
        </DialogHeader>
        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="px-6 py-4">
            <CriteriaReviewForm
              criteria={criteria}
              onCriteriaChange={setCriteria}
            />
          </div>
        </ScrollArea>
        <Separator />
        <div className="px-6 py-4 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-sm font-medium">
                Overall Rating: {getOverallRating() > 0 ? `${getOverallRating()}/5` : "Pending"}
              </div>
              <div className="text-xs text-muted-foreground">
                {isReviewComplete() ? "All criteria completed" : "Complete all ratings to finish review"}
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={onClose}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button 
                onClick={() => handleSave(false)}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSaving ? "Saving..." : isReviewComplete() ? "Complete Review" : "Save Progress"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 