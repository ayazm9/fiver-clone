"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useState, useEffect } from "react";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useRouter } from "next/navigation";

interface CreateFormProps {
  username: string;
}

const CreateFormSchema = z.object({
  title: z
    .string()
    .min(20, {
      message: "Title must be at least 20 characters.",
    })
    .max(100, {
      message: "Title must not be longer than 100 characters.",
    }),
  category: z.string({
    required_error: "Please select a category.",
  }),
  subcategoryId: z.string({
    required_error: "Please select a subcategory.",
  }),
});

type CreateFormValues = z.infer<typeof CreateFormSchema>;

const defaultValues: Partial<CreateFormValues> = {
  title: "",
};

export const CreateForm = ({ username }: CreateFormProps) => {
  const categoriesQuery = useQuery(api.categories.get);
  const [subcategories, setSubcategories] = useState<Doc<"subcategories">[]>([]);
  const { mutate, pending } = useApiMutation(api.gig.create);
  const router = useRouter();
  const form = useForm<CreateFormValues>({
    resolver: zodResolver(CreateFormSchema),
    defaultValues,
    mode: "onChange",
  });

  useEffect(() => {
    if (categoriesQuery) {
      // If categories are fetched and selectedCategory is defined
      const selectedCategory = categoriesQuery.find((category) => category.name === form.getValues("category"));
      if (selectedCategory) {
        setSubcategories(selectedCategory.subcategories || []);
      }
    }
  }, [categoriesQuery, form.getValues("category")]);

  function handleCategoryChange(categoryName: string) {
    if (!categoriesQuery) return;
    const selectedCategory = categoriesQuery.find(
      (category) => category.name === categoryName
    );
    if (selectedCategory) {
      setSubcategories(selectedCategory.subcategories || []);
    }
  }

  async function onSubmit(data: CreateFormValues) {
    try {
      const gigId: Id<"gigs"> = await mutate({
        title: data.title,
        description: "",
        subcategoryId: data.subcategoryId,
      });
      toast.success("Gig created successfully");
      router.push(`/seller/${username}/manage-gigs/edit/${gigId}`);
    } catch (error) {
      toast.error("Failed to create gig");
    }
  }

  if (categoriesQuery === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="I will do something amazing" {...field} />
              </FormControl>
              <FormDescription>
                Craft a keyword-rich Gig title to attract potential buyers.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select
                onValueChange={(categoryName: string) => {
                  field.onChange(categoryName);
                  handleCategoryChange(categoryName);
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categoriesQuery.map((category) => (
                    <SelectItem key={category._id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Select a category most relevant to your service.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="subcategoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subcategory</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subcategory" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {subcategories.map((subcategory) => (
                    <SelectItem key={subcategory._id} value={subcategory._id}>
                      {subcategory.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Subcategory will help buyers pinpoint your service more narrowly.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={pending}>
          Save
        </Button>
      </form>
    </Form>
  );
};
