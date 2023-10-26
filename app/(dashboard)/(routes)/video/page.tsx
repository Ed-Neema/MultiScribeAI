"use client"
import Heading from "@/components/Heading";
import { FileAudio, Music } from "lucide-react";
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
import { Empty } from "@/components/Empty";
import { Loader } from "@/components/Loader";
import { useProModal } from '@/hooks/use-pro-modal';
import { toast } from "react-hot-toast";

const VideoPage = () => {
    const router = useRouter();
    const proModal = useProModal();
    const [video, setVideo] = useState<string>();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),//controls validation for the form
        defaultValues: {
            prompt: ""
        }
    });
    const isLoading = form.formState.isSubmitting;//loading state
    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setVideo(undefined);
            const response = await axios.post('/api/video', values);
            setVideo(response.data[0]);
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
                title="Video Generation"
                description="Turn your prompt into video."
                icon={FileAudio}
                iconColor="text-orange-700"
                bgColor="bg-orange-700/10"
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
                                        placeholder="Clown fish swimming in a coral reef"
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
                {!video && !isLoading && (
                    <Empty label="No video files generated." />
                )}
                {video && (
                    <video controls className="w-full aspect-video mt-8 rounded-lg border bg-black">
                        <source src={video} />
                    </video>
                )}
            </div>
        </div>
    );
}

export default VideoPage;
