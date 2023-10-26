"use client"
import Heading from "@/components/Heading";
import { MessageSquare } from "lucide-react";
import { formSchema } from "./constants";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { cn } from "@/lib/utils";
import { Empty } from "@/components/Empty";
import { Loader } from "@/components/Loader";
import { UserAvatar } from "@/components/UserAvatar";
import { BotAvatar } from "@/components/BotAvatar";
import { toast } from "react-hot-toast";
// import ProModal from "@/components/ProModal";
import { useProModal } from "@/hooks/use-pro-modal";
const ConversationPage = () => {
    const router = useRouter();
    const proModal = useProModal();
    const [messages, setMessages] = useState<ChatCompletionMessageParam[]>([]);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),//controls validation for the form
        defaultValues: {
            prompt: ""
        }
    });
    const isLoading = form.formState.isSubmitting;//loading state
    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            
            const userMessage: ChatCompletionMessageParam = { role: "user", content: values.prompt };
            const newMessages = [...messages, userMessage];

            const response = await axios.post('/api/conversation', { messages: newMessages });
            /**
             * the response looks like this
             * {
    "role": "assistant",
    "content": "The perimeter of a triangle is the sum of the lengths of all three sides of the triangle. To calculate the perimeter, you need to know the lengths of the triangle's sides.\n\nLet's assume the lengths of the three sides are denoted as a, b, and c, with a being the length of side opposite to angle A, b being the length of side opposite to angle B, and c being the length of side opposite to angle C.\n\nThe formula to calculate the perimeter of a triangle is:\nPerimeter = a + b + c\n\nUsing this formula, you can calculate the perimeter of any triangle by simply adding up the lengths of its three sides.\n\nLet's look at an example:\nSuppose you have a triangle with side lengths a = 8 units, b = 5 units, and c = 7 units.\n\nPerimeter = 8 + 5 + 7 = 20 units\n\nSo, in this example, the perimeter of the triangle is 20 units."
}
             */
            setMessages((current) => [...current, userMessage, response.data]);
            

            form.reset();
        } catch (error: any) {
            if (error?.response?.status === 403) {
                proModal.onOpen();
            } else {
                toast.error("Something went wrong:", error.message);
            }
        } finally {
            router.refresh();
        }
        
    }
    return (
        <div>
            <Heading
                title="Conversation"
                description="Best conversation model ever built"
                icon={MessageSquare}
                iconColor="text-violet-500"
                bgColor="bg-violet-500/10"
            />
            <div className="px-4 lg:px-8">
                <Form {...form}>
                    <form
                        className="
                rounded-lg 
                border 
                w-full 
                p-4 
                px-3 
                md:px-6 
                focus-within:shadow-sm
                grid
                grid-cols-12
                gap-2
              "
                        onSubmit={form.handleSubmit(onSubmit)}
                    >
                        <FormField name="prompt" render={({ field }) => (
                            <FormItem className="col-span-12 lg:col-span-10">
                                <FormControl className="m-0 p-0">
                                    <Input
                                        className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                                        disabled={isLoading}//if loading, disable it
                                        placeholder="How do I become as smart as Albert Einstein?"
                                        {...field}
                                    />
                                </FormControl>
                            </FormItem>
                        )} />
                        <Button className="col-span-12 lg:col-span-2 w-full" type="submit" disabled={isLoading} size="icon">
                            Generate
                        </Button>
                    </form>
                </Form>
            </div>

            <div className="space-y-4 px-4 lg:px-8 mt-4">
                {isLoading && (
                    <div className="p-8 rounded-lg w-full flex items-center justify-center bg-muted">
                        <Loader />
                    </div>
                )}
                {messages.length === 0 && !isLoading && (
                    <Empty label="No conversation started." />
                )}
                <div className="flex flex-col-reverse gap-y-4">
                    {messages.map((message) => (
                        <div
                            key={message.content}
                            className={cn(
                                "p-8 w-full flex items-start gap-x-8 rounded-lg",
                                message.role === "user" ? "bg-white border border-black/10" : "bg-muted",
                            )}
                        >
                            {message.role === "user" ? <UserAvatar /> : <BotAvatar />}
                            <p className="text-sm">
                                {message.content}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ConversationPage;
