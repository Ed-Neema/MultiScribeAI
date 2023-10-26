import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
//  expected structure of the props 
interface HeadingProps {
    title: string;
    description: string;
    icon: LucideIcon;
    iconColor?: string;
    bgColor?: string;
}
/**
 * tells TypeScript that you expect the object being destructured to conform to the structure defined in the HeadingProps interface. It ensures that the properties you're extracting match the types defined in the interface.
 */
const Heading = ({
    title,
    description,
    icon: Icon,
    iconColor,
    bgColor,
}: HeadingProps) => {
    return (
        <>
            <div className="px-4 lg:px-8 flex items-center gap-x-3 mb-8">
                <div className={cn("p-2 w-fit rounded-md", bgColor)}>
                    <Icon className={cn("w-10 h-10", iconColor)} />
                </div>
                <div>
                    <h2 className="text-3xl font-bold">{title}</h2>
                    <p className="text-sm text-muted-foreground">
                        {description}
                    </p>
                </div>
            </div>
        </>
    )
}

export default Heading
