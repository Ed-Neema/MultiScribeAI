"use client"
import Heading from "@/components/Heading";
import { Download, ImageIcon } from "lucide-react";
import { amountOptions, formSchema, resolutionOptions } from "./constants";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Empty } from "@/components/Empty";
import { Loader } from "@/components/Loader";
import { UserAvatar } from "@/components/UserAvatar";
import { BotAvatar } from "@/components/BotAvatar";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardFooter } from "@/components/ui/card";
import Image from "next/image";
import { useProModal } from '@/hooks/use-pro-modal';
import { toast } from "react-hot-toast";
const ImagePage = () => {
    const router = useRouter();
    const proModal = useProModal();
    const [photos, setPhotos] = useState<string[]>([]);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            prompt: "",
            amount: "1",
            resolution: "512x512"
        }
    });
    const isLoading = form.formState.isSubmitting;//loading state
    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setPhotos([]);
            const response = await axios.post('/api/image', values);
            const urls = response.data.map((image: { url: string }) => image.url);
            setPhotos(urls);
            form.reset()

        } catch (error: any) {
            if (error?.response?.status === 403) {
                proModal.onOpen();
            } else {
                toast.error("Something went wrong.");
            }
        } finally {
            router.refresh();
        }
        console.log(values)
    }
    return (
        <div>
            <Heading
                title="Image Generation"
                description="Turn your prompt/idea into an image."
                icon={ImageIcon}
                iconColor="text-pink-700"
                bgColor="bg-pink-700/10"
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
                            <FormItem className="col-span-12 lg:col-span-6">
                                <FormControl className="m-0 p-0">
                                    <Input
                                        className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                                        disabled={isLoading}//if loading, disable it
                                        placeholder="Generate images of Mt. Kilimanjaro"
                                        {...field}
                                    />
                                </FormControl>
                            </FormItem>
                        )} />
                        {/* for number of photos */}
                        <FormField
                            //select input field
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem className="col-span-12 lg:col-span-2">
                                    <Select
                                        disabled={isLoading}
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue defaultValue={field.value} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {amountOptions.map((option) => (
                                                <SelectItem
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />
                        {/* for resolution */}
                        <FormField
                            control={form.control}
                            name="resolution"
                            render={({ field }) => (
                                <FormItem className="col-span-12 lg:col-span-2">
                                    <Select
                                        disabled={isLoading}
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue defaultValue={field.value} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {resolutionOptions.map((option) => (
                                                <SelectItem
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />
                        <Button className="col-span-12 lg:col-span-2 w-full" type="submit" disabled={isLoading} size="icon">
                            Generate
                        </Button>
                    </form>
                </Form>
            </div>

            <div className="space-y-4 px-4 lg:px-8 mt-4">
                {isLoading && (
                    <div className="p-20">
                        <Loader />
                    </div>
                )}
                {photos.length === 0 && !isLoading && (
                    <Empty label="No images yet." />
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-8">
                    {photos.map((src) => (
                        <Card key={src} className="rounded-lg overflow-hidden">
                            <div className="relative aspect-square">
                                <Image
                                    fill
                                    alt="Generated"
                                    src={src}
                                />
                            </div>
                            <CardFooter className="p-2">
                                <Button onClick={() => window.open(src)} variant="secondary" className="w-full">
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ImagePage;
