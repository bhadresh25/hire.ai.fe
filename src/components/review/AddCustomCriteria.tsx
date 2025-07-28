import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Plus } from "lucide-react";
import { ReviewCriteria } from "./CriteriaReviewForm";

interface AddCustomCriteriaProps {
  onAddCriteria: (criteria: ReviewCriteria) => void;
  criteriaCount: number;
}

export const AddCustomCriteria = ({ onAddCriteria, criteriaCount }: AddCustomCriteriaProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !description.trim()) return;

    const newCriteria: ReviewCriteria = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      rating: 0,
      comment: "",
      isCustom: true
    };

    onAddCriteria(newCriteria);
    
    // Reset form
    setName("");
    setDescription("");
    setIsOpen(false);
  };

  const handleCancel = () => {
    setName("");
    setDescription("");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full border-dashed border-2 border-blue-300 hover:border-blue-400 text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-16 transition-colors duration-200"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Custom Review Criteria
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Custom Criteria</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="criteria-name">Criteria Name *</Label>
            <Input
              id="criteria-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Leadership Skills"
              maxLength={50}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="criteria-description">Description *</Label>
            <Textarea
              id="criteria-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this criteria evaluates..."
              maxLength={200}
              className="min-h-[80px] resize-none"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || !description.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Add Criteria
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 