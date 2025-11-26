import { useEffect, useState } from "react";
import { fetchPicture } from "@/lib/api";

import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Child } from "@/types/child";
import { User } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Props {
  child: Child;
}

export function ChildCard({ child }: Props) {
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (!child.picture_id) return;
    fetchPicture(child.picture_id).then(blob => {
      setImageUrl(URL.createObjectURL(blob));
    });
  }, [child.picture_id]);


  return (
    <Card
      onClick={() => navigate(`/dashboard/${child.uuid}`)}
      className="cursor-pointer hover:shadow-lg transition-all bg-yellow-50 hover:bg-yellow-100 border border-yellow-200"
    >
      <CardContent className="flex flex-col items-center p-4">
        {imageUrl ? (
          <img
            src={imageUrl || ""}
            alt={child.name}
            className="w-24 h-24 rounded-full object-cover mb-3 border-2 border-yellow-200"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-yellow-200 flex items-center justify-center mb-3">
            <User className="w-12 h-12 text-yellow-600" />
          </div>
        )}
        <p className="font-semibold text-yellow-900">{child.name}</p>
        {child.age != null && (
          <p className="text-sm text-yellow-800">
            {child.age} {t("child.ageYears", { count: child.age })}
          </p>
        )}
        <p className="text-xs text-center mt-2 text-yellow-700">
          {child.diagnosis.length > 0
            ? child.diagnosis.join(", ")
            : t("diagnosis.normal")}
        </p>
      </CardContent>
    </Card>
  );
}
