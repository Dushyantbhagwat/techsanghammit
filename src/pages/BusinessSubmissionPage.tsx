import { BusinessSubmissionForm } from "@/components/city-updates/BusinessSubmissionForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

import { BusinessSubmission } from "@/types/business";

interface BusinessSubmissionPageProps {
  onBack?: () => void;
  onSubmitSuccess?: (submission: BusinessSubmission) => void;
}

export function BusinessSubmissionPage({ onBack, onSubmitSuccess }: BusinessSubmissionPageProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="bg-background border-b">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Promotions
            </Button>
            <h1 className="text-xl font-semibold">Submit Business Promotion</h1>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <p className="text-muted-foreground">
                Promote your business to the local community. Fill out the form below to submit your promotion.
              </p>
            </div>
            
            <BusinessSubmissionForm onSubmitSuccess={onSubmitSuccess} />
          </div>
        </div>
      </div>
    </div>
  );
}