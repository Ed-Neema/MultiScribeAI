"use client"
import Heading from "@/components/Heading";
import {  Music } from "lucide-react";
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
import { useProModal } from '@/hooks/use-pro-modal';
import { toast } from "react-hot-toast";

const MusicPage = () => {
    const router = useRouter();
    const proModal = useProModal();
    const [music, setMusic] = useState<string>();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),//controls validation for the form
        defaultValues: {
            prompt: ""
        }
    });
    const isLoading = form.formState.isSubmitting;//loading state
    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setMusic(undefined);

            const response = await axios.post('/api/music', values);
            console.log(response)
            setMusic(response.data.audio);
            form.reset();
        } catch (error: any) {
            if (error?.response?.status === 403) {
                proModal.onOpen();
            } else {
                toast.error("Something went wrong.");
            }
        } finally {
            router.refresh();
        }
    }
    return (
        <div>
            <Heading
                title="Music Generation"
                description="Turn your prompt into music."
                icon={Music}
                iconColor="text-emerald-500"
                bgColor="bg-emerald-500/10"
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
                                        placeholder="Neo soul Guitar solo"
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
                {!music && !isLoading && (
                    <Empty label="No music generated." />
                )}
                {music && (
                    <audio controls className="w-full mt-8">
                        <source src={music} />
                    </audio>
                )}
            </div>
        </div>
    );
}

export default MusicPage;
