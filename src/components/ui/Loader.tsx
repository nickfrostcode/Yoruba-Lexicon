import React from "react";
import { Loader2 } from "lucide-react";

interface LoaderProps {
	text?: string;
	className?: string;
}

export const Loader: React.FC<LoaderProps> = ({ text = "Loading...", className = "" }) => {
	return (
		<div className={`flex flex-col justify-center items-center py-12 ${className}`}>
			<Loader2 size={32} className="animate-spin text-brand-orange mb-3" />
			<p className="text-brand-ink/40 font-medium text-sm animate-pulse">{text}</p>
		</div>
	);
};
