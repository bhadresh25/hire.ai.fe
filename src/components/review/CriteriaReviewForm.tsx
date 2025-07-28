import { useState } from "react";
import { Card } from "../ui/card";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { StarRating } from "./StarRating";
import { Badge } from "../ui/badge";
import { AddCustomCriteria } from "./AddCustomCriteria";
import { EditCriteriaDialog } from "./EditCriteriaDialog";
import { Edit, Trash2 } from "lucide-react";
import { useToast } from "../../hooks/use-toast";

export interface ReviewCriteria {
  id: string;
  name: string;
  description: string;
  rating: number;
  comment: string;
  isCustom?: boolean;
}

interface CriteriaReviewFormProps {
  criteria: ReviewCriteria[];
  onCriteriaChange: (criteria: ReviewCriteria[]) => void;
}

export const CriteriaReviewForm = ({ criteria, onCriteriaChange }: CriteriaReviewFormProps) => {
  const [editingCriteria, setEditingCriteria] = useState<ReviewCriteria | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const updateCriteria = (id: string, field: keyof ReviewCriteria, value: any) => {
    const updated = criteria.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    );
    onCriteriaChange(updated);
  };

  const addCustomCriteria = (newCriteria: ReviewCriteria) => {
    onCriteriaChange([...criteria, newCriteria]);
    toast({
      title: "Custom criteria added",
      description: "You can now rate this new criteria",
    });
  };

  const editCriteria = (updatedCriteria: ReviewCriteria) => {
    const updated = criteria.map(c => 
      c.id === updatedCriteria.id ? { ...updatedCriteria, isCustom: true } : c
    );
    onCriteriaChange(updated);
    toast({
      title: "Criteria updated",
      description: "Changes have been saved successfully",
    });
  };

  const deleteCriteria = (criteriaId: string) => {
    const updated = criteria.filter(c => c.id !== criteriaId);
    onCriteriaChange(updated);
    toast({
      title: "Criteria deleted",
      description: "Review criteria has been removed",
    });
  };

  const handleEditClick = (criteria: ReviewCriteria) => {
    setEditingCriteria(criteria);
    setIsEditDialogOpen(true);
  };

  const getOverallRating = () => {
    const validRatings = criteria.filter(c => c.rating > 0);
    if (validRatings.length === 0) return 0;
    return Number((validRatings.reduce((sum, c) => sum + c.rating, 0) / validRatings.length).toFixed(1));
  };

  const getProgressPercentage = () => {
    const completedCriteria = criteria.filter(c => c.rating > 0).length;
    return (completedCriteria / criteria.length) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-lg">Review Progress</h3>
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            {criteria.filter(c => c.rating > 0).length}/{criteria.length} Completed
          </Badge>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="w-full bg-blue-100 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Overall Rating</div>
            <StarRating
              rating={getOverallRating()}
              onRatingChange={() => {}}
              readonly
              size="sm"
            />
          </div>
        </div>
      </Card>
      {/* Criteria List */}
      <div className="space-y-4">
        {criteria.map((criterion, index) => (
          <Card key={criterion.id} className={`p-5 transition-all duration-200 hover:shadow-md border-l-4 ${criterion.isCustom ? 'border-l-green-400/50' : 'border-l-blue-400/30'}`}>
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="outline" className="text-xs font-medium">
                      {String(index + 1).padStart(2, '0')}
                    </Badge>
                    <h4 className="font-semibold text-lg">{criterion.name}</h4>
                    {criterion.isCustom && (
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                        Custom
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {criterion.description}
                  </p>
                </div>
                {/* Action Buttons */}
                <div className="flex items-center gap-1 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditClick(criterion)}
                    className="h-8 w-8 p-0 hover:bg-blue-50 hover:border-blue-600 hover:text-blue-600"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteCriteria(criterion.id)}
                    className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {/* Rating */}
              <div className="space-y-2">
                <Label htmlFor={`rating-${criterion.id}`} className="text-sm font-medium">
                  Rating
                </Label>
                <StarRating
                  rating={criterion.rating}
                  onRatingChange={(rating) => updateCriteria(criterion.id, 'rating', rating)}
                />
              </div>
              {/* Comment */}
              <div className="space-y-2">
                <Label htmlFor={`comment-${criterion.id}`} className="text-sm font-medium">
                  Comments & Feedback
                </Label>
                <Textarea
                  id={`comment-${criterion.id}`}
                  placeholder="Provide specific feedback and observations..."
                  value={criterion.comment}
                  onChange={(e) => updateCriteria(criterion.id, 'comment', e.target.value)}
                  className="min-h-[80px] resize-none focus:ring-2 focus:ring-blue-200 border-gray-200"
                />
              </div>
            </div>
          </Card>
        ))}
        {/* Add Custom Criteria */}
        <AddCustomCriteria 
          onAddCriteria={addCustomCriteria}
          criteriaCount={criteria.length}
        />
      </div>
      {/* Edit Criteria Dialog */}
      <EditCriteriaDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingCriteria(null);
        }}
        criteria={editingCriteria}
        onSave={editCriteria}
      />
    </div>
  );
}; 