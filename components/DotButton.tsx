import { cn } from "@/lib/utils";

const DotButton = ({
  selected,
  onClick,
}: {
  selected: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-2.5 h-2.5 rounded-full border-none cursor-pointer transition-colors",
        selected ? "bg-orange-1" : "bg-black-6"
      )}
    />
  );
};

export default DotButton;
