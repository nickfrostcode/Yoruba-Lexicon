import React from "react";

export const StatItem: React.FC<{
	icon: React.ReactNode;
	label: string;
	value: number;
}> = ({ icon, label, value }) => (
	<div className='flex items-center justify-between'>
		<div className='flex items-center space-x-3'>
			{icon}
			<span className='text-sm font-medium text-brand-ink/60'>{label}</span>
		</div>
		<span className='text-lg font-bold'>{value}</span>
	</div>
);
