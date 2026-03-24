import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { speechExercises } from "@/data/speechExercises";
import { Card, CardContent } from "@/components/ui/card";

export function ExercisesTab() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {speechExercises.map((ex) => (
        <Card
          key={ex.id}
          className="cursor-pointer hover:shadow"
          onClick={() => navigate(`/exercises/${ex.id}`)}
        >
          <CardContent className="p-4">
            <h3 className="font-semibold">{t(ex.title)}</h3>
            <p className="text-xs text-yellow-700">
              {t(ex.category)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
