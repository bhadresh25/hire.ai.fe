import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, Trash2, Mail, Phone, MapPin, ChevronDown, User, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { CandidateStatus } from "../pages/Candidates";

// Helper function to format date
const formatDate = (dateString: string) => {
  if (!dateString) return "Date not available"
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch (error) {
    return "Invalid date"
  }
}

interface CandidateCardProps {
  candidate: {
    _id: string;
    personalInfo: {
      fullName: string;
      email: string;
      phone: string;
      location?: string;
    };
    professionalInfo: {
      currentTitle?: string;
    };
    roleApplied?: {
      role?: string;
    };
    technicalSkills?: string[];
    softSkills?: string[];
    status?: CandidateStatus;
    createdAt?: string;
  };
  onStatusChange: (id: string, status: CandidateStatus) => void;
  onViewDetails: (id: string) => void;
  onDelete: (id: string) => void;
}

const statusConfig = {
  "in-progress": {
    label: "In Progress",
    color: "bg-blue-500 text-white",
    variant: "default" as const,
  },
  hold: {
    label: "On Hold",
    color: "bg-orange-500 text-white",
    variant: "secondary" as const,
  },
  accepted: {
    label: "Accepted",
    color: "bg-green-500 text-white",
    variant: "default" as const,
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-500 text-white",
    variant: "destructive" as const,
  },
};

export default function CandidateCard({ candidate, onStatusChange, onViewDetails, onDelete }: CandidateCardProps) {
  const status = candidate.status || "in-progress";
  const statusInfo = statusConfig[status];
  const skills = [
    ...(candidate.technicalSkills || []),
    ...(candidate.softSkills || []),
  ];

  return (
    <Card className="p-5 hover:shadow-md transition-shadow w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Avatar - match resume-flow-status */}
          <div className="candidate-avatar-custom w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0">
            {/* Custom filled person SVG icon, dark/black color */}
            <svg width="28" height="28" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="8" r="4" style={{ fill: '#374151' }} />
              <path d="M4 20c0-2.21 3.58-4 8-4s8 1.79 8 4v1H4v-1z" style={{ fill: '#374151' }} />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            {/* Name and status badge */}
            <div className="flex items-center gap-3 mb-3">
              <h3 className="font-semibold text-lg text-foreground truncate">{candidate.personalInfo.fullName}</h3>
              <Badge className={cn("text-xs font-medium flex-shrink-0", statusInfo.color)}>
                {statusInfo.label}
              </Badge>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{candidate.personalInfo.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{candidate.personalInfo.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{candidate.personalInfo.location || "Location not specified"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{formatDate(candidate.createdAt || "")}</span>
              </div>
            </div>

            {/* Role and position */}
            <div className="mb-3">
              <div className="text-sm">
                <span className="font-medium text-foreground">{candidate.professionalInfo.currentTitle || "No title specified"}</span>
                <span className="text-muted-foreground ml-2">• {candidate.roleApplied?.role || "No role specified"}</span>
              </div>
            </div>

            {/* Skills */}
            <div className="flex flex-wrap gap-2">
              {/* Combine all skills and show only first 7 */}
              {[
                ...(candidate.technicalSkills || []),
                ...(candidate.softSkills || [])
              ].slice(0, 7).map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-xs px-2 py-1">
                  {skill}
                </Badge>
              ))}
              {/* Show "+X more" if there are more than 7 skills */}
              {((candidate.technicalSkills?.length || 0) + (candidate.softSkills?.length || 0)) > 7 && (
                <Badge variant="outline" className="text-xs px-2 py-1">
                  +{((candidate.technicalSkills?.length || 0) + (candidate.softSkills?.length || 0)) - 7} more
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 ml-4 flex-shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
                Status
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => onStatusChange(candidate._id, "in-progress")}> 
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mr-2"></div>
                In Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange(candidate._id, "hold")}> 
                <div className="w-2.5 h-2.5 rounded-full bg-orange-500 mr-2"></div>
                On Hold
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange(candidate._id, "accepted")}> 
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 mr-2"></div>
                Accepted
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange(candidate._id, "rejected")}> 
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 mr-2"></div>
                Rejected
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onViewDetails(candidate._id)}
            className="gap-1.5 h-8 text-xs"
          >
            <Eye className="w-3 h-3" />
            Details
          </Button>

          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onDelete(candidate._id)}
            className="gap-1.5 h-8 text-xs text-destructive hover:text-destructive"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </Card>
  );
} 