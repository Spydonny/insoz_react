import { Card, CardContent } from "@/components/ui/card";
import { User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Child } from "@/types/child";

interface Props {
    child: Child;
}

export function ChildOverviewCard({ child }: Props) {
    const { t } = useTranslation();

    return (
        <Card className="mb-6 border-yellow-400 bg-white">
            <CardContent className="flex items-center gap-4 p-4">
                <div className="w-20 h-20 rounded-full bg-yellow-200 flex items-center justify-center">
                    <User className="w-10 h-10 text-yellow-700" />
                </div>
                <div>
                    <p className="font-semibold text-lg">{child.name}</p>
                    <p className="text-sm text-yellow-800">
                        {child.diagnosis?.length
                            ? child.diagnosis.join(", ")
                            : t("diagnosis.normal")}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
