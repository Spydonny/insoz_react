import { useState, ChangeEvent } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Container from "@/components/ui/Container";
import RoundedInput from "@/components/ui/RoundedInput";
import { createChild } from "@/lib/api"; 
import { Child } from "@/types/child";

interface AddChildDialogProps {
  onAdd: (child: Child) => void;
}


export function AddChildDialog({ onAdd }: AddChildDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    age: "",
    diagnoses: "",
    photo: null as File | null,
    preview: "",
  });

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm({
        ...form,
        photo: file,
        preview: URL.createObjectURL(file),
      });
    }
  };

  const handleSubmit = async () => {
    if (!form.fullName.trim() || !form.age.trim()) {
      alert("Пожалуйста, заполните имя и возраст.");
      return;
    }

    setLoading(true);
    try {
      const diagnosesArray = form.diagnoses
        .split(",")
        .map((d) => d.trim())
        .filter(Boolean);

      const newChild = await createChild({
        name: form.fullName,
        age: Number(form.age),
        diagnosis: diagnosesArray,
        picture: form.photo || undefined,
      });

      if (newChild) {
        console.log("✅ Ребёнок создан:", newChild);
        onAdd(newChild); // 🔥 вызываем callback
        setOpen(false);
        setForm({
          fullName: "",
          age: "",
          diagnoses: "",
          photo: null,
          preview: "",
        });
      } else {
        alert("Ошибка при добавлении ребёнка.");
      }
    } catch (err) {
      console.error("Ошибка при создании:", err);
      alert("Не удалось добавить ребёнка.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="border-2 border-dashed border-yellow-400 flex flex-col items-center justify-center h-48 cursor-pointer rounded-xl hover:bg-yellow-100/30 dark:hover:bg-yellow-400/10 transition">
          <Plus className="w-8 h-8 text-yellow-500 dark:text-yellow-400" />
          <p className="text-sm text-yellow-600 dark:text-yellow-300 mt-2">
            Добавить ребёнка
          </p>
        </div>
      </DialogTrigger>

      <DialogContent className="max-w-md bg-transparent border-none shadow-none text-black">
        <Container>
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-yellow-500">
              Добавить ребёнка
            </DialogTitle>
            <DialogDescription>
              Заполните информацию о ребёнке для добавления в список.
            </DialogDescription>
          </DialogHeader>

          {/* Фото */}
          <div className="flex flex-col items-center gap-4 mt-3">
            {form.preview ? (
              <div className="relative">
                <img
                  src={form.preview}
                  alt="preview"
                  className="w-28 h-28 rounded-full object-cover border-2 border-yellow-400"
                />
                <button
                  onClick={() => setForm({ ...form, photo: null, preview: "" })}
                  className="absolute -top-2 -right-2 bg-yellow-500 text-white rounded-full p-1 hover:bg-yellow-600"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label
                htmlFor="photo"
                className={cn(
                  "flex flex-col items-center justify-center w-28 h-28 rounded-full border-2 border-dashed border-yellow-300 cursor-pointer hover:bg-yellow-100/30 dark:hover:bg-yellow-400/10 transition"
                )}
              >
                <Upload className="text-yellow-400" size={20} />
                <span className="text-xs text-black mt-1">Фото</span>
              </label>
            )}
            <input
              id="photo"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Поля формы */}
          <div className="flex flex-col gap-4 mt-4">
            <RoundedInput
              lbl="ФИО"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              placeholder=""
            />
            <RoundedInput
              lbl="Возраст ребёнка"
              placeholder=""
              type="number"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
            />
            <RoundedInput
              lbl="Основные диагнозы"
              placeholder="Пишите через запятую"
              value={form.diagnoses}
              onChange={(e) => setForm({ ...form, diagnoses: e.target.value })}
            />
          </div>

          <DialogFooter className="mt-5">
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold w-full"
            >
              {loading ? "Сохраняем..." : "Сохранить"}
            </Button>
          </DialogFooter>
        </Container>
      </DialogContent>
    </Dialog>
  );
}
