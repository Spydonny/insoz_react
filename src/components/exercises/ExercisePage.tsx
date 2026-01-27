import { useParams, useNavigate } from "react-router-dom";
import { speechExercises } from "@/data/speechExercises";
import { RepeatExercise } from "@/components/exercises/RepeatExercise";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function ExercisePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const exercise = speechExercises.find((e) => e.id === id);

  if (!exercise)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-yellow-700">
        Упражнение не найдено
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
            Назад
          </Button>
        </div>

        {/* Card */}
        <Card className="border-yellow-400 bg-white">
          <CardContent className="p-6 space-y-4">
            <h1 className="font-semibold text-2xl">
              {exercise.title}
            </h1>

            <p className="text-sm text-yellow-800 bg-yellow-50 p-3 rounded-lg">
              {exercise.description}
            </p>

            <div className="pt-2">
              {exercise.type !== "breathing" && (
                <RepeatExercise prompt={exercise.prompt} />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
