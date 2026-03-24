import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { speechExercises } from "@/data/speechExercises";
import { RepeatExercise } from "@/components/exercises/RepeatExercise";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LuArrowLeft as ArrowLeft } from "react-icons/lu";

export default function ExercisePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const exercise = speechExercises.find((e) => e.id === id);

  if (!exercise)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-yellow-700">
        {t("exercises.notFound", "Exercise not found")}
      </div>
    );

  return (
    <div className="min-h-screen bg-white text-yellow-900 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="text-yellow-700 hover:bg-yellow-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("common.back", "Back")}
          </Button>
        </div>

        {/* Card */}
        <Card className="border-yellow-400 bg-white">
          <CardContent className="p-6 space-y-4">
            <h1 className="font-semibold text-2xl">
              {t(exercise.title)}
            </h1>

            <p className="text-sm text-yellow-800 bg-yellow-50 p-3 rounded-lg">
              {t(exercise.description)}
            </p>

            <div className="pt-2">
              {exercise.type !== "breathing" && (
                <RepeatExercise prompt={t(exercise.prompt)} />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
