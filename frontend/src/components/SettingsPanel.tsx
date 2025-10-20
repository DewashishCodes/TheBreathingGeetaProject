import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface SettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  responseStyle: string;
  onResponseStyleChange: (value: string) => void;
  language: string;
  onLanguageChange: (value: string) => void;
}

export const SettingsPanel = ({
  open,
  onOpenChange,
  responseStyle,
  onResponseStyleChange,
  language,
  onLanguageChange,
}: SettingsPanelProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-card border-border">
        <SheetHeader>
          <SheetTitle className="font-serif text-primary">Settings</SheetTitle>
          <SheetDescription className="text-muted-foreground">
            Customize your spiritual guidance experience
          </SheetDescription>
        </SheetHeader>
        <div className="mt-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="response-style" className="text-foreground">
              Response Style (Author)
            </Label>
            <Select value={responseStyle} onValueChange={onResponseStyleChange}>
              <SelectTrigger id="response-style" className="bg-input border-border">
                <SelectValue />
              </SelectTrigger>
              
<SelectContent className="bg-popover border-border">
  <SelectItem value="Swami Sivananda">Swami Sivananda</SelectItem>
  <SelectItem value="Swami Ramsukhdas">Swami Ramsukhdas</SelectItem>
  <SelectItem value="A.C. Bhaktivedanta Swami Prabhupada">A.C. Bhaktivedanta Swami Prabhupada</SelectItem>
  <SelectItem value="Swami Tejomayananda">Swami Tejomayananda</SelectItem>
  <SelectItem value="Swami Chinmayananda">Swami Chinmayananda</SelectItem>
</SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language" className="text-foreground">
              Response Language
            </Label>
            <Select value={language} onValueChange={onLanguageChange}>
              <SelectTrigger id="language" className="bg-input border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="hindi">Hindi</SelectItem>
                <SelectItem value="sanskrit">Sanskrit</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
