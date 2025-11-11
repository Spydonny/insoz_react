import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  children: ReactNode;
}

export default function Container({ children }: Props) {
  return (
    <div className="flex items-center justify-center min-h-screen text-yellow-900">
      <Card className="w-full max-w-md bg-white border border-yellow-200 shadow-md rounded-2xl overflow-hidden">
        <CardContent className="p-6 rounded-2xl">{children}</CardContent>
      </Card>
    </div>
  );
}
