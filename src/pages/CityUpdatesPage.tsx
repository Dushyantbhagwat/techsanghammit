import { CityUpdatesFeed } from "@/components/city-updates/CityUpdatesFeed";
import { BusinessPromotions } from "@/components/city-updates/BusinessPromotions";
import { BusinessSubmissionPage } from "./BusinessSubmissionPage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Plus } from "lucide-react";
import { useCity } from "@/contexts/CityContext";

type TabValue = 'updates' | 'business';

export function CityUpdatesPage() {
  const [activeTab, setActiveTab] = useState<TabValue>('updates');
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const { selectedCity } = useCity();

  if (showSubmissionForm) {
    return <BusinessSubmissionPage onBack={() => setShowSubmissionForm(false)} />;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-background border-b">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabValue)}>
                <TabsList className="w-auto justify-start">
                  <TabsTrigger
                    value="updates"
                    className="data-[state=active]:border-primary data-[state=active]:bg-primary/10"
                  >
                    City Updates
                  </TabsTrigger>
                  <TabsTrigger
                    value="business"
                    className="data-[state=active]:border-primary data-[state=active]:bg-primary/10"
                  >
                    Business Promotions
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {activeTab === 'business' && (
                <Button
                  onClick={() => setShowSubmissionForm(true)}
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Submit Promotion
                </Button>
              )}
            </div>

            <div className="text-sm text-muted-foreground">
              {selectedCity}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-6">
          {activeTab === 'updates' ? (
            <CityUpdatesFeed />
          ) : (
            <BusinessPromotions />
          )}
        </div>
      </div>
    </div>
  );
}