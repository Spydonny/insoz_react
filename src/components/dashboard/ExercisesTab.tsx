import { useNavigate } from "react-router-dom";
import { speechExercises } from "@/data/speechExercises";
import { Card, CardContent } from "@/components/ui/card";

export function ExercisesTab() {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {speechExercises.map((ex) => (
        <Card
          key={ex.id}
          className="cursor-pointer hover:shadow"
          onClick={() => navigate(`/exercises/${ex.id}`)}
        >
          <CardContent className="p-4">
            <h3 className="font-semibold">{ex.title}</h3>
            <p className="text-xs text-yellow-700">
              {ex.category}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
