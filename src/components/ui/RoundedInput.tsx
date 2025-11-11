import { Input } from "@/components/ui/input";

interface RoundedInputProps {
  lbl: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}

export default function RoundedInput({ lbl, placeholder, value, onChange, type = "text" }: RoundedInputProps) {
  return (
    <div>
      <label className="text-sm font-medium">{lbl}</label>
      <Input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder || lbl}
        required
        className="rounded-xl border-yellow-200 focus:border-yellow-400 focus:ring-yellow-300"
      />
    </div>
  );
}
