import { useEffect, useState } from "react";
import { fetchPicture } from "@/lib/api";

import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Child } from "@/types/child";
import { User } from "lucide-react";

interface Props {
  child: Child;
}

export function ChildCard({ child }: Props) {
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState<string | null>(null);

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
        <p className="text-sm text-yellow-800">{child.age} {child?.age % 10 === 1 && child?.age % 100 !== 11
            ? "год"
            : child?.age % 10 >= 2 && child?.age % 10 <= 4 && (child?.age % 100 < 10 || child?.age % 100 >= 20)
            ? "года"
            : "лет"}</p>
        <p className="text-xs text-center mt-2 text-yellow-700">
          {child.diagnosis.join(",  ")}
        </p>
      </CardContent>
    </Card>
  );
}
